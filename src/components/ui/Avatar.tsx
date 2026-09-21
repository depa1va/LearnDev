import { cn } from '../../utils/cn';
import type { ReactElement } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  photoURL?: string;
  color?: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

const sizes: Record<AvatarSize, string> = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-lg' };

export default function Avatar({ initials, photoURL = '', color = 'bg-primary', size = 'md', ring = false, className }: AvatarProps): ReactElement {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-heading font-semibold text-white shrink-0',
        sizes[size],
        color,
        ring && 'ring-4 ring-white shadow-soft',
        className
      )}
    >
      {photoURL ? <img src={photoURL} alt="" className="h-full w-full rounded-full object-cover" /> : initials}
    </div>
  );
}
