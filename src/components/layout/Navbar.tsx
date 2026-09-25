import { useEffect, useState, type MouseEventHandler, type ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LayoutDashboard, Menu, Search, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeControls';
import Brand from './Brand';
import { navLinks } from '../../data/content';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../providers/AuthProvider';
import { getAvatarInitials } from '../../services/profileService';
import { getUnreadNotificationCount, NOTIFICATIONS_UPDATED_EVENT } from '../../services/notificationService';
import type { UserAccount } from '../../types/user';
import styles from './Navbar.module.css';

interface ProfileLinkProps {
  account: UserAccount | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  mobile?: boolean;
}

function SessionPlaceholder(): ReactElement {
  return <div aria-label="Carregando sessão" className="h-10 w-28 animate-pulse rounded-xl bg-ink/5" />;
}

function ProfileLink({ account, onClick, mobile = false }: ProfileLinkProps): ReactElement {
  const username = account?.usernameNormalized || account?.username;
  if (!username) {
    return <Link to="/dashboard" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5"><LayoutDashboard aria-hidden="true" className="h-4 w-4" />Ir para o painel</Link>;
  }

  const displayName = account?.displayName?.trim() || username;
  const initials = getAvatarInitials(displayName, username);

  return (
    <Link
      to={`/perfil/${encodeURIComponent(username)}`}
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 rounded-xl text-left transition-colors hover:bg-primary/5 ${mobile ? 'w-full border border-ink/10 bg-mist px-4 py-3' : 'px-2 py-1.5'}`}
    >
      <Avatar size="sm" initials={initials} photoURL={account?.photoURL ?? ''} className="group-hover:ring-2 group-hover:ring-primary/20" />
      <span className="min-w-0">
        <span className="block max-w-32 truncate text-sm font-semibold text-ink">{displayName}</span>
        <span className="block max-w-32 truncate text-xs text-ink/50">@{username}</span>
      </span>
    </Link>
  );
}

function NotificationLink({ unreadCount, mobile = false, onClick }: { unreadCount: number; mobile?: boolean; onClick?: MouseEventHandler<HTMLAnchorElement> }): ReactElement {
  const hasUnread = unreadCount > 0;
  const label = hasUnread ? `${unreadCount > 9 ? '9+' : unreadCount} notificações não lidas` : 'Notificações';
  return (
    <Link to="/notificacoes" onClick={onClick} aria-label={label} title="Notificações" className={`relative inline-flex items-center justify-center rounded-xl text-ink/70 transition-colors hover:bg-primary/5 hover:text-primary ${mobile ? 'w-full justify-start gap-3 border border-ink/10 bg-mist px-4 py-3 text-sm font-semibold' : 'p-2'}`}>
      <Bell aria-hidden="true" className="h-5 w-5" />
      {mobile && <span>Notificações</span>}
      {hasUnread && <span className={`inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ${mobile ? 'ml-auto' : 'absolute -right-1 -top-1'}`}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
    </Link>
  );
}

export default function Navbar(): ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, account, isLoading, isAccountLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isSessionLoading = isLoading || (Boolean(user) && isAccountLoading);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 24); }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setUnreadCount(0);
      return () => {
        active = false;
      };
    }

    function loadUnreadCount(): void {
      void getUnreadNotificationCount()
        .then((count) => {
          if (active) setUnreadCount(count);
        })
        .catch(() => {
          if (active) setUnreadCount(0);
        });
    }

    loadUnreadCount();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    return () => {
      active = false;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    };
  }, [user?.uid]);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${styles.header} fixed top-0 inset-x-0 z-50 ${
        scrolled ? `${styles.scrolled} py-3` : `${styles.transparent} py-5`
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Brand />

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm font-medium text-ink/70 hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          <Link to="/usuarios" aria-label="Buscar usuários" title="Buscar usuários" className="inline-flex items-center justify-center rounded-lg p-2 text-ink/70 transition-colors hover:bg-primary/5 hover:text-primary">
            <Search aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {isSessionLoading ? <SessionPlaceholder /> : isAuthenticated ? <><NotificationLink unreadCount={unreadCount} /><ProfileLink account={account} /></> : <><Link to="/entrar" className="px-2 text-sm font-semibold text-ink/70 transition-colors hover:text-primary">Entrar</Link><Button as={Link} to="/cadastro" size="md">Criar conta</Button></>}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {!isSessionLoading && isAuthenticated && <NotificationLink unreadCount={unreadCount} />}
          <button type="button" aria-label="Abrir menu" className="rounded-lg p-1 text-ink" onClick={() => setOpen((value) => !value)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${styles.mobileMenu} lg:hidden overflow-hidden border-t mt-3`}
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="text-ink/70 font-medium">
                  {link.label}
                </Link>
              ))}
              <Link to="/usuarios" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 text-ink/70 font-medium"><Search aria-hidden="true" className="h-4 w-4" />Buscar usuários</Link>
              <div className="flex flex-col gap-3 pt-3 border-t border-ink/5">
                {isSessionLoading ? <SessionPlaceholder /> : isAuthenticated ? <><NotificationLink unreadCount={unreadCount} mobile onClick={() => setOpen(false)} /><ProfileLink account={account} mobile onClick={() => setOpen(false)} /><Button as={Link} to="/dashboard" onClick={() => setOpen(false)} icon={LayoutDashboard}>Dashboard</Button></> : <><Link to="/entrar" onClick={() => setOpen(false)} className="text-left text-sm font-semibold text-ink/70">Entrar</Link><Button as={Link} to="/cadastro" onClick={() => setOpen(false)}>Criar conta</Button></>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
