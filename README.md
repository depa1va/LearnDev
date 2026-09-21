# LearnDev

Plataforma educacional para iniciantes em programação, com foco em clareza, prática guiada, acompanhamento individual e revisão. O projeto não utiliza mecanismos competitivos.

## Estado atual — Fase 9.2

Esta fase entrega a base real de Firebase e autenticação:

- Firebase Authentication por e-mail e senha, com persistência local de sessão;
- cadastro com nome, username, e-mail, senha e confirmação;
- verificação obrigatória de e-mail, reenvio e atualização do estado da conta;
- login, logout e recuperação de senha;
- documentos privados em `users/{uid}`, perfis públicos em `profiles/{usernameNormalized}` e reserva de usernames;
- regras iniciais restritivas para Firestore e Storage;
- preparação opcional para App Check e Firebase Emulator Suite;
- onboarding curto, após a verificação de e-mail;
- edição de nome e bio, com perfil público separado;
- leitura de trilhas, cursos, módulos, aulas e conceitos publicados;
- currículo estruturado com quatro cursos, 45 aulas planejadas e as dez primeiras aulas de lógica desenvolvidas e publicadas;
- progresso individual de aula e curso, calculado apenas a partir de aulas concluídas;
- atividades objetivas, histórico de tentativas e recomendações de revisão por conceito;
- correção local de atividades objetivas, com feedback pedagógico por alternativa e sem dependência de Cloud Functions.
- exercícios práticos de pseudocódigo (`complete_code`, `write_code` e `order_steps`), com tentativas privadas separadas e correção local determinística;
- comunidade com publicações, respostas, edição, exclusão lógica, reação “Útil” e denúncias básicas;
- área restrita de moderação para analisar denúncias abertas, descartar denúncias ou ocultar conteúdo por exclusão lógica.

Ainda não há execução de código, correção de código em servidor, player de vídeo avançado ou o desenvolvimento completo das 45 aulas planejadas.

## Tecnologias

- React 18 + Vite
- React Router
- Firebase SDK (Authentication, Cloud Firestore, Storage e App Check preparado)
- Tailwind CSS, Framer Motion e Lucide React

## Configuração do Firebase

1. Crie ou selecione um projeto no [console do Firebase](https://console.firebase.google.com/).
2. Adicione um aplicativo Web ao projeto e copie a configuração exibida para ele.
3. Copie `.env.example` para `.env.local`.
4. Preencha **somente** estas variáveis com os valores do aplicativo Web:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Esses valores identificam o aplicativo Web e não são service accounts. Nunca coloque chaves administrativas ou arquivos de credencial no frontend.

No console, também é necessário:

- em **Authentication → Sign-in method**, ativar **E-mail/Senha**;
- criar o banco em **Firestore Database**;
- ativar **Storage**;
- em **Authentication → Settings → Authorized domains**, adicionar os domínios usados em desenvolvimento e produção, se necessário;
- antes de produção, ativar **App Check** para Web com reCAPTCHA v3 e acrescentar a chave pública em `VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY`.

## Regras

As regras estão em `firestore.rules` e `storage.rules` e são referenciadas por `firebase.json`.

Para publicá-las após instalar o Firebase CLI e associar o projeto:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,storage
```

No Firestore, tudo é negado por padrão fora de `users`, `profiles`, `usernames`, da comunidade e das coleções educacionais publicadas. O campo `role` não pode ser alterado pelo cliente. No Storage, somente o proprietário autenticado pode gravar ou remover imagens em `avatars/{uid}/...`; avatares são legíveis publicamente por pertencerem a perfis públicos.

## Username

O username é normalizado para minúsculas e precisa ter de 3 a 20 caracteres, usando somente letras, números e underscore. O cadastro cria, em uma única transação do Firestore:

- `usernames/{usernameNormalized}` com o UID reservado;
- `users/{uid}` com dados privados permitidos;
- `profiles/{usernameNormalized}` com dados públicos, sem e-mail.

Uma transação do Firestore verifica e reserva o documento de username junto com os perfis, impedindo que dois cadastros confirmem o mesmo username. Como Firebase Authentication e Firestore são serviços distintos, a criação da conta não pode fazer parte dessa mesma transação: em falhas conhecidas de provisionamento, a conta recém-criada é removida; uma falha ambígua de rede pode exigir recuperação ou suporte.

## Emulator Suite

O arquivo `firebase.json` prepara Authentication, Firestore, Storage e a interface dos emuladores. Após instalar Java e Firebase CLI, execute:

```bash
npx firebase-tools emulators:start --project SEU_PROJECT_ID
```

Mantenha as variáveis do aplicativo Web em `.env.local` e acrescente:

```env
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_EMULATOR_HOST=127.0.0.1
```

## Perfil e onboarding

Os dados privados ficam em `users/{uid}`. Além dos campos de conta já existentes, o documento possui `onboardingCompleted`, `experienceLevel` e `learningGoal`. Não há e-mail em nenhuma coleção pública.

Os dados públicos ficam em `profiles/{usernameNormalized}` e contêm somente UID, nome, username, foto e bio. A tela de configurações atualiza nome e bio em `users` e `profiles` em uma única gravação em lote; as regras exigem que os campos públicos compartilhados permaneçam iguais nos dois documentos.

Depois de verificar o e-mail, estudantes cujo onboarding não foi concluído são encaminhados a `/onboarding`. São três passos: boas-vindas, experiência anterior e objetivo de estudo. Ao concluir, somente as opções escolhidas e `onboardingCompleted: true` são salvos.

O envio de avatar não foi ativado nesta fase. `photoURL` permanece preparado e o sistema apresenta iniciais enquanto o upload seguro não for concluído em uma etapa posterior.

## Fundação educacional e atividades

As coleções de conteúdo são `tracks`, `courses`, `modules`, `lessons`, `activities`, `practicalExercises` e `concepts`. O cliente nunca pode criar, editar ou excluir conteúdo. Aulas, atividades, exercícios práticos e conceitos publicados exigem autenticação, pois podem conter material pedagógico integral, steps interativos ou respostas usadas pela correção local.

### Catálogo público

As rotas `/trilhas`, `/trilhas/:slug` e `/cursos/:slug` são públicas e apresentam a organização curricular. Para não expor conteúdo interno de aula, o seed também gera `courseCatalogs/{courseId}`. Cada documento dessa coleção contém somente a ementa pública: módulos e metadados das aulas publicadas (ID, título, descrição, ordem e duração estimada). Não inclui `sections`, `steps`, atividades, exercícios, conceitos ou respostas.

Depois de revisar esta alteração localmente, execute `npm run seed:education` para criar ou atualizar as ementas públicas junto ao restante do conteúdo e publique as Firestore Rules revisadas. O seed não é executado pelo site.

Cada questão pública da atividade contém enunciado, alternativas, `correctAnswer`, explicações, dica e `conceptIds`. A correção é executada localmente por `src/services/activityService.ts`, que também grava a tentativa em `users/{uid}/activityAttempts/{attemptId}` e atualiza `users/{uid}/conceptMastery/{conceptId}` em uma transação do Firestore.

Esta escolha mantém o projeto no plano gratuito, mas possui uma limitação importante: uma pessoa tecnicamente avançada consegue inspecionar ou manipular respostas, contagens e resultados no navegador. Por isso, as tentativas são histórico educacional pessoal; não são resultados oficiais, certificados ou base para competição.

As Rules protegem a propriedade dos dados, a estrutura dos documentos, referências a atividades e conteúdos publicados e timestamps. Elas não podem provar que o resultado calculado pelo cliente está correto sem um backend confiável.

### Exercícios práticos de pseudocódigo

Os exercícios práticos ficam em `practicalExercises` e são vinculados a uma aula publicada. Eles são uma modalidade separada das atividades objetivas: não substituem questionários, não atualizam `conceptMastery` e registram tentativas em `users/{uid}/practicalAttempts/{attemptId}`.

Cada exercício usa somente pseudocódigo e um corretor local simples e determinístico:

- `complete_code`: compara a lacuna normalizada com respostas aceitas;
- `order_steps`: verifica a ordem das etapas fornecidas;
- `write_code`: verifica critérios declarados da solução, sem executar código.

Essa escolha não depende de Cloud Functions, planos pagos, IA, execução arbitrária de código ou editor externo. Em contrapartida, uma pessoa tecnicamente avançada pode inspecionar ou manipular as regras de correção e o resultado no navegador. As tentativas são, portanto, histórico pedagógico pessoal — não resultados oficiais, certificados ou base para competição.

## Comunidade e moderação

Publicações e respostas ficam em `posts/{postId}` e `posts/{postId}/replies/{replyId}`. A exclusão é lógica: documentos não são apagados fisicamente. Quando o autor remove seu conteúdo, são gravados `deletedBy`, `deletionType: "author"` e `deletedAt`. Quando a moderação remove conteúdo, os mesmos campos registram `deletionType: "moderation"`.

Denúncias ficam em `reports/{reportId}`. Estudantes podem criar e consultar somente as próprias denúncias; nunca podem listá-las. Moderadores e administradores podem listar denúncias abertas e registrar uma única decisão:

- `open → resolved`, ao remover conteúdo ou registrar a resolução de conteúdo já indisponível;
- `open → dismissed`, quando a denúncia não procede.

As decisões registram `reviewedBy`, `reviewedAt` e, opcionalmente, `resolutionNote`. O conteúdo apagado continua acessível somente para moderadores e administradores dentro da área restrita `/moderacao`; estudantes continuam vendo apenas conteúdo publicado.

### Papéis e primeiro administrador

Os únicos papéis aceitos são `student`, `moderator` e `admin`. O cadastro público cria apenas `student`, e as Rules impedem que o usuário altere o próprio papel.

Como esta versão não usa Cloud Functions nem credenciais administrativas no frontend, o primeiro administrador deve ser definido manualmente pelo responsável técnico, **após revisar e publicar as Rules**:

1. No Firebase Console, abra **Firestore Database → Data → users**.
2. Localize o documento cujo ID é o UID da conta responsável.
3. Altere somente o campo `role` de `student` para `admin`.
4. Salve a alteração e recarregue a sessão dessa conta no LearnDev.

Essa operação deve ser limitada ao responsável pelo projeto ou realizada via Firebase Admin SDK em ambiente seguro. Não existe botão, e-mail pré-configurado ou código secreto no frontend para conceder acesso administrativo.

Os serviços de leitura estão em `src/services/educationService.js`. Eles usam consultas simples, filtram conteúdo publicado e fazem a ordenação pelo campo `order` no cliente para evitar índices compostos desnecessários nesta fase.

O seed de desenvolvimento contém uma trilha e quatro cursos estruturados. Somente **Fundamentos de Programação e Lógica** e suas dez primeiras aulas estão publicados. As demais 35 aulas aparecem como `draft`, são validadas pelo manifesto, mas não são retornadas pelas consultas do frontend.

As aulas publicadas utilizam objetivos, seções textuais, exemplos de pseudocódigo, reflexão não persistente, erros comuns, resumo e próximos passos. Cada uma possui uma atividade objetiva associada; há 60 questões no conjunto inicial, vinculadas a conceitos específicos para a revisão individual.

Ele não é executado pela aplicação nem fica disponível em qualquer tela pública.

### Seed educacional administrativo

Os documentos mínimos estão definidos em `scripts/educationSeedData.mjs`. O comando `npm run seed:education` é uma ferramenta Node de desenvolvimento/administração: não é executado automaticamente, não aparece no site e não usa as permissões do navegador.

O script reutiliza esse manifesto, valida referências entre trilhas, cursos, módulos, aulas, atividades, exercícios práticos e conceitos antes de gravar e usa Firebase Admin SDK. Nenhuma chave administrativa é enviada ao frontend.

#### Configurar para o Firestore real

1. Execute `npm install` para instalar as dependências de desenvolvimento, incluindo `firebase-admin`.
2. No Firebase Console, abra **Configurações do projeto → Contas de serviço → Gerar nova chave privada**.
3. Salve o JSON em uma pasta segura fora do repositório. Nunca o copie para `src/`, `.env.local` ou qualquer arquivo versionado.
4. No PowerShell, dentro da pasta do projeto, informe somente o caminho local da credencial e o ID do projeto:

```powershell
$env:FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
$env:DEVQUEST_FIREBASE_SERVICE_ACCOUNT="C:\caminho-seguro\service-account.json"
npm run seed:education
Remove-Item Env:\DEVQUEST_FIREBASE_SERVICE_ACCOUNT
```

Como alternativa para ambientes que usam Application Default Credentials, execute `gcloud auth application-default login`, defina `FIREBASE_PROJECT_ID` e rode o mesmo comando sem `DEVQUEST_FIREBASE_SERVICE_ACCOUNT`.

#### Configurar para o Emulator Suite

Com o Emulator Suite em execução, use:

```powershell
$env:FIREBASE_PROJECT_ID="devquest-local"
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
npm run seed:education
```

O seed modifica somente `tracks`, `courses`, `modules`, `lessons`, `concepts`, `activities` e `practicalExercises`. Os IDs vêm das chaves do manifesto. Ao encontrar um documento existente com o mesmo ID, ele completa/atualiza os campos do manifesto, preserva `createdAt` quando já existe e sempre atualiza `updatedAt`. Nenhum documento fora do manifesto é apagado.

Nunca afrouxe as regras do Firestore para popular conteúdo educacional. O Firebase Admin SDK executa fora das regras do cliente e deve permanecer restrito ao ambiente do desenvolvedor.

Após alterar `firestore.rules`, publique as regras antes de usar a leitura educacional em produção:

```bash
npx firebase-tools deploy --only firestore:rules,storage
```

Não há índice composto configurado nesta fase. Caso uma consulta futura exija um, o console do Firestore fornecerá a definição e o link de criação.

## Limitações atuais

- Não há upload de avatar, player de vídeo avançado, execução de código, correção de código no servidor, banimentos, strikes, notificações ou painel administrativo de usuários.
- As 35 aulas em `draft` ainda precisam de conteúdo pedagógico completo, atividades e revisão editorial antes de serem publicadas.
- A correção atual atende questões `multiple-choice`, `true-false` e exercícios de pseudocódigo com critérios locais. Revisão mais detalhada, execução segura e correção robusta de respostas abertas pertencem às próximas fases.

## Executando

```bash
npm install
npm run dev
```

Para gerar a build de produção:

```bash
npm run build
```
