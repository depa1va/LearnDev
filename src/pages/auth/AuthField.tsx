import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import type { InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

const feedbackStyles = {
  success: 'text-emerald-600',
  error: 'text-red-700',
  muted: 'text-ink/55',
};

type FeedbackTone = keyof typeof feedbackStyles;

interface AuthFieldFeedback {
  tone: FeedbackTone;
  text: string;
}

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'disabled' | 'id' | 'type'> {
  label: ReactNode;
  icon?: LucideIcon;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  hint?: ReactNode;
  feedback?: AuthFieldFeedback;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export default function AuthField({
  label,
  icon: Icon,
  type = 'text',
  hint,
  feedback,
  id,
  disabled = false,
  className = '',
  ...inputProps
}: AuthFieldProps): ReactElement {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const feedbackId = feedback?.text ? `${inputId}-feedback` : undefined;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const canTogglePassword = type === 'password';
  const resolvedType = canTogglePassword && isPasswordVisible ? 'text' : type;
  const describedBy = [hintId, feedbackId].filter(Boolean).join(' ') || undefined;
  const fieldStateClass = feedback?.tone === 'error'
    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
    : feedback?.tone === 'success'
      ? 'border-emerald-300 focus:border-primary focus:ring-primary/10'
      : 'border-ink/15 focus:border-primary focus:ring-primary/10';

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-xs font-bold text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        {Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />}
        <input
          {...inputProps}
          id={inputId}
          type={resolvedType}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={feedback?.tone === 'error' || undefined}
          className={`h-12 w-full rounded-xl border bg-mist ${Icon ? 'pl-11' : 'pl-4'} ${canTogglePassword ? 'pr-12' : 'pr-4'} text-sm text-ink placeholder:text-ink/35 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${fieldStateClass}`}
        />
        {canTogglePassword && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink/50 transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed"
          >
            {isPasswordVisible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p id={hintId} className="mt-2 text-xs leading-relaxed text-ink/50">{hint}</p>}
      {feedback?.text && (
        <p id={feedbackId} role={feedback.tone === 'error' ? 'alert' : 'status'} className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${feedbackStyles[feedback.tone] ?? feedbackStyles.muted}`}>
          {feedback.tone === 'success' && <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
          {feedback.text}
        </p>
      )}
    </div>
  );
}
