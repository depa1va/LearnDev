import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import type { FirestoreDocument, TimestampedDocument } from './common';

export type PostType = 'question' | 'discussion';
export type PostStatus = 'published' | 'deleted';
export type ReplyStatus = PostStatus;
export type ContentDeletionType = 'author' | 'moderation';
export type ReportTargetType = 'post' | 'reply';
export type ReportReason = 'spam' | 'harassment' | 'offensive' | 'dangerous' | 'other';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';
export type ModerationAction = 'remove' | 'dismiss';

export interface CommunityPost extends FirestoreDocument, TimestampedDocument {
  authorUid: string;
  type: PostType;
  title: string;
  body: string;
  tags: string[];
  status: PostStatus;
  deletedBy?: string;
  deletionType?: ContentDeletionType;
  deletedAt?: Timestamp;
}

export interface CommunityReply extends FirestoreDocument, TimestampedDocument {
  postId?: string;
  authorUid: string;
  body: string;
  status: ReplyStatus;
  deletedBy?: string;
  deletionType?: ContentDeletionType;
  deletedAt?: Timestamp;
}

export interface CreatedCommunityPost {
  id: string;
  authorUid: string;
  type: PostType;
  title: string;
  body: string;
  tags: string[];
}

export interface CreatedCommunityReply {
  id: string;
  postId: string;
  authorUid: string;
  body: string;
}

export interface CommunityPostInput {
  type: PostType;
  title: string;
  body: string;
  tags: string | string[];
}

export interface NormalizedCommunityPostInput {
  type: PostType;
  title: string;
  body: string;
  tags: string[];
}

export interface HelpfulEntry extends FirestoreDocument, TimestampedDocument {
  uid: string;
}

export interface HelpfulSummary {
  count: number;
  isHelpful: boolean;
}

export interface HelpfulState {
  isHelpful: boolean;
  isSaving: boolean;
  isLoading?: boolean;
}

export interface PostReportTarget {
  targetType: 'post';
  postId: string;
  replyId: null;
}

export interface ReplyReportTarget {
  targetType: 'reply';
  postId: string;
  replyId: string;
}

export type ReportTarget = PostReportTarget | ReplyReportTarget;

export type CommunityReport = FirestoreDocument & TimestampedDocument & ReportTarget & {
  reporterUid: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  resolutionNote?: string;
};

export type CommunityReportInput = ReportTarget & {
  reason: ReportReason;
  details: string;
};

export type ModeratedContent = CommunityPost | CommunityReply;

export interface ModerationReportContext {
  content: ModeratedContent | null;
  kind: ReportTargetType;
  unavailable: boolean;
}

/** Resultado local de uma decisão de moderação; não é uma nova coleção. */
export interface ModerationCase {
  reportId: string;
  status: Exclude<ReportStatus, 'open'>;
  target: ModeratedContent | null;
  contentRemoved: boolean;
}

export interface CommunityPostsPage {
  posts: CommunityPost[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export interface CommunityReportsPage {
  reports: CommunityReport[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export interface CommunityPageOptions {
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  pageSize?: number;
}
