import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MouseEventHandler, ReactElement } from 'react';

interface BrandProps {
  light?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

export default function Brand({ light = false, onClick, className = '' }: BrandProps): ReactElement {
  return (
    <Link to="/" onClick={onClick} className={`flex items-center gap-2 ${className}`} aria-label="LearnDev — página inicial">
      <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-soft">
        <Code2 className="w-5 h-5" />
      </span>
      <span className={`font-heading font-bold text-lg ${light ? 'text-white' : 'text-ink'}`}>
        Learn<span className={light ? 'text-primary-100' : 'text-primary'}>Dev</span>
      </span>
    </Link>
  );
}
