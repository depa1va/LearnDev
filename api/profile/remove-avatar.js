import { createHash } from 'node:crypto';
import { getAdminAuth, getRequiredEnvironmentValue } from '../_lib/firebaseAdmin.js';

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
 * POST /api/profile/remove-avatar
 *
 * Objetivo: apagar no Cloudinary o asset do avatar da própria conta.
 * Autenticação: Firebase ID Token em Authorization: Bearer; não recebe corpo, UID ou public_id do cliente.
 * Funcionamento: o public_id é derivado do UID verificado, portanto o cliente não remove imagem alheia.
 * Retorno: { removed: true }; erros retornam { code, message } para sessão, autorização ou serviço externo.
 * A página limpa primeiro a referência no Firestore; esta rota remove o asset correspondente no Cloudinary.
 */
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'method-not-allowed', 'Método não permitido.');
  }

  const idToken = getBearerToken(request.headers?.authorization);
  if (!idToken) return sendError(response, 401, 'avatar/unauthenticated', 'Entre novamente para remover sua foto de perfil.');

  let decodedToken;
  let userRecord;
  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
    userRecord = await adminAuth.getUser(decodedToken.uid);
  } catch {
    return sendError(response, 401, 'avatar/unauthenticated', 'Entre novamente para remover sua foto de perfil.');
  }

  if (decodedToken.email_verified !== true || userRecord.disabled) {
    return sendError(response, 403, 'avatar/forbidden', 'Confirme seu e-mail para remover sua foto de perfil.');
  }

  try {
    const cloudName = getRequiredEnvironmentValue('CLOUDINARY_CLOUD_NAME');
    const apiKey = getRequiredEnvironmentValue('CLOUDINARY_API_KEY');
    const apiSecret = getRequiredEnvironmentValue('CLOUDINARY_API_SECRET');
    const timestamp = Math.floor(Date.now() / 1000);
    const parameters = {
      invalidate: true,
      public_id: `learndev/avatars/${decodedToken.uid}`,
      timestamp,
    };
    const signature = signCloudinaryParameters(parameters, apiSecret);
    const body = new URLSearchParams({
      api_key: apiKey,
      invalidate: 'true',
      public_id: parameters.public_id,
      signature,
      timestamp: String(timestamp),
    });
    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!cloudinaryResponse.ok) {
      return sendError(response, 502, 'avatar/cloudinary-unavailable', 'Não foi possível remover a imagem armazenada agora.');
    }

    return response.status(200).json({ removed: true });
  } catch {
    return sendError(response, 500, 'avatar/server-unavailable', 'Não foi possível remover a imagem armazenada agora.');
  }
}
