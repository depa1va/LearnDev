import { lazy, Suspense } from 'react';
import Hero from '../components/sections/Hero';
import HowItWorks from '../components/sections/HowItWorks';

const LearningTracks = lazy(() => import('../components/sections/LearningTracks'));
const Community = lazy(() => import('../components/sections/Community'));
const About = lazy(() => import('../components/sections/StatsAbout'));
const FAQ = lazy(() => import('../components/sections/FAQ'));
const FinalCTA = lazy(() => import('../components/sections/FinalCTA'));
import type { ReactElement } from 'react';

function SectionFallback(): ReactElement {
  return <div className="h-40 flex items-center justify-center text-ink/30 text-sm">Carregando seção...</div>;
}

export default function HomePage(): ReactElement {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Suspense fallback={<SectionFallback />}><LearningTracks /></Suspense>
      <Suspense fallback={<SectionFallback />}><Community /></Suspense>
      <Suspense fallback={<SectionFallback />}><About /></Suspense>
      <Suspense fallback={<SectionFallback />}><FAQ /></Suspense>
      <Suspense fallback={<SectionFallback />}><FinalCTA /></Suspense>
    </>
  );
}
