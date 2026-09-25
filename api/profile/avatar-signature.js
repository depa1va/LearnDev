import { createHash } from 'node:crypto';
import { getAdminAuth, getRequiredEnvironmentValue } from '../_lib/firebaseAdmin.js';

const AVATAR_SIGNATURE_COOLDOWN_MS = 10_000;
const AVATAR_TRANSFORMATION = 'c_fill,g_auto,h_512,w_512,q_auto,f_auto';
const AVATAR_ALLOWED_FORMATS = 'jpg,jpeg,png,webp';
const recentSignatureRequests = new Map();

function getBearerToken(authorization) {
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function sendError(response, status, code, message) {
  response.status(status).json({ code, message });
}

function signCloudinaryParameters(parameters, apiSecret) {
  const canonical = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');
}

/**
 * POST /api/profile/avatar-signature
 *
 * Objetivo: gerar a assinatura temporária de upload para o avatar determinístico da conta.
 * Autenticação: Firebase ID Token em Authorization: Bearer; não há corpo e o UID vem apenas do token.
 * Retorno: timestamp, signature, cloudName, apiKey, publicId, transformation, allowedFormats,
 * overwrite e invalidate. Os parâmetros correspondem ao upload direto ao Cloudinary.
 * Erros possíveis: 401 para sessão inválida, 403 para e-mail não verificado/conta desabilitada,
 * 429 para cooldown e 500 para configuração indisponível. CLOUDINARY_API_SECRET nunca sai do servidor.
 */
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'method-not-allowed', 'Método não permitido.');
  }

  const idToken = getBearerToken(request.headers?.authorization);
  if (!idToken) return sendError(response, 401, 'avatar/unauthenticated', 'Entre novamente para alterar sua foto de perfil.');

  let decodedToken;
  let userRecord;
  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
    userRecord = await adminAuth.getUser(decodedToken.uid);
  } catch {
    return sendError(response, 401, 'avatar/unauthenticated', 'Entre novamente para alterar sua foto de perfil.');
  }

  if (decodedToken.email_verified !== true || userRecord.disabled) {
    return sendError(response, 403, 'avatar/forbidden', 'Confirme seu e-mail para alterar sua foto de perfil.');
  }

  const now = Date.now();
  const lastRequestAt = recentSignatureRequests.get(decodedToken.uid) ?? 0;
  if (now - lastRequestAt < AVATAR_SIGNATURE_COOLDOWN_MS) {
    return sendError(response, 429, 'avatar/rate-limited', 'Aguarde alguns segundos antes de tentar novamente.');
  }

  try {
    const cloudName = getRequiredEnvironmentValue('CLOUDINARY_CLOUD_NAME');
    const apiKey = getRequiredEnvironmentValue('CLOUDINARY_API_KEY');
    const apiSecret = getRequiredEnvironmentValue('CLOUDINARY_API_SECRET');
    const timestamp = Math.floor(now / 1000);
    const publicId = `learndev/avatars/${decodedToken.uid}`;
    const parameters = {
      allowed_formats: AVATAR_ALLOWED_FORMATS,
      invalidate: true,
      overwrite: true,
      public_id: publicId,
      timestamp,
      transformation: AVATAR_TRANSFORMATION,
    };

    const signature = signCloudinaryParameters(parameters, apiSecret);
    recentSignatureRequests.set(decodedToken.uid, now);

    return response.status(200).json({
      timestamp,
      signature,
      cloudName,
      apiKey,
      publicId,
      transformation: AVATAR_TRANSFORMATION,
      allowedFormats: AVATAR_ALLOWED_FORMATS,
      overwrite: true,
      invalidate: true,
    });
  } catch {
    return sendError(response, 500, 'avatar/server-unavailable', 'Não foi possível preparar o envio da foto agora.');
  }
}
