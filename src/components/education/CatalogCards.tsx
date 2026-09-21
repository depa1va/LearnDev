import { ArrowRight, BookOpen, Clock3, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import type { ReactElement, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Course, TrackWithCourseCount } from '../../types/education';

interface MetadataProps {
  icon: LucideIcon;
  children: ReactNode;
}

interface TrackCardProps {
  track: TrackWithCourseCount;
  actionLabel?: string;
}

interface CourseCardProps {
  course: Course;
  moduleCount?: number;
  actionLabel?: string;
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function Metadata({ icon: Icon, children }: MetadataProps): ReactElement {
  return <span className="inline-flex items-center gap-2"><Icon aria-hidden="true" className="h-4 w-4 text-primary" />{children}</span>;
}

export function TrackCard({ track, actionLabel = 'Explorar trilha' }: TrackCardProps): ReactElement {
  return (
    <GlassCard className="flex h-full flex-col p-6 sm:p-7" hover>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Trilha</p>
      <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-ink">{track.title}</h2>
      {track.description && <p className="mt-3 leading-relaxed text-ink/60">{track.description}</p>}
      {typeof track.courseCount === 'number' && <p className="mt-5 text-sm font-medium text-ink/60"><Metadata icon={BookOpen}>{pluralize(track.courseCount, 'curso disponível', 'cursos disponíveis')}</Metadata></p>}
      <Link to={`/trilhas/${track.slug}`} className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-700">
        {actionLabel} <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}

export function CourseCard({ course, moduleCount, actionLabel = 'Abrir curso' }: CourseCardProps): ReactElement {
  return (
    <GlassCard className="flex h-full flex-col p-6 sm:p-7" hover>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Curso</p>
      <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-ink">{course.title}</h2>
      {course.description && <p className="mt-3 leading-relaxed text-ink/60">{course.description}</p>}
      {(Number.isFinite(course.estimatedMinutes) || typeof moduleCount === 'number') && <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink/60">
        {Number.isFinite(course.estimatedMinutes) && <Metadata icon={Clock3}>{course.estimatedMinutes} min estimados</Metadata>}
        {typeof moduleCount === 'number' && <Metadata icon={Layers3}>{pluralize(moduleCount, 'módulo', 'módulos')}</Metadata>}
      </div>}
      <Link to={`/cursos/${course.slug}`} className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-700">
        {actionLabel} <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}
