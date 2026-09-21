import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { To } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: To;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps): ReactElement {
  return (
    <nav aria-label="Caminho de navegação" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/55">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              {index > 0 && <ChevronRight aria-hidden="true" className="h-4 w-4 text-ink/35" />}
              {isCurrent || !item.to ? (
                <span aria-current={isCurrent ? 'page' : undefined} className={isCurrent ? 'font-semibold text-ink/70' : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to} className="font-medium text-primary hover:text-primary-700">{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
