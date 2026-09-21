import { Scale } from 'lucide-react';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { LEGAL_LAST_UPDATED } from '../../config/legal';
import type { ReactElement } from 'react';

const sections = [
  { title: '1. Sobre o LearnDev', content: 'O LearnDev é uma plataforma educacional em desenvolvimento no contexto de um projeto de TCC. Seu objetivo é apoiar o aprendizado de programação por meio de aulas, exercícios, acompanhamento individual e uma comunidade de apoio.' },
  { title: '2. Aceitação dos termos', content: 'Ao criar uma conta, você declara que leu e aceitou estes Termos de Uso e a Política de Privacidade. Caso não concorde com eles, não conclua o cadastro nem utilize as áreas autenticadas da plataforma.' },
  { title: '3. Cadastro e conta', content: 'Você deve fornecer informações corretas no cadastro e manter sua senha em sigilo. A conta é pessoal; não compartilhe seu acesso nem se passe por outra pessoa. Podemos solicitar atualização de informações quando isso for necessário para o funcionamento ou a segurança da plataforma.' },
  { title: '4. Uso educacional da plataforma', content: 'O LearnDev é destinado ao estudo. Você pode acessar os recursos disponibilizados para aprender, praticar e acompanhar sua própria evolução, respeitando estes Termos e os limites técnicos da plataforma.' },
  { title: '5. Comunidade', content: 'A comunidade existe para troca respeitosa de dúvidas, experiências e apoio entre estudantes. Publique somente o que for pertinente ao ambiente educacional e trate as outras pessoas com respeito.' },
  { title: '6. Conteúdo publicado por usuários', content: 'Posts, comentários e respostas são produzidos pelos próprios usuários. As opiniões publicadas não representam necessariamente o LearnDev, e cada pessoa é responsável pelo conteúdo que envia. Não realizamos aprovação prévia de todas as publicações. O LearnDev pode moderar, ocultar ou remover conteúdos que violem estes Termos, e os usuários podem denunciar materiais inadequados. Eventuais responsabilidades da plataforma permanecem sujeitas à legislação aplicável.' },
  { title: '7. Condutas proibidas', content: 'Não é permitido praticar assédio, ameaças, discurso de ódio, spam, fraude, impersonação indevida, publicação de conteúdo ilegal, exposição indevida de dados pessoais, violação de direitos de terceiros, publicação de material sem autorização quando aplicável, tentativa de comprometer a segurança da plataforma ou abuso do sistema de denúncias.' },
  { title: '8. Moderação', content: 'A plataforma permite denúncias e conta com revisão por moderadores ou administradores. Conteúdos que violem estes Termos podem ser ocultados ou removidos por meio do processo de moderação existente. Medidas adicionais relacionadas a contas poderão ser avaliadas futuramente em casos de abuso, respeitando a legislação aplicável.' },
  { title: '9. Denúncias', content: 'Use a denúncia de forma responsável para sinalizar conteúdo que possa violar estes Termos. A denúncia não significa remoção automática: ela cria um registro para análise da equipe de moderação.' },
  { title: '10. Conteúdo educacional', content: 'As aulas, exemplos e exercícios têm finalidade educacional. Alguns exemplos podem ser simplificados para facilitar o aprendizado. O LearnDev não garante resultado acadêmico ou profissional específico; verifique informações antes de utilizá-las em contextos críticos.' },
  { title: '11. Disponibilidade da plataforma', content: 'Como projeto em desenvolvimento, o LearnDev pode passar por manutenção, ajustes, indisponibilidades temporárias ou mudanças de recursos. Buscamos reduzir impactos, mas não garantimos disponibilidade ininterrupta.' },
  { title: '12. Propriedade intelectual', content: 'Os materiais e elementos da plataforma são protegidos pelas normas aplicáveis. Você pode utilizá-los para seu aprendizado pessoal, mas não deve reproduzi-los, redistribuí-los ou explorá-los comercialmente sem autorização, salvo quando a lei permitir.' },
  { title: '13. Privacidade', content: 'O tratamento de dados pessoais é descrito na Política de Privacidade. Ela explica quais dados são usados para manter a conta, registrar a aprendizagem e viabilizar a comunidade.' },
  { title: '14. Alterações dos termos', content: 'Podemos atualizar estes Termos para refletir mudanças na plataforma, no projeto ou nas obrigações aplicáveis. A versão vigente ficará disponível nesta página, com a data de atualização.' },
  { title: '15. Encerramento ou suspensão de conta', content: 'Você pode deixar de utilizar a plataforma quando desejar. O LearnDev poderá restringir ou suspender acessos quando houver violação destes Termos, risco à segurança ou obrigação legal, observados os limites da legislação aplicável.' },
  { title: '16. Contato', content: 'Para dúvidas sobre estes Termos ou sobre o funcionamento da plataforma, utilize os canais de contato que forem divulgados oficialmente pelo projeto.' },
];

export default function TermsPage(): ReactElement {
  return (
    <PageFrame className="pt-36 sm:pt-40">
      <div className="max-w-4xl">
        <PageIntro eyebrow="Institucional" title="Termos de Uso" description="Leia as condições para utilizar o LearnDev e participar da comunidade." />
        <article className="rounded-3xl border border-ink/5 bg-white p-7 shadow-soft sm:p-10">
          <div className="flex items-start gap-4 border-b border-ink/10 pb-6">
            <Scale aria-hidden="true" className="h-8 w-8 shrink-0 text-primary" />
            <div><p className="font-semibold text-ink">Versão 2026-09</p><p className="mt-1 text-sm text-ink/60">Última atualização: {LEGAL_LAST_UPDATED}</p></div>
          </div>
          <p className="mt-7 text-sm leading-relaxed text-ink/70">Este texto informa como o LearnDev funciona hoje e deve passar por revisão jurídica apropriada antes de um lançamento público mais amplo.</p>
          <div className="mt-8 space-y-8">{sections.map((section) => <section key={section.title}><h2 className="font-heading text-xl font-bold text-ink">{section.title}</h2><p className="mt-3 text-sm leading-7 text-ink/70">{section.content}</p></section>)}</div>
        </article>
      </div>
    </PageFrame>
  );
}
