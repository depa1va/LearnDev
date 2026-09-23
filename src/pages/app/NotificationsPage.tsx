import { Bell, CheckCheck, UserRound } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { getPublicProfilesByUids } from '../../services/communityService';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService';
import { getAvatarInitials } from '../../services/profileService';
import { formatStudyDateTime } from '../../utils/date';
import type { LearnDevNotification, NotificationListEntry } from '../../types/notification';
import type { PublicUserProfile } from '../../types/user';

interface NotificationsPageState {
  loading: boolean;
  error: string;
  entries: NotificationListEntry[];
  unreadCount: number;
}

const initialNotificationsState = (): NotificationsPageState => ({
  loading: true,
  error: '',
  entries: [],
  unreadCount: 0,
});

function notificationMarkedAsRead(notification: LearnDevNotification): LearnDevNotification {
  switch (notification.type) {
    case 'new_follower':
      return { ...notification, read: true };
    case 'followed_user_post':
      return { ...notification, read: true };
    case 'post_reply':
      return { ...notification, read: true };
    case 'helpful_post':
      return { ...notification, read: true };
    case 'helpful_reply':
      return { ...notification, read: true };
  }
}

function notificationTarget(notification: LearnDevNotification, actor: PublicUserProfile | null): string | null {
  if (notification.type === 'new_follower') {
    return actor ? `/perfil/${encodeURIComponent(actor.username)}` : null;
  }
  return `/comunidade/posts/${notification.source.postId}`;
}

function notificationText(notification: LearnDevNotification, actor: PublicUserProfile | null): string {
  const name = actor?.displayName ?? 'Uma pessoa';
  switch (notification.type) {
    case 'new_follower':
      return `${name} começou a seguir você.`;
    case 'followed_user_post':
      return `${name} publicou algo novo na comunidade.`;
    case 'post_reply':
      return `${name} respondeu à sua publicação.`;
    case 'helpful_post':
      return `${name} marcou sua publicação como útil.`;
    case 'helpful_reply':
      return `${name} marcou sua resposta como útil.`;
  }
}

function NotificationItem({ entry, onOpen }: { entry: NotificationListEntry; onOpen: (notification: LearnDevNotification) => void }): ReactElement {
  const { notification, actor } = entry;
  const destination = notificationTarget(notification, actor);
  const content = <>
    <Avatar initials={getAvatarInitials(actor?.displayName, actor?.username ?? '')} photoURL={actor?.photoURL} size="md" />
    <span className="min-w-0 flex-1">
      <span className="block text-sm leading-relaxed text-ink"><span className="font-semibold">{notificationText(notification, actor)}</span></span>
      {actor && <span className="mt-1 block text-xs font-semibold text-primary">@{actor.username}</span>}
      <span className="mt-2 block text-xs text-ink/50">{formatStudyDateTime(notification.createdAt)}</span>
    </span>
    {!notification.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Não lida" />}
  </>;

  if (!destination) {
    return <li className={`flex items-start gap-4 rounded-2xl border p-5 ${notification.read ? 'border-ink/8 bg-white' : 'border-primary/20 bg-primary/[0.03]'}`}>{content}</li>;
  }

  return <li>
    <Link to={destination} onClick={() => onOpen(notification)} className={`flex items-start gap-4 rounded-2xl border p-5 transition-colors hover:border-primary/35 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${notification.read ? 'border-ink/8 bg-white' : 'border-primary/20 bg-primary/[0.03]'}`}>
      {content}
    </Link>
  </li>;
}

export default function NotificationsPage(): ReactElement {
  const [state, setState] = useState<NotificationsPageState>(initialNotificationsState);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setState(initialNotificationsState());

    async function loadNotifications(): Promise<void> {
      try {
        const [notifications, unreadCount] = await Promise.all([getNotifications(), getUnreadNotificationCount()]);
        let actors = new Map<string, PublicUserProfile>();
        try {
          actors = await getPublicProfilesByUids(notifications.map((notification) => notification.actorUid));
        } catch {
          // A notificação permanece disponível mesmo se o perfil público do ator não puder ser carregado.
        }
        if (!active) return;
        setState({
          loading: false,
          error: '',
          unreadCount,
          entries: notifications.map((notification) => ({ notification, actor: actors.get(notification.actorUid) ?? null })),
        });
      } catch {
        if (active) setState({ ...initialNotificationsState(), loading: false, error: 'Não foi possível carregar suas notificações agora. Tente novamente.' });
      }
    }

    void loadNotifications();
    return () => {
      active = false;
    };
  }, [retry]);

  function handleOpen(notification: LearnDevNotification): void {
    if (notification.read) return;
    void markNotificationAsRead(notification.id)
      .then((changed) => {
        if (!changed) return;
        setState((current) => ({
          ...current,
          unreadCount: Math.max(0, current.unreadCount - 1),
          entries: current.entries.map((entry) => entry.notification.id === notification.id
            ? { ...entry, notification: notificationMarkedAsRead(entry.notification) }
            : entry),
        }));
      })
      .catch(() => {
        // A navegação permanece disponível; a próxima leitura tentará sincronizar o estado.
      });
  }

  async function handleMarkAllAsRead(): Promise<void> {
    if (isMarkingAll || state.unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setState((current) => ({
        ...current,
        unreadCount: 0,
        entries: current.entries.map((entry) => ({ ...entry, notification: notificationMarkedAsRead(entry.notification) })),
      }));
    } catch {
      setState((current) => ({ ...current, error: 'Não foi possível marcar todas as notificações como lidas agora.' }));
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <PageFrame>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <PageIntro eyebrow="Conta" title="Notificações" description="Acompanhe interações relevantes da comunidade." />
        {state.unreadCount > 0 && <button type="button" onClick={handleMarkAllAsRead} disabled={isMarkingAll} className="mt-1 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"><CheckCheck aria-hidden="true" className="h-4 w-4" />{isMarkingAll ? 'Marcando...' : 'Marcar todas como lidas'}</button>}
      </div>

      <section aria-live="polite" className="max-w-3xl">
        {state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando notificações...</div> : state.error && state.entries.length === 0 ? <EmptyState icon={Bell} title="Não foi possível carregar as notificações." description={state.error} action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /> : state.entries.length === 0 ? <EmptyState icon={Bell} title="Você não tem notificações." description="Quando houver novas interações na comunidade, elas aparecerão aqui." /> : <GlassCard hover={false} className="p-4 sm:p-5">
          {state.error && <p role="alert" className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">{state.error}</p>}
          <ol className="space-y-3">{state.entries.map((entry) => <NotificationItem key={entry.notification.id} entry={entry} onOpen={handleOpen} />)}</ol>
        </GlassCard>}
      </section>
    </PageFrame>
  );
}
