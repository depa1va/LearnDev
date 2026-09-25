import { BookOpenCheck, CheckCircle2, UsersRound } from 'lucide-react';
import { PageFrame, PageIntro } from '../components/ui/PageFrame';
import { aboutDescription, aboutFeatures, aboutObjectives, teamMembers } from '../data/about';
import type { ReactElement } from 'react';

export default function AboutPage(): ReactElement {
  return (
    <PageFrame className="pt-36 sm:pt-40">
      <PageIntro
        eyebrow="Institucional"
        title="Sobre o LearnDev"
        description="Conheça a proposta, os objetivos e as pessoas responsáveis pelo desenvolvimento da plataforma."
      />

      <section aria-labelledby="sobre-descricao" className="rounded-3xl border border-ink/5 bg-white p-7 shadow-soft sm:p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary"><BookOpenCheck aria-hidden="true" className="h-7 w-7" /></div>
          <div>
            <h2 id="sobre-descricao" className="font-heading text-2xl font-bold text-ink">Uma jornada estruturada para aprender</h2>
            <p className="mt-4 max-w-4xl leading-8 text-ink/70">{aboutDescription}</p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="sobre-objetivos" className="rounded-3xl border border-ink/5 bg-white p-7 shadow-soft sm:p-8">
          <h2 id="sobre-objetivos" className="font-heading text-2xl font-bold text-ink">Objetivos</h2>
          <ul className="mt-6 space-y-4">
            {aboutObjectives.map((objective) => (
              <li key={objective} className="flex gap-3 text-sm leading-6 text-ink/70">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {objective}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sobre-funcionalidades" className="rounded-3xl border border-ink/5 bg-white p-7 shadow-soft sm:p-8">
          <h2 id="sobre-funcionalidades" className="font-heading text-2xl font-bold text-ink">Funcionalidades principais</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {aboutFeatures.map((feature) => (
              <li key={feature} className="rounded-xl bg-mist px-4 py-3 text-sm leading-5 text-ink/70">{feature}</li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="sobre-equipe" className="mt-8 rounded-3xl border border-ink/5 bg-white p-7 shadow-soft sm:p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary"><UsersRound aria-hidden="true" className="h-7 w-7" /></div>
          <div>
            <h2 id="sobre-equipe" className="font-heading text-2xl font-bold text-ink">Equipe responsável</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">Conheça os desenvolvedores responsáveis pela plataforma.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {teamMembers.map((member) => (
            <article key={member.name} className="flex items-center gap-5 rounded-2xl border border-ink/10 bg-mist p-5">
              <img
                src={member.photo}
                alt={member.name}
                className="h-24 w-24 shrink-0 rounded-full border border-ink/10 object-cover object-center"
              />
              <div>
                <h3 className="font-heading text-lg font-semibold text-ink">{member.name}</h3>
                <p className="mt-1 text-sm leading-6 text-ink/65">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
