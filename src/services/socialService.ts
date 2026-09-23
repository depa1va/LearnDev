import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  Timestamp,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import { getPublicProfilesByUids } from './communityService';
import { processSocialNotification } from './notificationService';
import type { FollowCounts, FollowListEntry, FollowRelation } from '../types/social';

const FOLLOW_LIST_LIMIT = 20;

function requireFirestore(): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  return db;
}

function requireAuthenticatedUser(): { firestore: Firestore; uid: string } {
  const firestore = requireFirestore();
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error('Entre na sua conta para gerenciar seguidores.');
  return { firestore, uid };
}

function normalizeUid(value: string, label: string): string {
  const uid = value.trim();
  if (!uid || uid.includes('/')) throw new Error(`${label} é inválido.`);
  return uid;
}

function followDocumentId(followerUid: string, targetUid: string): string {
  return `${followerUid}_${targetUid}`;
}

function readText(data: DocumentData, field: string): string | undefined {
  const value: unknown = data[field];
  return typeof value === 'string' ? value : undefined;
}

function readTimestamp(data: DocumentData, field: string): Timestamp | undefined {
  const value: unknown = data[field];
  return value instanceof Timestamp ? value : undefined;
}

function mapFollowRelation(snapshot: DocumentSnapshot<DocumentData>): FollowRelation | null {
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const followerUid = readText(data, 'followerUid');
  const targetUid = readText(data, 'targetUid');
  if (!followerUid || !targetUid || followerUid === targetUid) return null;

  const relation: FollowRelation = { id: snapshot.id, followerUid, targetUid };
  const createdAt = readTimestamp(data, 'createdAt');
  if (createdAt) relation.createdAt = createdAt;
  return relation;
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

async function getFollowList(uid: string, field: 'followerUid' | 'targetUid'): Promise<FollowListEntry[]> {
  const { firestore } = requireAuthenticatedUser();
  const safeUid = normalizeUid(uid, 'O usuário');
  const snapshot = await getDocs(query(
    collection(firestore, 'follows'),
    where(field, '==', safeUid),
    orderBy('createdAt', 'desc'),
    limit(FOLLOW_LIST_LIMIT),
  ));
  const relations = snapshot.docs.map(mapFollowRelation).filter(isDefined);
  const profileUids = relations.map((relation) => field === 'targetUid' ? relation.followerUid : relation.targetUid);
  const profilesByUid = await getPublicProfilesByUids(profileUids);

  return relations.flatMap((relation) => {
    const profileUid = field === 'targetUid' ? relation.followerUid : relation.targetUid;
    const profile = profilesByUid.get(profileUid);
    return profile ? [{ relation, profile }] : [];
  });
}

export async function followUser(targetUid: string): Promise<void> {
  const { firestore, uid: followerUid } = requireAuthenticatedUser();
  const safeTargetUid = normalizeUid(targetUid, 'O perfil');
  if (safeTargetUid === followerUid) throw new Error('Você não pode seguir seu próprio perfil.');

  const reference = doc(firestore, 'follows', followDocumentId(followerUid, safeTargetUid));
  const created = await runTransaction(firestore, async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists()) return false;

    transaction.set(reference, {
      followerUid,
      targetUid: safeTargetUid,
      createdAt: serverTimestamp(),
    });
    return true;
  });

  if (created) void processSocialNotification({ event: 'follow', targetUid: safeTargetUid });
}

export async function unfollowUser(targetUid: string): Promise<void> {
  const { firestore, uid: followerUid } = requireAuthenticatedUser();
  const safeTargetUid = normalizeUid(targetUid, 'O perfil');
  if (safeTargetUid === followerUid) throw new Error('Você não pode deixar de seguir seu próprio perfil.');

  await deleteDoc(doc(firestore, 'follows', followDocumentId(followerUid, safeTargetUid)));
}

export async function isFollowing(targetUid: string): Promise<boolean> {
  const { firestore, uid: followerUid } = requireAuthenticatedUser();
  const safeTargetUid = normalizeUid(targetUid, 'O perfil');
  if (safeTargetUid === followerUid) return false;

  const snapshot = await getDoc(doc(firestore, 'follows', followDocumentId(followerUid, safeTargetUid)));
  return snapshot.exists();
}

export async function getFollowCounts(uid: string): Promise<FollowCounts> {
  const { firestore } = requireAuthenticatedUser();
  const safeUid = normalizeUid(uid, 'O usuário');
  const follows = collection(firestore, 'follows');
  const [followersSnapshot, followingSnapshot] = await Promise.all([
    getCountFromServer(query(follows, where('targetUid', '==', safeUid))),
    getCountFromServer(query(follows, where('followerUid', '==', safeUid))),
  ]);

  return {
    followers: followersSnapshot.data().count,
    following: followingSnapshot.data().count,
  };
}

export async function getFollowers(uid: string): Promise<FollowListEntry[]> {
  return getFollowList(uid, 'targetUid');
}

export async function getFollowing(uid: string): Promise<FollowListEntry[]> {
  return getFollowList(uid, 'followerUid');
}
