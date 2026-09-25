import { Save, Send } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { communityPostSchema, type CommunityPostFormValues } from '../../schemas/community';
import { COMMUNITY_LIMITS, POST_TYPES } from '../../services/communityService';
import type { CommunityPostInput, CreatedCommunityPost, NormalizedCommunityPostInput } from '../../types/community';

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

function getInitialForm(initialValues: Partial<CommunityPostInput> | undefined): CommunityPostFormValues {
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
  const [error, setError] = useState('');
  const isSubmittingRef = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting: isSaving },
  } = useForm<CommunityPostFormValues>({
    resolver: zodResolver(communityPostSchema),
    defaultValues: getInitialForm(initialValues),
  });
  const title = watch('title') ?? '';
  const body = watch('body') ?? '';

  useEffect(() => {
    reset(getInitialForm(initialValues));
    setError('');
  }, [initialValues, reset]);

  async function onFormSubmit(form: CommunityPostFormValues): Promise<void> {
    if (isSaving || isSubmittingRef.current) return;

    if (typeof form.title !== 'string' || typeof form.body !== 'string' || typeof form.tags !== 'string') {
      setError('Revise os campos da publicação antes de continuar.');
      return;
    }

    const postInput: CommunityPostInput = {
      type: form.type,
      title: form.title,
      body: form.body,
      tags: form.tags,
    };

    isSubmittingRef.current = true;
    setError('');

    let submittedPost: PostFormSubmission;
    try {
      submittedPost = await onSubmit(postInput);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar a publicação agora.');
      isSubmittingRef.current = false;
      return;
    }

    try {
      if (onCreated && isCreatedCommunityPost(submittedPost)) await onCreated(submittedPost);
    } catch {
      setError('A publicação foi criada, mas não foi possível abri-la agora. Você pode encontrá-la na comunidade.');
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-5">
      <label className="block text-sm font-semibold text-ink">Tipo de publicação
        <select disabled={isSaving} aria-invalid={errors.type ? true : undefined} aria-describedby={errors.type ? 'post-type-feedback' : undefined} className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" {...register('type', { onChange: () => setError('') })}>
          {POST_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
        {errors.type && <span id="post-type-feedback" role="alert" className="mt-2 block text-xs font-normal text-red-700">{errors.type.message}</span>}
      </label>

      <label className="block text-sm font-semibold text-ink">Título
        <input disabled={isSaving} required minLength={COMMUNITY_LIMITS.title.min} maxLength={COMMUNITY_LIMITS.title.max} aria-invalid={errors.title ? true : undefined} aria-describedby={errors.title ? 'post-title-feedback' : undefined} placeholder="Ex.: Como posso organizar melhor este algoritmo?" className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" {...register('title', { onChange: () => setError('') })} />
        {errors.title && <span id="post-title-feedback" role="alert" className="mt-2 block text-xs font-normal text-red-700">{errors.title.message}</span>}
        <span className="mt-2 block text-right text-xs font-normal text-ink/45">{title.length}/{COMMUNITY_LIMITS.title.max}</span>
      </label>

      <label className="block text-sm font-semibold text-ink">Conteúdo
        <textarea disabled={isSaving} required minLength={COMMUNITY_LIMITS.postBody.min} maxLength={COMMUNITY_LIMITS.postBody.max} aria-invalid={errors.body ? true : undefined} aria-describedby={errors.body ? 'post-body-feedback' : undefined} rows={8} placeholder="Explique sua dúvida ou compartilhe a discussão que gostaria de iniciar." className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" {...register('body', { onChange: () => setError('') })} />
        {errors.body && <span id="post-body-feedback" role="alert" className="mt-2 block text-xs font-normal text-red-700">{errors.body.message}</span>}
        <span className="mt-2 block text-right text-xs font-normal text-ink/45">{body.length}/{COMMUNITY_LIMITS.postBody.max}</span>
      </label>

      <label className="block text-sm font-semibold text-ink">Tags <span className="font-normal text-ink/50">(opcional, separadas por vírgula)</span>
        <input disabled={isSaving} maxLength={180} aria-invalid={errors.tags ? true : undefined} aria-describedby={errors.tags ? 'post-tags-feedback' : undefined} placeholder="javascript, logica, html" className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" {...register('tags', { onChange: () => setError('') })} />
        {errors.tags && <span id="post-tags-feedback" role="alert" className="mt-2 block text-xs font-normal text-red-700">{errors.tags.message}</span>}
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
