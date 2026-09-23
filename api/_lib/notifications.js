import { FieldValue } from 'firebase-admin/firestore';

const NOTIFICATION_BATCH_SIZE = 400;

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(data, field) {
  const value = data?.[field];
  return typeof value === 'string' && value.trim() ? value : null;
}

function safeDocumentId(value, label) {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id || id.includes('/')) throw new Error(`${label} é inválido.`);
  return id;
}

function isAlreadyExists(error) {
  return error?.code === 6 || error?.code === 'already-exists';
}

function notificationData(type, actorUid, source) {
  return {
    type,
    actorUid,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    source,
  };
}

async function createNotificationIfAbsent(firestore, recipientUid, notificationId, data) {
  const reference = firestore.collection('users').doc(recipientUid).collection('notifications').doc(notificationId);
  try {
    await reference.create(data);
    return true;
  } catch (error) {
    if (isAlreadyExists(error)) return false;
    throw error;
  }
}

async function createNotificationsForFollowers(firestore, recipientUids, notificationId, data) {
  let created = 0;
  const uniqueRecipients = [...new Set(recipientUids.filter(Boolean))];

  for (let index = 0; index < uniqueRecipients.length; index += NOTIFICATION_BATCH_SIZE) {
    const recipients = uniqueRecipients.slice(index, index + NOTIFICATION_BATCH_SIZE);
    const references = recipients.map((recipientUid) => firestore.collection('users').doc(recipientUid).collection('notifications').doc(notificationId));
    const existing = await firestore.getAll(...references);
    const batch = firestore.batch();
    let hasWrites = false;

    existing.forEach((snapshot, recipientIndex) => {
      if (!snapshot.exists) {
        batch.create(references[recipientIndex], data);
        hasWrites = true;
      }
    });

    if (!hasWrites) continue;
    try {
      await batch.commit();
      created += recipients.filter((_, recipientIndex) => !existing[recipientIndex].exists).length;
    } catch (error) {
      if (!isAlreadyExists(error)) throw error;
      const results = await Promise.all(recipients.map((recipientUid) => createNotificationIfAbsent(firestore, recipientUid, notificationId, data)));
      created += results.filter(Boolean).length;
    }
  }

  return created;
}

async function requirePublishedPost(firestore, postId, actorUid) {
  const snapshot = await firestore.collection('posts').doc(postId).get();
  const data = snapshot.data();
  if (!snapshot.exists || !isRecord(data) || data.status !== 'published' || readText(data, 'authorUid') !== actorUid) {
    throw new Error('A publicação não está disponível para este evento.');
  }
  return { snapshot, data };
}

async function processFollow({ firestore, actorUid, targetUid }) {
  const safeTargetUid = safeDocumentId(targetUid, 'O perfil');
  if (safeTargetUid === actorUid) throw new Error('Você não pode seguir seu próprio perfil.');

  const followId = `${actorUid}_${safeTargetUid}`;
  const snapshot = await firestore.collection('follows').doc(followId).get();
  const data = snapshot.data();
  if (!snapshot.exists || !isRecord(data) || data.followerUid !== actorUid || data.targetUid !== safeTargetUid) {
    throw new Error('A relação de acompanhamento não foi encontrada.');
  }
  const targetSnapshot = await firestore.collection('users').doc(safeTargetUid).get();
  if (!targetSnapshot.exists) throw new Error('O perfil acompanhado não está disponível.');

  return createNotificationIfAbsent(
    firestore,
    safeTargetUid,
    `follow_${actorUid}`,
    notificationData('new_follower', actorUid, { kind: 'profile' }),
  );
}

async function processPost({ firestore, actorUid, postId }) {
  const safePostId = safeDocumentId(postId, 'A publicação');
  await requirePublishedPost(firestore, safePostId, actorUid);
  const followersSnapshot = await firestore.collection('follows').where('targetUid', '==', actorUid).get();
  const recipients = followersSnapshot.docs
    .map((snapshot) => readText(snapshot.data(), 'followerUid'))
    .filter((uid) => uid && uid !== actorUid);

  return createNotificationsForFollowers(
    firestore,
    recipients,
    `post_${safePostId}`,
    notificationData('followed_user_post', actorUid, { kind: 'post', postId: safePostId }),
  );
}

async function processReply({ firestore, actorUid, postId, replyId }) {
  const safePostId = safeDocumentId(postId, 'A publicação');
  const safeReplyId = safeDocumentId(replyId, 'A resposta');
  const postSnapshot = await firestore.collection('posts').doc(safePostId).get();
  const post = postSnapshot.data();
  const replySnapshot = await firestore.collection('posts').doc(safePostId).collection('replies').doc(safeReplyId).get();
  const reply = replySnapshot.data();
  const recipientUid = isRecord(post) ? readText(post, 'authorUid') : null;

  if (!postSnapshot.exists || !isRecord(post) || post.status !== 'published' || !replySnapshot.exists || !isRecord(reply) || reply.status !== 'published' || readText(reply, 'authorUid') !== actorUid) {
    throw new Error('A resposta não está disponível para este evento.');
  }
  if (!recipientUid || recipientUid === actorUid) return false;

  return createNotificationIfAbsent(
    firestore,
    recipientUid,
    `reply_${safePostId}_${safeReplyId}`,
    notificationData('post_reply', actorUid, { kind: 'reply', postId: safePostId, replyId: safeReplyId }),
  );
}

async function processHelpfulPost({ firestore, actorUid, postId }) {
  const safePostId = safeDocumentId(postId, 'A publicação');
  const postSnapshot = await firestore.collection('posts').doc(safePostId).get();
  const post = postSnapshot.data();
  const helpfulSnapshot = await firestore.collection('posts').doc(safePostId).collection('helpful').doc(actorUid).get();
  const recipientUid = isRecord(post) ? readText(post, 'authorUid') : null;

  if (!postSnapshot.exists || !isRecord(post) || post.status !== 'published' || !helpfulSnapshot.exists || readText(helpfulSnapshot.data(), 'uid') !== actorUid) {
    throw new Error('A marcação útil não está disponível para este evento.');
  }
  if (!recipientUid || recipientUid === actorUid) return false;

  return createNotificationIfAbsent(
    firestore,
    recipientUid,
    `helpful_post_${safePostId}_${actorUid}`,
    notificationData('helpful_post', actorUid, { kind: 'post', postId: safePostId }),
  );
}

async function processHelpfulReply({ firestore, actorUid, postId, replyId }) {
  const safePostId = safeDocumentId(postId, 'A publicação');
  const safeReplyId = safeDocumentId(replyId, 'A resposta');
  const replySnapshot = await firestore.collection('posts').doc(safePostId).collection('replies').doc(safeReplyId).get();
  const reply = replySnapshot.data();
  const helpfulSnapshot = await firestore.collection('posts').doc(safePostId).collection('replies').doc(safeReplyId).collection('helpful').doc(actorUid).get();
  const recipientUid = isRecord(reply) ? readText(reply, 'authorUid') : null;

  if (!replySnapshot.exists || !isRecord(reply) || reply.status !== 'published' || !helpfulSnapshot.exists || readText(helpfulSnapshot.data(), 'uid') !== actorUid) {
    throw new Error('A marcação útil não está disponível para este evento.');
  }
  if (!recipientUid || recipientUid === actorUid) return false;

  return createNotificationIfAbsent(
    firestore,
    recipientUid,
    `helpful_reply_${safeReplyId}_${actorUid}`,
    notificationData('helpful_reply', actorUid, { kind: 'reply', postId: safePostId, replyId: safeReplyId }),
  );
}

/**
 * Valida no Firestore o evento iniciado por actorUid e cria somente as notificações legítimas.
 * actorUid sempre vem do ID token verificado; o corpo contém apenas o recurso afetado.
 */
export async function processSocialEvent(firestore, actorUid, payload) {
  if (!isRecord(payload) || typeof payload.event !== 'string') throw new Error('Evento de notificação inválido.');

  switch (payload.event) {
    case 'follow':
      return processFollow({ firestore, actorUid, targetUid: payload.targetUid });
    case 'post':
      return processPost({ firestore, actorUid, postId: payload.postId });
    case 'reply':
      return processReply({ firestore, actorUid, postId: payload.postId, replyId: payload.replyId });
    case 'helpful_post':
      return processHelpfulPost({ firestore, actorUid, postId: payload.postId });
    case 'helpful_reply':
      return processHelpfulReply({ firestore, actorUid, postId: payload.postId, replyId: payload.replyId });
    default:
      throw new Error('Evento de notificação inválido.');
  }
}
