import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import type {
  FollowedUserPostNotification,
  HelpfulPostNotification,
  HelpfulReplyNotification,
  LearnDevNotification,
  NewFollowerNotification,
  NotificationType,
  PostReplyNotification,
  SocialNotificationPayload,
} from '../types/notification';

const NOTIFICATIONS_LIMIT = 30;
const NOTIFICATION_BATCH_SIZE = 400;
export const NOTIFICATIONS_UPDATED_EVENT = 'learndev:notifications-updated';

function requireFirestore(): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  return db;
}

function requireAuthenticatedUser(): { firestore: Firestore; uid: string } {
  const firestore = requireFirestore();
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error('Entre na sua conta para acessar as notificações.');
  return { firestore, uid };
}

function safeDocumentId(value: string, label: string): string {
  const id = value.trim();
  if (!id || id.includes('/')) throw new Error(`${label} é inválido.`);
  return id;
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(data: DocumentData, field: string): string | undefined {
  const value: unknown = data[field];
  return typeof value === 'string' ? value : undefined;
}

function readTimestamp(data: DocumentData, field: string): Timestamp | undefined {
  const value: unknown = data[field];
  return value instanceof Timestamp ? value : undefined;
}

function isNotificationType(value: unknown): value is NotificationType {
  return value === 'new_follower'
    || value === 'followed_user_post'
    || value === 'post_reply'
    || value === 'helpful_post'
    || value === 'helpful_reply';
}

function mapNotification(snapshot: DocumentSnapshot<DocumentData>): LearnDevNotification | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const type: unknown = data.type;
  const actorUid = readText(data, 'actorUid');
  const source: unknown = data.source;
  if (!isNotificationType(type) || !actorUid || typeof data.read !== 'boolean' || !isDocumentData(source)) return null;

  const createdAt = readTimestamp(data, 'createdAt');
  const readAt = readTimestamp(data, 'readAt');

  const common = {
    id: snapshot.id,
    actorUid,
    read: data.read,
    ...(createdAt ? { createdAt } : {}),
    ...(readAt ? { readAt } : {}),
  };
  const sourceKind: unknown = source.kind;

  if (type === 'new_follower' && sourceKind === 'profile') {
    return { ...common, type, source: { kind: 'profile' } } satisfies NewFollowerNotification;
  }

  const postId = readText(source, 'postId');
  if (!postId) return null;
  if ((type === 'followed_user_post' || type === 'helpful_post') && sourceKind === 'post') {
    return type === 'followed_user_post'
      ? { ...common, type, source: { kind: 'post', postId } } satisfies FollowedUserPostNotification
      : { ...common, type, source: { kind: 'post', postId } } satisfies HelpfulPostNotification;
  }

  const replyId = readText(source, 'replyId');
  if (!replyId || sourceKind !== 'reply') return null;
  return type === 'post_reply'
    ? { ...common, type, source: { kind: 'reply', postId, replyId } } satisfies PostReplyNotification
    : type === 'helpful_reply'
      ? { ...common, type, source: { kind: 'reply', postId, replyId } } satisfies HelpfulReplyNotification
      : null;
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function dispatchNotificationsUpdated(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

/** Obtém até 30 notificações do usuário autenticado, em ordem cronológica decrescente. */
export async function getNotifications(): Promise<LearnDevNotification[]> {
  const { firestore, uid } = requireAuthenticatedUser();
  const snapshot = await getDocs(query(
    collection(firestore, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(NOTIFICATIONS_LIMIT),
  ));
  return snapshot.docs.map(mapNotification).filter(isDefined);
}

/** Calcula notificações não lidas sem manter um contador mutável no perfil do usuário. */
export async function getUnreadNotificationCount(): Promise<number> {
  const { firestore, uid } = requireAuthenticatedUser();
  const snapshot = await getCountFromServer(query(
    collection(firestore, 'users', uid, 'notifications'),
    where('read', '==', false),
  ));
  return snapshot.data().count;
}

/** Marca uma notificação própria como lida somente se ela ainda não tiver sido lida. */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { firestore, uid } = requireAuthenticatedUser();
  const reference = doc(firestore, 'users', uid, 'notifications', safeDocumentId(notificationId, 'A notificação'));
  const snapshot = await getDoc(reference);
  const notification = mapNotification(snapshot);
  if (!notification || notification.read) return false;

  await updateDoc(reference, { read: true, readAt: serverTimestamp() });
  dispatchNotificationsUpdated();
  return true;
}

/** Marca todas as notificações não lidas da conta atual como lidas em lotes seguros. */
export async function markAllNotificationsAsRead(): Promise<number> {
  const { firestore, uid } = requireAuthenticatedUser();
  const snapshot = await getDocs(query(
    collection(firestore, 'users', uid, 'notifications'),
    where('read', '==', false),
  ));
  const references = snapshot.docs.map((item) => item.ref);

  for (let index = 0; index < references.length; index += NOTIFICATION_BATCH_SIZE) {
    const batch = writeBatch(firestore);
    references.slice(index, index + NOTIFICATION_BATCH_SIZE).forEach((reference) => {
      batch.update(reference, { read: true, readAt: serverTimestamp() });
    });
    await batch.commit();
  }

  if (references.length > 0) dispatchNotificationsUpdated();
  return references.length;
}

/**
 * Solicita ao endpoint autenticado que valide o evento social no Firestore e gere notificações.
 * Falhas são intencionalmente isoladas: a ação social principal já foi persistida no cliente.
 */
export async function processSocialNotification(payload: SocialNotificationPayload): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user) return false;

  try {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/notifications/process-social-event', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}
