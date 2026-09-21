import type { Timestamp } from 'firebase/firestore';

export type StudyDateValue = Timestamp | Date | null | undefined;

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function toDate(value: StudyDateValue): Date | null {
  if (value instanceof Date) return isValidDate(value) ? value : null;
  if (value === null || value === undefined) return null;

  const date = value.toDate();
  return isValidDate(date) ? date : null;
}

export function getTimestampMilliseconds(value: StudyDateValue): number {
  return toDate(value)?.getTime() ?? 0;
}

export function formatStudyDateTime(value: StudyDateValue): string {
  const date = toDate(value);
  if (!date) return 'Data não disponível';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatStudyDate(value: StudyDateValue): string {
  const date = toDate(value);
  if (!date) return 'Data não disponível';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(date);
}
