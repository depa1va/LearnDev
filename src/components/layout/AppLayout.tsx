import { useEffect, useState, type MouseEventHandler, type ReactElement } from 'react';
import { BarChart3, Bell, BookOpen, LogOut, Menu, MessageCircle, Search, Settings, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../../providers/AuthProvider';
import { ThemeToggle } from '../ui/ThemeControls';
import { getUnreadNotificationCount, NOTIFICATIONS_UPDATED_EVENT } from '../../services/notificationService';

interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavigationProps {
  canModerate: boolean;
  unreadNotificationCount: number;
  onNavigate?: MouseEventHandler<HTMLAnchorElement>;
  compact?: boolean;
}

const navigation: readonly NavigationItem[] = [
  { label: 'Painel', to: '/dashboard', icon: BarChart3 },
  { label: 'Trilhas', to: '/trilhas', icon: BookOpen },
  { label: 'Progresso', to: '/progresso', icon: BarChart3 },
  { label: 'Comunidade', to: '/comunidade', icon: MessageCircle },
  { label: 'Notificações', to: '/notificacoes', icon: Bell },
  { label: 'Pessoas', to: '/usuarios', icon: Search },
];

function Navigation({ canModerate, unreadNotificationCount, onNavigate, compact = false }: NavigationProps): ReactElement {
  const items = canModerate
    ? [...navigation, { label: 'Moderação', to: '/moderacao', icon: ShieldCheck }]
    : navigation;

  return (
    <nav className="space-y-1" aria-label="Navegação da área do estudante">
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => `flex items-center ${compact ? 'gap-2.5 px-3 py-2.5' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-semibold transition-colors ${
            isActive ? 'bg-primary text-white shadow-soft' : 'text-ink/60 hover:bg-mist hover:text-primary'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          {to === '/notificacoes' && unreadNotificationCount > 0 && <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout(): ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { canModerate, logout, user } = useAuth();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    let active = true;
    if (!user) {
      setUnreadNotificationCount(0);
      return () => {
        active = false;
      };
    }

    function loadUnreadCount(): void {
      void getUnreadNotificationCount()
        .then((count) => {
          if (active) setUnreadNotificationCount(count);
        })
        .catch(() => {
          if (active) setUnreadNotificationCount(0);
        });
    }

    loadUnreadCount();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    return () => {
      active = false;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    };
  }, [user?.uid]);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-56 flex-col border-r border-ink/5 bg-white px-4 py-5">
        <Brand className="mb-7 px-1" />
        <Navigation canModerate={canModerate} unreadNotificationCount={unreadNotificationCount} compact />
        <div className="mt-auto flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/60">
          <span>Aparência</span>
          <ThemeToggle />
        </div>
        <NavLink to="/configuracoes" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/60 hover:bg-mist hover:text-primary transition-colors">
          <Settings className="w-4 h-4" />
          Configurações
        </NavLink>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink/60 hover:bg-mist hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          <LogOut className="w-4 h-4" />
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-ink/5 bg-white/90 px-5 py-4 backdrop-blur">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir navegação" className="rounded-lg p-2 text-ink hover:bg-mist">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[73px] z-20 border-b border-ink/5 bg-white px-5 py-5 shadow-soft">
          <Navigation canModerate={canModerate} unreadNotificationCount={unreadNotificationCount} onNavigate={() => setMenuOpen(false)} />
          <NavLink to="/configuracoes" onClick={() => setMenuOpen(false)} className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink/60 hover:bg-mist hover:text-primary">
            <Settings className="w-4 h-4" />
            Configurações
          </NavLink>
          <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-ink/60 hover:bg-mist hover:text-primary disabled:cursor-not-allowed disabled:opacity-50">
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      )}

      <main className="min-h-screen lg:ml-56"><Outlet /></main>
    </div>
  );
}
