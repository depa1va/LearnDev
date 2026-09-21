import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import type { ResolvedTheme, ThemeMode } from '../../types/common';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  Icon: LucideIcon;
  description: string;
}

interface ThemeIconProps {
  theme: ThemeMode | ResolvedTheme;
  className: string;
}

interface ThemeToggleProps {
  className?: string;
}

const OPTIONS: readonly ThemeOption[] = [
  { value: 'light', label: 'Claro', Icon: Sun, description: 'Usar cores claras' },
  { value: 'dark', label: 'Escuro', Icon: Moon, description: 'Usar cores escuras' },
  { value: 'system', label: 'Sistema', Icon: Monitor, description: 'Acompanhar o dispositivo' },
];

function ThemeIcon({ theme, className }: ThemeIconProps): ReactElement {
  const option = OPTIONS.find((item) => item.value === theme) ?? OPTIONS[2];
  const Icon = option.Icon;
  return <Icon aria-hidden="true" className={className} />;
}

export function ThemePreferenceSelector(): ReactElement {
  const { theme, setTheme } = useTheme();

  return (
    <div role="radiogroup" aria-label="Preferência de aparência" className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map(({ value, label, Icon, description }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={`relative flex min-h-28 flex-col items-start rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? 'border-primary bg-primary/10 text-ink' : 'border-ink/10 bg-mist text-ink/70 hover:border-primary/40'}`}
          >
            <Icon aria-hidden="true" className={`h-5 w-5 ${selected ? 'text-primary' : 'text-ink/55'}`} />
            <span className="mt-4 font-semibold text-ink">{label}</span>
            <span className="mt-1 text-xs leading-relaxed text-ink/55">{description}</span>
            {selected && <Check aria-label="Selecionado" className="absolute right-4 top-4 h-4 w-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeToggle({ className = '' }: ThemeToggleProps): ReactElement {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeWhenOutside(event: MouseEvent) {
      if (containerRef.current && event.target instanceof Node && !containerRef.current.contains(event.target)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', closeWhenOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeWhenOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const currentLabel = OPTIONS.find((item) => item.value === theme)?.label ?? 'Sistema';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`Tema atual: ${currentLabel}. Alterar tema`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 bg-white/80 text-ink/70 shadow-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ThemeIcon theme={theme === 'system' ? resolvedTheme : theme} className="h-4 w-4" />
      </button>
      {isOpen && (
        <div role="menu" aria-label="Escolher tema" className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-ink/10 bg-white p-2 shadow-soft">
          {OPTIONS.map(({ value, label, Icon }) => {
            const selected = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/70 transition-colors hover:bg-mist hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                {selected && <Check aria-hidden="true" className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
