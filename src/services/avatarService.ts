import { auth } from '../lib/firebase/auth';

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const AVATAR_ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const CLOUDINARY_CLOUD_NAME = 'b2uxjyfv';

type AvatarMimeType = typeof AVATAR_ACCEPTED_MIME_TYPES[number];
const avatarMimeTypeSet: ReadonlySet<string> = new Set(AVATAR_ACCEPTED_MIME_TYPES);
const avatarExtensionPattern = /\.(?:jpg|jpeg|png|webp)$/i;

interface AvatarSignaturePayload {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  publicId: string;
  transformation: string;
  allowedFormats: string;
  overwrite: boolean;
  invalidate: boolean;
}

interface CloudinaryUploadResponse {
  secureUrl: string;
  publicId: string;
}

export interface AvatarUploadResult {
  secureUrl: string;
}

export type AvatarFileValidation =
  | { valid: true; file: File }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function isAvatarMimeType(value: string): value is AvatarMimeType {
  return avatarMimeTypeSet.has(value);
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body)) {
      const message = readText(body.message);
      if (message) return message;
    }
  } catch {
    // A resposta de erro não é JSON; a mensagem segura de fallback é suficiente.
  }
  return fallback;
}

function parseAvatarSignature(payload: unknown): AvatarSignaturePayload {
  if (!isRecord(payload)) throw new Error('Não foi possível preparar o envio da foto agora.');

  const timestamp = payload.timestamp;
  const signature = readText(payload.signature);
  const cloudName = readText(payload.cloudName);
  const apiKey = readText(payload.apiKey);
  const publicId = readText(payload.publicId);
  const transformation = readText(payload.transformation);
  const allowedFormats = readText(payload.allowedFormats);
  const overwrite = readBoolean(payload.overwrite);
  const invalidate = readBoolean(payload.invalidate);

  if (typeof timestamp !== 'number' || !Number.isInteger(timestamp) || timestamp <= 0 || !signature || cloudName !== CLOUDINARY_CLOUD_NAME || !apiKey || !publicId || !transformation || !allowedFormats || overwrite !== true || invalidate !== true) {
    throw new Error('Não foi possível preparar o envio da foto agora.');
  }

  return { timestamp, signature, cloudName, apiKey, publicId, transformation, allowedFormats, overwrite, invalidate };
}

function parseCloudinaryUpload(payload: unknown): CloudinaryUploadResponse {
  if (!isRecord(payload)) throw new Error('O serviço de imagens retornou uma resposta inválida.');
  const secureUrl = readText(payload.secure_url);
  const publicId = readText(payload.public_id);
  if (!secureUrl || !publicId) throw new Error('O serviço de imagens não retornou a foto enviada.');
  return { secureUrl, publicId };
}

function hasExpectedAvatarPath(pathname: string, publicId: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const expectedSegments = publicId.split('/').filter(Boolean);
  if (expectedSegments.length < 2) return false;

  const folderSegments = expectedSegments.slice(0, -1);
  const assetId = expectedSegments[expectedSegments.length - 1];
  return segments.some((_, startIndex) => {
    const foldersMatch = folderSegments.every(
      (segment, segmentIndex) => segments[startIndex + segmentIndex] === segment,
    );
    const assetSegment = segments[startIndex + folderSegments.length];
    return foldersMatch && assetSegment.startsWith(`${assetId}.`) && avatarExtensionPattern.test(assetSegment);
  });
}

/** Valida a URL pública que pode ser persistida como avatar de um UID específico. */
export function isLearnDevCloudinaryAvatarUrl(urlValue: string, uid: string): boolean {
  try {
    const url = new URL(urlValue);
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || url.port) return false;

    const segments = url.pathname.split('/').filter(Boolean);
    const expectedPrefix = [CLOUDINARY_CLOUD_NAME, 'image', 'upload'];
    if (!expectedPrefix.every((segment, index) => segments[index] === segment)) return false;

    return hasExpectedAvatarPath(url.pathname, `learndev/avatars/${uid}`);
  } catch {
    return false;
  }
}

function matchesSignedCloudinaryAvatarUrl(urlValue: string, signature: AvatarSignaturePayload): boolean {
  const expectedPrefix = 'learndev/avatars/';
  if (!signature.publicId.startsWith(expectedPrefix)) return false;

  const uid = signature.publicId.slice(expectedPrefix.length);
  if (!uid || signature.publicId !== `${expectedPrefix}${uid}`) return false;

  return signature.cloudName === CLOUDINARY_CLOUD_NAME
    && isLearnDevCloudinaryAvatarUrl(urlValue, uid);
}

async function getAvatarSignature(): Promise<AvatarSignaturePayload> {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error('Entre novamente para alterar sua foto de perfil.');

  const idToken = await currentUser.getIdToken();
  const response = await fetch('/api/profile/avatar-signature', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Não foi possível preparar o envio da foto agora.'));
  }

  return parseAvatarSignature(await response.json());
}

/** Valida o arquivo no navegador antes de solicitar uma assinatura de upload. */
export function validateAvatarFile(file: File | null): AvatarFileValidation {
  if (!file) return { valid: false, error: 'Escolha uma imagem para continuar.' };
  if (!isAvatarMimeType(file.type)) {
    return { valid: false, error: 'Use uma imagem JPG, PNG ou WEBP.' };
  }
  if (file.size > AVATAR_MAX_FILE_SIZE) {
    return { valid: false, error: 'A imagem deve ter no máximo 5 MB.' };
  }
  return { valid: true, file };
}

/**
 * Obtém parâmetros assinados da API autenticada e envia o arquivo diretamente ao Cloudinary.
 * A API secret permanece no servidor; o Firestore recebe apenas a URL HTTPS retornada pelo Cloudinary.
 */
export async function uploadAvatar(file: File): Promise<AvatarUploadResult> {
  const validation = validateAvatarFile(file);
  if (validation.valid === false) throw new Error(validation.error);

  const signature = await getAvatarSignature();
  const formData = new FormData();
  formData.append('file', validation.file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('public_id', signature.publicId);
  formData.append('overwrite', String(signature.overwrite));
  formData.append('invalidate', String(signature.invalidate));
  formData.append('transformation', signature.transformation);
  formData.append('allowed_formats', signature.allowedFormats);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Não foi possível enviar a foto agora. Tente novamente.'));
  }

  const upload = parseCloudinaryUpload(await response.json());
  if (upload.publicId !== signature.publicId || !matchesSignedCloudinaryAvatarUrl(upload.secureUrl, signature)) {
    throw new Error('O serviço de imagens retornou uma URL de avatar inválida.');
  }

  return { secureUrl: upload.secureUrl };
}

/** Remove o asset determinístico depois que a referência pública já foi apagada do perfil. */
export async function removeAvatarAsset(): Promise<void> {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error('Entre novamente para remover sua foto de perfil.');

  const idToken = await currentUser.getIdToken();
  const response = await fetch('/api/profile/remove-avatar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Não foi possível remover a imagem armazenada agora.'));
  }
}
