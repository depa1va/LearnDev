import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import type {
  CommunityPost,
  CommunityPostInput,
  CommunityPostsPage,
  CommunityReply,
  CommunityReport,
  CommunityReportInput,
  CommunityReportsPage,
  CommunityPageOptions,
  CreatedCommunityPost,
  CreatedCommunityReply,
  HelpfulSummary,
  ModeratedContent,
  ModerationAction,
  ModerationCase,
  ModerationReportContext,
  NormalizedCommunityPostInput,
  PostStatus,
  PostType,
  ReportReason,
  ReportStatus,
  ReportTarget,
  ReportTargetType,
} from '../types/community';
import type { PublicUserProfile } from '../types/user';

interface CommunityTypeOption {
  value: PostType;
  label: string;
}

interface ReportReasonOption {
  value: ReportReason;
  label: string;
}

interface CommunityLimits {
  title: { min: number; max: number };
  postBody: { min: number; max: number };
  replyBody: { min: number; max: number };
  tags: { max: number; tagMax: number };
  pageSize: number;
}

type ValidatedReportInput = CommunityReportInput;

interface HelpfulTarget {
  postId: string;
  replyId?: string | null;
}

interface ToggleHelpfulInput extends HelpfulTarget {
  isHelpful: boolean;
}

interface ReviewReportInput {
  reportId: string;
  action: ModerationAction;
  resolutionNote?: string;
}

export const POST_TYPES: ReadonlyArray<CommunityTypeOption> = [
  { value: 'question', label: 'Pergunta' },
  { value: 'discussion', label: 'Discussão' },
];

export const COMMUNITY_LIMITS: CommunityLimits = {
  title: { min: 5, max: 140 },
  postBody: { min: 10, max: 5000 },
  replyBody: { min: 2, max: 3000 },
  tags: { max: 5, tagMax: 30 },
  pageSize: 10,
};

export const REPORT_REASONS: ReadonlyArray<ReportReasonOption> = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Assédio' },
  { value: 'offensive', label: 'Conteúdo ofensivo' },
  { value: 'dangerous', label: 'Informação perigosa' },
  { value: 'other', label: 'Outro' },
];

const PROFILE_QUERY_LIMIT = 30;
const MODERATION_REPORTS_PAGE_SIZE = 20;

export const REPORT_STATUS_LABELS: Readonly<Record<ReportStatus, string>> = {
  open: 'Aberta',
  resolved: 'Resolvida',
  dismissed: 'Descartada',
};

class AlreadyReportedError extends Error {
  readonly code = 'already-reported';
}

function requireFirestore(): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  return db;
}

function requireCommunityAccess(): { firestore: Firestore; uid: string } {
  const firestore = requireFirestore();
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error('Entre na sua conta para usar a comunidade.');
  return { firestore, uid };
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(data: DocumentData, field: string): string | undefined {
  const value: unknown = data[field];
  return typeof value === 'string' ? value : undefined;
}

function readStringArray(data: DocumentData, field: string): string[] | undefined {
  const value: unknown = data[field];
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : undefined;
}

function readTimestamp(data: DocumentData, field: string): Timestamp | undefined {
  const value: unknown = data[field];
  return value instanceof Timestamp ? value : undefined;
}

function isPostType(value: unknown): value is PostType {
  return value === 'question' || value === 'discussion';
}

function isPostStatus(value: unknown): value is PostStatus {
  return value === 'published' || value === 'deleted';
}

function isReportReason(value: unknown): value is ReportReason {
  return value === 'spam' || value === 'harassment' || value === 'offensive' || value === 'dangerous' || value === 'other';
}

function isReportStatus(value: unknown): value is ReportStatus {
  return value === 'open' || value === 'resolved' || value === 'dismissed';
}

function isReportTargetType(value: unknown): value is ReportTargetType {
  return value === 'post' || value === 'reply';
}

function isModerationAction(value: unknown): value is ModerationAction {
  return value === 'remove' || value === 'dismiss';
}

function mapCommunityPost(snapshot: DocumentSnapshot<DocumentData>): CommunityPost | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const authorUid = readString(data, 'authorUid');
  const type: unknown = data.type;
  const title = readString(data, 'title');
  const body = readString(data, 'body');
  const tags = readStringArray(data, 'tags');
  const status: unknown = data.status;
  if (!authorUid || !isPostType(type) || !title || !body || !tags || !isPostStatus(status)) return null;

  const post: CommunityPost = { id: snapshot.id, authorUid, type, title, body, tags, status };
  const createdAt = readTimestamp(data, 'createdAt');
  const updatedAt = readTimestamp(data, 'updatedAt');
  const deletedAt = readTimestamp(data, 'deletedAt');
  const deletedBy = readString(data, 'deletedBy');
  const deletionType: unknown = data.deletionType;
  if (createdAt) post.createdAt = createdAt;
  if (updatedAt) post.updatedAt = updatedAt;
  if (deletedAt) post.deletedAt = deletedAt;
  if (deletedBy) post.deletedBy = deletedBy;
  if (deletionType === 'author' || deletionType === 'moderation') post.deletionType = deletionType;
  return post;
}

function mapCommunityReply(snapshot: DocumentSnapshot<DocumentData>): CommunityReply | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const authorUid = readString(data, 'authorUid');
  const body = readString(data, 'body');
  const status: unknown = data.status;
  if (!authorUid || !body || !isPostStatus(status)) return null;

  const reply: CommunityReply = { id: snapshot.id, authorUid, body, status };
  const createdAt = readTimestamp(data, 'createdAt');
  const updatedAt = readTimestamp(data, 'updatedAt');
  const deletedAt = readTimestamp(data, 'deletedAt');
  const deletedBy = readString(data, 'deletedBy');
  const deletionType: unknown = data.deletionType;
  if (createdAt) reply.createdAt = createdAt;
  if (updatedAt) reply.updatedAt = updatedAt;
  if (deletedAt) reply.deletedAt = deletedAt;
  if (deletedBy) reply.deletedBy = deletedBy;
  if (deletionType === 'author' || deletionType === 'moderation') reply.deletionType = deletionType;
  return reply;
}

function mapCommunityReport(snapshot: DocumentSnapshot<DocumentData>): CommunityReport | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const reporterUid = readString(data, 'reporterUid');
  const targetType: unknown = data.targetType;
  const postId = readString(data, 'postId');
  const reason: unknown = data.reason;
  const details = readString(data, 'details');
  const status: unknown = data.status;
  if (!reporterUid || !isReportTargetType(targetType) || !postId || !isReportReason(reason) || details === undefined || !isReportStatus(status)) return null;

  const replyId = data.replyId;
  if (targetType === 'post' && replyId !== null) return null;
  if (targetType === 'reply' && (typeof replyId !== 'string' || !replyId)) return null;

  const report: CommunityReport = targetType === 'post'
    ? { id: snapshot.id, reporterUid, targetType, postId, replyId: null, reason, details, status }
    : { id: snapshot.id, reporterUid, targetType, postId, replyId, reason, details, status };
  const createdAt = readTimestamp(data, 'createdAt');
  const updatedAt = readTimestamp(data, 'updatedAt');
  const reviewedAt = readTimestamp(data, 'reviewedAt');
  const reviewedBy = readString(data, 'reviewedBy');
  const resolutionNote = readString(data, 'resolutionNote');
  if (createdAt) report.createdAt = createdAt;
  if (updatedAt) report.updatedAt = updatedAt;
  if (reviewedAt) report.reviewedAt = reviewedAt;
  if (reviewedBy) report.reviewedBy = reviewedBy;
  if (resolutionNote !== undefined) report.resolutionNote = resolutionNote;
  return report;
}

function mapPublicProfile(snapshot: DocumentSnapshot<DocumentData>): PublicUserProfile | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const uid = readString(data, 'uid');
  const displayName = readString(data, 'displayName');
  const username = readString(data, 'username');
  if (!uid || !displayName || !username) return null;

  const profile: PublicUserProfile = { id: snapshot.id, uid, displayName, username };
  const usernameNormalized = readString(data, 'usernameNormalized');
  const photoURL = readString(data, 'photoURL');
  const bio = readString(data, 'bio');
  const createdAt = readTimestamp(data, 'createdAt');
  const updatedAt = readTimestamp(data, 'updatedAt');
  if (usernameNormalized) profile.usernameNormalized = usernameNormalized;
  if (photoURL !== undefined) profile.photoURL = photoURL;
  if (bio !== undefined) profile.bio = bio;
  if (createdAt) profile.createdAt = createdAt;
  if (updatedAt) profile.updatedAt = updatedAt;
  return profile;
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function normalizeSpaces(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeBody(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeTag(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^#+/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTags(value: unknown): string[] {
  const rawTags = Array.isArray(value) ? value : String(value ?? '').split(',');
  const tags = rawTags.map(normalizeTag).filter(Boolean);
  return [...new Set(tags)];
}

function validateLength(value: string, limits: { min: number; max: number }, label: string): void {
  if (value.length < limits.min || value.length > limits.max) {
    throw new Error(`${label} deve ter entre ${limits.min} e ${limits.max} caracteres.`);
  }
}

function documentId(value: unknown, label: string): string {
  const id = String(value ?? '').trim();
  if (!id || id.includes('/')) throw new Error(`${label} é inválido.`);
  return id;
}

function getErrorProperty(error: unknown, property: string): string | undefined {
  if (!isDocumentData(error)) return undefined;
  const value: unknown = error[property];
  return typeof value === 'string' ? value : undefined;
}

function hasFirebaseCode(error: unknown, code: string): boolean {
  const errorCode = getErrorProperty(error, 'code') ?? '';
  return errorCode === code || errorCode.endsWith(`/${code}`);
}

function communityActionError(error: unknown, fallback: string): Error {
  if (error instanceof AlreadyReportedError) return error;
  if (hasFirebaseCode(error, 'already-exists')) return new Error('Você já denunciou este conteúdo.');
  if (hasFirebaseCode(error, 'not-found') || hasFirebaseCode(error, 'failed-precondition')) return new Error('Este conteúdo não está mais disponível para esta ação.');
  if (hasFirebaseCode(error, 'permission-denied')) return new Error('Esta ação não está disponível para este conteúdo.');
  return new Error(fallback);
}

function reportAlreadyExistsError(): AlreadyReportedError {
  return new AlreadyReportedError('Você já denunciou este conteúdo.');
}

function readInput(values: unknown): DocumentData {
  return isDocumentData(values) ? values : {};
}

function validateReportInput(values: unknown): ValidatedReportInput {
  const data = readInput(values);
  const targetType: unknown = data.targetType;
  const postId = documentId(data.postId, 'A publicação');
  const replyId = targetType === 'reply' ? documentId(data.replyId, 'A resposta') : null;
  const reason: unknown = data.reason;
  const details = normalizeBody(data.details);

  if (!isReportTargetType(targetType)) throw new Error('Escolha um conteúdo válido para denunciar.');
  if (!isReportReason(reason)) throw new Error('Escolha um motivo para a denúncia.');
  if (details.length > 1000) throw new Error('Os detalhes podem ter no máximo 1000 caracteres.');
  if (reason === 'other' && details.length < 5) throw new Error('Explique o motivo da denúncia em pelo menos 5 caracteres.');

  return targetType === 'post'
    ? { targetType, postId, replyId: null, reason, details }
    : { targetType, postId, replyId, reason, details };
}

function reportIdFor(uid: string, target: ReportTarget): string {
  return target.targetType === 'post'
    ? `${uid}_post_${target.postId}`
    : `${uid}_reply_${target.postId}_${target.replyId}`;
}

function reportTargetReference(firestore: Firestore, report: ReportTarget): DocumentReference<DocumentData> {
  const postId = documentId(report.postId, 'A publicação denunciada');
  if (report.targetType === 'post') return doc(firestore, 'posts', postId);
  return doc(firestore, 'posts', postId, 'replies', documentId(report.replyId, 'A resposta denunciada'));
}

function reportTargetKind(report: ReportTarget): ReportTargetType {
  return report.targetType;
}

function normalizeResolutionNote(value: unknown): string {
  const note = normalizeBody(value);
  if (note.length > 1000) throw new Error('A observação da moderação pode ter no máximo 1000 caracteres.');
  return note;
}

function helpfulReference(firestore: Firestore, { postId, replyId, uid }: HelpfulTarget & { uid: string }): DocumentReference<DocumentData> {
  return replyId
    ? doc(firestore, 'posts', postId, 'replies', replyId, 'helpful', uid)
    : doc(firestore, 'posts', postId, 'helpful', uid);
}

export function validatePostInput(values: unknown): NormalizedCommunityPostInput {
  const data = readInput(values);
  const type: unknown = data.type;
  const title = normalizeSpaces(data.title);
  const body = normalizeBody(data.body);
  const tags = normalizeTags(data.tags);

  if (!isPostType(type)) throw new Error('Escolha se esta publicação é uma pergunta ou uma discussão.');
  validateLength(title, COMMUNITY_LIMITS.title, 'O título');
  validateLength(body, COMMUNITY_LIMITS.postBody, 'O conteúdo');
  if (tags.length > COMMUNITY_LIMITS.tags.max) throw new Error(`Use no máximo ${COMMUNITY_LIMITS.tags.max} tags.`);
  if (tags.some((tag) => tag.length > COMMUNITY_LIMITS.tags.tagMax)) throw new Error(`Cada tag pode ter no máximo ${COMMUNITY_LIMITS.tags.tagMax} caracteres.`);
  if (tags.some((tag) => !/^[a-z0-9][a-z0-9-]*$/.test(tag))) throw new Error('Use tags com letras, números e hífen.');

  return { type, title, body, tags };
}

export function validateReplyInput(value: unknown): string {
  const body = normalizeBody(value);
  validateLength(body, COMMUNITY_LIMITS.replyBody, 'A resposta');
  return body;
}

export async function getPosts({ cursor = null, pageSize = COMMUNITY_LIMITS.pageSize }: CommunityPageOptions = {}): Promise<CommunityPostsPage> {
  const firestore = requireFirestore();
  const safeLimit = Math.min(Math.max(Number(pageSize) || COMMUNITY_LIMITS.pageSize, 1), COMMUNITY_LIMITS.pageSize);
  const constraints: QueryConstraint[] = [where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(safeLimit)];
  if (cursor) constraints.push(startAfter(cursor));

  const snapshot = await getDocs(query(collection(firestore, 'posts'), ...constraints));
  return {
    posts: snapshot.docs.map(mapCommunityPost).filter(isDefined),
    nextCursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === safeLimit,
  };
}

export async function getPostById(postId: string | undefined): Promise<CommunityPost | null> {
  const firestore = requireFirestore();
  const snapshot = await getDoc(doc(firestore, 'posts', documentId(postId, 'A publicação')));
  const post = mapCommunityPost(snapshot);
  return post?.status === 'published' ? post : null;
}

export async function createPost(values: CommunityPostInput): Promise<CreatedCommunityPost> {
  const { firestore, uid: authorUid } = requireCommunityAccess();
  const data = validatePostInput(values);
  const reference = doc(collection(firestore, 'posts'));
  await setDoc(reference, {
    authorUid,
    ...data,
    status: 'published',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: reference.id, ...data, authorUid };
}

export async function updatePost(postId: string, values: CommunityPostInput): Promise<NormalizedCommunityPostInput> {
  const { firestore } = requireCommunityAccess();
  const data = validatePostInput(values);
  await updateDoc(doc(firestore, 'posts', documentId(postId, 'A publicação')), { ...data, updatedAt: serverTimestamp() });
  return data;
}

export async function deletePost(postId: string): Promise<void> {
  const { firestore, uid: deletedBy } = requireCommunityAccess();
  await updateDoc(doc(firestore, 'posts', documentId(postId, 'A publicação')), {
    status: 'deleted',
    deletedBy,
    deletionType: 'author',
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getReplies(postId: string): Promise<CommunityReply[]> {
  const firestore = requireFirestore();
  const safePostId = documentId(postId, 'A publicação');
  const snapshot = await getDocs(query(
    collection(firestore, 'posts', safePostId, 'replies'),
    where('status', '==', 'published'),
    orderBy('createdAt', 'asc'),
  ));
  return snapshot.docs.map(mapCommunityReply).filter(isDefined);
}

export async function createReply(postId: string, value: string): Promise<CreatedCommunityReply> {
  const { firestore, uid: authorUid } = requireCommunityAccess();
  const safePostId = documentId(postId, 'A publicação');
  const body = validateReplyInput(value);
  try {
    const reference = await addDoc(collection(firestore, 'posts', safePostId, 'replies'), {
      authorUid,
      body,
      status: 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: reference.id, postId: safePostId, authorUid, body };
  } catch (error: unknown) {
    console.error('[community:createReply] Firestore write failed', {
      code: getErrorProperty(error, 'code'),
      message: getErrorProperty(error, 'message'),
    });
    throw communityActionError(error, 'Não foi possível publicar sua resposta agora.');
  }
}

export async function updateReply(postId: string, replyId: string, value: string): Promise<string> {
  const { firestore } = requireCommunityAccess();
  const body = validateReplyInput(value);
  await updateDoc(doc(firestore, 'posts', documentId(postId, 'A publicação'), 'replies', documentId(replyId, 'A resposta')), {
    body,
    updatedAt: serverTimestamp(),
  });
  return body;
}

export async function deleteReply(postId: string, replyId: string): Promise<void> {
  const { firestore, uid: deletedBy } = requireCommunityAccess();
  await updateDoc(doc(firestore, 'posts', documentId(postId, 'A publicação'), 'replies', documentId(replyId, 'A resposta')), {
    status: 'deleted',
    deletedBy,
    deletionType: 'author',
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

async function getHelpfulSummary({ postId, replyId = null }: HelpfulTarget): Promise<HelpfulSummary> {
  const { firestore, uid } = requireCommunityAccess();
  const helpfulCollection = replyId
    ? collection(firestore, 'posts', postId, 'replies', replyId, 'helpful')
    : collection(firestore, 'posts', postId, 'helpful');
  const helpfulDoc = helpfulReference(firestore, { postId, replyId, uid });

  try {
    const [countSnapshot, userSnapshot] = await Promise.all([getCountFromServer(helpfulCollection), getDoc(helpfulDoc)]);
    return { count: countSnapshot.data().count, isHelpful: userSnapshot.exists() };
  } catch (error: unknown) {
    throw communityActionError(error, 'Não foi possível carregar as reações agora.');
  }
}

export function getPostHelpfulSummary(postId: string): Promise<HelpfulSummary> {
  return getHelpfulSummary({ postId: documentId(postId, 'A publicação') });
}

export function getReplyHelpfulSummary(postId: string, replyId: string): Promise<HelpfulSummary> {
  return getHelpfulSummary({ postId: documentId(postId, 'A publicação'), replyId: documentId(replyId, 'A resposta') });
}

export async function getReplyHelpfulStates(postId: string, replyIds: string[] = []): Promise<Map<string, boolean>> {
  const { firestore, uid } = requireCommunityAccess();
  const safePostId = documentId(postId, 'A publicação');
  const uniqueReplyIds = [...new Set(replyIds.map((replyId) => documentId(replyId, 'A resposta')))];

  try {
    const snapshots = await Promise.all(uniqueReplyIds.map((replyId) => getDoc(helpfulReference(firestore, { postId: safePostId, replyId, uid }))));
    return new Map(uniqueReplyIds.map((replyId, index) => [replyId, snapshots[index].exists()]));
  } catch (error: unknown) {
    throw communityActionError(error, 'Não foi possível carregar as reações das respostas agora.');
  }
}

async function toggleHelpful({ postId, replyId = null, isHelpful }: ToggleHelpfulInput): Promise<boolean> {
  const { firestore, uid } = requireCommunityAccess();
  const reference = helpfulReference(firestore, { postId, replyId, uid });

  try {
    if (isHelpful) await deleteDoc(reference);
    else await setDoc(reference, { uid, createdAt: serverTimestamp() });
    return !isHelpful;
  } catch (error: unknown) {
    throw communityActionError(error, 'Não foi possível atualizar a reação agora.');
  }
}

export function togglePostHelpful(postId: string, isHelpful: boolean): Promise<boolean> {
  return toggleHelpful({ postId: documentId(postId, 'A publicação'), isHelpful: Boolean(isHelpful) });
}

export function toggleReplyHelpful(postId: string, replyId: string, isHelpful: boolean): Promise<boolean> {
  return toggleHelpful({
    postId: documentId(postId, 'A publicação'),
    replyId: documentId(replyId, 'A resposta'),
    isHelpful: Boolean(isHelpful),
  });
}

export async function hasUserReported(values: ReportTarget): Promise<boolean> {
  const { firestore, uid: reporterUid } = requireCommunityAccess();
  const target = validateReportInput({ ...values, reason: 'spam', details: '' });
  const reference = doc(firestore, 'reports', reportIdFor(reporterUid, target));

  try {
    const snapshot = await getDoc(reference);
    return snapshot.exists();
  } catch (error: unknown) {
    if (hasFirebaseCode(error, 'permission-denied')) return false;
    throw communityActionError(error, 'Não foi possível verificar esta denúncia agora.');
  }
}

export async function createReport(values: CommunityReportInput): Promise<CommunityReport> {
  const { firestore, uid: reporterUid } = requireCommunityAccess();
  const target = validateReportInput(values);
  const reportId = reportIdFor(reporterUid, target);
  const reference = doc(firestore, 'reports', reportId);

  if (await hasUserReported(target)) throw reportAlreadyExistsError();

  try {
    await setDoc(reference, {
      reporterUid,
      targetType: target.targetType,
      postId: target.postId,
      replyId: target.replyId,
      reason: target.reason,
      details: target.details,
      status: 'open',
      createdAt: serverTimestamp(),
    });
  } catch (error: unknown) {
    try {
      if (await hasUserReported(target)) throw reportAlreadyExistsError();
    } catch (checkError: unknown) {
      if (checkError instanceof AlreadyReportedError) throw checkError;
    }
    throw communityActionError(error, 'Não foi possível enviar a denúncia agora.');
  }

  return { id: reportId, ...target, reporterUid, status: 'open' };
}

export function getReportReasonLabel(reason: ReportReason | string): string {
  return REPORT_REASONS.find((item) => item.value === reason)?.label ?? 'Motivo não informado';
}

export function getReportStatusLabel(status: ReportStatus | string): string {
  return isReportStatus(status) ? REPORT_STATUS_LABELS[status] : 'Status desconhecido';
}

export async function getOpenReports({ cursor = null, pageSize = MODERATION_REPORTS_PAGE_SIZE }: CommunityPageOptions = {}): Promise<CommunityReportsPage> {
  const firestore = requireFirestore();
  const safeLimit = Math.min(Math.max(Number(pageSize) || MODERATION_REPORTS_PAGE_SIZE, 1), MODERATION_REPORTS_PAGE_SIZE);
  const constraints: QueryConstraint[] = [where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(safeLimit)];
  if (cursor) constraints.push(startAfter(cursor));

  try {
    const snapshot = await getDocs(query(collection(firestore, 'reports'), ...constraints));
    return {
      reports: snapshot.docs.map(mapCommunityReport).filter(isDefined),
      nextCursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
      hasMore: snapshot.docs.length === safeLimit,
    };
  } catch (error: unknown) {
    throw communityActionError(error, 'Não foi possível carregar as denúncias agora.');
  }
}

export async function getModerationReportTargets(reports: CommunityReport[] = []): Promise<Map<string, ModerationReportContext>> {
  const firestore = requireFirestore();
  const contexts = await Promise.all(reports.map(async (report): Promise<[string, ModerationReportContext]> => {
    try {
      const snapshot = await getDoc(reportTargetReference(firestore, report));
      const content = report.targetType === 'post' ? mapCommunityPost(snapshot) : mapCommunityReply(snapshot);
      return [report.id, { content, kind: reportTargetKind(report), unavailable: false }];
    } catch {
      return [report.id, { content: null, kind: reportTargetKind(report), unavailable: true }];
    }
  }));
  return new Map(contexts);
}

export async function reviewReport({ reportId, action, resolutionNote = '' }: ReviewReportInput): Promise<ModerationCase> {
  const { firestore, uid: reviewerUid } = requireCommunityAccess();
  const safeReportId = documentId(reportId, 'A denúncia');
  if (!isModerationAction(action)) throw new Error('Escolha uma ação de moderação válida.');
  const note = normalizeResolutionNote(resolutionNote);
  const reportRef = doc(firestore, 'reports', safeReportId);

  try {
    const reportSnapshot = await getDoc(reportRef);
    const report = mapCommunityReport(reportSnapshot);
    if (!report || report.status !== 'open') throw new Error('Esta denúncia não está mais aberta para análise.');

    const batch = writeBatch(firestore);
    let target: ModeratedContent | null = null;

    if (action === 'remove') {
      const targetRef = reportTargetReference(firestore, report);
      const targetSnapshot = await getDoc(targetRef);
      target = report.targetType === 'post' ? mapCommunityPost(targetSnapshot) : mapCommunityReply(targetSnapshot);

      if (target?.status === 'published') {
        batch.update(targetRef, {
          status: 'deleted',
          deletedBy: reviewerUid,
          deletionType: 'moderation',
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const status: Exclude<ReportStatus, 'open'> = action === 'remove' ? 'resolved' : 'dismissed';
    const reportUpdate = {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerUid,
      ...(note ? { resolutionNote: note } : {}),
    };
    batch.update(reportRef, reportUpdate);
    await batch.commit();

    return {
      reportId: safeReportId,
      status,
      target,
      contentRemoved: action === 'remove' && target?.status === 'published',
    };
  } catch (error: unknown) {
    throw communityActionError(error, 'Não foi possível concluir esta ação de moderação agora.');
  }
}

export async function getPublicProfilesByUids(uids: string[] = []): Promise<Map<string, PublicUserProfile>> {
  const firestore = requireFirestore();
  const uniqueUids = [...new Set(uids.filter((uid) => Boolean(uid)))];
  if (uniqueUids.length === 0) return new Map();

  const chunks = Array.from(
    { length: Math.ceil(uniqueUids.length / PROFILE_QUERY_LIMIT) },
    (_, index) => uniqueUids.slice(index * PROFILE_QUERY_LIMIT, (index + 1) * PROFILE_QUERY_LIMIT),
  );
  const snapshots = await Promise.all(chunks.map((uidsChunk) => getDocs(query(
    collection(firestore, 'profiles'),
    where('uid', 'in', uidsChunk),
  ))));
  const profiles = snapshots.flatMap((snapshot) => snapshot.docs.map(mapPublicProfile).filter(isDefined));
  return new Map(profiles.map((profile) => [profile.uid, profile]));
}
