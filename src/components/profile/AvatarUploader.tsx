import { ImageUp, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type ReactElement } from 'react';
import { uploadAvatar, validateAvatarFile } from '../../services/avatarService';
import Avatar from '../ui/Avatar';

interface AvatarUploaderProps {
  initials: string;
  photoURL?: string;
  disabled?: boolean;
  onUpload: (photoURL: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onBusyChange?: (isBusy: boolean) => void;
}

type AvatarOperation = 'idle' | 'uploading' | 'removing';

export default function AvatarUploader({ initials, photoURL = '', disabled = false, onUpload, onRemove, onBusyChange }: AvatarUploaderProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [operation, setOperation] = useState<AvatarOperation>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function releasePreview(): void {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  useEffect(() => releasePreview, []);

  useEffect(() => {
    onBusyChange?.(operation !== 'idle');
  }, [onBusyChange, operation]);

  function clearSelection(): void {
    releasePreview();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    const validation = validateAvatarFile(file);
    setError('');
    setSuccess('');

    if (validation.valid === false) {
      clearSelection();
      setError(validation.error);
      return;
    }

    releasePreview();
    const nextPreview = URL.createObjectURL(validation.file);
    previewUrlRef.current = nextPreview;
    setPreviewUrl(nextPreview);
    setSelectedFile(validation.file);
  }

  async function handleUpload(): Promise<void> {
    if (!selectedFile || operation !== 'idle' || disabled) return;
    setOperation('uploading');
    setError('');
    setSuccess('');

    try {
      // Integração de avatar: uploadAvatar documenta o POST autenticado para assinatura e o upload direto ao Cloudinary.
      const { secureUrl } = await uploadAvatar(selectedFile);
      await onUpload(secureUrl);
      clearSelection();
      setSuccess('Foto de perfil atualizada.');
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível atualizar sua foto agora.');
    } finally {
      setOperation('idle');
    }
  }

  async function handleRemove(): Promise<void> {
    if (!photoURL || operation !== 'idle' || disabled) return;
    setOperation('removing');
    setError('');
    setSuccess('');

    try {
      await onRemove();
      clearSelection();
      setSuccess('Foto de perfil removida.');
    } catch (removeError: unknown) {
      setError(removeError instanceof Error ? removeError.message : 'Não foi possível remover sua foto agora.');
    } finally {
      setOperation('idle');
    }
  }

  const isBusy = operation !== 'idle';
  const displayedPhotoURL = previewUrl ?? photoURL;

  return (
    <section aria-labelledby="avatar-heading" className="mb-8 rounded-2xl bg-mist p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar initials={initials} photoURL={displayedPhotoURL} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 id="avatar-heading" className="font-heading text-lg font-semibold text-ink">Foto do perfil</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">Use JPG, PNG ou WEBP com até 5 MB. A imagem é ajustada para um avatar quadrado.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled || isBusy}
            className="sr-only"
            aria-describedby="avatar-file-help"
          />
          <p id="avatar-file-help" className="sr-only">Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: 5 MB.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || isBusy} className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <ImageUp aria-hidden="true" className="h-4 w-4" /> Alterar foto
            </button>
            {photoURL && <button type="button" onClick={() => void handleRemove()} disabled={disabled || isBusy} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 aria-hidden="true" className="h-4 w-4" /> {operation === 'removing' ? 'Removendo...' : 'Remover foto'}
            </button>}
          </div>
        </div>
      </div>

      {selectedFile && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3">
        <p className="min-w-0 truncate text-sm text-ink/70">Imagem selecionada: <span className="font-semibold text-ink">{selectedFile.name}</span></p>
        <button type="button" onClick={() => void handleUpload()} disabled={disabled || isBusy} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <Upload aria-hidden="true" className="h-4 w-4" /> {operation === 'uploading' ? 'Enviando...' : 'Enviar foto'}
        </button>
      </div>}

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
    </section>
  );
}
