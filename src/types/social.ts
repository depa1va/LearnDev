import type { Timestamp } from 'firebase/firestore';
import type { FirestoreDocument, TimestampedDocument } from './common';
import type { PublicUserProfile } from './user';

export interface FollowRelation extends FirestoreDocument, TimestampedDocument {
  followerUid: string;
  targetUid: string;
  createdAt?: Timestamp;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

export interface FollowListEntry {
  relation: FollowRelation;
  profile: PublicUserProfile;
}
