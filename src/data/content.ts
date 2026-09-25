interface NavigationLink {
  label: string;
  to: string;
  sectionId?: string;
}

interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  icon: 'Compass' | 'Layout' | 'Code2' | 'Lightbulb';
  color: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export const navLinks: readonly NavigationLink[] = [
  { label: 'Início', to: '/' },
  { label: 'Como funciona', to: '/#como-funciona', sectionId: 'como-funciona' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Comunidade', to: '/comunidade' },
  { label: 'Sobre', to: '/sobre' },
];

export const learningPath: readonly LearningPathItem[] = [
  {
    id: 'comecando-do-zero-e-logica',
    title: 'Começando do Zero e Lógica',
    description: 'Uma base acolhedora para entender como resolver problemas passo a passo.',
    icon: 'Compass',
    color: 'from-primary to-blue-400',
  },
  {
    id: 'html-e-css',
    title: 'HTML e CSS',
    description: 'Estrutura e estilo para criar as primeiras páginas da web.',
    icon: 'Layout',
    color: 'from-primary to-sky-400',
  },
  {
    id: 'javascript-essencial',
    title: 'JavaScript Essencial',
    description: 'Os fundamentos da linguagem para dar comportamento às páginas.',
    icon: 'Code2',
    color: 'from-sky-400 to-primary',
  },
  {
    id: 'interatividade-e-projeto',
    title: 'Interatividade e Projeto',
    description: 'Aplique o que aprendeu em uma experiência interativa guiada.',
    icon: 'Lightbulb',
    color: 'from-grape to-primary',
  },
];

export const faqs: readonly FaqItem[] = [
  {
    id: 1,
    question: 'Preciso ter experiência prévia para começar?',
    answer:
      'Não! O LearnDev foi criado para quem está começando do zero. As trilhas iniciam pelo básico de HTML e CSS e evoluem no seu ritmo.',
  },
  {
    id: 2,
    question: 'Quanto tempo por dia eu preciso dedicar?',
    answer:
      'Você pode estudar no seu próprio ritmo. Cada aula será organizada em partes curtas, para que seja mais fácil retomar de onde parou.',
  },
  {
    id: 3,
    question: 'O LearnDev é gratuito?',
    answer:
      'O escopo e o modelo de acesso do MVP serão definidos junto com a evolução do projeto de TCC.',
  },
  {
    id: 4,
    question: 'Como o meu aprendizado será acompanhado?',
    answer:
      'O LearnDev vai registrar aulas e atividades concluídas, seu avanço percentual e os conceitos que precisam de revisão — sem competição entre estudantes.',
  },
  {
    id: 5,
    question: 'Quais assuntos estarão disponíveis no MVP?',
    answer:
      'O currículo inicial começa com lógica e segue por HTML, CSS e JavaScript. Novas tecnologias ficarão para versões futuras.',
  },
];
