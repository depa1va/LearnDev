import { Save, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { COMMUNITY_LIMITS, POST_TYPES } from '../../services/communityService';
import type { CommunityPostInput, CreatedCommunityPost, NormalizedCommunityPostInput, PostType } from '../../types/community';

type PostFormMode = 'create' | 'edit';
type PostFormSubmission = CreatedCommunityPost | NormalizedCommunityPostInput | void;

interface CommunityPostFormProps {
  initialValues?: Partial<CommunityPostInput>;
  onSubmit: (values: CommunityPostInput) => Promise<PostFormSubmission>;
  onCreated?: (post: CreatedCommunityPost) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  mode?: PostFormMode;
}

interface CommunityPostFormState {
  type: PostType;
  title: string;
  body: string;
  tags: string;
}

function getInitialForm(initialValues: Partial<CommunityPostInput> | undefined): CommunityPostFormState {
  const tags = initialValues?.tags;
  return {
    type: initialValues?.type ?? 'question',
    title: initialValues?.title ?? '',
    body: initialValues?.body ?? '',
    tags: Array.isArray(tags) ? tags.join(', ') : tags ?? '',
  };
}

function isCreatedCommunityPost(value: PostFormSubmission): value is CreatedCommunityPost {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';
}

export default function CommunityPostForm({ initialValues, onSubmit, onCreated, onCancel, submitLabel = 'Publicar', mode = 'create' }: CommunityPostFormProps) {
  const [form, setForm] = useState<CommunityPostFormState>(() => getInitialForm(initialValues));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setForm(getInitialForm(initialValues));
    setError('');
  }, [initialValues]);

  function updateField<Field extends keyof CommunityPostFormState>(field: Field, value: CommunityPostFormState[Field]): void {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSaving || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSaving(true);
    setError('');

    let submittedPost: PostFormSubmission;
    try {
      submittedPost = await onSubmit(form);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar a publicação agora.');
      isSubmittingRef.current = false;
      setIsSaving(false);
      return;
    }

    try {
      if (onCreated && isCreatedCommunityPost(submittedPost)) await onCreated(submittedPost);
    } catch {
      setError('A publicação foi criada, mas não foi possível abri-la agora. Você pode encontrá-la na comunidade.');
    } finally {
      isSubmittingRef.current = false;
      setIsSaving(false);
    }
  }

  function handleTypeChange(value: string): void {
    if (value === 'question' || value === 'discussion') updateField('type', value);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <label className="block text-sm font-semibold text-ink">Tipo de publicação
        <select value={form.type} onChange={(event) => handleTypeChange(event.target.value)} disabled={isSaving} className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60">
          {POST_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </label>

      <label className="block text-sm font-semibold text-ink">Título
        <input value={form.title} onChange={(event) => updateField('title', event.target.value)} disabled={isSaving} required minLength={COMMUNITY_LIMITS.title.min} maxLength={COMMUNITY_LIMITS.title.max} placeholder="Ex.: Como posso organizar melhor este algoritmo?" className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        <span className="mt-2 block text-right text-xs font-normal text-ink/45">{form.title.length}/{COMMUNITY_LIMITS.title.max}</span>
      </label>

      <label className="block text-sm font-semibold text-ink">Conteúdo
        <textarea value={form.body} onChange={(event) => updateField('body', event.target.value)} disabled={isSaving} required minLength={COMMUNITY_LIMITS.postBody.min} maxLength={COMMUNITY_LIMITS.postBody.max} rows={8} placeholder="Explique sua dúvida ou compartilhe a discussão que gostaria de iniciar." className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        <span className="mt-2 block text-right text-xs font-normal text-ink/45">{form.body.length}/{COMMUNITY_LIMITS.postBody.max}</span>
      </label>

      <label className="block text-sm font-semibold text-ink">Tags <span className="font-normal text-ink/50">(opcional, separadas por vírgula)</span>
        <input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} disabled={isSaving} maxLength={180} placeholder="javascript, logica, html" className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        <span className="mt-2 block text-xs font-normal leading-relaxed text-ink/45">Máximo de {COMMUNITY_LIMITS.tags.max} tags. Elas serão normalizadas sem #.</span>
      </label>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel && <button type="button" onClick={onCancel} disabled={isSaving} className="rounded-full border-2 border-ink/15 px-5 py-3 text-sm font-semibold text-ink/70 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">Cancelar</button>}
        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">
          {mode === 'edit' ? <Save aria-hidden="true" className="h-4 w-4" /> : <Send aria-hidden="true" className="h-4 w-4" />}
          {isSaving ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
