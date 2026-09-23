import { Save, Settings2 } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import AvatarUploader from '../../components/profile/AvatarUploader';
import EmptyState from '../../components/ui/EmptyState';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { ThemePreferenceSelector } from '../../components/ui/ThemeControls';
import { useAuth } from '../../providers/AuthProvider';
import { removeAvatarAsset } from '../../services/avatarService';
import { getAvatarInitials, getPrivateProfile, updateUserAvatar, updateUserProfile, validateProfileFields } from '../../services/profileService';
import type { ProfileFormValues, UserAccount } from '../../types/user';

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<ProfileFormValues>({ displayName: '', bio: '', showLearningInfo: false });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) return undefined;

    void getPrivateProfile(user.uid)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setLoadError('Não foi possível encontrar os dados da sua conta.');
        } else {
          setProfile(data);
          setForm({ displayName: data.displayName ?? '', bio: data.bio ?? '', showLearningInfo: data.showLearningInfo ?? false });
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError('Não foi possível carregar as configurações agora. Tente novamente.');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  function updateField<Field extends keyof ProfileFormValues>(field: Field, value: ProfileFormValues[Field]): void {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus('idle');
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!user || status === 'saving' || isAvatarSaving) return;

    const validation = validateProfileFields(form);
    if (validation.error) {
      setError(validation.error);
      return;
    }

    setError('');
    setStatus('saving');
    try {
      const updatedProfile = await updateUserProfile(user.uid, validation.data);
      setProfile(updatedProfile);
      setForm({ displayName: updatedProfile.displayName ?? '', bio: updatedProfile.bio ?? '', showLearningInfo: updatedProfile.showLearningInfo ?? false });
      setStatus('saved');
    } catch (saveError: unknown) {
      setStatus('idle');
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar as alterações. Tente novamente.');
    }
  }

  function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField('displayName', event.target.value);
  }

  function handleBioChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    updateField('bio', event.target.value);
  }

  async function handleAvatarUpload(photoURL: string): Promise<void> {
    if (!user || !profile) throw new Error('Sua sessão não permite editar este perfil.');
    const updatedProfile = await updateUserAvatar(user.uid, photoURL);
    setProfile(updatedProfile);
    await refreshUser();
  }

  async function handleAvatarRemoval(): Promise<void> {
    if (!user || !profile) throw new Error('Sua sessão não permite editar este perfil.');
    const updatedProfile = await updateUserAvatar(user.uid, '');
    setProfile(updatedProfile);
    await refreshUser();

    try {
      await removeAvatarAsset();
    } catch {
      // A referência já foi removida do LearnDev. A limpeza do asset pode ser tentada depois.
    }
  }

  return (
    <PageFrame>
      <PageIntro eyebrow="Conta" title="Configurações" description="Atualize as informações públicas do seu perfil. Seu e-mail e dados de autenticação permanecem privados." />
      <section aria-labelledby="appearance-heading" className="mb-8 max-w-3xl rounded-3xl border border-ink/5 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Preferência local</p>
        <h2 id="appearance-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Aparência</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">Escolha como o LearnDev será exibido neste navegador. A alteração é aplicada imediatamente.</p>
        <div className="mt-6"><ThemePreferenceSelector /></div>
      </section>
      {isLoading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando suas configurações...</div> : loadError ? <EmptyState icon={Settings2} title="Não foi possível carregar as configurações." description={loadError} /> : profile && <form onSubmit={handleSubmit} className="max-w-3xl rounded-3xl border border-ink/5 bg-white p-6 shadow-soft sm:p-8">
        <AvatarUploader
          initials={getAvatarInitials(profile.displayName, profile.username)}
          photoURL={profile.photoURL}
          disabled={status === 'saving'}
          onUpload={handleAvatarUpload}
          onRemove={handleAvatarRemoval}
          onBusyChange={setIsAvatarSaving}
        />

        <div className="space-y-5">
          <label className="block text-sm font-semibold text-ink">Nome de exibição
            <input required maxLength={80} value={form.displayName} onChange={handleDisplayNameChange} className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink focus:border-primary focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold text-ink">Username
            <input disabled value={`@${profile.username ?? ''}`} className="mt-2 w-full cursor-not-allowed rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 text-ink/50" />
            <span className="mt-2 block text-xs font-normal text-ink/45">O username permanece reservado para manter links públicos estáveis.</span>
          </label>
          <label className="block text-sm font-semibold text-ink">Bio
            <textarea value={form.bio} onChange={handleBioChange} maxLength={280} rows={5} placeholder="Conte um pouco sobre o que você quer aprender." className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none" />
            <span className="mt-2 block text-right text-xs font-normal text-ink/45">{form.bio.length}/280</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-mist p-4 text-sm leading-relaxed text-ink/70">
            <input checked={form.showLearningInfo} onChange={(event) => updateField('showLearningInfo', event.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/30 text-primary focus:ring-primary" />
            <span><span className="block font-semibold text-ink">Mostrar meu nível e objetivo de aprendizado no perfil</span><span className="mt-1 block text-xs text-ink/55">Quando ativado, essas informações aparecem no seu perfil público. Seu progresso e histórico de estudos continuam privados.</span></span>
          </label>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {status === 'saved' && <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Alterações salvas.</p>}
        <div className="mt-7 flex justify-end"><button type="submit" disabled={status === 'saving' || isAvatarSaving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{status === 'saving' ? 'Salvando...' : 'Salvar alterações'}</button></div>
      </form>}
    </PageFrame>
  );
}
