# LearnDev

Plataforma educacional para aprender programação com conteúdo estruturado, prática guiada, acompanhamento individual e uma comunidade de apoio.

## Sobre o projeto

O LearnDev é voltado principalmente para pessoas com pouco ou nenhum conhecimento em programação. A plataforma organiza a jornada de aprendizado desde os conceitos fundamentais até conteúdos mais avançados por meio de trilhas, cursos, módulos, aulas, vídeos complementares, atividades, exercícios práticos e acompanhamento de progresso.

O projeto busca reduzir a dificuldade dos primeiros passos em desenvolvimento ao reunir explicações claras, prática orientada e recursos de interação entre estudantes em uma única experiência web.

## Funcionalidades

- Cadastro, login, logout, recuperação de senha e verificação de e-mail.
- Onboarding e configurações da conta.
- Perfis públicos, busca de usuários, seguidores e notificações internas.
- Trilhas, cursos, módulos, aulas e vídeos complementares.
- Atividades objetivas com feedback pedagógico e exercícios práticos de pseudocódigo.
- Progresso individual, histórico de tentativas e conceitos para revisão.
- Comunidade com posts, respostas e reação de conteúdo útil.
- Denúncias e área de moderação para contas autorizadas.
- Avatar via Cloudinary, com upload assinado e remoção segura.
- Dark mode, layout responsivo e página institucional em [/sobre](/sobre).

## Tecnologias

As versões abaixo refletem o `package.json` do projeto.

- React 18.3.1 e React DOM 18.3.1
- Vite 5.3.1
- TypeScript 5.7.2
- React Router DOM 6.28.1
- Tailwind CSS 3.4.4, CSS global, variáveis CSS e CSS Modules
- React Hook Form 7.88.0 e Zod 4.6.5
- Firebase Web SDK 12.18.0: Authentication, Cloud Firestore e App Check
- Firebase Admin 13.8.0 nos scripts administrativos e endpoints server-side
- Cloudinary para avatares
- Resend para e-mails de verificação
- Vercel para os endpoints server-side e hospedagem
- Framer Motion 11.2.10 e Lucide React 0.383.0
- YouTube Privacy-Enhanced Mode (`youtube-nocookie`) para embeds complementares

## Back-end

O LearnDev Web utiliza Firebase Authentication e Cloud Firestore como base de autenticação e dados. O projeto Firebase é a fonte compartilhada prevista para os clientes Web e Mobile do LearnDev; a validação do repositório Mobile não faz parte deste repositório.

- **Firebase Authentication:** cadastro e sessão por e-mail e senha, com verificação de e-mail.
- **Cloud Firestore:** conteúdo educacional, perfis, progresso, comunidade, moderação e relações sociais.
- **Firestore Rules:** autorização por autenticação, e-mail verificado, ownership, papel e estrutura de documento.
- **App Check:** inicializado no cliente quando a site key pública do reCAPTCHA v3 é configurada.
- **Vercel APIs:** endpoints autenticados para verificação de e-mail, assinatura e remoção de avatar, além do processamento de notificações sociais.
- **Firebase Admin:** usado apenas no servidor e nos scripts administrativos; nunca é enviado ao navegador.
- **Resend:** envio server-side de e-mails de verificação.
- **Cloudinary:** upload direto assinado de avatares; o segredo de API permanece no servidor.

Os contratos das APIs próprias e integrações externas estão documentados em comentários próximos aos services, componentes e endpoints envolvidos.

### Modelo de dados resumido

| Área | Collections e subcollections principais |
| --- | --- |
| Conteúdo educacional | `tracks`, `courses`, `modules`, `lessons`, `activities`, `concepts`, `practicalExercises`, `courseCatalogs` |
| Contas e perfis | `users`, `profiles`, `usernames` |
| Progresso privado | `users/{uid}/lessonProgress`, `activityAttempts`, `practicalAttempts`, `conceptMastery` |
| Notificações | `users/{uid}/notifications` |
| Comunidade | `posts`, `posts/{postId}/replies`, `helpful` de posts e respostas, `reports` |
| Relações sociais | `follows` |

O conteúdo educacional é inserido ou atualizado pelo seed administrativo. O frontend não cria nem edita esse conteúdo.

### Firebase Storage

O Firebase Storage permanece inicializado e disponível no Emulator Suite por configuração legada, mas nenhuma funcionalidade atual do Web depende dele. Avatares usam Cloudinary, não Firebase Storage. As regras de Storage foram preservadas para decisão futura, sem remoção automática nesta etapa.

## Segurança

- Rotas e operações educacionais, sociais e de progresso exigem uma conta autenticada com e-mail verificado quando aplicável.
- Firestore Rules restringem ownership e dados privados; progresso, tentativas e notificações pertencem somente ao respectivo usuário.
- Perfis públicos não expõem e-mail, consentimentos, tentativas ou progresso privado.
- Endpoints da Vercel validam o Firebase ID Token e derivam a identidade do ator a partir dele, sem confiar em UIDs enviados pelo navegador.
- Variáveis administrativas são lidas apenas no servidor. Firebase Admin, private keys, API secrets do Resend e do Cloudinary não são incluídos no bundle cliente.
- Avatares usam parâmetros Cloudinary assinados no servidor e URLs validadas antes de serem persistidas.
- App Check é inicializado quando configurado. O enforcement deve ser confirmado no Firebase Console para cada ambiente.

## Variáveis de ambiente

Copie [`.env.example`](.env.example) para `.env.local` e preencha os valores do ambiente adequado. Nunca versione `.env.local` ou credenciais administrativas.

### Frontend público

As variáveis `VITE_` são disponibilizadas pelo Vite no navegador e devem conter apenas configuração pública:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY` (opcional)
- `VITE_USE_FIREBASE_EMULATORS` e `VITE_FIREBASE_EMULATOR_HOST` (desenvolvimento local)

### Backend server-side

Estas variáveis são usadas somente pelos endpoints Vercel ou scripts administrativos. Não use o prefixo `VITE_` para elas:

- Firebase Admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Resend: `RESEND_API_KEY`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Instalação e execução local

Pré-requisito: Node.js 18 ou superior.

```powershell
git clone https://github.com/depa1va/LearnDev.git
cd LearnDev
Copy-Item .env.example .env.local
npm install
npm run dev
```

Preencha `.env.local` com a configuração pública do Firebase antes de utilizar recursos que dependem do backend.

### Build de produção

```powershell
npm run build
npm run preview
```

### Seed educacional administrativo

O seed não é executado pelo site. Após configurar as credenciais administrativas de forma segura no ambiente local, ele pode ser executado manualmente:

```powershell
npm run seed:education
```

## Estrutura do projeto

```text
src/
  assets/        # imagens e recursos locais
  components/    # componentes reutilizáveis, layouts e seções
  config/        # configurações da aplicação
  data/          # dados institucionais e conteúdo estático
  lib/           # inicialização dos serviços Firebase
  pages/         # telas públicas, autenticadas, legais e de autenticação
  providers/     # contexto de autenticação e tema
  routes/        # guards de rota
  schemas/       # schemas Zod de formulários
  services/      # acesso a Firebase e integrações client-side
  types/         # tipos TypeScript das entidades
  utils/         # utilitários compartilhados
api/
  auth/          # endpoint de verificação de e-mail
  notifications/ # processamento server-side de notificações
  profile/       # assinatura e remoção de avatar
  _lib/          # Firebase Admin e helpers server-side
public/          # arquivos públicos, sitemap e robots
scripts/         # seed e validação do conteúdo educacional
```

## Rotas principais

### Públicas

- `/`
- `/sobre`
- `/termos`
- `/privacidade`
- `/trilhas`
- `/trilhas/:slug`
- `/cursos/:slug`
- `/entrar`
- `/cadastro`
- `/recuperar-senha`
- `/verificar-email`

### Protegidas

As rotas abaixo exigem autenticação, e as áreas do estudante também exigem e-mail verificado e onboarding concluído conforme os guards da aplicação.

- `/dashboard`
- `/progresso`
- `/notificacoes`
- `/aulas/:lessonId`
- `/atividades/:activityId`
- `/praticas/:exerciseId`
- `/comunidade`
- `/comunidade/posts/:postId`
- `/usuarios`
- `/perfil/:username`
- `/configuracoes`
- `/moderacao` (somente moderador ou administrador)

## Página Sobre

A rota [/sobre](/sobre) apresenta a descrição institucional do LearnDev, seus objetivos, funcionalidades principais e a equipe responsável pelo desenvolvimento.

## Equipe

- **André Monteiro Paiva** — Desenvolvedor web e mobile da plataforma.
- **Guilherme Marques dos Santos** — Desenvolvedor web e mobile da plataforma.

## Status do projeto

Versão desenvolvida para o Trabalho de Conclusão de Curso. A evolução de currículo, integrações e entrega final deve ser acompanhada pela revisão das regras, variáveis de ambiente e documentação correspondente.
