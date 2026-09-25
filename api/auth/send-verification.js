import { getAdminAuth, getRequiredEnvironmentValue } from '../_lib/firebaseAdmin.js';

const VERIFICATION_CONTINUE_URL = 'https://learndev.com.br/verificar-email';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const RESEND_SENDER = 'LearnDev <noreply@learndev.com.br>';
const RESEND_SUBJECT = 'Confirme seu e-mail — LearnDev';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getGreeting(displayName) {
  const name = typeof displayName === 'string' ? displayName.trim() : '';
  return name ? `Olá, ${name}.` : 'Olá.';
}

function getVerificationEmail(displayName, verificationLink) {
  const greeting = getGreeting(displayName);
  const safeGreeting = escapeHtml(greeting);
  const safeLink = escapeHtml(verificationLink);

  return {
    html: `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;color:#15233a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f4f7fb;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dbe3ef;border-radius:20px;overflow:hidden;">
          <tr><td style="padding:32px 36px 12px;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;">LearnDev</td></tr>
          <tr><td style="padding:10px 36px 0;"><h1 style="margin:0;font-size:28px;line-height:1.25;color:#10213e;">Confirme seu e-mail</h1></td></tr>
          <tr><td style="padding:20px 36px 0;font-size:16px;line-height:1.65;color:#41516b;"><p style="margin:0;">${safeGreeting}</p><p style="margin:16px 0 0;">Confirme seu endereço de e-mail para ativar sua conta e acessar o LearnDev.</p></td></tr>
          <tr><td style="padding:28px 36px 12px;"><a href="${safeLink}" style="display:inline-block;border-radius:10px;background:#1d4ed8;padding:14px 22px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">Confirmar meu e-mail</a></td></tr>
          <tr><td style="padding:12px 36px 32px;font-size:14px;line-height:1.6;color:#64748b;">Se você não criou esta conta, pode ignorar esta mensagem.<br><a href="https://learndev.com.br" style="color:#2563eb;text-decoration:none;">learndev.com.br</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
    text: `LearnDev\n\nConfirme seu e-mail\n\n${greeting}\n\nConfirme seu endereço de e-mail para ativar sua conta e acessar o LearnDev.\n\nConfirmar meu e-mail: ${verificationLink}\n\nSe você não criou esta conta, pode ignorar esta mensagem.\n\nlearndev.com.br`,
  };
}

function getBearerToken(authorization) {
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function sendError(response, status, code, message) {
  response.status(status).json({ code, message });
}

/**
 * API: POST /api/auth/send-verification
 *
 * Objetivo: gerar um link Firebase Admin e enviar a verificação de e-mail pelo Resend.
 * Autenticação: Authorization Bearer com Firebase ID Token. O destinatário é sempre o e-mail do
 * usuário validado; a requisição não aceita destinatário nem corpo fornecido pelo cliente.
 * Retorno: { sent: true } em sucesso; { code, message } para erros de sessão, conta já verificada,
 * limite do Resend ou indisponibilidade. RESEND_API_KEY é lida somente em process.env no servidor.
 */
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'method-not-allowed', 'Método não permitido.');
  }

  const idToken = getBearerToken(request.headers?.authorization);
  if (!idToken) return sendError(response, 401, 'verification/unauthenticated', 'Sua sessão expirou. Entre novamente para continuar.');

  let adminAuth;
  let decodedToken;
  let userRecord;

  try {
    adminAuth = getAdminAuth();
  } catch {
    return sendError(response, 500, 'verification/server-unavailable', 'O serviço de confirmação está indisponível no momento. Tente novamente mais tarde.');
  }

  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
    userRecord = await adminAuth.getUser(decodedToken.uid);
  } catch {
    return sendError(response, 401, 'verification/unauthenticated', 'Sua sessão expirou. Entre novamente para continuar.');
  }

  if (!userRecord.email) {
    return sendError(response, 400, 'verification/no-email', 'Não foi possível identificar um e-mail para esta conta.');
  }

  if (userRecord.emailVerified) {
    return sendError(response, 409, 'verification/already-verified', 'Este e-mail já foi confirmado.');
  }

  let verificationLink;
  try {
    verificationLink = await adminAuth.generateEmailVerificationLink(userRecord.email, {
      url: VERIFICATION_CONTINUE_URL,
      handleCodeInApp: false,
    });
  } catch {
    return sendError(response, 500, 'verification/link-generation-failed', 'Não foi possível preparar o e-mail de confirmação agora.');
  }

  const { html, text } = getVerificationEmail(userRecord.displayName, verificationLink);
  let resendResponse;

  try {
    resendResponse = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getRequiredEnvironmentValue('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_SENDER,
        to: [userRecord.email],
        subject: RESEND_SUBJECT,
        html,
        text,
      }),
    });
  } catch {
    return sendError(response, 502, 'verification/email-delivery-failed', 'Não foi possível enviar o e-mail de confirmação agora.');
  }

  if (!resendResponse.ok) {
    const status = resendResponse.status === 429 ? 429 : 502;
    const code = status === 429 ? 'verification/rate-limited' : 'verification/email-delivery-failed';
    const message = status === 429
      ? 'Muitas solicitações de envio. Aguarde um momento antes de tentar novamente.'
      : 'Não foi possível enviar o e-mail de confirmação agora.';
    return sendError(response, status, code, message);
  }

  return response.status(200).json({ sent: true });
}
