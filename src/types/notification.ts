import type { Timestamp } from 'firebase/firestore';
import type { FirestoreDocument, TimestampedDocument } from './common';
import type { PublicUserProfile } from './user';

export type NotificationType = 'new_follower' | 'followed_user_post' | 'post_reply' | 'helpful_post' | 'helpful_reply';

export interface ProfileNotificationSource {
  kind: 'profile';
}

export interface PostNotificationSource {
  kind: 'post';
  postId: string;
}

export interface ReplyNotificationSource {
  kind: 'reply';
  postId: string;
  replyId: string;
}

interface NotificationBase extends FirestoreDocument, TimestampedDocument {
  actorUid: string;
  read: boolean;
  readAt?: Timestamp;
}

export interface NewFollowerNotification extends NotificationBase {
  type: 'new_follower';
  source: ProfileNotificationSource;
}

export interface FollowedUserPostNotification extends NotificationBase {
  type: 'followed_user_post';
  source: PostNotificationSource;
}

export interface PostReplyNotification extends NotificationBase {
  type: 'post_reply';
  source: ReplyNotificationSource;
}

export interface HelpfulPostNotification extends NotificationBase {
  type: 'helpful_post';
  source: PostNotificationSource;
}

export interface HelpfulReplyNotification extends NotificationBase {
  type: 'helpful_reply';
  source: ReplyNotificationSource;
}

export type LearnDevNotification =
  | NewFollowerNotification
  | FollowedUserPostNotification
  | PostReplyNotification
  | HelpfulPostNotification
  | HelpfulReplyNotification;

export interface NotificationListEntry {
  notification: LearnDevNotification;
  actor: PublicUserProfile | null;
}

export type SocialNotificationEvent = 'follow' | 'post' | 'reply' | 'helpful_post' | 'helpful_reply';

export type SocialNotificationPayload =
  | { event: 'follow'; targetUid: string }
  | { event: 'post'; postId: string }
  | { event: 'reply'; postId: string; replyId: string }
  | { event: 'helpful_post'; postId: string }
  | { event: 'helpful_reply'; postId: string; replyId: string };
