import { ShieldCheck } from 'lucide-react';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { LEGAL_LAST_UPDATED } from '../../config/legal';
import type { ReactElement } from 'react';

const sections = [
  { title: '1. Finalidade desta política', content: 'Esta política explica, de forma informativa, como o LearnDev trata os dados necessários para criar sua conta, oferecer recursos educacionais e viabilizar a comunidade. Ela deve ser revisada juridicamente antes de um lançamento público mais amplo.' },
  { title: '2. Dados da conta e perfil', content: 'Armazenamos nome de exibição, username, bio e, quando o recurso estiver disponível, avatar. O e-mail e a senha são tratados pelo Firebase Authentication; a senha não é armazenada no Firestore. O e-mail não é exibido no perfil público.' },
  { title: '3. Dados educacionais', content: 'Para oferecer acompanhamento individual, armazenamos o progresso de aulas, tentativas de questionários, tentativas práticas enviadas, resultados, histórico de prática e dados de conceitos que podem precisar de revisão. As respostas submetidas em práticas e seu histórico educacional são dados privados do usuário.' },
  { title: '4. Dados da comunidade', content: 'Quando você participa da comunidade, armazenamos posts, respostas, reações e denúncias relacionadas ao uso desses recursos. O perfil público exibe somente as informações públicas necessárias para identificar o autor, como nome, username, bio e avatar quando disponível.' },
  { title: '5. Como usamos os dados', content: 'Usamos os dados para autenticar sua conta, manter sua sessão, apresentar o conteúdo educacional, registrar seu próprio aprendizado, permitir sua participação na comunidade, atender denúncias e proteger o funcionamento da plataforma.' },
  { title: '6. Acesso e privacidade', content: 'As regras de acesso do projeto separam dados públicos e privados. Progresso, tentativas de quiz, tentativas práticas, respostas de exercícios e dados de revisão não são exibidos em perfis públicos nem compartilhados automaticamente com outros estudantes.' },
  { title: '7. Compartilhamento e fornecedores', content: 'O LearnDev utiliza serviços do Firebase para autenticação, banco de dados e infraestrutura relacionada. Não há venda de dados pessoais no escopo atual do projeto. Dados públicos da comunidade podem ser vistos por pessoas com acesso permitido àquela área.' },
  { title: '8. Retenção e segurança', content: 'Mantemos os dados enquanto forem necessários para os recursos disponibilizados e para as obrigações aplicáveis. São usadas medidas técnicas proporcionais ao projeto, como autenticação e regras de acesso. Nenhuma medida de segurança elimina todos os riscos.' },
  { title: '9. Seus direitos e contato', content: 'Você pode solicitar informações sobre seus dados e correção de informações pessoais pelos canais oficiais que forem divulgados pelo projeto. Direitos e procedimentos específicos devem ser avaliados conforme a legislação aplicável e a evolução da plataforma.' },
  { title: '10. Alterações nesta política', content: 'Esta política pode ser atualizada para acompanhar mudanças técnicas, de funcionalidades ou obrigações aplicáveis. A versão vigente e a data de atualização permanecerão disponíveis nesta página.' },
];

export default function PrivacyPage(): ReactElement {
  return (
    <PageFrame className="pt-36 sm:pt-40">
      <div className="max-w-4xl">
        <PageIntro eyebrow="Institucional" title="Política de Privacidade" description="Entenda quais dados são usados no LearnDev e para qual finalidade." />
        <article className="rounded-3xl border border-ink/5 bg-white p-7 shadow-soft sm:p-10">
          <div className="flex items-start gap-4 border-b border-ink/10 pb-6">
            <ShieldCheck aria-hidden="true" className="h-8 w-8 shrink-0 text-primary" />
            <div><p className="font-semibold text-ink">Versão 2026-09</p><p className="mt-1 text-sm text-ink/60">Última atualização: {LEGAL_LAST_UPDATED}</p></div>
          </div>
          <div className="mt-8 space-y-8">{sections.map((section) => <section key={section.title}><h2 className="font-heading text-xl font-bold text-ink">{section.title}</h2><p className="mt-3 text-sm leading-7 text-ink/70">{section.content}</p></section>)}</div>
        </article>
      </div>
    </PageFrame>
  );
}
