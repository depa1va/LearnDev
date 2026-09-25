import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MouseEventHandler, ReactElement } from 'react';
import styles from './Brand.module.css';

interface BrandProps {
  light?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

export default function Brand({ light = false, onClick, className = '' }: BrandProps): ReactElement {
  return (
    <Link to="/" onClick={onClick} className={`${styles.brand} ${className}`} aria-label="LearnDev — página inicial">
      <span className={styles.mark}>
        <Code2 className="w-5 h-5" />
      </span>
      <span className={`${styles.wordmark} ${light ? styles.lightWordmark : ''}`}>
        Learn<span className={styles.accent}>Dev</span>
      </span>
    </Link>
  );
}
