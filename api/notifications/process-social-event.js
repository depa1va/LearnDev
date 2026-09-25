import { getAdminAuth, getAdminFirestore } from '../_lib/firebaseAdmin.js';
import { processSocialEvent } from '../_lib/notifications.js';

function getBearerToken(authorization) {
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function sendError(response, status, code, message) {
  response.status(status).json({ code, message });
}

function expectedEventError(error) {
  if (!(error instanceof Error)) return null;
  const messages = new Set([
    'Evento de notificação inválido.',
    'Você não pode seguir seu próprio perfil.',
    'A relação de acompanhamento não foi encontrada.',
    'O perfil acompanhado não está disponível.',
    'A publicação não está disponível para este evento.',
    'A resposta não está disponível para este evento.',
    'A marcação útil não está disponível para este evento.',
  ]);
  return messages.has(error.message) ? error.message : null;
}

/**
 * API: POST /api/notifications/process-social-event
 *
 * Objetivo: validar um evento social persistido e criar as notificações legítimas no Firebase Admin.
 * Autenticação: Authorization Bearer com Firebase ID Token verificado no servidor.
 * Corpo: event e os IDs do recurso afetado; actorUid nunca é aceito do cliente porque vem do token.
 * Retorno: { processed: true, created: number } para evento processado/idempotente; { code, message }
 * em falhas 4xx de sessão/dados ou 5xx de processamento.
 */
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'method-not-allowed', 'Método não permitido.');
  }

  const idToken = getBearerToken(request.headers?.authorization);
  if (!idToken) return sendError(response, 401, 'notifications/unauthenticated', 'Sua sessão expirou. Entre novamente para continuar.');

  let decodedToken;
  let userRecord;
  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
    userRecord = await adminAuth.getUser(decodedToken.uid);
  } catch {
    return sendError(response, 401, 'notifications/unauthenticated', 'Sua sessão expirou. Entre novamente para continuar.');
  }

  if (decodedToken.email_verified !== true || userRecord.disabled) {
    return sendError(response, 403, 'notifications/email-not-verified', 'Confirme seu e-mail para usar a comunidade.');
  }

  try {
    const created = await processSocialEvent(getAdminFirestore(), decodedToken.uid, request.body);
    return response.status(200).json({ processed: true, created: Number(created) || 0 });
  } catch (error) {
    const message = expectedEventError(error);
    if (message) return sendError(response, 400, 'notifications/invalid-event', message);
    return sendError(response, 500, 'notifications/server-unavailable', 'Não foi possível processar a notificação agora.');
  }
}
