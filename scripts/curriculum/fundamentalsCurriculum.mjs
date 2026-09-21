const courseId = 'comecando-do-zero-e-logica';
const courseSlug = 'comecando-do-zero-e-logica';

function text(id, title, content) {
  return { id, type: 'text', title, content };
}

function callout(id, title, content) {
  return { id, type: 'callout', title, content };
}

function example(id, title, content, explanation) {
  return { id, type: 'example', title, label: 'Pseudocódigo', content, explanation };
}

function reflection(id, prompt, suggestedAnswer) {
  return { id, type: 'reflection', title: 'Teste seu entendimento', prompt, suggestedAnswer };
}

function guidedPractice(id, title, problem, steps, check) {
  return { id, type: 'guided-practice', title, problem, steps, check };
}

function commonMistakes(id, items) {
  return { id, type: 'common-mistakes', title: 'Erros comuns', items };
}

function summary(id, items) {
  return { id, type: 'summary', title: 'Resumo da aula', items };
}

function nextSteps(id, items) {
  return { id, type: 'next-steps', title: 'Próximos passos', items };
}

function publishedLesson({ id, moduleId, slug, title, description, order, estimatedMinutes, objectives, conceptIds, introduction, sections, video }) {
  return {
    [id]: {
      courseId,
      courseSlug,
      moduleId,
      slug,
      title,
      description,
      order,
      status: 'published',
      estimatedMinutes,
      objectives,
      content: { introduction, explanation: sections.find((section) => section.type === 'text')?.content ?? introduction, examples: [] },
      sections,
      conceptIds,
      ...(video ? { video } : {}),
    },
  };
}

function draftLesson({ id, courseId: draftCourseId, courseSlug: draftCourseSlug, moduleId, slug, title, description, order, conceptIds = [] }) {
  return {
    [id]: {
      courseId: draftCourseId,
      courseSlug: draftCourseSlug,
      moduleId,
      slug,
      title,
      description,
      order,
      status: 'draft',
      conceptIds,
    },
  };
}

function option(id, label, feedback) {
  return { id, label, feedback };
}

function question(id, prompt, conceptIds, options, correctAnswer, correctFeedback, hint) {
  return {
    id,
    type: 'multiple-choice',
    prompt,
    conceptIds,
    options,
    correctAnswer,
    correctFeedback,
    incorrectFeedback: 'A alternativa escolhida aponta para uma confusão comum. Leia o feedback específico e retome o exemplo da aula.',
    hint,
  };
}

const difficultyPlan = {
  'programacao-primeiros-passos': ['intermediate', 'intermediate', 'intermediate', 'application', 'application', 'basic'],
  'computador-executa-instrucoes-verificacao': ['application', 'intermediate', 'application', 'intermediate', 'application', 'intermediate'],
  'algoritmos-instrucoes-verificacao': ['application', 'application', 'application', 'intermediate', 'intermediate', 'basic'],
  'entrada-processamento-saida-pratica': ['basic', 'intermediate', 'intermediate', 'application', 'application', 'application'],
  'dados-valores-e-tipos-pratica': ['basic', 'basic', 'intermediate', 'application', 'application', 'intermediate'],
  'variaveis-e-memoria-pratica': ['basic', 'intermediate', 'application', 'intermediate', 'application', 'intermediate'],
  'operadores-pratica': ['basic', 'basic', 'application', 'application', 'intermediate', 'intermediate'],
  'condicoes-e-decisoes-pratica': ['basic', 'intermediate', 'application', 'application', 'intermediate', 'application'],
  'repeticoes-e-loops-pratica': ['application', 'intermediate', 'intermediate', 'application', 'intermediate', 'application'],
  'funcoes-e-reutilizacao-pratica': ['application', 'basic', 'intermediate', 'application', 'intermediate', 'application'],
  'decomposicao-de-problemas-pratica': ['intermediate', 'application', 'application', 'intermediate', 'application', 'application'],
  'exercicios-de-logica-integradores': ['intermediate', 'intermediate', 'application', 'application', 'application', 'application'],
};

function activity({ id, lessonId, moduleId, title, description, conceptIds, questions }) {
  const difficulties = difficultyPlan[id];
  return {
    [id]: {
      lessonId,
      courseId,
      moduleId,
      slug: id,
      type: 'multiple-choice',
      title,
      description,
      instructions: 'Leia cada situação com calma. Escolha a alternativa que melhor explica o raciocínio e use o feedback para revisar o que for necessário.',
      order: 1,
      status: 'published',
      conceptIds,
      questions: questions.map((item, index) => ({ ...item, difficulty: difficulties[index] })),
    },
  };
}

const fundamentalsLessons = {
  ...publishedLesson({
    id: 'o-que-e-programacao',
    moduleId: 'introducao-programacao',
    slug: 'o-que-e-programacao',
    title: 'O que é programação?',
    description: 'Entenda programação como a elaboração precisa de soluções que um computador pode executar.',
    order: 1,
    estimatedMinutes: 32,
    conceptIds: ['logic.programming', 'logic.instructions'],
    objectives: [
      'Explicar programação como resolução de problemas por meio de instruções.',
      'Diferenciar um problema, uma solução e a sua implementação.',
      'Reconhecer por que computadores precisam de instruções explícitas.',
      'Identificar tarefas cotidianas que podem ser automatizadas.',
    ],
    introduction: 'Programar não começa com decorar comandos. Começa com uma pergunta: qual problema quero resolver e quais passos deixam a solução clara o bastante para alguém — ou uma máquina — executá-la?',
    sections: [
      text('programacao-ideia-central', 'Programar é transformar intenção em passos executáveis', 'Um computador consegue repetir cálculos e seguir regras com velocidade, mas não entende intenções vagas como “organize meus gastos”. Programar é descrever uma solução em passos precisos: quais dados entram, que decisões serão tomadas e qual resultado deve aparecer.\n\nA linguagem de programação é o meio usado para escrever esses passos. Antes dela existe o raciocínio: observar o problema, dividir a solução e verificar se cada instrução pode ser executada.'),
      callout('programacao-nao-e-magia', 'Uma ideia não é uma instrução', '“Avise se eu gastar demais” é uma ideia útil, mas ainda faltam detalhes: o que significa demais? onde o gasto será informado? como será o aviso? Instruções claras removem essas ambiguidades.'),
      example('programacao-exemplo-simples', 'Mostrar um nome recebido', 'READ name\nPRINT name', 'READ representa a entrada de um dado. PRINT apresenta o resultado. O exemplo não usa cálculo, comparação ou decisão: ele mostra somente uma sequência clara de entrada e saída.'),
      text('programacao-aplicacao', 'Onde isso aparece?', 'Um aplicativo de transporte calcula uma rota; uma loja confere disponibilidade; um site mostra uma mensagem após um formulário. Em todos os casos há dados, regras e resultados. Programação ajuda a tornar esse processo repetível e verificável.\n\nIsso também explica por que testar é importante: se a regra foi descrita de forma incompleta, o computador seguirá a regra incompleta com toda precisão.'),
      commonMistakes('programacao-erros', [
        { title: 'Confundir programação com digitar código rápido', description: 'Velocidade de digitação não resolve um problema mal entendido. O código só registra uma solução que precisa ser pensada antes.' },
        { title: 'Esperar que o computador “complete” uma instrução vaga', description: 'Computadores não usam contexto como pessoas. Critérios e exceções precisam ser definidos.' },
      ]),
      reflection('programacao-reflexao', 'Pense em um despertador. Qual dado ele recebe, qual regra ele aplica e qual ação realiza?', 'Uma resposta possível: recebe o horário configurado; compara esse horário com a hora atual; toca um alarme quando os horários coincidem.'),
      summary('programacao-resumo', ['Programação organiza soluções em instruções executáveis.', 'Computadores precisam de regras explícitas e critérios claros.', 'Código é uma forma de registrar essas instruções em uma linguagem.', 'Testar ajuda a descobrir se a solução realmente cobre o problema.']),
      nextSteps('programacao-proximos-passos', ['Na próxima aula, você verá como o computador executa cada instrução sem “adivinhar” o próximo passo.', 'Depois, algoritmos darão uma forma organizada para planejar essas instruções.']),
    ],
  }),
  ...publishedLesson({
    id: 'como-computador-executa-instrucoes',
    moduleId: 'introducao-programacao',
    slug: 'como-computador-executa-instrucoes',
    title: 'Como um computador executa instruções',
    description: 'Veja por que precisão, ordem e dados definidos são essenciais quando uma máquina executa um programa.',
    order: 2,
    estimatedMinutes: 30,
    conceptIds: ['logic.programming', 'logic.instructions'],
    objectives: [
      'Descrever a execução de um programa como leitura e realização de instruções.',
      'Explicar por que uma instrução ambígua não é suficiente para um computador.',
      'Identificar o efeito de alterar a ordem de passos dependentes.',
      'Relacionar dados armazenados às instruções que os usam.',
    ],
    introduction: 'Quando um programa é executado, o computador não improvisa. Ele lê instruções e trabalha com dados exatamente conforme as regras escritas. Essa previsibilidade é poderosa — e exige cuidado de quem programa.',
    sections: [
      text('execucao-passo-a-passo', 'Execução é uma sequência controlada', 'Imagine uma lista de instruções numeradas. Em geral, o computador começa na primeira, executa-a e segue para a próxima. Algumas instruções podem escolher caminhos diferentes ou repetir um trecho, mas a ideia permanece: cada passo precisa dizer o que fazer agora.\n\nSe uma etapa depende do resultado de outra, inverter a ordem muda o comportamento. Não é uma questão de “preferência”; é uma dependência lógica.'),
      example('execucao-exemplo', 'Calcular o dobro de um número', 'READ number\nCALCULATE double FROM number\nPRINT double', 'Primeiro o programa recebe number. Depois calcula seu dobro usando esse valor. Só então mostra o resultado. Mostrar antes do cálculo não produziria a informação desejada; os símbolos de cálculo serão apresentados em uma aula posterior.'),
      text('execucao-precisao', 'Precisão reduz interpretações', 'Uma pessoa pode entender “separe os alunos aprovados”. Um programa precisa saber qual nota é suficiente, como a nota chega e o que fazer com quem não atinge o critério. Especificar essas partes torna a solução verificável.\n\nIsso não significa que todo detalhe precisa aparecer de uma vez. Você pode começar com uma versão simples, testá-la e acrescentar regras conforme o problema fica mais claro.'),
      callout('execucao-modelo-mental', 'Modelo mental útil', 'Pense no computador como um executor extremamente consistente: ele faz exatamente o que foi definido, inclusive quando a definição contém uma falha. Por isso, uma resposta inesperada costuma ser uma pista para revisar a instrução, não para culpar a máquina.'),
      commonMistakes('execucao-erros', [
        { title: 'Achar que a ordem é apenas visual', description: 'Quando um passo usa um valor produzido antes, a posição dele no algoritmo é parte do significado.' },
        { title: 'Usar palavras sem critério mensurável', description: 'Termos como “muito”, “perto” ou “rápido” precisam virar uma regra que possa ser avaliada.' },
      ]),
      reflection('execucao-reflexao', 'Em uma calculadora, por que “mostrar resultado” deve vir depois de receber os números e executar a operação?', 'Porque o resultado depende dos números recebidos e do cálculo. Sem essas etapas anteriores, não existe resultado correto para mostrar.'),
      summary('execucao-resumo', ['Programas executam instruções e usam dados conforme a ordem definida.', 'Dependências entre passos explicam por que trocar a sequência pode falhar.', 'Regras claras deixam o comportamento testável.', 'Uma saída inesperada é um convite para revisar a lógica.']),
      nextSteps('execucao-proximos-passos', ['Agora você pode organizar uma solução inteira usando o conceito de algoritmo.', 'Observe em especial como cada passo prepara o próximo.']),
    ],
  }),
  ...publishedLesson({
    id: 'algoritmos-e-instrucoes',
    moduleId: 'introducao-programacao',
    slug: 'algoritmos-e-instrucoes',
    title: 'Algoritmos e sequência lógica',
    description: 'Planeje uma solução como uma sequência finita, ordenada e verificável de passos.',
    order: 3,
    estimatedMinutes: 38,
    conceptIds: ['logic.instructions', 'logic.algorithm'],
    video: {
      provider: 'youtube',
      videoId: 'mstMhMT_UeA',
      title: 'Curso de Algoritmos e Lógica de Programação — O que é e como funciona?',
      channelName: 'Hashtag Programação',
      language: 'pt-BR',
      educationalRole: 'Explicação complementar sobre algoritmo, lógica e pseudocódigo para iniciantes.',
    },
    objectives: [
      'Definir algoritmo com precisão técnica.',
      'Organizar passos em uma sequência lógica.',
      'Reconhecer instruções incompletas ou fora de ordem.',
      'Revisar um algoritmo por meio de exemplos de entrada e saída.',
    ],
    introduction: 'Um algoritmo é um plano de resolução: uma sequência de instruções organizada para produzir um resultado. A analogia com receita ajuda, mas o conceito técnico exige também clareza, ordem e um fim.',
    sections: [
      text('algoritmo-definicao', 'O que torna uma sequência um algoritmo?', 'Um algoritmo descreve passos para resolver uma classe de problemas, não apenas uma resposta decorada. Ele deve ser compreensível, ter uma ordem lógica e terminar depois de cumprir a tarefa.\n\nUma receita ilustra a ideia porque ingredientes e etapas importam. A analogia termina aí: em programação, também precisamos prever dados, decisões e casos diferentes para que a solução seja executável.'),
      example('algoritmo-media', 'Classificar uma média escolar', 'READ grade1\nREAD grade2\naverage ← (grade1 + grade2) / 2\nPRINT average', 'As duas notas entram antes do cálculo. A expressão entre parênteses soma as notas; a divisão produz a média. A saída ocorre somente depois que average recebeu um valor.'),
      text('algoritmo-testes', 'Simular antes de implementar', 'Uma maneira simples de revisar um algoritmo é escolher dados de exemplo e percorrer as linhas como se você fosse o computador. Para nota1 = 6 e nota2 = 8, a média esperada é 7. Se o algoritmo mostra outro valor, existe uma regra ou ordem a revisar.\n\nEssa simulação é chamada de rastreamento manual. Ela não substitui testes automáticos no futuro, mas desenvolve o hábito de conferir a lógica.'),
      callout('algoritmo-finitude', 'Todo algoritmo precisa saber quando termina', 'Uma instrução como “continue calculando” não basta. É necessário indicar um resultado, uma condição de parada ou uma quantidade de repetições. Essa ideia ficará ainda mais importante quando você estudar loops.'),
      commonMistakes('algoritmo-erros', [
        { title: 'Confundir algoritmo com uma linguagem específica', description: 'O algoritmo é a lógica da solução. Ele pode ser explicado em português estruturado, fluxograma ou código.' },
        { title: 'Esconder uma etapa essencial', description: 'Se o cálculo usa dois valores, o algoritmo precisa indicar de onde eles vêm antes de usá-los.' },
      ]),
      reflection('algoritmo-reflexao', 'Crie três passos para verificar se uma porta está trancada. Qual informação você precisa observar antes de concluir?', 'Uma resposta possível: observar a posição da fechadura; tentar mover a maçaneta; informar se a porta permanece fechada. A observação e o teste vêm antes da conclusão.'),
      summary('algoritmo-resumo', ['Algoritmo é uma sequência ordenada de instruções para resolver um problema.', 'Dados necessários precisam estar disponíveis antes de serem usados.', 'Simular casos concretos ajuda a encontrar falhas.', 'Uma solução precisa ter um caminho de término.']),
      nextSteps('algoritmo-proximos-passos', ['Na próxima aula, você vai separar uma solução em entrada, processamento e saída.', 'Essa divisão deixa algoritmos maiores mais fáceis de entender.']),
    ],
  }),
  ...publishedLesson({
    id: 'entrada-processamento-saida',
    moduleId: 'introducao-programacao',
    slug: 'entrada-processamento-saida',
    title: 'Entrada, processamento e saída',
    description: 'Use o modelo entrada–processamento–saída para decompor como um sistema transforma dados em resultados.',
    order: 4,
    estimatedMinutes: 36,
    conceptIds: ['logic.input', 'logic.processing', 'logic.output', 'logic.algorithm'],
    objectives: [
      'Identificar entradas em uma situação computacional.',
      'Distinguir processamento de saída.',
      'Modelar um problema simples com entrada, processamento e saída.',
      'Detectar quando uma informação foi classificada na etapa errada.',
    ],
    introduction: 'Muitos programas podem ser entendidos como uma transformação: recebem dados, aplicam regras e devolvem um resultado. O modelo entrada–processamento–saída, frequentemente abreviado como EPS, torna essa transformação visível.',
    sections: [
      text('eps-visao', 'Três papéis diferentes', 'Entrada é aquilo que o sistema recebe: uma nota, um horário, um clique ou uma escolha. Processamento é o trabalho feito sobre esses dados: somar, comparar, ordenar ou decidir. Saída é o resultado comunicado: uma média, uma mensagem, uma lista ou uma tela atualizada.\n\nO mesmo dado pode mudar de papel em outro contexto. A média calculada é saída de um cálculo, mas pode virar entrada para uma regra que decide aprovação.'),
      example('eps-media', 'Sistema de média escolar', 'READ grade1\nREAD grade2\naverage ← (grade1 + grade2) / 2\nPRINT "Média: " + average', 'grade1 e grade2 são entradas. A soma e a divisão formam o processamento. A mensagem com average é a saída. Separar essas partes ajuda a descobrir o que falta em uma solução.'),
      example('eps-frete', 'Estimativa de frete', 'READ distance\nREAD pricePerKm\nshipping ← distance * pricePerKm\nPRINT shipping', 'distance e pricePerKm entram no sistema. A multiplicação calcula o frete. O valor apresentado ao cliente é a saída.'),
      text('eps-aplicacao', 'Use EPS para planejar antes do código', 'Ao imaginar um caixa eletrônico, pergunte: quais dados chegam? valor do saque e saldo. O que é processado? a verificação de saldo e o novo saldo. O que sai? dinheiro, comprovante ou uma mensagem.\n\nEssa análise não resolve todos os detalhes, mas evita começar pela sintaxe e esquecer dados indispensáveis.'),
      commonMistakes('eps-erros', [
        { title: 'Chamar todo dado de entrada', description: 'Um resultado produzido pelo próprio programa costuma ser saída daquele processamento, mesmo que seja usado depois em outra etapa.' },
        { title: 'Tratar uma regra como saída', description: '“Calcular desconto” descreve processamento; a saída é o valor descontado ou a mensagem resultante.' },
      ]),
      reflection('eps-reflexao', 'Em um aplicativo que converte temperatura de Celsius para Fahrenheit, qual é a entrada, qual é o processamento e qual é a saída?', 'Entrada: temperatura em Celsius. Processamento: aplicar a fórmula de conversão. Saída: temperatura equivalente em Fahrenheit.'),
      summary('eps-resumo', ['Entrada fornece dados ao sistema.', 'Processamento aplica regras aos dados.', 'Saída comunica um resultado.', 'O modelo EPS ajuda a planejar e revisar algoritmos.']),
      nextSteps('eps-proximos-passos', ['Você já sabe de onde vêm e para onde vão os valores. Agora vai observar que valores podem ter naturezas diferentes.', 'A próxima aula apresenta dados, valores e tipos.']),
    ],
  }),
  ...publishedLesson({
    id: 'dados-valores-e-tipos',
    moduleId: 'dados-e-decisoes',
    slug: 'dados-valores-e-tipos',
    title: 'Dados, valores e tipos',
    description: 'Entenda como programas representam números, textos e valores lógicos para trabalhar com informação de forma confiável.',
    order: 5,
    estimatedMinutes: 35,
    conceptIds: ['logic.data'],
    objectives: [
      'Diferenciar dado, valor e tipo de dado.',
      'Reconhecer números, textos e valores lógicos em situações simples.',
      'Explicar por que o tipo influencia uma operação.',
      'Escolher uma representação adequada para uma informação.',
    ],
    introduction: 'Programas trabalham com dados. Para que uma instrução faça sentido, o computador precisa saber se está lidando com um número para calcular, um texto para exibir ou uma condição que pode ser verdadeira ou falsa.',
    sections: [
      text('dados-tipos', 'Valor é a informação; tipo é como ela será tratada', 'O valor 25 pode representar idade, quantidade ou temperatura. O texto “25” parece parecido para uma pessoa, mas é uma sequência de caracteres. Um programa precisa distinguir essas representações porque somar números não é o mesmo que juntar textos.\n\nNesta etapa, use três famílias: números para quantidades e cálculos; textos para palavras e mensagens; valores lógicos para respostas de sim ou não, representadas aqui por TRUE e FALSE.'),
      example('dados-exemplo', 'Dados de um pedido', 'quantity ← 3\ncustomer ← "Rafa"\npaymentConfirmed ← TRUE', 'quantity é numérica e pode entrar em cálculos. customer é texto e será exibido. paymentConfirmed é lógico: ele permite decidir se o pedido pode avançar.'),
      text('dados-importancia', 'O tipo orienta a operação', 'Se um formulário recebe “dez” como texto, não é seguro usá-lo diretamente como quantidade numérica. Da mesma forma, uma mensagem como “pedido enviado” não pode ser multiplicada. Identificar o tipo cedo evita resultados estranhos e deixa as regras mais claras.\n\nEm linguagens reais, existem mais tipos e conversões. Por enquanto, o essencial é perguntar: que espécie de informação estou manipulando e o que pretendo fazer com ela?'),
      commonMistakes('dados-erros', [
        { title: 'Achar que todo valor com aparência de número é numérico', description: '“12” é texto enquanto não for tratado como número. A aparência não define a operação.' },
        { title: 'Usar TRUE/FALSE como mensagem', description: 'Um valor lógico representa uma condição. Ele é especialmente útil para decisões, que virão em breve.' },
      ]),
      reflection('dados-reflexao', 'Classifique cada informação de um cadastro: nome, idade e aceitaTermos.', 'nome é texto; idade é número; aceitaTermos é lógico, pois representa uma escolha de sim ou não.'),
      summary('dados-resumo', ['Dados representam informações usadas por um programa.', 'Valores podem ser numéricos, textuais ou lógicos.', 'O tipo orienta quais operações são adequadas.', 'Escolher a representação correta reduz erros de lógica.']),
      nextSteps('dados-proximos-passos', ['Na próxima aula, você dará nomes a valores para poder usá-los ao longo de um algoritmo.', 'Esses nomes serão as variáveis.']),
    ],
  }),
  ...publishedLesson({
    id: 'variaveis-e-memoria',
    moduleId: 'dados-e-decisoes',
    slug: 'variaveis-e-memoria',
    title: 'Variáveis e memória',
    description: 'Use variáveis para nomear, guardar, ler e atualizar valores durante a execução de um algoritmo.',
    order: 6,
    estimatedMinutes: 40,
    conceptIds: ['logic.data', 'logic.variables'],
    objectives: [
      'Explicar a relação entre variável, nome e valor.',
      'Acompanhar uma variável sendo atualizada passo a passo.',
      'Escolher nomes que revelem o papel de um dado.',
      'Evitar confundir a variável com o valor que ela guarda agora.',
    ],
    introduction: 'Uma variável é um nome associado a um valor que o programa precisa consultar ou alterar. A ideia de “caixa” ajuda no começo, desde que você lembre: o importante é o nome, o valor atual e as instruções que o atualizam.',
    sections: [
      text('variaveis-conceito', 'Nomear valores permite trabalhar com eles', 'Em vez de repetir o número 10 em vários lugares, podemos guardar esse valor em limite. Depois, qualquer instrução que leia limite usa o valor atual associado a esse nome.\n\nO símbolo ←, usado no pseudocódigo, significa “recebe”. A linha total ← total + 1 não é uma igualdade matemática: ela lê o valor atual de total, soma 1 e guarda o novo resultado de volta em total.'),
      example('variaveis-contador', 'Atualizando um contador', 'total ← 0\ntotal ← total + 1\ntotal ← total + 1\nPRINT total', 'Após a primeira linha, total vale 0. Na segunda, passa a valer 1. Na terceira, passa a valer 2. A saída mostra 2. Rastrear os valores linha a linha é a melhor forma de entender uma atualização.'),
      example('variaveis-nomes', 'Nomes que explicam a regra', 'idadeCliente → 20\nlimiteDeIdade → 18\nnomeCliente → "Ana"', 'Nomes longos, mas claros, ajudam a ler a lógica. Não é preciso adivinhar o que x ou a significam. Comparações serão introduzidas somente na próxima aula, sobre operadores.'),
      callout('variaveis-memoria', 'A analogia da caixa tem limite', 'Uma variável não é literalmente uma caixa física. Ela é uma forma de referenciar um valor na memória enquanto o programa executa. A analogia serve para pensar em guardar e substituir valores, não para explicar todos os detalhes do computador.'),
      commonMistakes('variaveis-erros', [
        { title: 'Ler ← como “é igual a”', description: 'Em pseudocódigo, ← atribui um novo valor. Leia como “recebe”.' },
        { title: 'Esperar que a variável conserve o valor antigo após atualização', description: 'Quando total recebe total + 1, o valor anterior é substituído pelo novo resultado.' },
      ]),
      reflection('variaveis-reflexao', 'Se pontos começa em 5 e depois recebe pontos + 3, qual valor deve ser mostrado?', 'Deve ser mostrado 8. A segunda instrução usa o 5 atual, soma 3 e atualiza pontos.'),
      summary('variaveis-resumo', ['Variáveis dão nomes a valores usados no algoritmo.', 'Uma atribuição atualiza o valor associado ao nome.', 'Rastrear valores ajuda a entender a execução.', 'Nomes claros tornam a lógica mais legível.']),
      nextSteps('variaveis-proximos-passos', ['Agora você pode guardar valores. Em seguida, vai combinar e comparar esses valores usando operadores.', 'Essas comparações prepararão as decisões da aula seguinte.']),
    ],
  }),
  ...publishedLesson({
    id: 'operadores',
    moduleId: 'dados-e-decisoes',
    slug: 'operadores',
    title: 'Operadores',
    description: 'Combine, compare e transforme valores com operadores aritméticos e relacionais em pseudocódigo.',
    order: 7,
    estimatedMinutes: 38,
    conceptIds: ['logic.data', 'logic.variables', 'logic.operators'],
    objectives: [
      'Usar operadores aritméticos em cálculos simples.',
      'Interpretar comparações que geram TRUE ou FALSE.',
      'Distinguir cálculo de comparação.',
      'Rastrear uma expressão usando valores conhecidos.',
    ],
    introduction: 'Operadores são símbolos ou palavras que indicam uma ação sobre valores. Alguns calculam, como + e *. Outros comparam, como > e ==. Saber que tipo de resultado cada operador produz é essencial para escrever regras corretas.',
    sections: [
      text('operadores-tipos', 'Calcular é diferente de comparar', 'Operadores aritméticos produzem números: + soma, - subtrai, * multiplica e / divide. Operadores relacionais comparam valores e produzem um valor lógico: > significa maior que, < menor que, >= maior ou igual a e == igual a.\n\nA expressão 7 + 2 produz 9. Já 7 + 2 == 9 produz TRUE. A primeira serve para calcular; a segunda serve para responder uma pergunta sobre o cálculo.'),
      example('operadores-desconto', 'Calculando e comparando', 'valor ← 120\ndesconto ← valor * 0.10\nvalorFinal ← valor - desconto\nfreteGratis ← valorFinal >= 100', 'desconto e valorFinal são numéricos. freteGratis é lógico, pois resulta de uma comparação. Separar cada etapa torna a regra fácil de conferir.'),
      text('operadores-ordem', 'Leia expressões em partes', 'Quando uma expressão fica grande, crie variáveis intermediárias em vez de tentar fazer tudo de uma vez. Isso reduz erros e comunica intenção. Em uma média, por exemplo, soma ← nota1 + nota2 e media ← soma / 2 deixam cada cálculo visível.\n\nParênteses também ajudam a mostrar quais operações devem ser consideradas juntas, mesmo quando você ainda não está estudando todas as regras de precedência.'),
      commonMistakes('operadores-erros', [
        { title: 'Confundir = de uma linguagem com comparação', description: 'Nesta etapa usamos == para comparar e ← para atribuir. Linguagens podem ter sintaxes próprias; o significado precisa continuar claro.' },
        { title: 'Esperar número de uma comparação', description: 'Uma comparação responde TRUE ou FALSE. Esse resultado é usado para decidir caminhos.' },
      ]),
      reflection('operadores-reflexao', 'Com saldo = 40 e preco = 55, qual é o resultado de saldo >= preco? O que essa resposta pode orientar?', 'O resultado é FALSE. Ele pode orientar a decisão de não permitir a compra por saldo insuficiente.'),
      summary('operadores-resumo', ['Operadores aritméticos calculam valores numéricos.', 'Operadores relacionais comparam valores e produzem resultados lógicos.', 'Variáveis intermediárias tornam cálculos mais legíveis.', 'Comparações preparam decisões.']),
      nextSteps('operadores-proximos-passos', ['A próxima aula usa resultados TRUE/FALSE para escolher entre caminhos.', 'Você verá como uma decisão transforma regras em comportamento do programa.']),
    ],
  }),
  ...publishedLesson({
    id: 'condicoes-e-tomada-de-decisao',
    moduleId: 'dados-e-decisoes',
    slug: 'condicoes-e-tomada-de-decisao',
    title: 'Condições e tomada de decisão',
    description: 'Modele decisões com condições claras antes de conhecer a sintaxe de JavaScript.',
    order: 8,
    estimatedMinutes: 42,
    conceptIds: ['logic.operators', 'logic.condition'],
    video: {
      provider: 'youtube',
      videoId: 'dd6AbL-hAnE',
      title: 'Estruturas Condicionais If Else — Aula 3 — Curso de Algoritmos e Lógica de Programação',
      channelName: 'Hashtag Programação',
      language: 'pt-BR',
      educationalRole: 'Explicação complementar sobre condições e operadores comparativos.',
    },
    objectives: [
      'Explicar como uma condição escolhe um caminho do algoritmo.',
      'Ler estruturas IF/ELSE em pseudocódigo.',
      'Criar condições baseadas em comparações claras.',
      'Identificar qual saída ocorre para um conjunto de dados.',
    ],
    introduction: 'Programas não fazem sempre a mesma coisa. Eles precisam escolher: liberar ou bloquear acesso, aplicar ou não desconto, mostrar uma mensagem ou outra. Uma condição transforma uma comparação em uma decisão controlada.',
    sections: [
      text('condicoes-ideia', 'Uma condição pergunta algo que pode ser verdadeiro ou falso', 'A estrutura IF avalia uma condição. Se ela for TRUE, executa um bloco de instruções. ELSE indica o caminho alternativo quando ela for FALSE.\n\nAntes de pensar em sintaxe, defina a regra em linguagem clara: “se a média for pelo menos 6, informar aprovação; caso contrário, informar que é preciso revisar”. A comparação precisa ter critérios conhecidos.'),
      example('condicoes-acesso', 'Decisão de acesso', 'READ age\nIF age >= 18 THEN\n    PRINT "Entrada permitida"\nELSE\n    PRINT "Entrada não permitida"\nEND IF', 'age >= 18 é a condição. Com age 17, ela é FALSE e o programa mostra a segunda mensagem. Com age 18, é TRUE e mostra a primeira. A condição não é a mensagem: ela é a pergunta que decide qual mensagem será exibida.'),
      example('condicoes-desconto', 'Regra de desconto', 'READ totalPurchase\nIF totalPurchase >= 200 THEN\n    discount ← totalPurchase * 0.15\nELSE\n    discount ← 0\nEND IF\nPRINT discount', 'Os dois caminhos atribuem um valor a discount. Fazer isso evita deixar a variável sem definição quando não há desconto.'),
      text('condicoes-limites', 'Casos de fronteira merecem atenção', 'Em uma regra “a partir de 18 anos”, a idade 18 precisa ser aceita. Por isso usamos >=, e não apenas >. Testar valores no limite — 17, 18 e 19 — ajuda a verificar se a regra corresponde ao que foi pedido.'),
      commonMistakes('condicoes-erros', [
        { title: 'Usar uma mensagem no lugar da condição', description: '“Mostrar aprovado” é uma ação. A condição é a comparação que diz quando essa ação ocorre.' },
        { title: 'Esquecer o caso alternativo', description: 'Nem todo problema exige ELSE, mas você precisa pensar no que acontece quando a condição é falsa.' },
      ]),
      reflection('condicoes-reflexao', 'Uma loja oferece frete grátis para pedidos de 100 ou mais. Qual operador compara corretamente totalPedido com 100?', 'totalPedido >= 100, porque 100 também deve receber frete grátis.'),
      summary('condicoes-resumo', ['Condições transformam uma comparação em escolha de caminho.', 'IF executa um bloco quando a condição é verdadeira.', 'ELSE trata o caminho alternativo quando necessário.', 'Valores de limite devem ser testados com cuidado.']),
      nextSteps('condicoes-proximos-passos', ['Na próxima aula, você verá como repetir um conjunto de passos sem copiá-lo muitas vezes.', 'As condições continuarão importantes para decidir quando uma repetição termina.']),
    ],
  }),
  ...publishedLesson({
    id: 'repeticoes-e-loops',
    moduleId: 'repeticao-e-organizacao',
    slug: 'repeticoes-e-loops',
    title: 'Repetições e loops',
    description: 'Resolva tarefas repetitivas com controle de quantidade, condição de parada e atualização de contador.',
    order: 9,
    estimatedMinutes: 44,
    conceptIds: ['logic.variables', 'logic.condition', 'logic.loop'],
    video: {
      provider: 'youtube',
      videoId: 'WdaWoxTiWnU',
      title: 'Estruturas de Repetição For e While — Aula 4 — Curso de Algoritmos e Lógica de Programação',
      channelName: 'Hashtag Programação',
      language: 'pt-BR',
      educationalRole: 'Explicação complementar sobre contadores, condições de parada e repetição.',
    },
    objectives: [
      'Identificar problemas que pedem repetição.',
      'Ler um loop controlado por contador.',
      'Explicar a função da condição de parada.',
      'Reconhecer um risco de loop infinito.',
    ],
    introduction: 'Se uma instrução precisa ocorrer dez vezes, copiar a mesma linha dez vezes funciona apenas para esse caso e é difícil de alterar. Loops expressam a intenção de repetir com uma regra de controle.',
    sections: [
      text('loops-problema', 'O que um loop resolve?', 'Loops repetem um bloco enquanto uma condição for verdadeira ou até uma quantidade definida ser alcançada. O objetivo não é repetir por repetir: é evitar duplicação e permitir que uma mesma regra opere sobre vários casos.\n\nTodo loop precisa de uma forma de parar. Um contador que avança até um limite é uma das formas mais simples de enxergar essa parada.'),
      example('loops-contador', 'Mostrar números de 1 a 3', 'counter ← 1\nWHILE counter <= 3\n    PRINT counter\n    counter ← counter + 1\nEND WHILE', 'counter começa em 1. Enquanto for menor ou igual a 3, o programa mostra o valor e soma 1. Depois de mostrar 3, counter passa a 4; a condição fica falsa e o loop termina.'),
      example('loops-acumulador', 'Somar três valores informados', 'sum ← 0\nFOR counter FROM 1 TO 3\n    READ value\n    sum ← sum + value\nEND FOR\nPRINT sum', 'sum começa em zero para não carregar um valor desconhecido. A cada repetição, recebe o valor anterior mais o novo dado. Essa variável é chamada de acumulador.'),
      text('loops-seguranca', 'Por que loops infinitos acontecem?', 'Se contador não for atualizado no primeiro exemplo, ele continua valendo 1 e a condição contador <= 3 nunca muda. O bloco se repete sem parar. Ao revisar um loop, sempre pergunte: qual valor muda? em que momento a condição ficará falsa?'),
      commonMistakes('loops-erros', [
        { title: 'Esquecer a atualização do contador', description: 'Sem mudança no valor controlado, a condição pode permanecer verdadeira para sempre.' },
        { title: 'Usar um limite diferente da regra desejada', description: '<= 3 inclui o 3; < 3 para antes dele. Verifique qual conjunto de valores você quer percorrer.' },
      ]),
      reflection('loops-reflexao', 'Para mostrar cinco mensagens, quais três elementos você precisa planejar em um loop de contador?', 'Um valor inicial, uma condição que limita a repetição e uma atualização que aproxima o contador do limite.'),
      summary('loops-resumo', ['Loops resolvem tarefas repetitivas sem copiar instruções.', 'Um contador pode controlar quantas vezes o bloco executa.', 'A condição de parada é essencial.', 'Atualizar o valor de controle evita loops infinitos.']),
      nextSteps('loops-proximos-passos', ['Na próxima aula, você organizará uma sequência de passos reutilizável em uma função.', 'Funções reduzem repetição de lógica em partes diferentes de um programa.']),
    ],
  }),
  ...publishedLesson({
    id: 'funcoes-e-reutilizacao',
    moduleId: 'repeticao-e-organizacao',
    slug: 'funcoes-e-reutilizacao',
    title: 'Funções e reutilização',
    description: 'Agrupe uma tarefa com nome, entradas e resultado para deixar algoritmos maiores mais claros e reutilizáveis.',
    order: 10,
    estimatedMinutes: 43,
    conceptIds: ['logic.instructions', 'logic.variables', 'logic.function'],
    objectives: [
      'Explicar por que uma função agrupa uma tarefa reutilizável.',
      'Distinguir chamar uma função de definir seus passos.',
      'Reconhecer entradas e resultado de uma função simples.',
      'Escolher um nome que revele a responsabilidade de uma função.',
    ],
    introduction: 'À medida que um algoritmo cresce, repetir o mesmo conjunto de passos em vários lugares torna a manutenção difícil. Funções dão um nome a uma tarefa e permitem usá-la sempre que aquela tarefa for necessária.',
    sections: [
      text('funcoes-conceito', 'Uma função organiza uma responsabilidade', 'Uma função reúne instruções que trabalham juntas para cumprir uma tarefa: calcular uma média, formatar uma mensagem ou verificar uma regra. O nome deve explicar o que a função faz, não como cada detalhe interno funciona.\n\nAlgumas funções recebem dados de entrada, chamados aqui de parâmetros. Outras devolvem um resultado. Elas não precisam necessariamente fazer as duas coisas; a escolha depende da responsabilidade definida.'),
      example('funcoes-media', 'Função para calcular média', 'FUNCTION calculateAverage(grade1, grade2)\n    sum ← grade1 + grade2\n    RETURN sum / 2\nEND FUNCTION\n\nanaAverage ← calculateAverage(7, 9)\nPRINT anaAverage', 'A definição explica como calculateAverage trabalha. A chamada calculateAverage(7, 9) fornece dois valores e recebe o resultado 8. A variável local sum ajuda a tornar o cálculo legível dentro da função.'),
      example('funcoes-mensagem', 'Função sem resultado numérico', 'FUNCTION showWelcome(name)\n    PRINT "Olá, " + name\nEND FUNCTION\n\nshowWelcome("Lia")', 'Essa função recebe name e produz uma ação visível: mostrar uma mensagem. Ela não precisa retornar um número para ser útil.'),
      text('funcoes-beneficio', 'Reutilização reduz alterações repetidas', 'Se a regra de média mudar, uma função centraliza o ajuste. Em vez de procurar várias cópias do mesmo cálculo, você altera uma definição e todas as chamadas passam a usar a nova regra.\n\nFunções pequenas, com uma responsabilidade clara, também ajudam a testar e explicar algoritmos maiores.'),
      commonMistakes('funcoes-erros', [
        { title: 'Confundir definir com chamar', description: 'Definir descreve a função; chamar executa a tarefa usando valores concretos.' },
        { title: 'Criar uma função que faz tarefas sem relação', description: 'Quando uma função calcula, exibe, salva e decide tudo ao mesmo tempo, fica difícil entender e modificar.' },
      ]),
      reflection('funcoes-reflexao', 'Que função você criaria para evitar repetir a mesma regra de desconto em várias compras? Que dados ela precisaria receber?', 'Uma resposta possível: calcularDesconto(valorDaCompra). Ela recebe o valor da compra e retorna o valor do desconto conforme a regra definida.'),
      summary('funcoes-resumo', ['Funções agrupam uma tarefa com nome e responsabilidade clara.', 'Parâmetros fornecem dados para a função quando necessário.', 'Uma função pode retornar um resultado ou executar uma ação.', 'Reutilização reduz cópias e facilita mudanças.']),
      nextSteps('funcoes-proximos-passos', ['As próximas aulas planejadas aprofundam decomposição de problemas e exercícios de lógica.', 'Depois, o currículo inicia HTML e CSS, lembrando: HTML é marcação e CSS é estilo; a programação será aplicada com JavaScript.']),
    ],
  }),
};

const lessonEnhancements = {
  'o-que-e-programacao': {
    minutes: 20,
    sections: [
      text('programacao-pseudocodigo', 'Antes do exemplo: o que é pseudocódigo?', 'Pseudocódigo não é uma linguagem de programação real. É uma maneira simples de representar a lógica antes de aprender uma sintaxe específica. Nesta trilha, READ indica que um dado foi informado ao programa e PRINT indica que o programa apresenta um resultado. Novos símbolos serão explicados somente quando forem necessários.'),
      example('programacao-exemplo-sem-decisao', 'Cumprimentar uma pessoa', 'READ name\nPRINT name', 'Primeiro chega um dado: o nome. Depois o programa devolve esse mesmo dado como resultado. Não há decisão nem cálculo neste exemplo; ele serve apenas para observar entrada, execução e saída.'),
      guidedPractice('programacao-pratica-guiada', 'Prática guiada: transformar uma ideia em instruções', 'Problema: um aplicativo deve mostrar o nome de quem acabou de se cadastrar.', [
        'Passo 1 — Identifique o dado necessário: o nome informado pela pessoa.',
        'Passo 2 — Escreva a ação de entrada: READ name.',
        'Passo 3 — Escreva o resultado desejado: PRINT name.',
        'Pergunta — A frase “cumprimente a pessoa de um jeito legal” é clara o bastante? Não: falta dizer qual dado será usado e qual resultado deve aparecer.',
      ], 'Uma instrução clara descreve uma ação observável. A ideia é “cumprimentar”; a sequência executável é receber o nome e mostrá-lo.'),
    ],
  },
  'como-computador-executa-instrucoes': {
    minutes: 20,
    sections: [
      text('execucao-calculo-conceitual', 'Cálculo antes de símbolos', 'Um programa pode receber um número, calcular o dobro desse número e mostrar o resultado. Nesta aula, “calcular o dobro” é uma instrução em português: ainda não precisamos usar símbolos de multiplicação nem o sinal de atribuição. Eles serão apresentados depois, na ordem certa.'),
      guidedPractice('execucao-pratica-guiada', 'Prática guiada: rastrear a execução', 'Problema: mostrar o dobro do número 5.', [
        'Passo 1 — Entrada: o programa recebe o número 5.',
        'Passo 2 — Processamento: ele calcula o dobro de 5, que é 10.',
        'Passo 3 — Saída: ele mostra 10.',
        'Pergunta — O que falharia se a saída viesse antes do cálculo? O programa ainda não teria um resultado para mostrar.',
      ], 'Rastreamento é seguir a execução um passo de cada vez, anotando o dado disponível depois de cada etapa.'),
    ],
  },
  'algoritmos-e-instrucoes': {
    minutes: 28,
    sections: [
      example('algoritmo-exemplo-incorreto', 'Um algoritmo fora de ordem', 'ASSAR o bolo\nMISTURAR os ingredientes\nCOLOCAR a mistura na forma', 'O primeiro passo depende de uma mistura que ainda não existe. O algoritmo falha não porque a receita é ruim, mas porque a ordem ignora uma dependência.'),
      example('algoritmo-exemplo-corrigido', 'A mesma ideia em ordem lógica', 'SEPARATE ingredients\nMIX ingredients\nPLACE mixture IN pan\nBAKE cake\nPRINT "Bolo pronto"', 'Cada passo prepara o seguinte. O resultado final também deixa claro quando a tarefa foi concluída.'),
      guidedPractice('algoritmo-pratica-guiada', 'Prática guiada: revisar um algoritmo de cadastro', 'Problema: registrar uma pessoa em uma lista.', [
        'Passo 1 — Verifique a entrada: o nome precisa ser recebido antes de ser usado.',
        'Passo 2 — Defina a transformação: adicionar esse nome à lista.',
        'Passo 3 — Defina a saída: mostrar a lista atualizada.',
        'Passo 4 — Teste um caso: com nome “Lia”, a saída deve conter “Lia”.',
        'Pergunta — Qual instrução é vaga? “Organizar a lista melhor”. Reescreva-a como uma ação verificável, por exemplo “ordenar a lista por nome”.',
      ], 'Um bom teste não prova que todos os casos funcionam, mas mostra se a sequência produz o resultado esperado para um caso concreto.'),
    ],
  },
  'entrada-processamento-saida': {
    minutes: 24,
    sections: [
      guidedPractice('eps-pratica-guiada', 'Prática guiada: cinco situações com EPS', 'Classifique cada situação antes de pensar em código.', [
        'Média escolar — entradas: duas notas; processamento: calcular a média; saída: média e situação do aluno.',
        'Caixa eletrônico — entradas: valor do saque e saldo; processamento: verificar saldo e atualizar conta; saídas: dinheiro, comprovante ou aviso.',
        'Cadastro — entradas: nome e e-mail; processamento: verificar campos obrigatórios; saídas: confirmação ou mensagens de correção. Não há cálculo matemático obrigatório.',
        'Loja online — entradas: itens e endereço; processamento: calcular total e frete; saídas: preço final e confirmação do pedido.',
        'Aplicativo de transporte — entradas: origem e destino; processamento: estimar rota; saídas: rota, tempo e valor previstos.',
      ], 'Um mesmo sistema pode ter várias entradas e várias saídas. Processar não significa somente fazer conta: validar, selecionar ou organizar também são processamentos.'),
    ],
  },
  'dados-valores-e-tipos': {
    minutes: 22,
    sections: [
      callout('dados-representacao-consciente', 'A aparência de um valor não basta', 'Em uma tela, 18 e "18" podem parecer semelhantes, mas representam coisas diferentes: o primeiro é uma quantidade; o segundo é um conjunto de caracteres. Escolher a representação adequada evita aplicar uma operação a um dado que ainda não está pronto para ela. Antes de calcular ou comparar, pergunte como a informação chegou e como ela será usada.'),
      guidedPractice('dados-pratica-guiada', 'Prática guiada: escolher uma representação', 'Problema: modelar um cadastro simples.', [
        'Passo 1 — nome da pessoa: texto, pois representa caracteres.',
        'Passo 2 — idade: número, pois poderá entrar em cálculos e comparações.',
        'Passo 3 — aceitouTermos: valor lógico, pois registra uma resposta de sim ou não.',
        'Passo 4 — Compare 18 com “18”: o primeiro representa uma quantidade numérica; o segundo representa caracteres. A aparência parecida não torna os valores equivalentes.',
      ], 'Uma conversão pode ser necessária quando uma informação chega como texto, mas será usada em cálculo. A ideia é transformar a representação de modo consciente, não assumir que ela já está correta.'),
    ],
  },
  'variaveis-e-memoria': {
    minutes: 24,
    sections: [
      example('variaveis-memoria-textual', 'Representação simples da memória', 'nome  → "Ana"\nidade → 16\nsaldo → 120', 'Cada nome aponta para o valor que está disponível naquele momento. O objetivo não é desenhar a memória real do computador, e sim acompanhar de forma clara o estado do algoritmo.'),
      example('variaveis-atualizacao-textual', 'O nome permanece; o valor muda', 'balance → 120\nREAD deposit\nbalance ← 150\nPRINT balance', 'balance continua sendo o mesmo nome. O que mudou foi o valor associado a ele depois da atualização. Ainda não é necessário usar símbolos de comparação nesta aula.'),
      guidedPractice('variaveis-pratica-guiada', 'Prática guiada: acompanhar um saldo', 'Problema: registrar um depósito sem escrever sintaxe de operadores.', [
        'Passo 1 — Estado inicial: saldo guarda 120.',
        'Passo 2 — Entrada: a pessoa informa depósito de 30.',
        'Passo 3 — Processamento: o programa calcula o novo saldo.',
        'Passo 4 — Atualização: saldo passa a guardar 150.',
      ], 'A variável não é o valor antigo. Para saber seu valor atual, observe a última instrução que a atualizou.'),
    ],
  },
  operadores: {
    minutes: 24,
    sections: [
      text('operadores-guia-simbolos', 'Símbolos e resultados', '+ soma, - subtrai, * multiplica e / divide. Esses operadores aritméticos produzem números. Já >, <, >=, <=, == e != comparam valores e produzem um resultado lógico: TRUE ou FALSE. Por exemplo, age >= 18 não produz 18; ela responde se a idade atende à regra. == pergunta se dois valores são iguais; != pergunta se são diferentes.'),
      guidedPractice('operadores-pratica-guiada', 'Prática guiada: calcular e comparar', 'Problema: descobrir o valor final de uma compra de duas unidades de 15 reais.', [
        'Passo 1 — Use * para calcular 2 * 15: o total é 30.',
        'Passo 2 — Compare total >= 30. O resultado é TRUE, pois 30 atende ao limite.',
        'Passo 3 — Rastreie: quantidade e preço produzem um número; a comparação produz uma resposta lógica.',
        'Pergunta — Se o total fosse 29, total >= 30 seria TRUE ou FALSE? Seria FALSE.',
      ], 'Cálculo e comparação têm papéis diferentes. O primeiro transforma quantidades; o segundo responde a uma pergunta sobre elas.'),
    ],
  },
  'condicoes-e-tomada-de-decisao': {
    minutes: 26,
    sections: [
      text('condicoes-diferente', 'Antes do exemplo: igualdade e diferença', '== significa “é igual a” e != significa “é diferente de”. Ambos produzem TRUE ou FALSE. Assim, typedPassword != correctPassword é verdadeira quando as senhas são diferentes; uma regra de acesso deve liberar somente quando typedPassword == correctPassword for verdadeira.'),
      guidedPractice('condicoes-pratica-guiada', 'Prática guiada: testar limites', 'Problema: permitir entrada para idade de 18 anos ou mais.', [
        'Passo 1 — Escreva a pergunta: idade >= 18?',
        'Passo 2 — Teste age 17: resultado FALSE; execute ELSE.',
        'Passo 3 — Teste age 18: resultado TRUE; execute IF. É por isso que > seria inadequado.',
        'Passo 4 — Teste age 19: resultado TRUE; execute IF.',
        'Repita o raciocínio para nota = 6 e saldo = 0 sempre verificando o que o limite significa na regra.',
      ], 'Casos de fronteira são os valores exatamente no limite. Eles revelam erros comuns entre > e >=, ou entre < e <=.'),
    ],
  },
  'repeticoes-e-loops': {
    minutes: 26,
    sections: [
      text('loops-rastreamento-detalhado', 'Rastreando uma repetição controlada', 'Em uma repetição, não basta saber que o contador aumenta: é preciso observar cada passagem. contador = 1: mostra 1. Depois atualiza para 2. contador = 2: mostra 2. Depois atualiza para 3. contador = 3: mostra 3. Depois atualiza para 4. Como 4 não atende ao limite <= 3, o loop encerra.'),
      guidedPractice('loops-pratica-guiada', 'Prática guiada: prever uma saída', 'Problema: mostrar três lembretes numerados.', [
        'Passo 1 — Defina contador como 1.',
        'Passo 2 — Enquanto contador for menor ou igual a 3, mostre o contador.',
        'Passo 3 — Depois de mostrar, aumente contador em 1.',
        'Pergunta — Qual saída aparece? 1, 2 e 3. O 4 não aparece, pois apenas faz a condição ficar falsa.',
        'Pergunta — O que ocorre sem a atualização? contador não se aproxima da parada e o loop pode ser infinito.',
      ], 'Todo loop precisa de início, condição de continuação, trabalho repetido, atualização e término.'),
    ],
  },
  'funcoes-e-reutilizacao': {
    minutes: 26,
    sections: [
      text('funcoes-decomposicao', 'Do problema repetido à função', 'Imagine que três telas precisam calcular o mesmo desconto. Copiar a lógica em cada tela cria três lugares para corrigir quando a regra mudar. Extraí-la para calcularDesconto organiza uma responsabilidade: receber o valor, aplicar a regra e devolver o desconto. Outras partes apenas chamam a função quando precisam dela.'),
      guidedPractice('funcoes-pratica-guiada', 'Prática guiada: extrair uma responsabilidade', 'Problema: uma loja precisa mostrar o total em mais de uma tela.', [
        'Passo 1 — Identifique a lógica repetida: preço multiplicado por quantidade.',
        'Passo 2 — Dê um nome responsável: calcularTotal.',
        'Passo 3 — Defina parâmetros: preço e quantidade são dados de entrada.',
        'Passo 4 — Defina retorno: a função devolve o total calculado.',
        'Passo 5 — Chame calcularTotal em cada tela, sem copiar o cálculo.',
      ], 'Definir uma função descreve a tarefa; chamá-la executa a tarefa com valores concretos. Essa separação é a base da decomposição de problemas maiores.'),
    ],
  },
};

Object.entries(lessonEnhancements).forEach(([lessonId, enhancement]) => {
  const lesson = fundamentalsLessons[lessonId];
  lesson.estimatedMinutes = enhancement.minutes;
  lesson.sections.splice(-2, 0, ...enhancement.sections);
});

Object.assign(fundamentalsLessons,
  publishedLesson({
    id: 'decomposicao-de-problemas',
    moduleId: 'repeticao-e-organizacao',
    slug: 'decomposicao-de-problemas',
    title: 'Decomposição de problemas',
    description: 'Divida um problema maior em partes menores, com responsabilidades claras e uma ordem que possa ser verificada.',
    order: 11,
    estimatedMinutes: 26,
    conceptIds: ['logic.algorithm', 'logic.instructions', 'logic.function'],
    objectives: [
      'Dividir um problema amplo em partes menores e verificáveis.',
      'Identificar dependências entre as partes de uma solução.',
      'Definir responsabilidades claras para etapas e funções.',
      'Revisar uma solução grande sem perder de vista o resultado final.',
    ],
    introduction: 'Problemas reais raramente cabem em uma única instrução. Quando tentamos resolver tudo de uma vez, fica difícil descobrir o que falta, testar cada parte e corrigir erros. Decompor é separar um problema maior em pequenas responsabilidades que podem ser entendidas, testadas e depois reunidas.',
    sections: [
      text('decomposicao-visao-geral', 'Resolver por partes não é perder o todo', 'Imagine um sistema simples de pedidos. Ele precisa receber os itens, calcular o total, verificar o pagamento e informar a confirmação. Dizer apenas “processar pedido” esconde as decisões e os dados necessários. Ao separar as partes, cada uma ganha uma pergunta clara: quais dados recebe, qual resultado produz e de que etapa depende.\n\nA decomposição não cria passos aleatórios. As partes devem colaborar para alcançar o mesmo objetivo. Se calcular o total depende dos itens do pedido, receber os itens vem antes. Se a confirmação mostra o resultado do pagamento, ela vem depois da verificação.'),
      example('decomposicao-pedido', 'Planejando um pedido em partes', 'READ orderItems\n total ← calculateTotal(orderItems)\n paymentApproved ← checkPayment(total)\n\nIF paymentApproved == TRUE THEN\n  PRINT "Pedido confirmado"\nELSE\n  PRINT "Pagamento não aprovado"\nEND IF', 'O algoritmo principal coordena as etapas. calculateTotal e checkPayment representam tarefas menores com responsabilidades específicas. Primeiro os itens existem; depois o total pode ser calculado; só então a verificação usa esse total para decidir qual mensagem mostrar.'),
      text('decomposicao-responsabilidades', 'Uma parte deve responder por uma tarefa', 'Uma boa divisão evita que uma mesma etapa tente receber dados, calcular tudo, decidir todas as regras e mostrar todas as mensagens ao mesmo tempo. Por exemplo, calcularTotal deve se concentrar no total; verificarPagamento deve responder se o pagamento foi aprovado; mostrar a confirmação deve comunicar o resultado.\n\nEssa organização facilita a revisão. Se o total estiver errado, você começa pela parte que o calcula. Se a mensagem estiver errada, investiga a saída. Cada parte menor também pode ser testada com exemplos antes de integrar a solução completa.'),
      guidedPractice('decomposicao-pratica-guiada', 'Prática guiada: organizar um lembrete de biblioteca', 'Problema: a biblioteca precisa avisar pessoas com empréstimo vencido.', [
        'Passo 1 — Liste os dados: nome da pessoa, data de devolução e data atual.',
        'Passo 2 — Separe a regra: comparar as datas para descobrir se o empréstimo venceu.',
        'Passo 3 — Separe a mensagem: montar um lembrete usando o nome somente quando a regra indicar atraso.',
        'Passo 4 — Defina a ordem: receber dados, verificar vencimento, montar mensagem, mostrar ou registrar o resultado.',
        'Pergunta — Onde uma função ajudaria? Uma função verificarVencimento pode concentrar a regra de comparação para todos os empréstimos.',
      ], 'Ao decompor, procure partes que tenham uma responsabilidade clara e que possam devolver um resultado útil para a próxima etapa.'),
      commonMistakes('decomposicao-erros', [
        { title: 'Dividir sem considerar dependências', description: 'Criar uma etapa de mostrar total antes de calcular o total mantém o problema, apenas em pedaços menores.' },
        { title: 'Criar nomes vagos como processarTudo', description: 'Um nome amplo esconde responsabilidades demais. Prefira nomes que indiquem a tarefa, como calcularTotal ou verificarVencimento.' },
      ]),
      reflection('decomposicao-reflexao', 'Pense em um aplicativo de lista de compras. Quais três ou quatro partes menores você separaria antes de escrever qualquer código?', 'Uma resposta possível: receber o item informado; adicionar o item à lista; mostrar a lista atualizada; permitir marcar ou remover um item. Cada parte tem um resultado que ajuda a próxima.'),
      summary('decomposicao-resumo', ['Decompor é dividir um problema grande em responsabilidades menores.', 'A ordem das partes continua importante porque resultados de uma etapa podem ser dados para outra.', 'Funções ajudam a nomear e reutilizar tarefas bem definidas.', 'Testar partes menores facilita localizar a origem de um erro.']),
      nextSteps('decomposicao-proximos-passos', ['Na próxima aula, você reunirá os conceitos do curso para resolver problemas de lógica progressivos.', 'Use a decomposição como apoio: primeiro organize o problema, depois rastreie cada parte.']),
    ],
  }),
  publishedLesson({
    id: 'exercicios-de-logica',
    moduleId: 'repeticao-e-organizacao',
    slug: 'exercicios-de-logica',
    title: 'Exercícios de lógica',
    description: 'Revise os fundamentos do curso resolvendo situações que combinam dados, regras, repetição, funções e verificação.',
    order: 12,
    estimatedMinutes: 30,
    conceptIds: ['logic.programming', 'logic.instructions', 'logic.algorithm', 'logic.input', 'logic.processing', 'logic.output', 'logic.data', 'logic.variables', 'logic.operators', 'logic.condition', 'logic.loop', 'logic.function'],
    objectives: [
      'Reconhecer quais conceitos usar em um problema de lógica.',
      'Planejar e rastrear soluções antes de pensar em sintaxe de uma linguagem.',
      'Combinar entrada, processamento, decisão, repetição e saída em problemas simples.',
      'Explicar o próprio raciocínio e identificar o que precisa revisar.',
    ],
    introduction: 'Esta aula fecha o curso reunindo os conceitos já estudados. O objetivo não é decorar uma resposta pronta, mas escolher dados, organizar passos, testar limites e explicar por que uma solução funciona. Se algum exercício parecer difícil, volte ao conceito envolvido e resolva uma parte de cada vez.',
    sections: [
      text('exercicios-estrategia', 'Uma estratégia para problemas novos', 'Comece descrevendo o resultado desejado. Em seguida, liste as entradas necessárias e separe o processamento em passos. Se existe uma regra com dois caminhos, escreva a condição e teste o valor no limite. Se a mesma ação será aplicada a vários itens, procure uma repetição com início, condição, atualização e término. Quando uma tarefa reaparece, dê a ela uma função com responsabilidade clara.\n\nDepois faça um rastreamento manual usando valores pequenos. O rastreamento não é um chute: ele registra o valor de cada variável e o caminho escolhido pelo algoritmo. Ao final, compare a saída obtida com a saída esperada.'),
      example('exercicios-lista-compras', 'Problema integrado: total de uma lista', 'FUNCTION calculateTotal(price, quantity)\n  RETURN price * quantity\nEND FUNCTION\n\nREAD price\nREAD quantity\ntotal ← calculateTotal(price, quantity)\n\nIF total >= 100 THEN\n  PRINT "Compra com frete grátis"\nELSE\n  PRINT "Compra com frete"\nEND IF', 'price e quantity são entradas. calculateTotal concentra o processamento repetível. total guarda o resultado para a condição. A comparação >= 100 inclui exatamente 100, por isso o caso de fronteira deve ser testado com cuidado.'),
      guidedPractice('exercicios-pratica-guiada', 'Prática guiada: revisar um contador de tarefas', 'Problema: mostrar as tarefas numeradas de 1 até a quantidade informada.', [
        'Passo 1 — Entrada: receber quantidadeDeTarefas.',
        'Passo 2 — Inicialização: contador começa em 1.',
        'Passo 3 — Repetição: enquanto contador for menor ou igual à quantidade, mostrar contador e a tarefa correspondente.',
        'Passo 4 — Atualização: aumentar contador em 1 para aproximar a condição do término.',
        'Passo 5 — Teste: se quantidadeDeTarefas for 3, a saída deve conter 1, 2 e 3; o contador termina em 4.',
      ], 'Quando um problema parece grande, primeiro encontre o padrão que se repete. Depois confira se cada passagem do loop muda algo que o leva ao fim.'),
      text('exercicios-revisao', 'Revisar é investigar, não apenas conferir o gabarito', 'Se uma resposta estiver errada, localize o tipo de erro. Faltou uma entrada? A variável não foi atualizada? A condição excluiu o limite? O loop não se aproxima do fim? Uma função recebeu dados insuficientes? Nomear o problema torna a revisão mais útil do que apenas trocar uma alternativa.\n\nVocê não precisa resolver tudo mentalmente de uma vez. Escrever uma tabela simples com o estado das variáveis, testar um valor pequeno e dividir o algoritmo em responsabilidades são técnicas válidas de quem está aprendendo e de quem programa profissionalmente.'),
      commonMistakes('exercicios-erros', [
        { title: 'Tentar resolver sem organizar os dados', description: 'Antes de calcular ou comparar, confirme quais valores existem e o que cada variável guarda.' },
        { title: 'Ignorar o caso de fronteira', description: 'Palavras como “pelo menos”, “até” e “maior que” mudam o operador e precisam de teste específico.' },
        { title: 'Tratar uma resposta errada como fim do estudo', description: 'O feedback deve indicar qual conceito revisar; uma nova tentativa é uma oportunidade de aplicar o raciocínio corrigido.' },
      ]),
      reflection('exercicios-reflexao', 'Escolha um problema cotidiano — por exemplo, dividir despesas entre amigos — e descreva: entradas, processamento, saída, uma regra de decisão e uma parte que poderia virar função.', 'Uma resposta possível: entradas são valores pagos e quantidade de pessoas; processamento soma os valores e divide pelo grupo; saída é o valor por pessoa; a decisão pode avisar se alguém não informou pagamento; calcularDivisao pode ser uma função reutilizável.'),
      summary('exercicios-resumo', ['Problemas de lógica podem ser organizados com entrada, processamento e saída.', 'Variáveis registram valores que mudam durante o rastreamento.', 'Condições e loops precisam de testes de limite e de término.', 'Funções e decomposição deixam a solução mais clara e reutilizável.']),
      nextSteps('exercicios-proximos-passos', ['Você concluiu os fundamentos de lógica do LearnDev.', 'O próximo curso continua em planejamento: HTML será apresentado como linguagem de marcação e CSS como linguagem de estilos, antes de JavaScript.']),
    ],
  })
);

const draftCourseId = {
  htmlCss: 'html-e-css',
  javascript: 'javascript-essencial',
  project: 'projeto-web',
};

const draftLessons = {
  ...draftLesson({ id: 'como-a-web-funciona', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'fundamentos-web', slug: 'como-a-web-funciona', title: 'Como a Web funciona', description: 'Planejado: navegador, servidor e páginas na Web.', order: 13 }),
  ...draftLesson({ id: 'o-que-e-html', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'fundamentos-web', slug: 'o-que-e-html', title: 'O que é HTML', description: 'Planejado: HTML como linguagem de marcação.', order: 14 }),
  ...draftLesson({ id: 'estrutura-documento-html', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'fundamentos-web', slug: 'estrutura-documento-html', title: 'Estrutura de um documento HTML', description: 'Planejado: elementos essenciais de um documento HTML.', order: 15 }),
  ...draftLesson({ id: 'textos-titulos-e-paragrafos', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'fundamentos-web', slug: 'textos-titulos-e-paragrafos', title: 'Textos, títulos e parágrafos', description: 'Planejado: conteúdo textual com HTML.', order: 16 }),
  ...draftLesson({ id: 'links-imagens-e-listas', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'fundamentos-web', slug: 'links-imagens-e-listas', title: 'Links, imagens e listas', description: 'Planejado: conexões e conteúdo estruturado.', order: 17 }),
  ...draftLesson({ id: 'estrutura-semantica', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'fundamentos-web', slug: 'estrutura-semantica', title: 'Estrutura semântica', description: 'Planejado: significado dos elementos HTML.', order: 18 }),
  ...draftLesson({ id: 'o-que-e-css', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'o-que-e-css', title: 'O que é CSS', description: 'Planejado: CSS como linguagem de estilos.', order: 19 }),
  ...draftLesson({ id: 'seletores-e-propriedades', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'seletores-e-propriedades', title: 'Seletores e propriedades', description: 'Planejado: regras de estilo com CSS.', order: 20 }),
  ...draftLesson({ id: 'cores-e-tipografia', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'cores-e-tipografia', title: 'Cores e tipografia', description: 'Planejado: legibilidade e aparência.', order: 21 }),
  ...draftLesson({ id: 'box-model', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'box-model', title: 'Box Model', description: 'Planejado: área, borda e espaçamento.', order: 22 }),
  ...draftLesson({ id: 'espacamento-e-dimensionamento', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'espacamento-e-dimensionamento', title: 'Espaçamento e dimensionamento', description: 'Planejado: controle de espaço e tamanho.', order: 23 }),
  ...draftLesson({ id: 'flexbox', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'flexbox', title: 'Flexbox', description: 'Planejado: alinhamento e distribuição de elementos.', order: 24 }),
  ...draftLesson({ id: 'responsividade', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'css-fundamentos', slug: 'responsividade', title: 'Responsividade', description: 'Planejado: páginas adaptáveis a diferentes telas.', order: 25 }),
  ...draftLesson({ id: 'pagina-completa-html-css', courseId: draftCourseId.htmlCss, courseSlug: 'html-e-css', moduleId: 'projeto-html-css', slug: 'pagina-completa-html-css', title: 'Construindo uma página completa com HTML e CSS', description: 'Planejado: projeto guiado de página estática.', order: 26 }),
  ...draftLesson({ id: 'o-que-e-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-primeiros-passos', slug: 'o-que-e-javascript', title: 'O que é JavaScript', description: 'Planejado: JavaScript como linguagem de programação para a Web.', order: 27 }),
  ...draftLesson({ id: 'let-e-const', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-primeiros-passos', slug: 'let-e-const', title: 'Variáveis com let e const', description: 'Planejado: declaração de valores em JavaScript.', order: 28 }),
  ...draftLesson({ id: 'tipos-de-dados-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-primeiros-passos', slug: 'tipos-de-dados-javascript', title: 'Tipos de dados', description: 'Planejado: valores e tipos em JavaScript.', order: 29 }),
  ...draftLesson({ id: 'operadores-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-primeiros-passos', slug: 'operadores-javascript', title: 'Operadores', description: 'Planejado: cálculos e comparações em JavaScript.', order: 30 }),
  ...draftLesson({ id: 'condicionais-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-controle', slug: 'condicionais-javascript', title: 'Condicionais', description: 'Planejado: decisões com JavaScript.', order: 31 }),
  ...draftLesson({ id: 'operadores-logicos', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-controle', slug: 'operadores-logicos', title: 'Operadores lógicos', description: 'Planejado: combinação de condições.', order: 32 }),
  ...draftLesson({ id: 'loops-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-controle', slug: 'loops-javascript', title: 'Loops', description: 'Planejado: repetições em JavaScript.', order: 33 }),
  ...draftLesson({ id: 'funcoes-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-organizacao', slug: 'funcoes-javascript', title: 'Funções', description: 'Planejado: funções em JavaScript.', order: 34 }),
  ...draftLesson({ id: 'arrays', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-organizacao', slug: 'arrays', title: 'Arrays', description: 'Planejado: listas de valores.', order: 35 }),
  ...draftLesson({ id: 'objetos', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-organizacao', slug: 'objetos', title: 'Objetos', description: 'Planejado: dados agrupados por propriedades.', order: 36 }),
  ...draftLesson({ id: 'introducao-ao-dom', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-navegador', slug: 'introducao-ao-dom', title: 'Introdução ao DOM', description: 'Planejado: documento HTML como estrutura manipulável.', order: 37 }),
  ...draftLesson({ id: 'selecionando-elementos', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-navegador', slug: 'selecionando-elementos', title: 'Selecionando elementos', description: 'Planejado: acesso a elementos da página.', order: 38 }),
  ...draftLesson({ id: 'eventos', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-navegador', slug: 'eventos', title: 'Eventos', description: 'Planejado: respostas a interações do usuário.', order: 39 }),
  ...draftLesson({ id: 'alterando-pagina-com-javascript', courseId: draftCourseId.javascript, courseSlug: 'javascript-essencial', moduleId: 'javascript-navegador', slug: 'alterando-pagina-com-javascript', title: 'Alterando a página com JavaScript', description: 'Planejado: atualização de conteúdo e estilos.', order: 40 }),
  ...draftLesson({ id: 'planejando-aplicacao-simples', courseId: draftCourseId.project, courseSlug: 'projeto-web', moduleId: 'projeto-web-fundamentos', slug: 'planejando-aplicacao-simples', title: 'Planejando uma aplicação simples', description: 'Planejado: escopo, telas e requisitos de um projeto.', order: 41 }),
  ...draftLesson({ id: 'projeto-construindo-html', courseId: draftCourseId.project, courseSlug: 'projeto-web', moduleId: 'projeto-web-fundamentos', slug: 'projeto-construindo-html', title: 'Construindo o HTML', description: 'Planejado: estrutura inicial do projeto.', order: 42 }),
  ...draftLesson({ id: 'projeto-criando-visual-css', courseId: draftCourseId.project, courseSlug: 'projeto-web', moduleId: 'projeto-web-fundamentos', slug: 'projeto-criando-visual-css', title: 'Criando o visual com CSS', description: 'Planejado: estilo e responsividade do projeto.', order: 43 }),
  ...draftLesson({ id: 'projeto-comportamento-javascript', courseId: draftCourseId.project, courseSlug: 'projeto-web', moduleId: 'projeto-web-fundamentos', slug: 'projeto-comportamento-javascript', title: 'Adicionando comportamento com JavaScript', description: 'Planejado: interações do projeto.', order: 44 }),
  ...draftLesson({ id: 'revisao-e-projeto-final', courseId: draftCourseId.project, courseSlug: 'projeto-web', moduleId: 'projeto-web-fundamentos', slug: 'revisao-e-projeto-final', title: 'Revisão e projeto final', description: 'Planejado: integração e revisão final.', order: 45 }),
};

const fundamentalsActivities = {
  ...activity({ id: 'programacao-primeiros-passos', lessonId: 'o-que-e-programacao', moduleId: 'introducao-programacao', title: 'Raciocinando sobre programação', description: 'Aplique a ideia de programação como instruções para resolver problemas.', conceptIds: ['logic.programming', 'logic.instructions'], questions: [
    question('programacao-problema', 'Uma equipe quer criar um aviso quando o estoque de um produto ficar baixo. Qual é o melhor primeiro passo de programação?', ['logic.programming'], [option('definir-regra', 'Definir qual quantidade conta como estoque baixo e qual aviso deve aparecer.', 'Correto: antes de escrever código, a regra precisa ter um critério observável.'), option('escolher-cor', 'Escolher a cor do botão do sistema.', 'A aparência pode ser decidida depois, mas não define a lógica do aviso.'), option('decorar-comandos', 'Decorar comandos de uma linguagem sem analisar a regra.', 'Conhecer comandos ajuda, mas não substitui entender o problema.')], 'definir-regra', 'Você identificou que programação começa pela definição clara do problema e da regra.', 'Pergunte quais dados entram, qual regra será aplicada e qual resultado deve aparecer.'),
    question('programacao-instrucao-clara', 'Qual instrução é mais adequada para um computador em um sistema de notas?', ['logic.instructions'], [option('comparar-media', 'Calcule a média das duas notas e mostre “aprovado” se ela for pelo menos 6.', 'Essa alternativa define dados, cálculo e critério de decisão.'), option('avaliar-bem', 'Veja se o aluno foi bem.', '“Foi bem” é vago: falta um critério que a máquina possa avaliar.'), option('resolver-notas', 'Resolva as notas da turma.', 'A intenção existe, mas não há passos executáveis.')], 'comparar-media', 'A instrução correta transforma uma intenção em um critério que pode ser executado.', 'Procure valores, operações e critérios explícitos.'),
    question('programacao-automacao', 'Qual situação representa melhor o uso de programação para automatizar uma tarefa?', ['logic.programming'], [option('calcular-todos', 'Calcular a média de cada aluno usando a mesma regra para toda a turma.', 'A mesma regra é aplicada a muitos dados, um bom caso de automação.'), option('escrever-uma-vez', 'Anotar uma média manualmente em um papel.', 'Uma anotação manual isolada não exige um conjunto de instruções automatizadas.'), option('adivinhar-media', 'Escolher a média sem usar as notas.', 'Programas precisam de regras e dados, não de adivinhação.')], 'calcular-todos', 'Automação aplica uma regra definida de forma repetível aos dados.', 'Pense em tarefas que seguem o mesmo procedimento muitas vezes.'),
    question('programacao-ordem', 'Um programa deve receber uma senha e depois informar se o acesso foi permitido. Por que a senha precisa ser recebida antes da decisão?', ['logic.instructions'], [option('decisao-depende', 'Porque a decisão usa o valor da senha recebida como dado.', 'A condição depende de um dado que precisa existir antes de ser avaliado.'), option('computador-preferencia', 'Porque computadores preferem receber textos no início.', 'Não é preferência: é uma dependência lógica da regra.'), option('mensagem-antes', 'Porque a mensagem de acesso sempre vem antes da verificação.', 'A mensagem deve refletir o resultado da verificação, não antecedê-lo.')], 'decisao-depende', 'Você reconheceu uma dependência entre dado e instrução.', 'Pergunte que informação uma decisão precisa consultar.'),
    question('programacao-teste', 'Após escrever um algoritmo, qual prática ajuda a verificar se ele resolve o problema esperado?', ['logic.programming'], [option('testar-casos', 'Executar ou simular casos de exemplo e comparar o resultado com o esperado.', 'Testar casos concretos revela se as instruções cumprem a regra.'), option('mudar-nomes', 'Trocar todos os nomes por letras menores.', 'Nomes curtos não demonstram que a lógica está correta.'), option('evitar-resultados', 'Evitar observar o resultado para não confundir.', 'A observação do resultado é parte essencial da verificação.')], 'testar-casos', 'Testes conectam a solução planejada ao comportamento observado.', 'Escolha uma entrada, percorra as instruções e confira a saída.'),
    question('programacao-computador', 'Qual afirmação descreve melhor a responsabilidade do computador em um programa?', ['logic.programming', 'logic.instructions'], [option('executa-regra', 'Executar as instruções e regras que foram definidas.', 'O computador executa a lógica especificada, inclusive quando ela contém um erro.'), option('cria-objetivo', 'Inventar sozinho o objetivo e os critérios do sistema.', 'Definir objetivos e critérios é responsabilidade de quem projeta a solução.'), option('interpreta-vago', 'Interpretar instruções vagas como uma pessoa faria.', 'Instruções vagas precisam ser detalhadas; a máquina não preenche esse contexto.')], 'executa-regra', 'Você distinguiu a definição humana do problema da execução automatizada.', 'Lembre-se: o computador é consistente, não adivinho.'),
  ] }),
  ...activity({ id: 'computador-executa-instrucoes-verificacao', lessonId: 'como-computador-executa-instrucoes', moduleId: 'introducao-programacao', title: 'Executando instruções com precisão', description: 'Verifique como ordem, dados e critérios afetam a execução de um programa.', conceptIds: ['logic.programming', 'logic.instructions'], questions: [
    question('execucao-ordem-calculo', 'Considere: PRINT double; double ← number * 2; READ number. Qual é o principal problema?', ['logic.instructions'], [option('ordem-invertida', 'As instruções usam e mostram valores antes de recebê-los e calculá-los.', 'A saída depende do cálculo, e o cálculo depende da entrada.'), option('nome-dobro', 'O nome double não pode ser usado em programas.', 'O nome é válido; o problema é a sequência das etapas.'), option('multiplicar-proibido', 'Multiplicação não pode aparecer em algoritmos.', 'Multiplicação é uma operação válida quando os valores já foram definidos.')], 'ordem-invertida', 'Você identificou a dependência entre entrada, cálculo e saída.', 'Observe qual passo produz o valor usado pela etapa seguinte.'),
    question('execucao-ambiguidade', 'Qual regra é mais testável em um aplicativo de entregas?', ['logic.instructions'], [option('distancia-criterio', 'Se a distância for maior que 10 km, cobrar taxa adicional de 5 reais.', 'Há uma condição mensurável e uma ação definida.'), option('longe-cobrar', 'Se a entrega for longe, cobrar mais.', '“Longe” precisa de um critério numérico antes de ser programado.'), option('cobrar-adequado', 'Cobrar um valor adequado quando necessário.', '“Adequado” não informa quando nem quanto cobrar.')], 'distancia-criterio', 'Critérios mensuráveis permitem que uma regra seja executada e testada.', 'Substitua palavras vagas por limites ou condições observáveis.'),
    question('execucao-rastreamento', 'Com numero = 4, o algoritmo numero ← numero + 3; numero ← numero * 2 mostra qual resultado?', ['logic.instructions'], [option('quatorze', '14, pois primeiro 4 vira 7 e depois 7 é multiplicado por 2.', 'O rastreamento respeita a ordem das atualizações.'), option('dez', '10, pois 4 é multiplicado por 2 e depois soma 2.', 'Essa conta muda as operações e não segue as instruções dadas.'), option('oito', '8, pois apenas a multiplicação deve ser considerada.', 'A primeira atualização também altera o valor usado pela multiplicação.')], 'quatorze', 'Você acompanhou o valor atualizado a cada instrução.', 'Execute uma linha de cada vez e anote o novo valor.'),
    question('execucao-dados', 'Por que “enviar confirmação” deve ocorrer depois de verificar o pagamento?', ['logic.instructions'], [option('confirmacao-depende', 'Porque a confirmação deve refletir o resultado da verificação.', 'A ação depende de uma informação produzida pela etapa anterior.'), option('texto-primeiro', 'Porque mensagens de texto sempre são executadas primeiro.', 'O tipo de saída não determina a ordem; a dependência lógica determina.'), option('pagamento-irrelevante', 'Porque o valor do pagamento não influencia a confirmação.', 'A verificação existe justamente para decidir se a confirmação é válida.')], 'confirmacao-depende', 'Você relacionou corretamente resultado de uma etapa e ação seguinte.', 'Pergunte: qual fato precisa ser conhecido antes desta instrução?'),
    question('execucao-erro', 'Um programa mostra “acesso liberado” para uma senha incorreta. Qual investigação é mais útil primeiro?', ['logic.programming'], [option('revisar-regra', 'Revisar a condição que compara a senha informada com a senha esperada.', 'O comportamento inesperado indica que a regra ou seus dados devem ser conferidos.'), option('culpar-teclado', 'Concluir que o teclado sempre é a causa.', 'Pode haver entrada incorreta, mas a regra deve ser testada antes de assumir a causa.'), option('trocar-tela', 'Mudar a cor da tela de acesso.', 'A aparência não corrige a condição que liberou o acesso.')], 'revisar-regra', 'Você usou o resultado como pista para revisar a lógica.', 'Compare dados de entrada, condição e saída esperada.'),
    question('execucao-resultado', 'Qual sequência respeita uma dependência para calcular preço final?', ['logic.instructions'], [option('ler-calcular-mostrar', 'Ler preço e desconto; calcular preço final; mostrar preço final.', 'Cada etapa recebe o que precisa da anterior.'), option('mostrar-ler-calcular', 'Mostrar preço final; ler preço e desconto; calcular preço final.', 'A saída ocorre antes de existir um preço final calculado.'), option('calcular-mostrar-ler', 'Calcular preço final; mostrar preço final; ler preço e desconto.', 'O cálculo usa dados que ainda não foram recebidos.')], 'ler-calcular-mostrar', 'A sequência correta respeita entrada, processamento e saída.', 'Identifique quais valores cada instrução exige para funcionar.'),
  ] }),
  ...activity({ id: 'algoritmos-instrucoes-verificacao', lessonId: 'algoritmos-e-instrucoes', moduleId: 'introducao-programacao', title: 'Planejando algoritmos e sequências', description: 'Avalie ordem, completude e término de algoritmos em situações concretas.', conceptIds: ['logic.instructions', 'logic.algorithm'], questions: [
    question('algoritmo-definicao-aplicada', 'Qual sequência é um algoritmo mais adequado para calcular a média de duas notas?', ['logic.algorithm'], [option('receber-calcular-mostrar', 'Receber as duas notas; somar; dividir por 2; mostrar a média.', 'A sequência contém dados, processamento e resultado em ordem lógica.'), option('mostrar-receber', 'Mostrar a média; receber duas notas quando der tempo.', 'A saída aparece antes do cálculo e a ordem não resolve o problema.'), option('somar-sem-dados', 'Somar duas notas sem informar quais notas serão usadas.', 'O cálculo precisa de valores definidos como entrada.')], 'receber-calcular-mostrar', 'Um algoritmo útil apresenta passos necessários em uma ordem que permite executá-los.', 'Verifique se os dados existem antes do cálculo e se há uma saída ao final.'),
    question('algoritmo-falha-ordem', 'Em uma receita, “assar o bolo” aparece antes de “misturar os ingredientes”. Que tipo de falha esse exemplo representa?', ['logic.algorithm'], [option('sequencia-incorreta', 'Uma sequência lógica incorreta: uma etapa depende de outra que ainda não ocorreu.', 'A tarefa de assar pressupõe que a mistura já esteja pronta.'), option('falta-de-texto', 'Apenas uma falta de descrição decorativa.', 'A ordem altera o resultado, portanto é uma falha da lógica.'), option('excesso-de-saida', 'Uma saída exibida muitas vezes.', 'Não há saída de programa envolvida; o problema é a dependência dos passos.')], 'sequencia-incorreta', 'Você reconheceu que ordem é parte do significado de um algoritmo.', 'Pergunte qual estado ou resultado cada passo precisa receber do anterior.'),
    question('algoritmo-simulacao', 'Para testar um algoritmo que dobra um valor, qual caso de teste é mais informativo?', ['logic.algorithm'], [option('entrada-e-saida', 'Usar entrada 6 e verificar se a saída é 12.', 'Um caso concreto permite comparar resultado obtido e esperado.'), option('somente-nome', 'Apenas verificar se o algoritmo tem um título bonito.', 'O título não mostra se as instruções produzem o resultado correto.'), option('sem-dado', 'Executar sem escolher nenhum valor de entrada.', 'Sem entrada, não há como confirmar o comportamento do cálculo.')], 'entrada-e-saida', 'Simular uma entrada conhecida é uma forma direta de validar a lógica.', 'Escolha um valor com resultado esperado fácil de conferir.'),
    question('algoritmo-termino', 'Qual instrução adicional é necessária em “repita os passos de cadastro” para que a ideia seja um algoritmo executável?', ['logic.algorithm'], [option('criterio-parada', 'Um critério que informe quando o cadastro termina ou quando parar de repetir.', 'Toda repetição precisa de uma condição de parada ou quantidade definida.'), option('mais-adjetivos', 'Mais adjetivos para descrever o cadastro.', 'Detalhes de linguagem não indicam quando o processo deve acabar.'), option('ocultar-resultado', 'Uma forma de esconder o resultado final.', 'Ocultar saída não resolve a ausência de término.')], 'criterio-parada', 'Você identificou a necessidade de término controlado.', 'Pergunte como o processo saberá que cumpriu sua tarefa.'),
    question('algoritmo-generalizacao', 'Por que um algoritmo de cálculo de média é mais útil do que memorizar a média de dois alunos específicos?', ['logic.algorithm'], [option('serve-varios-dados', 'Porque a mesma sequência pode ser aplicada a diferentes notas de entrada.', 'Algoritmos descrevem um método reutilizável para uma classe de casos.'), option('evita-numeros', 'Porque algoritmos nunca usam números.', 'Algoritmos frequentemente usam números; o ganho é organizar como tratá-los.'), option('dispensa-regra', 'Porque não é necessário definir a operação.', 'A operação precisa estar definida para funcionar com novos dados.')], 'serve-varios-dados', 'A força de um algoritmo está em aplicar uma regra a diferentes entradas.', 'Pense no que permanece igual quando os dados mudam.'),
    question('algoritmo-instrucao', 'Qual passo é mais claro em um algoritmo de lista de compras?', ['logic.instructions'], [option('adicionar-item', 'Adicionar “arroz” à lista e mostrar a lista atualizada.', 'A ação e o resultado esperado estão definidos.'), option('organizar-melhor', 'Organizar a lista melhor.', '“Melhor” depende de interpretação e não define uma ação mensurável.'), option('resolver-compras', 'Resolver o problema das compras.', 'A intenção é ampla demais para ser uma instrução executável.')], 'adicionar-item', 'Instruções claras especificam ação, dado e, quando necessário, resultado.', 'Troque intenções gerais por passos observáveis.'),
  ] }),
  ...activity({ id: 'entrada-processamento-saida-pratica', lessonId: 'entrada-processamento-saida', moduleId: 'introducao-programacao', title: 'Separando entrada, processamento e saída', description: 'Classifique dados e etapas de sistemas cotidianos usando o modelo EPS.', conceptIds: ['logic.input', 'logic.processing', 'logic.output', 'logic.algorithm'], questions: [
    question('eps-media-entrada', 'Em um sistema que calcula média, qual item é uma entrada?', ['logic.input'], [option('notas', 'As notas informadas pelo estudante.', 'As notas chegam ao sistema antes do cálculo.'), option('media', 'A média calculada pelo sistema.', 'A média é produzida pelo processamento; nesse contexto, ela é saída.'), option('mensagem', 'A mensagem “média calculada”.', 'A mensagem comunica o resultado, portanto é saída.')], 'notas', 'Você identificou corretamente dados fornecidos ao sistema.', 'Entrada é aquilo que o sistema recebe antes de aplicar sua regra.'),
    question('eps-frete-processamento', 'Em uma calculadora de frete, qual etapa é processamento?', ['logic.processing'], [option('multiplicar', 'Multiplicar a distância pelo valor por quilômetro.', 'A operação transforma os dados recebidos em um novo valor.'), option('digitar-distancia', 'Digitar a distância do endereço.', 'Digitar fornece um dado: é entrada.'), option('mostrar-frete', 'Mostrar o frete calculado na tela.', 'Mostrar comunica um resultado: é saída.')], 'multiplicar', 'Você distinguiu a operação que transforma dados da entrada e da saída.', 'Processamento aplica uma regra aos valores disponíveis.'),
    question('eps-saida', 'Um caixa eletrônico recebe o valor desejado, confere o saldo e exibe “saldo insuficiente”. Essa mensagem é:', ['logic.output'], [option('saida', 'Uma saída, pois comunica o resultado da verificação.', 'A mensagem é o resultado apresentado ao usuário.'), option('entrada', 'Uma entrada, pois o usuário precisa lê-la.', 'Ser lida pelo usuário não a torna entrada; ela foi produzida pelo sistema.'), option('processamento', 'O processamento que compara o saldo.', 'A comparação é processamento; a mensagem é a saída dessa regra.')], 'saida', 'Você identificou o papel comunicativo da saída.', 'Pergunte se a informação chegou ao sistema ou foi produzida por ele.'),
    question('eps-classificacao', 'Qual ordem modela corretamente um conversor de Celsius para Fahrenheit?', ['logic.input', 'logic.processing', 'logic.output'], [option('ler-converter-mostrar', 'Ler Celsius; aplicar a fórmula; mostrar Fahrenheit.', 'A sequência segue o fluxo de dados do modelo EPS.'), option('mostrar-ler-converter', 'Mostrar Fahrenheit; ler Celsius; aplicar a fórmula.', 'A saída vem antes do valor necessário para calculá-la.'), option('converter-sem-entrada', 'Aplicar a fórmula; mostrar resultado; pedir Celsius.', 'A fórmula não pode usar uma temperatura que ainda não foi recebida.')], 'ler-converter-mostrar', 'Você organizou corretamente entrada, transformação e saída.', 'Siga a pergunta: o que chega, o que é feito e o que é mostrado?'),
    question('eps-reuso', 'A média calculada de um aluno será usada depois para decidir aprovação. Nesse segundo momento, a média funciona como:', ['logic.input', 'logic.output'], [option('nova-entrada', 'Uma nova entrada para a regra de aprovação.', 'Um resultado de uma etapa pode se tornar dado de outra etapa.'), option('sempre-saida', 'Apenas saída, sem poder ser usada novamente.', 'O papel depende do contexto. A média é saída do cálculo e entrada da decisão.'), option('nenhuma-informacao', 'Algo que não participa do algoritmo.', 'A média é central para a decisão de aprovação.')], 'nova-entrada', 'Você percebeu que EPS descreve papéis dentro de uma etapa, não rótulos permanentes.', 'Observe em qual transformação o valor está sendo usado.'),
    question('eps-falta', 'Um algoritmo recebe preço e quantidade, mas só mostra “pedido registrado”. O que falta para ele informar o valor total?', ['logic.processing'], [option('calcular-total', 'Um processamento que multiplique preço por quantidade antes da saída.', 'O total precisa ser produzido por uma regra antes de ser exibido.'), option('mais-entradas', 'Uma entrada com a mensagem final.', 'A mensagem não substitui o cálculo necessário.'), option('trocar-saida', 'Apenas trocar a frase exibida.', 'Alterar o texto não cria o valor total.')], 'calcular-total', 'Você identificou a etapa de transformação que estava ausente.', 'Pergunte qual regra produz o resultado que se deseja mostrar.'),
  ] }),
  ...activity({ id: 'dados-valores-e-tipos-pratica', lessonId: 'dados-valores-e-tipos', moduleId: 'dados-e-decisoes', title: 'Interpretando dados, valores e tipos', description: 'Escolha representações adequadas para informações que um algoritmo precisa manipular.', conceptIds: ['logic.data'], questions: [
    question('dados-tipo-idade', 'Para calcular em quantos anos uma pessoa poderá votar, idade deve ser tratada principalmente como:', ['logic.data'], [option('numero', 'Número, pois será usada em cálculos e comparações.', 'Idade precisa participar de operações numéricas.'), option('texto', 'Texto, porque pode ser exibida na tela.', 'Pode ser exibida como texto depois, mas para calcular deve ser tratada como número.'), option('logico', 'Valor lógico, pois representa sim ou não.', 'Idade não responde apenas sim ou não; ela representa uma quantidade.')], 'numero', 'Você escolheu um tipo compatível com o uso pretendido.', 'Pergunte quais operações serão feitas com a informação.'),
    question('dados-tipo-nome', 'Qual representação é mais apropriada para o nome “Ana Luiza” em um cadastro?', ['logic.data'], [option('texto', 'Texto, pois é uma sequência de caracteres para ser exibida e armazenada.', 'Nomes são informações textuais.'), option('numero', 'Número, pois cada letra pode ser contada.', 'Contar letras é uma operação possível, mas não define o tipo principal do nome.'), option('logico', 'Valor lógico, pois o nome existe ou não existe.', 'A existência pode gerar uma condição, mas o nome em si continua sendo texto.')], 'texto', 'Você diferenciou a informação do teste que pode ser feito sobre ela.', 'Classifique o valor pelo que ele representa no programa.'),
    question('dados-logico', 'Qual valor é mais adequado para indicar se o e-mail foi confirmado?', ['logic.data'], [option('verdadeiro-falso', 'TRUE ou FALSE.', 'A informação representa uma condição com duas possibilidades.'), option('email-texto', 'O próprio texto do e-mail.', 'O endereço é outro dado; confirmação responde se algo aconteceu.'), option('quantidade', 'A quantidade de letras do e-mail.', 'Essa quantidade não informa se a confirmação ocorreu.')], 'verdadeiro-falso', 'Você escolheu uma representação lógica para uma pergunta de sim ou não.', 'Valores lógicos são úteis para condições e estados binários.'),
    question('dados-aparencia', 'Por que o valor “12” pode exigir cuidado antes de ser somado a outro número?', ['logic.data'], [option('texto-pode-nao-calcular', 'Porque, entre aspas, ele representa texto e pode não ser tratado como número.', 'A mesma aparência visual não garante a mesma forma de tratamento.'), option('doze-invalido', 'Porque 12 não pode participar de cálculos.', 'O número 12 é válido; a questão é como o valor foi representado.'), option('aspas-ignorar', 'Porque aspas nunca têm significado.', 'Aspas frequentemente indicam texto em linguagens e exemplos.')], 'texto-pode-nao-calcular', 'Você reconheceu que tipo e aparência visual não são a mesma coisa.', 'Observe se o valor representa quantidade ou caracteres.'),
    question('dados-operacao', 'Qual operação faz sentido para dois valores numéricos, quantity = 3 e price = 12?', ['logic.data'], [option('multiplicar', 'Calcular quantity * price para obter um total.', 'Multiplicação combina quantidade e preço de modo coerente.'), option('juntar-ao-acaso', 'Juntar os valores como uma mensagem sem objetivo.', 'Mensagens podem ser úteis, mas isso não calcula o total da compra.'), option('tratar-como-falso', 'Transformar ambos em FALSE.', 'Não há regra que justifique converter essas quantidades em condição.')], 'multiplicar', 'Você relacionou o tipo numérico a uma operação adequada.', 'Pense no significado do resultado esperado.'),
    question('dados-escolha', 'Um formulário pergunta “aceita receber novidades?”. Qual dado deve ser armazenado para a resposta?', ['logic.data'], [option('condicao', 'Um valor lógico que registre sim ou não.', 'A pergunta tem duas respostas possíveis e orienta uma decisão.'), option('nome-completo', 'O nome completo da pessoa.', 'O nome não responde à permissão solicitada.'), option('valor-preco', 'Um número de preço.', 'Preço não tem relação com o consentimento perguntado.')], 'condicao', 'Você identificou uma condição binária do formulário.', 'Procure perguntas cuja resposta seja verdadeira ou falsa.'),
  ] }),
  ...activity({ id: 'variaveis-e-memoria-pratica', lessonId: 'variaveis-e-memoria', moduleId: 'dados-e-decisoes', title: 'Acompanhando variáveis e atualizações', description: 'Rastreie valores e escolha nomes que expressem a responsabilidade de cada variável.', conceptIds: ['logic.data', 'logic.variables'], questions: [
    question('variavel-atualizacao', 'Considere pontos ← 2; pontos ← pontos + 5. Qual é o valor final de pontos?', ['logic.variables'], [option('sete', '7.', 'A segunda atribuição lê 2, soma 5 e guarda 7 em pontos.'), option('cinco', '5.', '5 é apenas o valor adicionado; ele não substitui o cálculo completo.'), option('dois', '2.', 'A segunda linha atualiza a variável, portanto o valor inicial não permanece.')], 'sete', 'Você acompanhou a atualização da variável corretamente.', 'Leia ← como “recebe o novo resultado”.'),
    question('variavel-nome', 'Qual nome comunica melhor uma variável que guarda a quantidade de produtos no carrinho?', ['logic.variables'], [option('quantidadeNoCarrinho', 'quantidadeNoCarrinho.', 'O nome revela tanto o que é contado quanto o contexto.'), option('x', 'x.', 'Um nome genérico exige que outra pessoa procure o significado em todo o algoritmo.'), option('coisa', 'coisa.', 'Esse nome não informa que dado está guardado nem como será usado.')], 'quantidadeNoCarrinho', 'Nomes claros tornam a lógica mais fácil de ler e revisar.', 'Prefira nomes que descrevam papel e contexto.'),
    question('variavel-rastreamento', 'saldo ← 100; saldo ← saldo - 30; saldo ← saldo + 20. Qual valor será mostrado?', ['logic.variables'], [option('noventa', '90.', '100 menos 30 é 70; somando 20, saldo passa a 90.'), option('cento-e-vinte', '120.', 'Essa resposta ignora a retirada de 30 antes do depósito.'), option('setenta', '70.', '70 é o valor intermediário, antes da última atualização.')], 'noventa', 'Você rastreou os valores em cada linha, sem pular atualizações.', 'Anote o novo valor logo após cada atribuição.'),
    question('variavel-responsabilidade', 'Qual instrução mostra uma variável sendo usada para guardar o resultado de um cálculo?', ['logic.variables'], [option('total-recebe', 'total ← price * quantity.', 'total recebe o valor produzido pela multiplicação.'), option('mostrar-preco', 'PRINT price.', 'Essa instrução usa um valor existente, mas não guarda um novo resultado.'), option('ler-quantidade', 'READ quantity.', 'Essa instrução recebe uma entrada; não calcula um resultado a partir de outros valores.')], 'total-recebe', 'Você identificou uma atribuição que armazena um resultado.', 'Observe o lado esquerdo de ←: ele recebe o novo valor.'),
    question('variavel-conceito', 'Por que é incorreto dizer que uma variável “sempre vale 10” apenas porque recebeu 10 em uma linha?', ['logic.variables'], [option('pode-mudar', 'Porque uma instrução posterior pode atribuir outro valor ao mesmo nome.', 'O valor associado a uma variável pode ser atualizado durante a execução.'), option('nome-muda', 'Porque o nome da variável muda sozinho.', 'O nome normalmente permanece; o que pode mudar é o valor associado.'), option('memoria-apaga', 'Porque a memória apaga todos os valores imediatamente.', 'A execução segue regras de armazenamento; não há apagamento imediato automático.')], 'pode-mudar', 'Você diferenciou o nome da variável de seu valor atual.', 'Pergunte qual foi a última atribuição executada para esse nome.'),
    question('variavel-erro', 'Um algoritmo usa total antes de atribuir qualquer valor a ele. Qual correção é mais adequada?', ['logic.variables'], [option('inicializar', 'Inicializar total com um valor apropriado antes de usá-lo.', 'A variável precisa ter um valor definido antes de entrar em um cálculo.'), option('esconder-total', 'Ocultar total da saída.', 'Esconder não resolve o uso de um valor ainda indefinido.'), option('trocar-por-texto', 'Trocar total por uma frase.', 'Uma frase não substitui o dado numérico que o cálculo precisa.')], 'inicializar', 'Você identificou a necessidade de definir um valor inicial.', 'Pense no que a variável deve guardar antes da primeira operação.'),
  ] }),
  ...activity({ id: 'operadores-pratica', lessonId: 'operadores', moduleId: 'dados-e-decisoes', title: 'Calculando e comparando valores', description: 'Use operadores para resolver situações com cálculo e decisão.', conceptIds: ['logic.data', 'logic.variables', 'logic.operators'], questions: [
    question('operador-calculo', 'Com preco = 80 e quantidade = 3, qual expressão calcula o valor total?', ['logic.operators'], [option('multiplicar', 'preco * quantidade.', 'Multiplicação combina o preço de cada unidade com a quantidade.'), option('somar-um', 'preco + quantidade.', 'Somar 80 e 3 não representa o preço de três unidades.'), option('comparar', 'preco >= quantidade.', 'Essa expressão produz uma condição, não o total da compra.')], 'multiplicar', 'Você escolheu um operador coerente com o significado do cálculo.', 'Pergunte se o resultado esperado é uma quantidade total ou uma resposta lógica.'),
    question('operador-comparacao', 'Qual resultado produz a expressão age >= 18 quando age vale 16?', ['logic.operators'], [option('falso', 'FALSE.', '16 não é maior nem igual a 18.'), option('dezoito', '18.', '18 é o valor de comparação, não o resultado da expressão.'), option('verdadeiro', 'TRUE.', 'A condição seria verdadeira apenas a partir de 18.')], 'falso', 'Você interpretou uma comparação como resultado lógico.', 'Compare os dois valores e responda se a relação é satisfeita.'),
    question('operador-etapas', 'Qual forma deixa mais legível o cálculo de uma média de duas notas?', ['logic.operators', 'logic.variables'], [option('variaveis-intermediarias', 'sum ← grade1 + grade2; average ← sum / 2.', 'Etapas nomeadas facilitam leitura, teste e revisão.'), option('mensagem-primeiro', 'PRINT average antes de calcular sum.', 'A saída depende de valores que ainda não foram produzidos.'), option('comparar-notas', 'grade1 >= grade2 sem calcular a média.', 'Comparar as notas não produz a média desejada.')], 'variaveis-intermediarias', 'Você escolheu uma estrutura que torna o raciocínio explícito.', 'Separe cálculos dependentes em passos nomeados quando isso ajudar a leitura.'),
    question('operador-desconto', 'Se valor = 200 e desconto = valor * 0.10, qual é o valor de desconto?', ['logic.operators'], [option('vinte', '20.', '10% de 200 equivale a 0,10 multiplicado por 200.'), option('duzentos-e-dez', '210.', 'Essa resposta soma o percentual ao valor, em vez de calcular o desconto.'), option('dez', '10.', '10 é o percentual em forma de número inteiro, não o valor do desconto.')], 'vinte', 'Você aplicou corretamente uma operação percentual simples.', 'Converta 10% em 0,10 antes de multiplicar.'),
    question('operador-tipo-resultado', 'Qual expressão tende a produzir TRUE ou FALSE, e não um número?', ['logic.operators'], [option('comparar-saldo', 'balance < price.', 'Operadores relacionais respondem a uma condição.'), option('somar-saldo', 'balance + price.', 'Soma produz um valor numérico.'), option('dividir-saldo', 'balance / price.', 'Divisão produz um valor numérico, quando os valores são adequados.')], 'comparar-saldo', 'Você distinguiu cálculo de comparação.', 'Símbolos como <, > e >= normalmente verificam uma relação.'),
    question('operador-regra', 'Uma promoção vale para compras de pelo menos 150 reais. Qual condição respeita esse limite?', ['logic.operators'], [option('maior-ou-igual', 'valorCompra >= 150.', '“Pelo menos” inclui o valor de 150.'), option('maior', 'valorCompra > 150.', 'Essa condição excluiria justamente uma compra de 150.'), option('menor', 'valorCompra < 150.', 'Essa condição seleciona compras abaixo do limite.')], 'maior-ou-igual', 'Você relacionou corretamente a expressão “pelo menos” ao operador >=.', 'Teste mentalmente o valor exato do limite.'),
  ] }),
  ...activity({ id: 'condicoes-e-decisoes-pratica', lessonId: 'condicoes-e-tomada-de-decisao', moduleId: 'dados-e-decisoes', title: 'Tomando decisões com condições', description: 'Interprete e projete regras IF/ELSE para situações reais.', conceptIds: ['logic.operators', 'logic.condition'], questions: [
    question('condicao-idade', 'Com age = 17, qual saída o algoritmo IF age >= 18 THEN PRINT “permitido” ELSE PRINT “não permitido” END IF produz?', ['logic.condition'], [option('nao-permitido', '“não permitido”, porque 17 não satisfaz a condição.', 'A condição é falsa, então o caminho ELSE é executado.'), option('permitido', '“permitido”, porque 17 está perto de 18.', 'Condições usam o critério definido; estar perto não altera a comparação.'), option('sem-saida', 'Nenhuma saída, porque só existe uma condição.', 'ELSE define justamente a saída para o caso falso.')], 'nao-permitido', 'Você seguiu o caminho correspondente ao resultado falso da condição.', 'Avalie primeiro a comparação e só depois escolha o bloco executado.'),
    question('condicao-limite', 'Uma biblioteca permite empréstimo para quem tem 15 anos ou mais. Qual condição é correta?', ['logic.condition', 'logic.operators'], [option('idade-maior-igual', 'idade >= 15.', 'O limite inclui a pessoa que tem exatamente 15 anos.'), option('idade-maior', 'idade > 15.', 'Essa condição rejeitaria a idade mínima permitida.'), option('idade-menor', 'idade < 15.', 'Essa condição seleciona quem ainda não atingiu o requisito.')], 'idade-maior-igual', 'Você traduziu “ou mais” para uma comparação inclusiva.', 'Sempre teste o valor que está no limite da regra.'),
    question('condicao-desconto', 'Qual estrutura evita que discount fique sem valor quando a compra não atinge o limite?', ['logic.condition'], [option('dois-caminhos', 'IF total >= 200 THEN atribuir discount; ELSE atribuir discount ← 0.', 'Os dois caminhos deixam discount definido antes de ser usado.'), option('somente-se', 'IF total >= 200 THEN atribuir discount, sem prever outro caso.', 'Se a condição for falsa, discount pode nunca receber um valor.'), option('mostrar-sem-regra', 'PRINT discount antes de comparar total.', 'A saída usa uma variável que ainda não foi determinada.')], 'dois-caminhos', 'Você garantiu que a variável terá um valor em todos os caminhos necessários.', 'Observe o que acontece quando a condição é falsa.'),
    question('condicao-problema', 'Um sistema libera acesso quando senhaDigitada != senhaCorreta. Qual alteração corrige a regra?', ['logic.condition'], [option('igualdade', 'Usar senhaDigitada == senhaCorreta para liberar acesso.', 'O acesso deve ser liberado quando os valores forem iguais.'), option('manter-diferente', 'Manter != porque senhas devem ser diferentes.', 'Senhas diferentes indicam justamente que a verificação falhou.'), option('remover-senha', 'Remover a comparação de senha.', 'Sem comparação, o sistema não tem critério para decidir.')], 'igualdade', 'Você identificou a relação lógica correta para validar a senha.', 'Compare a condição com o significado de “senha correta”.'),
    question('condicao-caso-fronteira', 'Uma nota de 6 aprova quando a regra é media >= 6. Qual teste ajuda a verificar o limite?', ['logic.condition'], [option('cinco-seis-sete', 'Testar médias 5, 6 e 7.', 'Os valores abaixo, no e acima do limite mostram se a fronteira foi implementada corretamente.'), option('somente-dez', 'Testar apenas média 10.', 'Um valor distante do limite não verifica a regra mais delicada.'), option('nenhum-teste', 'Não testar, porque >= é sempre correto.', 'A escrita pode estar certa, mas testes confirmam o comportamento no algoritmo real.')], 'cinco-seis-sete', 'Você escolheu testes que cobrem a fronteira da decisão.', 'Casos imediatamente antes e depois do limite são especialmente úteis.'),
    question('condicao-semantica', 'Qual frase descreve melhor o papel de uma condição?', ['logic.condition'], [option('escolhe-caminho', 'Ela avalia uma regra e escolhe qual caminho de instruções executar.', 'Condições conectam um resultado lógico ao fluxo do algoritmo.'), option('guarda-texto', 'Ela guarda sempre uma mensagem de texto.', 'Mensagens podem ser exibidas após uma decisão, mas não são a condição.'), option('repete-automatico', 'Ela repete instruções infinitamente.', 'Repetição é responsabilidade de loops; condições podem controlar loops, mas são conceitos distintos.')], 'escolhe-caminho', 'Você resumiu corretamente a função de uma condição.', 'Pense em uma pergunta cujo resultado direciona o próximo passo.'),
  ] }),
  ...activity({ id: 'repeticoes-e-loops-pratica', lessonId: 'repeticoes-e-loops', moduleId: 'repeticao-e-organizacao', title: 'Controlando repetições e loops', description: 'Rastreie contadores, identifique paradas e evite repetições infinitas.', conceptIds: ['logic.variables', 'logic.condition', 'logic.loop'], questions: [
    question('loop-contador-saida', 'counter ← 1; WHILE counter <= 3, PRINT counter e depois counter ← counter + 1. Quais valores aparecem?', ['logic.loop'], [option('um-dois-tres', '1, 2 e 3.', 'Cada valor é mostrado enquanto satisfaz counter <= 3.'), option('zero-um-dois', '0, 1 e 2.', 'O counter começa em 1, não em 0.'), option('um-dois-tres-quatro', '1, 2, 3 e 4.', 'Quando counter se torna 4, a condição já é falsa e ele não é mostrado.')], 'um-dois-tres', 'Você acompanhou a condição antes de cada execução.', 'Observe o valor inicial, o limite e o momento da atualização.'),
    question('loop-infinito', 'Qual alteração cria risco de loop infinito no exemplo do counter?', ['logic.loop', 'logic.variables'], [option('sem-atualizacao', 'Remover counter ← counter + 1.', 'Sem atualização, counter continua satisfazendo a condição inicial.'), option('mostrar-contador', 'Manter PRINT counter dentro do bloco.', 'PRINT não impede a mudança do counter nem causa repetição infinita por si só.'), option('limite-tres', 'Usar o limite 3.', 'O limite é válido quando o counter avança em direção a ele.')], 'sem-atualizacao', 'Você identificou a falta de progresso em direção à condição de parada.', 'Em um loop, pergunte o que muda a cada repetição.'),
    question('loop-necessidade', 'Qual tarefa é o melhor caso para um loop?', ['logic.loop'], [option('enviar-lista', 'Aplicar a mesma verificação a cada item de uma lista de pedidos.', 'A mesma regra será repetida para vários elementos.'), option('calcular-unica-media', 'Calcular uma única média de duas notas.', 'Uma operação única simples não exige repetição.'), option('mostrar-titulo', 'Mostrar o título de uma página uma vez.', 'Não há conjunto de itens nem necessidade de repetir a ação.')], 'enviar-lista', 'Você escolheu um problema com padrão repetitivo.', 'Loops são úteis quando a mesma lógica se aplica a vários casos.'),
    question('loop-limite', 'Se contador começa em 0 e o loop usa contador < 5, quantas vezes o bloco executa quando contador aumenta de 1 em 1?', ['logic.loop'], [option('cinco-vezes', 'Cinco vezes: para 0, 1, 2, 3 e 4.', 'O valor 5 não entra porque 5 < 5 é falso.'), option('quatro-vezes', 'Quatro vezes.', 'Também existe execução para contador igual a 0, totalizando cinco valores.'), option('seis-vezes', 'Seis vezes.', 'O limite 5 não é incluído com o operador <.')], 'cinco-vezes', 'Você interpretou corretamente o limite exclusivo.', 'Liste os valores que tornam a condição verdadeira.'),
    question('loop-acumulador', 'Por que soma costuma começar em 0 em um algoritmo que acumula valores?', ['logic.variables', 'logic.loop'], [option('elemento-neutro', 'Porque 0 não altera a primeira soma e fornece um valor inicial definido.', 'O acumulador precisa começar com um valor compatível com a operação.'), option('evita-entrada', 'Porque assim não é necessário ler valores.', 'As entradas continuam necessárias para que haja algo a somar.'), option('faz-loop-infinito', 'Porque 0 faz o loop parar imediatamente.', 'O término depende da condição de repetição, não apenas do valor inicial da soma.')], 'elemento-neutro', 'Você relacionou a inicialização ao comportamento do cálculo.', 'Pense no que acontece quando o primeiro valor é somado ao acumulador.'),
    question('loop-condicao', 'Qual pergunta ajuda mais a revisar se um loop termina?', ['logic.loop', 'logic.condition'], [option('quando-falsa', 'Qual valor muda e em que momento a condição ficará falsa?', 'Essa pergunta verifica o mecanismo de parada.'), option('qual-cor', 'Qual cor será usada na interface?', 'Aparência não determina a continuidade da repetição.'), option('qual-nome', 'Qual é o nome do arquivo?', 'O nome do arquivo não mostra como a condição evolui.')], 'quando-falsa', 'Você focou no elemento que controla a duração do loop.', 'Uma repetição segura precisa caminhar para sua própria parada.'),
  ] }),
  ...activity({ id: 'funcoes-e-reutilizacao-pratica', lessonId: 'funcoes-e-reutilizacao', moduleId: 'repeticao-e-organizacao', title: 'Organizando lógica com funções', description: 'Reconheça responsabilidades, parâmetros, retorno e reutilização de funções.', conceptIds: ['logic.instructions', 'logic.variables', 'logic.function'], questions: [
    question('funcao-beneficio', 'Por que criar calcularMedia(nota1, nota2) é melhor do que copiar o mesmo cálculo em várias partes do programa?', ['logic.function'], [option('centraliza-regra', 'Porque a regra fica centralizada e pode ser reutilizada com valores diferentes.', 'Uma mudança na regra é feita em um lugar, beneficiando todas as chamadas.'), option('elimina-dados', 'Porque assim notas deixam de ser necessárias.', 'A função continua precisando receber ou acessar os dados para calcular.'), option('evita-teste', 'Porque funções não precisam ser testadas.', 'Funções também devem ser testadas, mas são mais fáceis de verificar isoladamente.')], 'centraliza-regra', 'Você identificou a manutenção e a reutilização como benefícios centrais.', 'Pense no trabalho de alterar uma regra copiada muitas vezes.'),
    question('funcao-chamada', 'Qual linha representa a chamada de uma função já definida?', ['logic.function'], [option('chamada', 'average ← calculateAverage(7, 9).', 'A linha usa a função com valores concretos e guarda o resultado.'), option('definicao', 'FUNCTION calculateAverage(grade1, grade2).', 'Essa linha inicia a definição, não executa a função para valores específicos.'), option('variavel', 'grade1 ← 7.', 'Essa linha atribui um valor, mas não chama uma função.')], 'chamada', 'Você distinguiu usar uma função de descrevê-la.', 'Uma chamada normalmente aparece com o nome da função e argumentos concretos.'),
    question('funcao-parametros', 'Na função mostrarBoasVindas(nome), para que serve nome?', ['logic.function'], [option('entrada', 'É um parâmetro que recebe o dado necessário para personalizar a mensagem.', 'O parâmetro permite que a mesma função trabalhe com nomes diferentes.'), option('resultado-fixo', 'É sempre o resultado final da função.', 'O nome é dado de entrada; a função pode produzir uma mensagem usando-o.'), option('contador', 'É obrigatoriamente um contador de loop.', 'Parâmetros têm papel definido pela função, não são sempre contadores.')], 'entrada', 'Você identificou o parâmetro como entrada da função.', 'Pergunte que informação a tarefa precisa receber para funcionar.'),
    question('funcao-retorno', 'Uma função calcula o frete e outra parte do programa precisa usar esse valor em uma mensagem. O que a função deve fazer?', ['logic.function'], [option('retornar-frete', 'Retornar o valor calculado para que quem a chamou possa usá-lo.', 'O retorno entrega o resultado da tarefa para outra parte do algoritmo.'), option('apagar-frete', 'Apagar o valor calculado após terminar.', 'Isso impediria que a mensagem use o resultado.'), option('renomear-tudo', 'Renomear todas as variáveis do programa.', 'Renomear não comunica o resultado da função.')], 'retornar-frete', 'Você conectou retorno ao uso posterior de um resultado.', 'Quando outra parte precisa do valor, a função deve devolvê-lo.'),
    question('funcao-responsabilidade', 'Qual função tem responsabilidade mais clara?', ['logic.function'], [option('calcular-total', 'calcularTotal(preco, quantidade), que retorna o total da compra.', 'Ela tem uma tarefa específica, entradas claras e resultado definido.'), option('fazer-tudo', 'processarTudo(), que calcula, mostra, salva e decide todas as regras do sistema.', 'Muitas responsabilidades misturadas tornam a função difícil de entender e alterar.'), option('sem-nome', 'Uma função sem nome e sem descrição.', 'Sem identificação, não fica claro quando ou por que usar a tarefa.')], 'calcular-total', 'Você escolheu uma função focada em uma única responsabilidade.', 'Prefira nomes que indiquem exatamente a tarefa que a função resolve.'),
    question('funcao-reuso', 'Duas telas precisam calcular o mesmo desconto. Qual solução reduz divergências entre elas?', ['logic.function'], [option('uma-funcao', 'Criar uma função calcularDesconto e chamá-la nas duas telas.', 'A regra fica em um ponto único e os dois usos permanecem consistentes.'), option('copiar-calculo', 'Copiar o cálculo e alterar cada cópia separadamente.', 'Cópias podem se tornar diferentes quando a regra mudar.'), option('calcular-manual', 'Pedir que a pessoa calcule o desconto fora do sistema.', 'Isso remove a automação e não garante aplicação uniforme da regra.')], 'uma-funcao', 'Você aplicou reutilização para manter uma regra consistente.', 'Quando a mesma lógica reaparece, considere dar a ela um nome e uma função.'),
  ] }),
  ...activity({ id: 'decomposicao-de-problemas-pratica', lessonId: 'decomposicao-de-problemas', moduleId: 'repeticao-e-organizacao', title: 'Dividindo problemas em partes', description: 'Planeje responsabilidades, dependências e testes para soluções maiores.', conceptIds: ['logic.algorithm', 'logic.instructions', 'logic.function'], questions: [
    question('decomposicao-etapas-pedido', 'Um sistema de pedidos precisa receber itens, calcular o total, verificar o pagamento e mostrar uma confirmação. Qual divisão inicial é mais útil?', ['logic.algorithm', 'logic.instructions'], [
      option('uma-etapa-ampla', 'Criar uma única etapa chamada processarTudo e decidir os detalhes depois.', 'Um nome amplo não mostra os dados, as dependências nem onde cada responsabilidade será verificada.'),
      option('dividir-em-etapas', 'Separar receber itens, calcular total, verificar pagamento e comunicar o resultado.', 'Cada parte tem uma responsabilidade clara e pode produzir o dado que a próxima etapa precisa.'),
      option('mostrar-primeiro', 'Começar mostrando a confirmação e calcular o total somente se alguém perguntar.', 'A confirmação depende do resultado do pagamento, que por sua vez depende do total calculado.'),
    ], 'dividir-em-etapas', 'Correto. A divisão revela as responsabilidades e a ordem em que os dados precisam existir.', 'Liste as entradas, os resultados intermediários e a saída antes de escolher nomes de funções.'),
    question('decomposicao-ordem-dependencias', 'Considere esta proposta: PRINT confirmation; paymentApproved ← checkPayment(total); total ← calculateTotal(items); READ items. Qual reorganização respeita as dependências?', ['logic.algorithm', 'logic.instructions'], [
      option('manter-confirmacao', 'READ items; PRINT confirmation; calcular total; verificar pagamento.', 'A confirmação ainda é mostrada antes de existir a decisão que deveria determinar a mensagem.'),
      option('pagar-sem-total', 'READ items; checkPayment(total); calculate total; PRINT confirmation.', 'checkPayment precisa do total, que ainda não foi calculado nessa ordem.'),
      option('receber-calcular-verificar', 'READ items; calculate total; checkPayment(total); PRINT confirmation.', 'Os itens chegam antes do cálculo, o total existe antes da verificação e a mensagem usa o resultado final.'),
    ], 'receber-calcular-verificar', 'Correto. Cada etapa aparece depois das informações que ela precisa usar.', 'Para revisar a ordem, pergunte qual valor cada instrução consome e onde esse valor foi produzido.'),
    question('decomposicao-responsabilidade', 'Uma função chamada processarCadastro recebe nome e e-mail, calcula desconto, envia mensagem, atualiza estoque e decide pagamento. Qual melhoria organiza melhor a solução?', ['logic.function', 'logic.instructions'], [
      option('adicionar-mais-passos', 'Adicionar mais instruções à mesma função para evitar criar outros nomes.', 'Concentrar responsabilidades diferentes torna a função mais difícil de testar, explicar e alterar.'),
      option('trocar-nome', 'Renomear a função para processarCadastroCompleto, mantendo todas as tarefas juntas.', 'Um nome maior não separa responsabilidades nem esclarece qual parte causou uma falha.'),
      option('extrair-responsabilidades', 'Separar tarefas como validarCadastro, calcularDesconto e verificarPagamento em funções com objetivos específicos.', 'A solução passa a ter partes menores, nomeadas e testáveis, enquanto um algoritmo principal coordena a ordem.'),
    ], 'extrair-responsabilidades', 'Correto. Funções com uma responsabilidade clara ajudam a decompor e revisar um problema maior.', 'Procure tarefas que podem ser explicadas por um verbo específico e que produzem um resultado útil.'),
    question('decomposicao-parametros', 'A função calcularFrete precisa usar a distância e o valor por quilômetro para devolver um frete. Quais dados devem ser parâmetros?', ['logic.function'], [
      option('mensagem-final', 'A mensagem “Frete calculado”, pois ela explica o objetivo da função.', 'A mensagem pode usar o resultado depois, mas não contém os valores necessários para calcular o frete.'),
      option('distancia-e-valor', 'distancia e valorPorKm, pois são os dados usados pelo cálculo.', 'Parâmetros representam os dados de entrada de que a responsabilidade precisa para produzir seu resultado.'),
      option('resultado-pronto', 'Somente frete, porque a função deve receber o resultado já calculado.', 'Se o resultado já estivesse pronto, a função não teria o que calcular.'),
    ], 'distancia-e-valor', 'Correto. A função recebe os dados necessários e devolve o resultado que outra parte poderá usar.', 'Diferencie os dados que entram na tarefa do valor que sai dela.'),
    question('decomposicao-teste-local', 'Após separar uma solução em calcularTotal e verificarPagamento, o total exibido está incorreto. Qual investigação é mais eficiente primeiro?', ['logic.function', 'logic.algorithm'], [
      option('revisar-tudo-ao-mesmo-tempo', 'Alterar as duas funções e a mensagem final antes de testar novamente.', 'Mudar várias partes de uma vez impede saber qual alteração corrigiu ou criou o problema.'),
      option('testar-confirmacao', 'Testar apenas o texto da confirmação, pois ele aparece no fim.', 'O texto pode estar correto mesmo quando o valor que chegou até ele foi calculado de forma errada.'),
      option('testar-calculo-isolado', 'Usar itens conhecidos para testar calcularTotal isoladamente e comparar o resultado com o esperado.', 'Testar a responsabilidade que produz o valor incorreto reduz o problema a uma parte verificável antes de integrar tudo.'),
    ], 'testar-calculo-isolado', 'Correto. Decomposição facilita testar uma responsabilidade por vez e localizar o ponto da falha.', 'Comece pela parte que produz o dado inesperado, usando uma entrada com resultado conhecido.'),
    question('decomposicao-reuso-regra', 'Dois fluxos precisam decidir se um empréstimo venceu usando a mesma regra de datas. Qual escolha mantém a regra consistente?', ['logic.function', 'logic.instructions'], [
      option('criar-verificar-vencimento', 'Criar verificarVencimento(dataDevolucao, dataAtual) e chamar essa função nos dois fluxos.', 'A mesma regra fica definida em um único lugar e pode ser usada com dados diferentes.'),
      option('copiar-e-ajustar', 'Copiar a comparação de datas e permitir que cada fluxo a altere quando quiser.', 'Cópias podem divergir e produzir respostas diferentes para o mesmo empréstimo.'),
      option('usar-mensagem', 'Criar uma função mostrarMensagem que decide sozinha se o empréstimo venceu.', 'A mensagem depende de uma regra de vencimento; misturar as duas responsabilidades dificulta reutilizar a decisão.'),
    ], 'criar-verificar-vencimento', 'Correto. Uma função nomeada concentra uma regra repetida sem misturar a decisão com a apresentação.', 'Quando a mesma decisão aparece em mais de um ponto, transforme a regra em uma responsabilidade reutilizável.'),
  ] }),
  ...activity({ id: 'exercicios-de-logica-integradores', lessonId: 'exercicios-de-logica', moduleId: 'repeticao-e-organizacao', title: 'Resolvendo problemas de lógica', description: 'Integre os fundamentos do curso em situações progressivas de análise e rastreamento.', conceptIds: ['logic.programming', 'logic.instructions', 'logic.algorithm', 'logic.input', 'logic.processing', 'logic.output', 'logic.data', 'logic.variables', 'logic.operators', 'logic.condition', 'logic.loop', 'logic.function'], questions: [
    question('logica-integrada-eps', 'Um aplicativo de entrega recebe endereço, distância, valor dos produtos e cupom. Depois calcula desconto, frete e total; por fim mostra o total e o tempo estimado. Qual classificação está correta?', ['logic.input', 'logic.processing', 'logic.output'], [
      option('tudo-entrada', 'Endereço, distância, desconto, total e tempo são entradas, pois aparecem no aplicativo.', 'Desconto, total e tempo são produzidos pelo sistema; eles não chegam todos prontos como entrada.'),
      option('eps-correto', 'Endereço, distância, produtos e cupom são entradas; cálculos são processamento; total e tempo são saídas.', 'A resposta separa os dados recebidos, as regras aplicadas e os resultados comunicados.'),
      option('saida-como-regra', 'Total é processamento, e calcular frete é saída.', 'Calcular frete é uma transformação; total é um resultado produzido para ser apresentado.'),
    ], 'eps-correto', 'Correto. O modelo entrada–processamento–saída ajuda a enxergar o papel de cada informação no sistema.', 'Pergunte o que chega ao programa, o que ele transforma e o que ele devolve.'),
    question('logica-integrada-variavel', 'saldo começa em 100. O programa registra um depósito de 50 e depois uma compra de 30. Qual valor saldo deve guardar ao final?', ['logic.variables', 'logic.operators'], [
      option('cento-e-vinte', '120, pois 100 + 50 resulta em 150 e 150 - 30 resulta em 120.', 'O rastreamento acompanha cada atualização do valor guardado em saldo.'),
      option('cento-e-cinquenta', '150, pois o depósito é a última informação importante.', 'A compra ocorre depois do depósito e atualiza novamente o saldo.'),
      option('duzentos-e-quarenta', '240, pois todos os números devem ser somados.', 'A compra reduz o saldo; valores anteriores não são somados automaticamente sem considerar as operações.'),
    ], 'cento-e-vinte', 'Correto. A variável guarda seu valor atual: 100 → 150 → 120.', 'Anote o valor depois de cada instrução em vez de combinar os números sem observar a operação.'),
    question('logica-integrada-fronteira', 'Uma pessoa pode retirar um livro se tiver no máximo 2 empréstimos ativos. O algoritmo usa IF loans < 2 THEN. Qual alteração inclui corretamente quem já tem exatamente 2 empréstimos?', ['logic.operators', 'logic.condition'], [
      option('manter-menor', 'Manter emprestimos < 2, porque 2 não é menor que 2.', 'A comparação está correta matematicamente, mas não atende à regra, que também permite exatamente 2.'),
      option('usar-igual', 'Usar emprestimos == 2, porque o limite é o caso mais importante.', 'Essa condição permitiria apenas o valor 2 e excluiria quem tem 0 ou 1 empréstimo, que também deveria poder retirar.'),
      option('usar-menor-igual', 'Usar emprestimos <= 2, porque “no máximo 2” inclui o próprio limite.', 'A condição aceita 0, 1 e 2, e rejeita valores maiores, exatamente como a regra descreve.'),
    ], 'usar-menor-igual', 'Correto. Testar o valor no limite ajuda a escolher entre < e <=.', 'Traduza “no máximo” como uma comparação que inclua o limite informado.'),
    question('logica-integrada-loop', 'Um programa deve mostrar cada item de uma lista de 4 tarefas. contador começa em 1 e aumenta de 1 em 1. Qual estrutura evita mostrar uma quinta tarefa?', ['logic.loop', 'logic.condition', 'logic.variables'], [
      option('contador-menor-igual', 'Enquanto contador <= 4, mostrar a tarefa e depois aumentar contador.', 'A condição permite 1, 2, 3 e 4; depois contador vira 5 e a repetição termina.'),
      option('contador-menor-seis', 'Enquanto contador < 6, mostrar a tarefa e depois aumentar contador.', 'Essa condição também permite contador igual a 5, criando uma passagem além das quatro tarefas.'),
      option('sem-atualizacao', 'Enquanto contador <= 4, mostrar a tarefa sem atualizar contador.', 'Sem atualização, contador permanece em 1 e a condição nunca se torna falsa.'),
    ], 'contador-menor-igual', 'Correto. O início, o limite e a atualização trabalham juntos para produzir exatamente quatro passagens.', 'Liste os valores permitidos pela condição e confira o valor que encerra o loop.'),
    question('logica-integrada-funcao', 'Uma escola calcula a média de cada estudante em duas telas diferentes. Qual organização usa decomposição e reutilização de forma mais clara?', ['logic.function', 'logic.algorithm'], [
      option('copiar-media', 'Copiar o cálculo completo para cada tela e editar as duas versões quando a regra mudar.', 'Cópias exigem manutenção em mais de um lugar e podem se tornar inconsistentes.'),
      option('calcular-media', 'Criar calcularMedia(nota1, nota2), retornar a média e chamar a função nas duas telas.', 'A responsabilidade de calcular fica centralizada, e cada tela usa o resultado com seus próprios dados.'),
      option('mostrar-sem-calculo', 'Criar mostrarMedia(), sem parâmetros, e pedir que cada tela descubra a média antes de chamá-la.', 'A função não recebe os dados necessários nem concentra o cálculo que deveria ser reutilizado.'),
    ], 'calcular-media', 'Correto. Uma função com parâmetros e retorno separa o cálculo de quem apresenta o resultado.', 'Identifique a regra que se repete, os dados que ela precisa e o valor que deve devolver.'),
    question('logica-integrada-rastreamento', 'Considere: READ quantity = 3; total ← calculateTotal(quantity, 20); IF total >= 50 THEN PRINT "frete grátis"; ELSE PRINT "frete cobrado"; END IF. Se calculateTotal multiplica quantidade pelo preço, qual saída aparece?', ['logic.input', 'logic.function', 'logic.variables', 'logic.operators', 'logic.condition', 'logic.output'], [
      option('frete-gratis', '“frete grátis”, pois calcularTotal(3, 20) produz 60 e 60 atende a total >= 50.', 'O rastreamento segue a entrada, o retorno da função, a variável total e a condição antes de escolher a saída.'),
      option('frete-cobrado', '“frete cobrado”, pois 3 é menor que 50.', 'A condição compara total, não quantidade. Depois da função, total vale 60.'),
      option('sem-saida', 'Nenhuma saída, pois uma função não pode ser usada antes de uma condição.', 'Uma função pode produzir um valor que será usado por uma condição; essa é uma forma comum de organizar um algoritmo.'),
    ], 'frete-gratis', 'Correto. O valor 3 é transformado pela função: 3 × 20 = 60, e a condição seleciona a primeira mensagem.', 'Rastreie os resultados intermediários: entrada → retorno da função → variável → comparação → saída.'),
  ] }),
};

const distractorRevisions = {
  'programacao-automacao': {
    'escrever-uma-vez': ['Calcular a média de um único aluno manualmente, sem registrar uma regra reutilizável.', 'Uma tarefa manual isolada não aplica automaticamente a mesma regra a vários casos.'],
    'adivinhar-media': ['Copiar a média de um aluno anterior para os demais alunos.', 'Reutilizar um resultado anterior ignora os dados de cada aluno e não aplica a regra de cálculo.'],
  },
  'programacao-teste': {
    'mudar-nomes': ['Usar apenas um caso de entrada que já se sabe que funciona e não comparar a saída.', 'Um único caso favorável não mostra como a regra se comporta em situações diferentes.'],
    'evitar-resultados': ['Conferir somente se o programa terminou, sem verificar o valor produzido.', 'Terminar a execução não garante que o resultado esteja correto.'],
  },
  'algoritmo-simulacao': {
    'somente-nome': ['Usar entrada 6 e aceitar qualquer saída diferente de erro.', 'Um teste precisa comparar a saída obtida com uma saída esperada, não apenas verificar se algo apareceu.'],
    'sem-dado': ['Usar entrada 0 e concluir que todos os demais números também funcionarão.', 'O caso zero pode ser útil, mas sozinho não verifica o comportamento geral do algoritmo.'],
  },
  'algoritmo-termino': {
    'mais-adjetivos': ['Repetir os mesmos passos até que o usuário “pareça satisfeito”.', 'A condição de parada precisa ser observável; “pareça satisfeito” depende de interpretação.'],
    'ocultar-resultado': ['Adicionar mais uma mensagem de confirmação ao final.', 'Uma mensagem adicional não define quando a repetição deve encerrar.'],
  },
  'algoritmo-generalizacao': {
    'evita-numeros': ['Porque o algoritmo só pode ser usado quando as notas forem iguais.', 'A utilidade está em aceitar entradas diferentes, não em restringi-las a casos idênticos.'],
    'dispensa-regra': ['Porque basta trocar as notas sem revisar a sequência de cálculo.', 'Novas entradas usam a mesma regra; a regra continua indispensável.'],
  },
};

Object.entries(distractorRevisions).forEach(([questionId, revisions]) => {
  const target = Object.values(fundamentalsActivities).flatMap((activity) => activity.questions).find((question) => question.id === questionId);
  target.options.forEach((item) => {
    if (!revisions[item.id]) return;
    [item.label, item.feedback] = revisions[item.id];
  });
});

function reviseQuestion(questionId, prompt, conceptIds, options, correctAnswer, correctFeedback, hint) {
  const target = Object.values(fundamentalsActivities).flatMap((activity) => activity.questions).find((question) => question.id === questionId);
  Object.assign(target, { prompt, conceptIds, options, correctAnswer, correctFeedback, hint });
}

reviseQuestion('programacao-instrucao-clara', 'Um aplicativo deve mostrar o nome de quem acabou de concluir um cadastro. Qual sequência deixa a tarefa executável?', ['logic.instructions', 'logic.input', 'logic.output'], [
  option('comparar-media', 'READ name; PRINT name.', 'Essa sequência recebe o dado necessário e só depois apresenta o resultado.'),
  option('avaliar-bem', 'PRINT name; READ name.', 'A mensagem tenta usar name antes de esse dado ser recebido.'),
  option('resolver-notas', 'READ name; decidir se o cadastro foi “bom”.', 'A segunda instrução introduz um critério vago que não faz parte do objetivo de mostrar o nome.'),
], 'comparar-media', 'Correto. O nome precisa ser recebido antes que uma instrução possa mostrá-lo.', 'Confira se cada passo tem os dados necessários disponíveis.');

reviseQuestion('algoritmo-definicao-aplicada', 'Um algoritmo deveria calcular a média de duas notas. Qual organização permite executar a tarefa corretamente?', ['logic.algorithm', 'logic.instructions'], [
  option('receber-calcular-mostrar', 'READ grade1; READ grade2; average ← (grade1 + grade2) / 2; PRINT average.', 'As duas notas existem antes do cálculo, e a média é mostrada depois de ser produzida.'),
  option('mostrar-receber', 'READ grade1; PRINT average; READ grade2; average ← (grade1 + grade2) / 2.', 'average é mostrada antes de as duas notas terem sido recebidas e antes de ser calculada.'),
  option('somar-sem-dados', 'READ grade1; average ← (grade1 + grade2) / 2; READ grade2; PRINT average.', 'O cálculo acontece antes de grade2 existir; a média não pode usar um dado ainda ausente.'),
], 'receber-calcular-mostrar', 'Correto. A ordem respeita a dependência entre receber as notas, calcular a média e mostrá-la.', 'Pergunte quais dados cada etapa precisa para funcionar.');

reviseQuestion('algoritmo-simulacao', 'Um algoritmo recebe numero = 4, calcula o dobro e depois mostra o resultado. Durante um rastreamento manual, qual registro está correto?', ['logic.algorithm', 'logic.instructions'], [
  option('entrada-e-saida', 'Entrada: 4; processamento: dobro de 4; saída: 8.', 'O rastreamento acompanha o dado, a transformação e o resultado esperado.'),
  option('somente-nome', 'Entrada: 4; processamento: mostrar 4; saída: dobro ainda desconhecido.', 'Mostrar o valor inicial não executa a transformação pedida.'),
  option('sem-dado', 'Entrada: 4; processamento: dobro de 8; saída: 16.', 'O algoritmo deve dobrar a entrada 4 uma vez; dobrar novamente cria um passo que não existe.'),
], 'entrada-e-saida', 'Correto. Rastrear é registrar o valor disponível após cada passo do algoritmo.', 'Simule uma instrução por vez, sem acrescentar etapas inexistentes.');

reviseQuestion('algoritmo-termino', 'Uma lista deve receber nomes até que a pessoa informe “fim”. Qual correção transforma “repita o cadastro” em um algoritmo controlado?', ['logic.algorithm', 'logic.instructions'], [
  option('criterio-parada', 'Receber um nome; adicionar à lista enquanto o nome for diferente de “fim”.', 'A regra informa qual dado é lido e quando a repetição deve terminar.'),
  option('mais-adjetivos', 'Repetir o cadastro várias vezes e parar quando a lista estiver completa.', '“Várias vezes” e “completa” ainda não definem um critério que o algoritmo consiga verificar.'),
  option('ocultar-resultado', 'Adicionar nomes e mostrar a lista antes de decidir se deve parar.', 'Mostrar a lista pode ser útil, mas não define a condição que encerra a repetição.'),
], 'criterio-parada', 'Correto. Um algoritmo repetitivo precisa de um dado de controle e de uma condição de término.', 'Procure a informação que faz a regra mudar de “continuar” para “parar”.');

reviseQuestion('dados-aparencia', 'Um cadastro recebe idade como "18" e precisa verificar futuramente se a pessoa atingiu uma idade mínima. Qual preparação é mais adequada?', ['logic.data'], [
  option('texto-pode-nao-calcular', 'Reconhecer que "18" representa texto e convertê-lo conceitualmente para número antes de comparar idades.', 'A comparação de idade exige uma representação numérica, não apenas caracteres que parecem um número.'),
  option('doze-invalido', 'Manter "18" como texto e comparar suas letras com o limite de idade.', 'Contar ou comparar caracteres não responde à regra sobre quantidade de anos.'),
  option('aspas-ignorar', 'Ignorar a forma recebida, pois todo valor que parece número já pode ser calculado.', 'A aparência não garante o tipo; o programa precisa saber como tratar a informação.'),
], 'texto-pode-nao-calcular', 'Correto. Valor e representação precisam ser compatíveis com a operação que será feita depois.', 'Pergunte se o dado será lido como caracteres ou usado como quantidade.');

reviseQuestion('variavel-conceito', 'saldo começa guardando 100. Depois o programa atualiza saldo para 150 e, em seguida, adiciona 20 ao valor atual. Qual valor final deve estar associado a saldo?', ['logic.variables'], [
  option('pode-mudar', '170, pois a última atualização usa 150 e adiciona 20.', 'A variável mantém o nome, mas cada atualização substitui o valor anterior pelo novo resultado.'),
  option('nome-muda', '150, pois a atualização final não altera o valor já guardado.', 'A última instrução altera o conteúdo de saldo; 150 é apenas o valor intermediário.'),
  option('memoria-apaga', '270, pois o programa soma 100, 150 e 20.', 'Valores anteriores não são somados automaticamente; saldo guarda somente seu valor atual.'),
], 'pode-mudar', 'Correto. O rastreamento é 100 → 150 → 170.', 'Anote o valor da variável após cada atualização, em vez de somar todos os valores que ela já teve.');

reviseQuestion('operador-etapas', 'preco = 100; desconto = 20; precoFinal = preco - desconto; depois, precoFinal >= 80. Qual resultado está correto?', ['logic.operators', 'logic.variables'], [
  option('variaveis-intermediarias', 'finalPrice vale 80 e a comparação produz TRUE.', '100 - 20 resulta em 80; como 80 atende a >= 80, a comparação é verdadeira.'),
  option('mensagem-primeiro', 'finalPrice vale 80 e a comparação produz FALSE.', 'A comparação >= inclui o próprio limite 80; por isso o resultado não é falso.'),
  option('comparar-notas', 'finalPrice vale 120 e a comparação produz TRUE.', 'Desconto deve ser subtraído do preço, não somado a ele.'),
], 'variaveis-intermediarias', 'Correto. Primeiro ocorre o cálculo aritmético; depois a comparação devolve um valor lógico.', 'Resolva o cálculo antes de avaliar a comparação.');

reviseQuestion('condicao-idade', 'A regra diz: “clientes com 18 anos ou mais podem continuar”. Qual condição atende aos casos 17, 18 e 19 corretamente?', ['logic.operators', 'logic.condition'], [
  option('nao-permitido', 'idade >= 18.', '>= inclui 18 e também aceita valores maiores, rejeitando 17.'),
  option('permitido', 'idade > 18.', 'Essa condição rejeita exatamente 18, embora a regra diga “18 anos ou mais”.'),
  option('sem-saida', 'idade == 18.', 'Essa condição aceita só 18 e rejeita 19, que também deveria continuar.'),
], 'nao-permitido', 'Correto. O operador >= inclui o limite definido pela regra.', 'Teste mentalmente o valor que está exatamente no limite.');

reviseQuestion('condicao-desconto', 'Uma regra deve permitir finalizar uma compra quando balance for 0 ou maior. O algoritmo usa IF balance > 0 THEN. Qual correção trata o caso de fronteira?', ['logic.operators', 'logic.condition'], [
  option('dois-caminhos', 'Trocar a condição para saldo >= 0.', '>= inclui o valor 0, que a regra declara como permitido.'),
  option('somente-se', 'Manter saldo > 0, pois 0 não é um número positivo.', 'Isso é verdadeiro matematicamente, mas contradiz a regra, que permite saldo igual a zero.'),
  option('mostrar-sem-regra', 'Usar saldo == 0, pois só o limite importa.', 'Essa condição excluiria saldos positivos, que também devem ser permitidos.'),
], 'dois-caminhos', 'Correto. O caso de fronteira deve ser traduzido para um operador que inclua 0.', 'Compare a frase da regra com os valores que a condição aceita.');

reviseQuestion('funcao-beneficio', 'Três telas repetem o mesmo cálculo de preço final. Qual mudança melhora a organização sem alterar o resultado?', ['logic.function'], [
  option('centraliza-regra', 'Criar calcularPrecoFinal(preco, quantidade) e chamar essa função nas três telas.', 'A fórmula fica centralizada, recebe os dados necessários e pode ser reutilizada sem cópias divergentes.'),
  option('elimina-dados', 'Copiar o cálculo para uma quarta tela que sirva de referência.', 'Mais cópias aumentam os lugares que precisam ser corrigidos quando a regra mudar.'),
  option('evita-teste', 'Deixar cada tela escolher uma fórmula parecida para sua necessidade.', 'Fórmulas parecidas podem produzir resultados diferentes para o mesmo pedido.'),
], 'centraliza-regra', 'Correto. A função extrai uma responsabilidade repetida e evita divergência entre cópias.', 'Procure a lógica que se repete e transforme-a em uma tarefa nomeada.');

reviseQuestion('funcao-retorno', 'calcularFrete(distancia, valorPorKm) deve entregar o valor calculado para uma tela mostrar “Frete: ...”. Qual desenho está correto?', ['logic.function'], [
  option('retornar-frete', 'A função recebe distancia e valorPorKm, calcula o frete e retorna esse valor; a tela mostra o retorno.', 'Parâmetros entram na função e o retorno leva o resultado de volta para quem a chamou.'),
  option('apagar-frete', 'A função mostra uma mensagem interna e apaga o valor antes de a tela usá-lo.', 'A tela precisa receber o resultado para decidir como apresentá-lo.'),
  option('renomear-tudo', 'A função recebe o texto “Frete:” como retorno e a tela calcula o valor sozinha.', 'Isso separa de forma incoerente a responsabilidade: quem calcula deve devolver o número calculado.'),
], 'retornar-frete', 'Correto. Os parâmetros fornecem dados e o retorno devolve o resultado da tarefa.', 'Diferencie o que entra na função do que ela entrega ao final.');

reviseQuestion('programacao-problema', 'Uma escola quer avisar automaticamente quem ainda não entregou uma atividade. Antes de escrever as instruções, qual definição torna o problema verificável?', ['logic.programming', 'logic.instructions'], [
  option('definir-regra', 'Definir quais dados mostram a entrega, qual é o prazo e qual mensagem deve ser enviada.', 'A solução passa a ter dados observáveis e um resultado esperado.'),
  option('escolher-cor', 'Escolher a cor do aviso antes de decidir quem deve recebê-lo.', 'A aparência não determina quais registros precisam ser analisados nem qual aviso será produzido.'),
  option('decorar-comandos', 'Escolher uma linguagem e memorizar comandos sem descrever o que o aviso deve fazer.', 'Comandos não substituem a definição da regra e dos dados necessários.'),
], 'definir-regra', 'Correto. Programar começa por transformar uma necessidade em dados, regras e resultado observáveis.', 'Identifique o que o sistema precisa saber e qual resultado deve produzir.');

reviseQuestion('programacao-automacao', 'A secretaria precisa gerar um lembrete diferente para cada estudante com pendência. Qual plano realmente automatiza a tarefa?', ['logic.programming', 'logic.instructions'], [
  option('calcular-todos', 'Usar os dados de cada estudante para aplicar a mesma sequência: identificar a pendência, montar o lembrete e registrar o envio.', 'A regra é definida uma vez e aplicada de forma consistente aos dados de cada estudante.'),
  option('escrever-uma-vez', 'Copiar o lembrete de um estudante anterior e trocar apenas o nome quando alguém perceber a pendência.', 'A tarefa continua manual e pode manter dados ou mensagens do estudante anterior.'),
  option('adivinhar-media', 'Enviar o mesmo lembrete para todos, sem consultar se existe pendência.', 'Sem usar os dados de cada caso, o sistema não aplica a regra que motivou o aviso.'),
], 'calcular-todos', 'Correto. Automação combina uma regra repetível com os dados corretos de cada caso.', 'Verifique se o plano usa os dados do caso atual e se o procedimento pode ser repetido.');

reviseQuestion('programacao-ordem', 'Um sistema deve criar um cartão com o nome informado no cadastro. Qual sequência evita usar um dado antes de ele existir?', ['logic.instructions', 'logic.input', 'logic.output'], [
  option('decisao-depende', 'Receber o nome; montar o texto do cartão com esse nome; mostrar o cartão.', 'Cada passo usa um resultado produzido pelo anterior: primeiro o dado, depois a mensagem e por fim o cartão mostrado.'),
  option('computador-preferencia', 'Mostrar o cartão; receber o nome; montar o texto do cartão.', 'O cartão é mostrado antes de existir o nome e antes de o texto ser montado.'),
  option('mensagem-antes', 'Montar o cartão com o nome; receber o nome; mostrar o cartão.', 'O texto depende do nome, portanto não pode ser montado antes de o nome ser recebido.'),
], 'decisao-depende', 'Correto. A ordem é determinada pelas dependências entre os dados e os resultados de cada passo.', 'Para cada instrução, pergunte de quais dados ela depende.');

reviseQuestion('programacao-teste', 'Um algoritmo deve receber duas notas, calcular a média e exibir o resultado. Qual teste fornece evidência mais útil de que a sequência funciona?', ['logic.programming', 'logic.instructions'], [
  option('testar-casos', 'Simular duas notas conhecidas, acompanhar cada passo e comparar a média exibida com a média esperada.', 'O teste relaciona as notas recebidas, os passos do cálculo e o resultado esperado; assim um erro de sequência pode ser percebido.'),
  option('mudar-nomes', 'Trocar o nome das variáveis e considerar o algoritmo correto se ele abrir sem mensagem de erro.', 'Nomes podem melhorar a leitura, mas não comprovam que a média produzida está correta.'),
  option('evitar-resultados', 'Usar uma única dupla de notas e verificar apenas se algum número apareceu na tela.', 'Um número qualquer na tela não prova que ele corresponde ao cálculo esperado nem revela como o algoritmo reage a outros dados.'),
], 'testar-casos', 'Correto. Testar exige comparar o comportamento observado com um resultado que você consegue antecipar.', 'Escolha notas simples, simule uma instrução por vez e confira o resultado mostrado.');

reviseQuestion('execucao-ordem-calculo', 'Considere a sequência: PRINT double; CALCULATE double FROM number; READ number. Qual é o principal problema?', ['logic.instructions', 'logic.input', 'logic.output'], [
  option('ordem-invertida', 'A sequência mostra e calcula um resultado antes de receber o número necessário.', 'O valor mostrado depende do cálculo, e o cálculo depende de receber o número; as dependências estão invertidas.'),
  option('nome-dobro', 'A palavra dobro não pode ser usada em um algoritmo.', 'O nome pode ser usado; o problema é tentar usá-lo antes de produzir o valor correspondente.'),
  option('multiplicar-proibido', 'Calcular um dobro nunca é permitido em algoritmos.', 'O cálculo é válido quando o número já foi recebido e existe uma etapa para produzir o resultado.'),
], 'ordem-invertida', 'Correto. A sequência precisa receber o dado, calcular o resultado e só então apresentá-lo.', 'Localize a instrução que produz cada valor usado nas etapas seguintes.');

reviseQuestion('execucao-ambiguidade', 'Um aplicativo deve calcular o frete de um pacote. Qual instrução descreve a tarefa de forma mais executável?', ['logic.instructions', 'logic.input', 'logic.processing', 'logic.output'], [
  option('distancia-criterio', 'Receber o peso do pacote, calcular o frete usando a tabela definida e mostrar o valor calculado.', 'O dado necessário, o cálculo e a mensagem final estão explicitados, mesmo que a tabela seja detalhada depois.'),
  option('longe-cobrar', 'Cobrar um frete justo para o pacote.', '“Justo” não informa quais dados usar, qual regra aplicar nem qual resultado produzir.'),
  option('cobrar-adequado', 'Resolver o frete como for mais adequado.', 'A instrução deixa para a execução decisões que deveriam estar especificadas na regra.'),
], 'distancia-criterio', 'Correto. Uma instrução executável indica dados, ação e resultado de forma que possa ser conferida.', 'Substitua palavras vagas por passos que outra pessoa conseguiria seguir.');

reviseQuestion('execucao-rastreamento', 'numero começa com 4. O algoritmo aumenta esse numero em 3 e, depois, calcula o dobro do valor atualizado. Qual resultado ele mostra?', ['logic.instructions'], [
  option('quatorze', '14, porque o valor passa de 4 para 7 e o dobro de 7 é 14.', 'O rastreamento usa o valor atualizado na segunda instrução.'),
  option('dez', '10, porque o dobro é calculado antes de aumentar o número.', 'Essa resposta inverte a ordem real das instruções; primeiro o número é atualizado.'),
  option('oito', '8, porque considera somente o dobro do valor inicial.', 'O valor inicial deixa de ser o atual depois que o algoritmo aumenta o número em 3.'),
], 'quatorze', 'Correto. Rastrear é acompanhar o valor disponível depois de cada instrução.', 'Execute uma etapa por vez e anote o novo valor antes de passar à seguinte.');

reviseQuestion('execucao-dados', 'Um pedido só pode receber um comprovante depois que o sistema registra o resultado do pagamento. Por que essa ordem é importante?', ['logic.instructions', 'logic.processing', 'logic.output'], [
  option('confirmacao-depende', 'Porque o comprovante precisa usar a informação produzida pelo registro do pagamento.', 'A mensagem só pode representar corretamente um resultado que já foi produzido e registrado.'),
  option('texto-primeiro', 'Porque mensagens escritas sempre devem ser executadas antes de outras instruções.', 'O tipo de mensagem não determina a ordem; a dependência entre os resultados determina.'),
  option('pagamento-irrelevante', 'Porque o comprovante pode ser emitido mesmo sem saber o resultado do pagamento.', 'Sem esse resultado, o comprovante pode comunicar uma situação que ainda não foi confirmada.'),
], 'confirmacao-depende', 'Correto. Uma mensagem deve vir depois das etapas que produzem a informação que ela comunica.', 'Pergunte qual informação precisa estar disponível para que a mensagem seja verdadeira.');

reviseQuestion('execucao-erro', 'Durante um teste, o sistema registra pagamento pendente, mas mostra “pedido confirmado”. Qual investigação deve vir primeiro?', ['logic.instructions', 'logic.input', 'logic.processing', 'logic.output'], [
  option('revisar-regra', 'Rastrear a informação de pagamento desde o recebimento até a etapa que define a mensagem exibida.', 'Comparar cada passo mostra se a informação foi lida, transformada ou usada de forma incorreta antes da mensagem.'),
  option('culpar-teclado', 'Trocar o teclado, pois qualquer mensagem incorreta vem da digitação.', 'A informação recebida pode ser conferida, mas o problema também pode estar nos passos seguintes.'),
  option('trocar-tela', 'Mudar a cor da tela para destacar que o pedido está pendente.', 'A aparência não explica por que a sequência produziu uma mensagem incompatível com o dado registrado.'),
], 'revisar-regra', 'Correto. O comportamento inesperado deve ser investigado acompanhando a informação pelas instruções que levam à mensagem.', 'Compare a informação recebida, as transformações e a mensagem esperada passo a passo.');

reviseQuestion('execucao-resultado', 'Um pedido informa preço e desconto. Qual sequência produz uma mensagem confiável com o preço final?', ['logic.instructions', 'logic.input', 'logic.processing', 'logic.output'], [
  option('ler-calcular-mostrar', 'Receber preço e desconto; calcular o preço final; mostrar o preço final.', 'Cada etapa recebe os dados produzidos pela anterior e a mensagem usa o resultado calculado.'),
  option('mostrar-ler-calcular', 'Mostrar o preço final; receber preço e desconto; calcular o preço final.', 'A mensagem é apresentada antes de existir um valor final calculado.'),
  option('calcular-mostrar-ler', 'Calcular o preço final; mostrar o preço final; receber preço e desconto.', 'O cálculo aparece antes de receber preço e desconto, valores dos quais ele depende.'),
], 'ler-calcular-mostrar', 'Correto. A sequência recebe os valores, calcula o resultado e só então o mostra.', 'Verifique se todo cálculo recebe seus dados antes de ser executado.');

reviseQuestion('algoritmo-falha-ordem', 'Um algoritmo de empréstimo precisa registrar o código do livro, criar o recibo e mostrar o recibo. Qual reorganização corrige a sequência “mostrar recibo; registrar código; criar recibo”?', ['logic.algorithm', 'logic.instructions'], [
  option('sequencia-incorreta', 'Registrar o código; criar o recibo com esse código; mostrar o recibo.', 'O código existe antes de o recibo ser montado, e o recibo existe antes de ser mostrado.'),
  option('sem-ingredientes', 'Criar o recibo; registrar o código; mostrar o recibo.', 'O recibo é criado antes de receber o dado que deve aparecer nele.'),
  option('sem-forno', 'Mostrar o recibo; criar o recibo; registrar o código.', 'O recibo continua sendo mostrado antes de ser criado e antes de receber o código necessário.'),
], 'sequencia-incorreta', 'Correto. Corrigir um algoritmo é reorganizar os passos conforme as dependências dos dados.', 'Verifique qual passo produz a informação usada pelo próximo.');

reviseQuestion('algoritmo-termino', 'Um algoritmo de cadastro deve receber nome e e-mail, registrar os dados e informar que o cadastro foi concluído. Ele recebe apenas o nome e já mostra a confirmação. Qual passo está ausente?', ['logic.algorithm', 'logic.instructions'], [
  option('criterio-parada', 'Receber o e-mail e registrar os dois dados antes de montar a confirmação.', 'O algoritmo precisa coletar e registrar todas as informações necessárias antes de anunciar a conclusão.'),
  option('mais-adjetivos', 'Trocar “cadastro concluído” por uma mensagem mais detalhada.', 'A mensagem pode melhorar, mas não resolve a ausência de um dado obrigatório nem do registro.'),
  option('ocultar-resultado', 'Mostrar a confirmação duas vezes depois de receber o nome.', 'Repetir a confirmação não cria o e-mail nem garante que os dados foram registrados.'),
], 'criterio-parada', 'Correto. Um algoritmo completo recebe e registra todas as informações necessárias antes de comunicar o resultado prometido.', 'Compare o objetivo com os dados e as etapas realmente presentes.');

reviseQuestion('algoritmo-generalizacao', 'Uma escola quer usar o mesmo algoritmo de média para turmas diferentes. Por que receber as notas de cada turma torna o algoritmo mais reutilizável?', ['logic.algorithm', 'logic.input'], [
  option('aceita-dados', 'Porque a mesma sequência pode operar com as notas de cada turma, sem mudar os passos de cálculo.', 'O algoritmo permanece o mesmo; o que muda são as notas fornecidas em cada execução.'),
  option('evita-numeros', 'Porque o algoritmo só funciona quando as notas de todas as turmas são iguais.', 'Reutilização depende de aceitar valores diferentes, não de restringir os casos a valores idênticos.'),
  option('dispensa-regra', 'Porque trocar as notas elimina a necessidade de manter a sequência de cálculo.', 'Novos dados ainda precisam passar pelos mesmos passos ordenados para produzir a média.'),
], 'aceita-dados', 'Correto. A mesma sequência pode ser aplicada a casos diferentes quando recebe valores diferentes.', 'Separe o procedimento geral dos valores específicos de cada execução.');

reviseQuestion('algoritmo-instrucao', 'Para criar uma lista de compras, qual instrução é clara o suficiente para outra pessoa executar sem adivinhar dados?', ['logic.algorithm', 'logic.instructions'], [
  option('passo-claro', 'Receber o nome do produto, a quantidade desejada e registrar essas informações na lista.', 'A instrução informa quais dados são necessários e qual ação deve ser realizada com eles.'),
  option('passo-vago', 'Organizar as compras de um jeito bom.', '“De um jeito bom” não define dados, ação nem resultado verificável.'),
  option('passo-incompleto', 'Registrar o produto.', 'Falta indicar qual informação do produto deve ser recebida e registrada, como quantidade.'),
], 'passo-claro', 'Correto. Um passo de algoritmo precisa ser específico o bastante para ser seguido e conferido.', 'Procure os dados exigidos e a ação que será feita com eles.');

reviseQuestion('eps-frete-processamento', 'Um aplicativo de entrega recebe endereço, distância, valor dos produtos e cupom. Depois calcula desconto, frete e total. Qual item descreve uma etapa de processamento?', ['logic.input', 'logic.processing', 'logic.output'], [
  option('calcular-frete', 'Usar a distância e o cupom para calcular frete, desconto e total.', 'Essa etapa transforma dados recebidos em novos valores.'),
  option('receber-distancia', 'Receber a distância informada para a entrega.', 'A distância é um dado de entrada; ainda não foi transformada.'),
  option('mostrar-total', 'Mostrar o total e o tempo estimado para a pessoa.', 'Exibir resultados é saída, pois comunica valores já calculados.'),
], 'calcular-frete', 'Correto. Processamento é a parte que aplica regras aos dados para gerar resultados.', 'Observe se a etapa recebe dados, transforma dados ou comunica um resultado.');

reviseQuestion('eps-saida', 'Um caixa eletrônico recebe um valor, confere o saldo e exibe “saldo insuficiente”. Por que essa mensagem é classificada como saída?', ['logic.input', 'logic.processing', 'logic.output'], [
  option('mensagem-saida', 'Porque comunica à pessoa o resultado obtido depois da conferência do saldo.', 'A mensagem é produzida para fora do processamento, após os dados serem analisados.'),
  option('valor-entrada', 'Porque é o dado digitado pela pessoa antes do cálculo.', 'O valor solicitado é entrada; a mensagem só aparece depois da verificação.'),
  option('regra-processamento', 'Porque realiza a comparação entre saldo e valor desejado.', 'A comparação é processamento; a frase exibida é a comunicação do resultado dessa comparação.'),
], 'mensagem-saida', 'Correto. Saída é a informação que o sistema apresenta depois de trabalhar com as entradas.', 'Diferencie o que é fornecido ao sistema, o que ele calcula e o que ele comunica.');

reviseQuestion('eps-classificacao', 'Um conversor recebe uma temperatura em Celsius, transforma o valor para Fahrenheit e apresenta a nova temperatura. Qual organização preserva corretamente o fluxo?', ['logic.input', 'logic.processing', 'logic.output'], [
  option('entrada-processamento-saida', 'Receber Celsius; calcular Fahrenheit a partir desse valor; mostrar Fahrenheit.', 'A transformação só acontece após a entrada, e a saída usa o resultado transformado.'),
  option('saida-entrada-processamento', 'Mostrar Fahrenheit; receber Celsius; calcular Fahrenheit.', 'A saída é solicitada antes de existir a temperatura convertida.'),
  option('processamento-saida-entrada', 'Calcular Fahrenheit; mostrar Fahrenheit; receber Celsius.', 'O cálculo depende de uma temperatura em Celsius que ainda não foi informada.'),
], 'entrada-processamento-saida', 'Correto. A ordem evita calcular ou mostrar um resultado antes de ter o dado de entrada.', 'Rastreie de onde vem cada valor usado no passo seguinte.');

reviseQuestion('eps-reuso', 'No aplicativo de entrega, o total calculado será mostrado na tela e também usado para registrar o pedido. Como esse total deve ser entendido nesse segundo uso?', ['logic.processing', 'logic.output', 'logic.data'], [
  option('resultado-reutilizado', 'Como um resultado do processamento que pode servir de dado para outras etapas.', 'Depois de calculado, o total pode ser comunicado e também usado por um passo posterior sem deixar de ser um dado.'),
  option('entrada-original', 'Como uma entrada que a pessoa digitou no começo do pedido.', 'O total não foi informado diretamente; ele foi produzido a partir dos dados do pedido.'),
  option('mensagem-fixa', 'Como uma mensagem que não pode mais participar de outro cálculo ou registro.', 'Resultados calculados podem alimentar etapas posteriores, desde que o algoritmo deixe essa dependência clara.'),
], 'resultado-reutilizado', 'Correto. Um valor produzido no processamento pode se tornar dado para uma nova etapa.', 'Observe a origem do valor e em quais passos posteriores ele é usado.');

reviseQuestion('eps-falta', 'Um algoritmo recebe preço e quantidade, mas mostra apenas “pedido registrado”. Qual alteração permite informar o valor total corretamente?', ['logic.input', 'logic.processing', 'logic.output'], [
  option('calcular-total', 'Adicionar uma etapa que calcula o total a partir de preço e quantidade e mostrar esse resultado.', 'As entradas precisam ser transformadas no valor pedido antes de uma saída poder informá-lo.'),
  option('mostrar-novamente', 'Mostrar “pedido registrado” uma segunda vez.', 'Repetir a mensagem não cria o total nem explica como ele é obtido.'),
  option('remover-quantidade', 'Ignorar a quantidade e mostrar apenas o preço de uma unidade.', 'O valor total depende dos dois dados recebidos; remover um deles muda o problema.'),
], 'calcular-total', 'Correto. A etapa ausente é o processamento que produz o valor que a saída deve comunicar.', 'Compare a saída desejada com os cálculos presentes no algoritmo.');

reviseQuestion('dados-tipo-idade', 'Em um cadastro, a idade será usada para calcular quantos anos faltam para uma meta. Qual representação é a mais adequada?', ['logic.data'], [
  option('numero', 'Um número, pois a idade será usada em cálculos de quantidade de anos.', 'Números representam quantidades sobre as quais o algoritmo pode calcular.'),
  option('texto', 'Um texto, pois a idade pode ser exibida em uma frase.', 'Ela pode ser exibida depois, mas sua representação principal deve servir ao cálculo previsto.'),
  option('logico', 'Um valor lógico, pois a pessoa tem ou não tem idade.', 'Um valor lógico só representa duas possibilidades; ele não guarda a quantidade de anos.'),
], 'numero', 'Correto. O tipo escolhido deve combinar com a operação que o programa precisará realizar.', 'Pergunte se o valor será tratado como quantidade, texto ou resposta de sim/não.');

reviseQuestion('dados-tipo-nome', 'Um formulário precisa guardar o nome completo “Ana Luiza” para personalizar uma mensagem. Qual representação é mais apropriada?', ['logic.data'], [
  option('texto', 'Texto, pois o nome é composto por caracteres que serão apresentados como mensagem.', 'O programa precisa preservar letras e espaços, não realizar contas com esse dado.'),
  option('numero', 'Número, pois o nome tem uma quantidade de letras.', 'A quantidade de letras não substitui o nome que a mensagem precisa mostrar.'),
  option('logico', 'Valor lógico, pois a pessoa possui ou não possui um nome.', 'Sim/não não guarda os caracteres necessários para personalizar a mensagem.'),
], 'texto', 'Correto. Nomes são informações textuais, mesmo quando o programa também pode medir seu tamanho.', 'Escolha o tipo conforme a informação que precisa ser preservada.');

reviseQuestion('dados-logico', 'No perfil de uma pessoa, o sistema precisa registrar se ela autorizou receber novidades. Qual conjunto de dados representa melhor essa informação sem confundir o restante do cadastro?', ['logic.data'], [
  option('booleano', 'Nome como texto, idade como número e autorização como valor lógico: sim ou não.', 'Cada dado usa uma representação compatível com seu significado; autorização tem apenas duas possibilidades.'),
  option('texto', 'Nome, idade e autorização todos como textos, inclusive a resposta “sim”.', 'Texto pode exibir a resposta, mas não deixa clara a natureza binária da autorização para as regras futuras.'),
  option('numero', 'Nome e autorização como números, usando 1 para sim e 2 para não.', 'Os números escolhidos não expressam uma quantidade e tornam a leitura da regra menos direta.'),
], 'booleano', 'Correto. Textos, números e valores lógicos atendem a necessidades diferentes dentro do mesmo cadastro.', 'Associe cada campo ao tipo de operação ou decisão que ele precisa permitir.');

reviseQuestion('dados-operacao', 'Um pedido contém quantidade = 3 e precoUnitario = 12. Antes de mostrar o total, qual processamento é coerente com esses dois dados?', ['logic.data', 'logic.processing'], [
  option('multiplicar', 'Multiplicar a quantidade pelo preço unitário para produzir o valor total.', 'O total depende de considerar as três unidades, cada uma com preço 12.'),
  option('somar', 'Somar quantidade e preço unitário para produzir o valor total.', '3 mais 12 mistura grandezas diferentes e não representa o preço de três unidades.'),
  option('comparar', 'Comparar quantidade e preço unitário para produzir o valor total.', 'Uma comparação produz uma relação, não o valor monetário do pedido.'),
], 'multiplicar', 'Correto. Os valores foram escolhidos como números porque participam de um cálculo de quantidade por preço.', 'Pergunte que significado o resultado deve ter antes de escolher a operação.');

reviseQuestion('dados-escolha', 'Um formulário registra nome, quantidade de produtos, e-mail confirmado e data de entrega. Qual organização representa cada informação de modo mais adequado?', ['logic.data'], [
  option('tipos-coerentes', 'Nome como texto, quantidade como número, confirmação como valor lógico e data como texto em formato combinado.', 'Cada campo recebe uma forma adequada ao que precisa comunicar ou permitir em etapas posteriores.'),
  option('todos-numeros', 'Todos como números, porque o sistema guarda apenas valores.', 'Nome e confirmação não representam quantidades; forçá-los a números perde seu significado.'),
  option('todos-textos', 'Todos como textos, pois assim aparecem facilmente na tela.', 'Exibir é uma necessidade, mas quantidade e confirmação precisam manter significados próprios para cálculos e decisões futuras.'),
], 'tipos-coerentes', 'Correto. O modelo de dados deve preservar o significado de cada informação, não apenas facilitar sua exibição.', 'Analise o uso futuro de cada campo: ler texto, calcular quantidade ou decidir entre duas opções.');

reviseQuestion('variavel-atualizacao', 'Uma variável chamada pontos começa com 2 e depois recebe o novo valor 7. Qual valor ela guarda ao final?', ['logic.variables'], [
  option('sete', '7, porque a atualização substitui o conteúdo anterior de pontos.', 'Uma variável guarda seu valor atual; a segunda atribuição troca o 2 por 7.'),
  option('dois', '2, porque o primeiro valor não pode ser alterado.', 'O objetivo de uma variável é justamente poder armazenar um novo valor quando a situação muda.'),
  option('nove', '9, porque os dois valores são somados automaticamente.', 'Valores anteriores não são acumulados sem uma instrução que peça esse cálculo.'),
], 'sete', 'Correto. O nome da variável permanece, mas o valor armazenado pode ser atualizado.', 'Diferencie trocar o valor atual de guardar uma lista de todos os valores anteriores.');

reviseQuestion('variavel-nome', 'Um pedido possui quantidade, preço unitário e total calculado. Qual escolha de nomes ajuda mais alguém a rastrear qual valor está sendo atualizado?', ['logic.variables'], [
  option('nome-claro', 'quantidadeItens, precoUnitario e totalPedido.', 'Cada nome revela o papel do valor e reduz o risco de atualizar ou usar o dado errado.'),
  option('nome-curto', 'a, b e c, porque são menores de digitar.', 'Nomes curtos não mostram qual valor representa quantidade, preço ou resultado.'),
  option('nome-repetido', 'valor para os três dados, mudando apenas quando necessário.', 'Um único nome para papéis diferentes torna impossível saber qual valor está disponível em cada etapa.'),
], 'nome-claro', 'Correto. Nomes claros tornam o estado do algoritmo mais fácil de acompanhar e revisar.', 'Prefira nomes que indiquem o que o valor representa, não apenas que ele existe.');

reviseQuestion('variavel-rastreamento', 'saldo começa em 100. Após um pagamento, o algoritmo atualiza saldo para 70. Depois de um crédito, atualiza saldo para 90. Qual valor deve ser mostrado?', ['logic.variables'], [
  option('noventa', '90, porque essa é a última atualização armazenada em saldo.', 'O rastreamento é 100 → 70 → 90; cada atualização substitui o valor atual.'),
  option('cem', '100, porque o primeiro valor de saldo é o permanente.', 'O valor inicial é substituído quando o pagamento atualiza a variável.'),
  option('setenta', '70, porque o crédito não muda o saldo já registrado.', 'A segunda atualização altera novamente o conteúdo de saldo para 90.'),
  option('duzentos-e-sessenta', '260, porque todos os valores assumidos por saldo devem ser somados.', 'A variável não acumula seu histórico automaticamente; ela guarda somente o valor atual.'),
], 'noventa', 'Correto. Para rastrear uma variável, atualize a anotação a cada atribuição e preserve apenas o valor vigente.', 'Escreva uma pequena tabela com o valor de saldo após cada passo.');

reviseQuestion('variavel-responsabilidade', 'Um relatório deve guardar o valor calculado antes de mostrá-lo. Qual sequência usa uma variável de forma organizada?', ['logic.variables', 'logic.processing', 'logic.output'], [
  option('guardar-resultado', 'Calcular o total; guardar o resultado em totalPedido; mostrar totalPedido.', 'A variável recebe o resultado do processamento e a saída usa exatamente esse valor guardado.'),
  option('mostrar-sem-guardar', 'Mostrar totalPedido; calcular o total; guardar o resultado depois.', 'A saída tenta usar a variável antes que ela receba o valor calculado.'),
  option('trocar-nome', 'Calcular o total; chamar o resultado de qualquer coisa; mostrar um texto sem o valor.', 'Um nome sem relação com o papel do dado e uma saída sem o resultado dificultam verificar a sequência.'),
], 'guardar-resultado', 'Correto. A variável torna explícito qual resultado foi produzido e qual valor será usado na saída.', 'Confira se a variável recebe um valor antes de qualquer etapa que precise dela.');

reviseQuestion('variavel-erro', 'Um algoritmo mostra totalPedido, mas nenhuma etapa anterior atribui um valor a totalPedido. Qual correção resolve a causa do problema?', ['logic.variables', 'logic.instructions'], [
  option('atribuir-antes', 'Calcular o total e atribuir esse resultado a totalPedido antes de mostrá-lo.', 'A variável precisa receber um valor definido antes que outra instrução tente usá-la.'),
  option('mostrar-duas-vezes', 'Mostrar totalPedido duas vezes para garantir que apareça.', 'Repetir a saída não cria o valor que está ausente.'),
  option('trocar-cor', 'Mudar a aparência da mensagem do total.', 'A apresentação não resolve a falta de uma etapa que produza e guarde o dado.'),
], 'atribuir-antes', 'Correto. O erro vem da dependência: a saída usa um valor que ainda não foi produzido.', 'Localize a instrução que deveria atribuir o primeiro valor à variável.');

reviseQuestion('operador-calculo', 'Com preco = 80 e quantidade = 3, qual expressão calcula o valor total do pedido?', ['logic.operators', 'logic.variables'], [
  option('multiplicar', 'preco * quantidade.', 'Multiplicar o preço de uma unidade pela quantidade produz o valor das três unidades.'),
  option('somar', 'preco + quantidade.', 'Somar 80 e 3 mistura preço com quantidade e não representa o total do pedido.'),
  option('comparar', 'price >= quantity.', 'A comparação produz TRUE ou FALSE, não um valor monetário total.'),
], 'multiplicar', 'Correto. O operador deve combinar com o significado do resultado desejado.', 'Pergunte se você precisa calcular uma quantidade total ou verificar uma relação.');

reviseQuestion('operador-comparacao', 'Com age = 16, qual resultado a expressão age >= 18 produz?', ['logic.operators'], [
  option('falso', 'FALSE, pois 16 não é maior nem igual a 18.', 'A comparação verifica a relação entre os valores e, nesse caso, ela não é satisfeita.'),
  option('dezoito', '18, porque esse é o limite usado na expressão.', '18 é o valor de referência; a expressão devolve um resultado lógico, não o próprio limite.'),
  option('verdadeiro', 'TRUE, porque 16 está próximo de 18.', 'Comparações não usam proximidade: 16 continua abaixo do limite 18.'),
], 'falso', 'Correto. Operadores relacionais respondem se uma relação é verdadeira ou falsa.', 'Compare os dois valores exatamente como o operador indica.');

reviseQuestion('operador-desconto', 'valor = 200; desconto = valor * 0.10; valorFinal = valor - desconto. Qual par descreve desconto e valorFinal?', ['logic.operators', 'logic.variables'], [
  option('vinte', 'desconto = 20 e valorFinal = 180.', '10% de 200 é 20; depois o desconto é subtraído do valor original.'),
  option('duzentos-e-dez', 'desconto = 10 e valorFinal = 190.', '10 é a porcentagem usada no cálculo, não o valor do desconto sobre 200.'),
  option('dez', 'desconto = 20 e valorFinal = 220.', 'O desconto foi calculado corretamente, mas o valor final deve subtraí-lo, não somá-lo.'),
], 'vinte', 'Correto. Primeiro calcule o desconto; só então use esse resultado para calcular o valor final.', 'Rastreie as variáveis intermediárias antes de avaliar o resultado final.');

reviseQuestion('operador-tipo-resultado', 'Um pedido já tem totalPedido calculado. Qual expressão responde a uma pergunta lógica sobre esse valor, em vez de produzir outro número?', ['logic.operators', 'logic.variables'], [
  option('comparar-saldo', 'total >= freeShippingLimit.', 'A expressão compara dois valores e produz TRUE ou FALSE.'),
  option('somar-saldo', 'totalPedido + taxaDeServico.', 'Essa expressão calcula um novo valor numérico para o pedido.'),
  option('dividir-saldo', 'totalPedido / quantidadeItens.', 'Essa expressão calcula um valor numérico, como uma média por item.'),
], 'comparar-saldo', 'Correto. Comparações respondem a perguntas sobre a relação entre valores.', 'Procure operadores como >, <, >=, <=, == ou != quando o resultado esperado for lógico.');

reviseQuestion('operador-regra', 'Uma promoção vale para compras de pelo menos 150 reais. Qual comparação atende corretamente aos casos 149, 150 e 151?', ['logic.operators'], [
  option('maior-ou-igual', 'valorCompra >= 150.', 'A comparação rejeita 149 e inclui tanto 150 quanto valores maiores.'),
  option('maior', 'valorCompra > 150.', 'Essa comparação rejeita 150, embora “pelo menos” inclua exatamente o limite.'),
  option('menor', 'valorCompra < 150.', 'Essa comparação seleciona justamente os valores que não atingiram a promoção.'),
], 'maior-ou-igual', 'Correto. Interpretar o limite exige testar o valor imediatamente abaixo, no limite e acima dele.', 'Traduza palavras como “pelo menos” e “até” para comparações e teste a fronteira.');

reviseQuestion('condicao-limite', 'Uma biblioteca permite empréstimo para quem tem 15 anos ou mais. Qual condição aceita 15 e 16, mas rejeita 14?', ['logic.operators', 'logic.condition'], [
  option('idade-maior-igual', 'idade >= 15.', '>= inclui o valor do limite e todos os valores maiores, mas não aceita 14.'),
  option('idade-maior', 'idade > 15.', 'Essa condição rejeita 15, que deveria ser permitido pela regra.'),
  option('idade-menor', 'idade < 15.', 'Essa condição aceita 14 e rejeita as idades que a biblioteca quer permitir.'),
], 'idade-maior-igual', 'Correto. Testar os três valores próximos ao limite confirma qual operador representa a frase.', 'Comece sempre pelo caso exatamente igual ao limite da regra.');

reviseQuestion('condicao-problema', 'Um sistema deve liberar acesso somente quando senhaDigitada corresponde a senhaCorreta, mas usa senhaDigitada != senhaCorreta. Qual ajuste corrige a lógica sem alterar a saída prevista?', ['logic.operators', 'logic.condition'], [
  option('igualdade', 'Usar senhaDigitada == senhaCorreta para liberar acesso.', 'A igualdade é verdadeira exatamente quando os dois valores correspondem.'),
  option('manter-diferente', 'Manter !=, pois senhas diferentes tornam a verificação mais segura.', 'Valores diferentes indicam falha de correspondência; essa condição liberaria quem não deveria entrar.'),
  option('remover-senha', 'Remover a comparação e liberar acesso depois que qualquer senha for digitada.', 'Sem verificar os valores, o algoritmo perde o critério que diferencia acesso válido de inválido.'),
], 'igualdade', 'Correto. A correção parte do significado da regra, não apenas do símbolo usado no código.', 'Leia a condição como uma frase: “a senha digitada é igual à senha correta?”.');

reviseQuestion('condicao-caso-fronteira', 'Uma nota de 6 aprova quando a regra é media >= 6. Qual conjunto de testes verifica melhor se a fronteira está correta?', ['logic.operators', 'logic.condition'], [
  option('cinco-seis-sete', 'Testar médias 5, 6 e 7 e conferir as três saídas.', 'Valores abaixo, no limite e acima mostram se a regra inclui 6 como deveria.'),
  option('somente-dez', 'Testar apenas média 10.', 'Um valor distante do limite não revela se a comparação trata corretamente o caso mais delicado.'),
  option('nenhum-teste', 'Não testar, porque o símbolo >= garante o comportamento sozinho.', 'A intenção pode estar escrita corretamente, mas o algoritmo completo ainda precisa ser verificado com casos reais.'),
], 'cinco-seis-sete', 'Correto. Casos de fronteira são especialmente importantes porque pequenos erros de operador mudam o resultado.', 'Sempre inclua o valor imediatamente abaixo, o próprio limite e um valor acima.');

reviseQuestion('condicao-semantica', 'Um estoque deve mostrar “repor” quando quantidade for 0 e “disponível” nos demais casos. Qual estrutura representa a regra sem inverter os caminhos?', ['logic.operators', 'logic.condition'], [
  option('escolhe-caminho', 'IF quantity == 0 THEN PRINT “repor”; ELSE PRINT “disponível”; END IF.', 'A condição identifica exatamente a falta de itens e o caminho alternativo atende às demais quantidades.'),
  option('guarda-texto', 'IF quantity != 0 THEN PRINT “repor”; ELSE PRINT “disponível”; END IF.', 'A comparação está invertida: ela pediria reposição justamente quando ainda há quantidade.'),
  option('repete-automatico', 'Mostrar “repor” antes de verificar quantidade e depois decidir a mensagem.', 'A primeira saída pode contradizer o estado real; a decisão precisa ocorrer antes da mensagem.'),
], 'escolhe-caminho', 'Correto. Uma condição direciona o fluxo para uma saída compatível com o resultado da comparação.', 'Associe cada caminho ao valor que torna a condição verdadeira ou falsa.');

reviseQuestion('loop-infinito', 'contador começa em 1 e o loop continua enquanto contador <= 3. Qual mudança cria risco de repetição infinita?', ['logic.loop', 'logic.variables', 'logic.condition'], [
  option('sem-atualizacao', 'Remover a atualização que aumenta contador a cada volta.', 'Sem mudança, contador continua em 1 e a condição contador <= 3 permanece verdadeira.'),
  option('mostrar-contador', 'Manter a instrução que mostra contador dentro do bloco.', 'Mostrar o valor não impede a atualização nem altera a condição de parada.'),
  option('limite-tres', 'Manter o limite 3 e aumentar contador a cada volta.', 'Com o contador avançando, ele chegará a 4 e a condição deixará de ser verdadeira.'),
], 'sem-atualizacao', 'Correto. Um loop precisa de uma mudança que faça sua condição caminhar para falso.', 'Pergunte qual valor muda em cada volta e quando ele ultrapassa ou alcança o limite.');

reviseQuestion('loop-necessidade', 'Um sistema recebe uma lista de pedidos e precisa aplicar a mesma verificação de endereço a cada pedido. Qual solução organiza melhor a tarefa?', ['logic.loop', 'logic.instructions'], [
  option('enviar-lista', 'Usar uma repetição que pega um pedido por vez, verifica o endereço e passa ao próximo.', 'A mesma sequência é aplicada a vários elementos, sem copiar as instruções manualmente.'),
  option('calcular-unica-media', 'Escrever a verificação uma vez para o primeiro pedido e assumir que os demais estão corretos.', 'O primeiro pedido não representa automaticamente os dados dos outros pedidos da lista.'),
  option('mostrar-titulo', 'Mostrar um título informando que a lista possui pedidos.', 'A saída não executa a verificação necessária em cada elemento.'),
], 'enviar-lista', 'Correto. Loops são adequados quando uma mesma regra precisa ser aplicada a vários casos semelhantes.', 'Procure uma ação repetida para cada item de um conjunto.');

reviseQuestion('loop-acumulador', 'Um algoritmo soma os valores de três compras. Por que total começa em 0 antes de cada valor ser acrescentado?', ['logic.variables', 'logic.loop'], [
  option('elemento-neutro', 'Porque 0 fornece um valor inicial que não altera a primeira soma.', 'O primeiro valor passa a ser o total inicial, e os seguintes são acumulados sobre ele.'),
  option('evita-entrada', 'Porque começar em 0 elimina a necessidade de receber os valores das compras.', 'O acumulador só terá algo para somar depois que os valores de entrada forem obtidos.'),
  option('faz-loop-infinito', 'Porque 0 faz qualquer repetição encerrar imediatamente.', 'O fim do loop depende da condição e de suas atualizações, não apenas do valor inicial do total.'),
], 'elemento-neutro', 'Correto. Inicializar o acumulador evita que ele comece sem valor e preserva o primeiro cálculo.', 'Simule o total antes e depois de acrescentar o primeiro valor.');

reviseQuestion('loop-condicao', 'contador começa em 1. O algoritmo repete enquanto contador <= 3, mostra contador e depois atualiza contador para contador - 1. O que precisa mudar para a repetição terminar?', ['logic.loop', 'logic.condition', 'logic.variables'], [
  option('quando-falsa', 'Atualizar contador para contador + 1, para que ele alcance 4 e a condição fique falsa.', 'Com a soma de 1, o contador avança em direção ao valor que encerra a condição.'),
  option('qual-cor', 'Apenas trocar a mensagem mostrada em cada volta.', 'Mudar a saída não altera contador nem aproxima a condição de ficar falsa.'),
  option('qual-nome', 'Renomear contador para indice, mantendo a atualização que diminui o valor.', 'Trocar o nome não muda o comportamento: valores menores continuam atendendo contador <= 3.'),
], 'quando-falsa', 'Correto. A atualização original faz o contador diminuir e permanecer abaixo do limite; a correção o conduz até a parada.', 'Teste alguns valores: 1, 0, -1… Eles mostram por que a condição nunca se torna falsa.');

reviseQuestion('funcao-chamada', 'A função calcularTotal(preco, quantidade) já foi definida. Qual linha a chama para um item de preço 12 e quantidade 3, guardando o resultado?', ['logic.function', 'logic.variables'], [
  option('chamada', 'totalPedido ← calcularTotal(12, 3).', 'A chamada fornece valores concretos aos parâmetros e guarda o retorno em uma variável.'),
  option('definicao', 'FUNCTION calculateTotal(price, quantity).', 'Essa linha descreve a função, mas não executa o cálculo para o item informado.'),
  option('variavel', 'preco ← 12.', 'Atribuir um valor a preço não chama a função nem produz o total com a quantidade.'),
], 'chamada', 'Correto. Uma chamada usa o nome da função com argumentos para executar sua tarefa.', 'Diferencie definir a tarefa de pedir que ela seja realizada com dados específicos.');

reviseQuestion('funcao-parametros', 'calcularTotal(preco, quantidade) deve funcionar tanto para um livro de 12 reais quanto para um jogo de 80 reais. Qual explicação descreve o papel de preco e quantidade?', ['logic.function', 'logic.variables'], [
  option('entrada', 'São parâmetros: recebem os valores de cada item para que a mesma função calcule casos diferentes.', 'A função mantém a mesma lógica, enquanto os parâmetros fornecem os dados específicos de cada chamada.'),
  option('resultado-fixo', 'São sempre o resultado final da função, independentemente do item.', 'Parâmetros entram na função; o resultado é produzido depois que ela trabalha com esses dados.'),
  option('contador', 'São obrigatoriamente contadores de loop.', 'Parâmetros não têm um papel fixo de contagem; seu papel depende da tarefa definida pela função.'),
], 'entrada', 'Correto. Parâmetros tornam uma função reutilizável porque recebem valores diferentes em cada chamada.', 'Veja quais informações precisam entrar na função para que ela execute sua responsabilidade.');

reviseQuestion('funcao-responsabilidade', 'Uma função precisa preparar o total de uma compra para outras partes do sistema usarem. Qual desenho mantém uma responsabilidade clara?', ['logic.function', 'logic.variables'], [
  option('calcular-total', 'calcularTotal(preco, quantidade) calcula e retorna somente o total da compra.', 'A função tem uma tarefa definida: transformar os dados recebidos em um resultado reutilizável.'),
  option('fazer-tudo', 'processarTudo() calcula, mostra, envia e-mail, salva dados e decide todas as regras.', 'Misturar muitas tarefas dificulta entender, testar e reaproveitar a função.'),
  option('sem-nome', 'Criar uma função sem nome que altera valores desconhecidos.', 'Sem nome, entradas e resultado claros, não é possível saber quando a função deve ser chamada.'),
], 'calcular-total', 'Correto. Uma função focada deixa claro o que ela recebe, o que faz e o que entrega.', 'Prefira extrair uma tarefa coesa em vez de concentrar responsabilidades sem relação.');

reviseQuestion('funcao-reuso', 'Duas telas precisam aplicar a mesma regra de desconto. Depois a regra muda. Qual solução evita que uma tela fique com cálculo antigo?', ['logic.function'], [
  option('uma-funcao', 'Criar calcularDesconto e chamá-la nas duas telas; a alteração é feita dentro dessa função.', 'Com uma única fonte da regra, as duas telas usam automaticamente o mesmo cálculo atualizado.'),
  option('copiar-calculo', 'Copiar o cálculo em cada tela e lembrar de ajustar cada cópia quando necessário.', 'Cópias podem ser esquecidas ou receber alterações diferentes, criando resultados inconsistentes.'),
  option('calcular-manual', 'Pedir que cada pessoa calcule o desconto fora do sistema antes de usar as telas.', 'A tarefa perde automação e ainda não garante que a mesma regra será aplicada em todos os casos.'),
], 'uma-funcao', 'Correto. Reutilizar uma função centraliza a regra e reduz o risco de divergência entre cópias.', 'Quando a lógica se repete, pergunte se ela pode se tornar uma tarefa nomeada e reutilizável.');

reviseQuestion('algoritmo-simulacao', 'Um algoritmo recebe numero = 4, calcula o dobro e depois mostra o resultado. Durante um rastreamento manual, qual registro está correto?', ['logic.algorithm', 'logic.instructions'], [
  option('entrada-e-saida', 'O algoritmo recebe 4, calcula o dobro de 4 e mostra 8.', 'O registro acompanha o valor disponível e o resultado produzido em cada passo.'),
  option('somente-nome', 'O algoritmo recebe 4, mostra 4 e deixa o dobro para depois.', 'Mostrar o valor inicial não executa a transformação que foi pedida.'),
  option('sem-dado', 'O algoritmo recebe 4, calcula o dobro de 8 e mostra 16.', 'Dobrar 8 acrescenta uma etapa inexistente; o algoritmo deve dobrar o valor 4 uma vez.'),
], 'entrada-e-saida', 'Correto. Rastrear é registrar o valor disponível depois de cada instrução, sem inventar etapas.', 'Simule uma instrução por vez e anote o valor que ela produz.');

reviseQuestion('eps-reuso', 'No aplicativo de entrega, o total calculado será mostrado na tela e também usado para registrar o pedido. Como esse total deve ser entendido no segundo uso?', ['logic.processing', 'logic.output'], [
  option('resultado-reutilizado', 'Como um resultado calculado que pode ser usado por uma etapa posterior do algoritmo.', 'O total foi produzido pelo cálculo e pode alimentar outra etapa antes ou depois de ser mostrado.'),
  option('entrada-original', 'Como um valor que a pessoa digitou no começo do pedido.', 'O total não foi informado diretamente; ele foi produzido a partir das informações do pedido.'),
  option('mensagem-fixa', 'Como uma mensagem que não pode participar de outro registro.', 'Um resultado calculado pode ser reaproveitado por outra etapa quando essa dependência é descrita no algoritmo.'),
], 'resultado-reutilizado', 'Correto. Um resultado de processamento pode ser usado novamente em uma etapa posterior.', 'Observe se o valor foi recebido diretamente ou se foi produzido por um cálculo.');

reviseQuestion('dados-operacao', 'Em um catálogo, o código do produto é “003”. Ele será usado para localizar o item e deve continuar aparecendo com os três dígitos. Qual representação preserva melhor esse significado?', ['logic.data'], [
  option('multiplicar', 'Texto, pois os zeros iniciais fazem parte da identificação do produto.', 'O código identifica o item; tratar “003” como texto preserva exatamente os caracteres necessários.'),
  option('somar', 'Número, pois todo valor formado por dígitos deve representar uma quantidade.', 'Os dígitos não indicam uma quantidade a calcular; remover os zeros iniciais mudaria a forma de identificação.'),
  option('comparar', 'Valor lógico, pois o produto existe ou não existe.', 'A existência pode ser outra informação, mas não substitui o código que identifica qual produto é procurado.'),
], 'multiplicar', 'Correto. Um valor com dígitos pode ser texto quando sua função é identificar, e não calcular.', 'Pergunte se os caracteres representam uma quantidade ou um rótulo que precisa ser preservado.');

reviseQuestion('variavel-conceito', 'saldo começa guardando 100. Depois o programa atualiza saldo para 150 e, em seguida, faz uma nova atualização para 170. Qual valor final deve estar associado a saldo?', ['logic.variables'], [
  option('pode-mudar', '170, pois a última atualização substitui o valor anterior de saldo.', 'O rastreamento é 100 → 150 → 170; a variável guarda o valor atual.'),
  option('nome-muda', '150, pois a segunda atualização não altera o valor já guardado.', 'A nova atribuição é justamente a instrução que troca 150 pelo valor atual 170.'),
  option('memoria-apaga', '420, pois todos os valores que saldo já teve devem ser somados.', 'Uma variável não soma seu histórico automaticamente; ela mantém somente o valor vigente.'),
], 'pode-mudar', 'Correto. O nome da variável permanece, enquanto seu conteúdo pode ser atualizado várias vezes.', 'Anote apenas o valor atual depois de cada atualização.');

const conceptIdRevisions = {
  'programacao-instrucao-clara': ['logic.instructions'],
  'programacao-ordem': ['logic.instructions'],
  'execucao-ordem-calculo': ['logic.instructions'],
  'execucao-ambiguidade': ['logic.instructions'],
  'execucao-dados': ['logic.instructions'],
  'execucao-erro': ['logic.instructions'],
  'execucao-resultado': ['logic.instructions'],
  'algoritmo-generalizacao': ['logic.algorithm'],
  'variavel-responsabilidade': ['logic.variables'],
  'variavel-erro': ['logic.variables'],
  'loop-necessidade': ['logic.loop'],
};

Object.entries(conceptIdRevisions).forEach(([questionId, conceptIds]) => {
  const target = Object.values(fundamentalsActivities).flatMap((activity) => activity.questions).find((question) => question.id === questionId);
  target.conceptIds = conceptIds;
});

// Ordem fixa e auditável no manifesto: não há embaralhamento durante a execução da atividade.
const correctOptionPositions = {
  'programacao-problema': 2,
  'programacao-instrucao-clara': 1,
  'programacao-automacao': 3,
  'programacao-ordem': 1,
  'programacao-teste': 3,
  'programacao-computador': 1,
  'execucao-ordem-calculo': 2,
  'execucao-ambiguidade': 3,
  'execucao-rastreamento': 2,
  'execucao-dados': 1,
  'execucao-erro': 3,
  'execucao-resultado': 2,
  'algoritmo-definicao-aplicada': 3,
  'algoritmo-falha-ordem': 1,
  'algoritmo-simulacao': 3,
  'algoritmo-termino': 2,
  'algoritmo-generalizacao': 3,
  'algoritmo-instrucao': 1,
  'eps-media-entrada': 1,
  'eps-frete-processamento': 2,
  'eps-saida': 1,
  'eps-classificacao': 3,
  'eps-reuso': 2,
  'eps-falta': 1,
  'dados-tipo-idade': 3,
  'dados-tipo-nome': 2,
  'dados-logico': 3,
  'dados-aparencia': 1,
  'dados-operacao': 2,
  'dados-escolha': 3,
  'variavel-atualizacao': 3,
  'variavel-nome': 2,
  'variavel-rastreamento': 4,
  'variavel-responsabilidade': 3,
  'variavel-conceito': 1,
  'variavel-erro': 2,
  'operador-calculo': 1,
  'operador-comparacao': 3,
  'operador-etapas': 1,
  'operador-desconto': 2,
  'operador-tipo-resultado': 1,
  'operador-regra': 2,
  'condicao-idade': 2,
  'condicao-limite': 1,
  'condicao-desconto': 2,
  'condicao-problema': 3,
  'condicao-caso-fronteira': 2,
  'condicao-semantica': 1,
  'loop-contador-saida': 3,
  'loop-infinito': 1,
  'loop-necessidade': 3,
  'loop-limite': 2,
  'loop-acumulador': 1,
  'loop-condicao': 3,
  'funcao-beneficio': 2,
  'funcao-chamada': 1,
  'funcao-parametros': 2,
  'funcao-retorno': 3,
  'funcao-responsabilidade': 1,
  'funcao-reuso': 2,
};

Object.values(fundamentalsActivities).flatMap((activity) => activity.questions).forEach((question) => {
  const targetPosition = correctOptionPositions[question.id];
  if (!targetPosition || question.type !== 'multiple-choice') return;

  const correctOptionIndex = question.options.findIndex((option) => option.id === question.correctAnswer);
  const [correctOption] = question.options.splice(correctOptionIndex, 1);
  question.options.splice(targetPosition - 1, 0, correctOption);
});

const fundamentalsPracticalExercises = {
  'organizar-algoritmo-dobro': {
    lessonId: 'algoritmos-e-instrucoes', courseId, moduleId: 'introducao-programacao', slug: 'organizar-algoritmo-dobro', type: 'order_steps', title: 'Organize o algoritmo do dobro', description: 'Ordene os passos para receber um número, calcular seu dobro e comunicar o resultado.', instructions: 'Use os botões para colocar as etapas em uma sequência que respeite as dependências dos dados.', conceptIds: ['logic.instructions', 'logic.algorithm'], difficulty: 'intermediate', status: 'published', order: 1,
    steps: [
      { id: 'mostrar-dobro', content: 'PRINT double' },
      { id: 'ler-numero', content: 'READ number' },
      { id: 'calcular-dobro', content: 'double ← number * 2' },
    ],
    validation: { correctOrder: ['ler-numero', 'calcular-dobro', 'mostrar-dobro'] },
    feedback: { correct: 'Você organizou o algoritmo respeitando a origem de cada dado.', partiallyCorrect: 'Quase lá. Revise a dependência entre as etapas.', needsRevision: 'A sequência ainda usa um dado antes que ele exista.', hint: 'Antes de calcular, o número precisa ser lido; antes de mostrar, o dobro precisa ser calculado.', explanation: 'Um algoritmo confiável recebe os dados de que precisa, executa o processamento e só então apresenta a saída.' },
    possibleSolution: 'READ number\ndouble ← number * 2\nPRINT double',
  },
  'organizar-fluxo-do-pedido': {
    lessonId: 'entrada-processamento-saida', courseId, moduleId: 'introducao-programacao', slug: 'organizar-fluxo-do-pedido', type: 'order_steps', title: 'Organize o fluxo de um pedido', description: 'Monte uma sequência de entrada, processamento e saída para um pedido simples.', instructions: 'Posicione as etapas para que o total só seja mostrado depois de ser calculado.', conceptIds: ['logic.input', 'logic.processing', 'logic.output', 'logic.algorithm'], difficulty: 'intermediate', status: 'published', order: 1,
    steps: [
      { id: 'mostrar-total', content: 'PRINT total' },
      { id: 'ler-quantidade', content: 'READ quantity AND unitPrice' },
      { id: 'calcular-total', content: 'total ← quantity * unitPrice' },
    ],
    validation: { correctOrder: ['ler-quantidade', 'calcular-total', 'mostrar-total'] },
    feedback: { correct: 'Você separou corretamente entrada, processamento e saída.', partiallyCorrect: 'Quase lá. Revise a dependência entre as etapas.', needsRevision: 'A ordem ainda tenta calcular ou comunicar algo antes de receber os dados necessários.', hint: 'Pergunte em qual etapa cada valor passa a existir.', explanation: 'Quantidade e preço são entradas. O total é calculado no processamento e apresentado como saída.' },
    possibleSolution: 'READ quantity AND unitPrice\ntotal ← quantity * unitPrice\nPRINT total',
  },
  'completar-limite-de-idade': {
    lessonId: 'dados-valores-e-tipos', courseId, moduleId: 'dados-e-decisoes', slug: 'completar-limite-de-idade', type: 'complete_code', title: 'Complete o limite de idade', description: 'Use um número para completar a condição que classifica uma pessoa maior de idade.', instructions: 'Digite somente o valor que falta na lacuna.', starterCode: 'READ age\n\nIF age >= {{blank}} THEN\n    PRINT "Maior de idade"\nEND IF', conceptIds: ['logic.data'], difficulty: 'basic', status: 'published', order: 1,
    validation: { acceptedAnswers: ['18'] },
    feedback: { correct: 'Você completou a condição com o valor numérico adequado.', partiallyCorrect: 'Revise o valor usado como limite.', needsRevision: 'O trecho ainda não representa o limite proposto.', hint: 'A condição deve comparar a idade com o limite de maioridade apresentado no enunciado.', explanation: 'Idade é um dado numérico porque pode ser comparada a um limite e usada em cálculos.' },
    possibleSolution: 'READ age\n\nIF age >= 18 THEN\n    PRINT "Maior de idade"\nEND IF',
  },
  'completar-atualizacao-de-saldo': {
    lessonId: 'variaveis-e-memoria', courseId, moduleId: 'dados-e-decisoes', slug: 'completar-atualizacao-de-saldo', type: 'complete_code', title: 'Complete a atualização do saldo', description: 'Complete a operação que atualiza o valor guardado em uma variável.', instructions: 'Digite o operador que acrescenta o crédito ao saldo.', starterCode: 'balance ← 100\ncredit ← 20\nbalance ← balance {{blank}} credit\nPRINT balance', conceptIds: ['logic.variables'], difficulty: 'intermediate', status: 'published', order: 1,
    validation: { acceptedAnswers: ['+'] },
    feedback: { correct: 'Você atualizou a variável a partir do valor que ela já guardava.', partiallyCorrect: 'Revise a operação que deve acontecer com o crédito.', needsRevision: 'A operação escolhida não acrescenta o crédito ao saldo.', hint: 'O novo saldo precisa partir de 100 e chegar a 120.', explanation: 'Uma variável guarda o valor atual. A atribuição usa o valor anterior e o crédito para produzir o novo saldo.' },
    possibleSolution: 'balance ← 100\ncredit ← 20\nbalance ← balance + credit\nPRINT balance',
  },
  'completar-preco-com-desconto': {
    lessonId: 'operadores', courseId, moduleId: 'dados-e-decisoes', slug: 'completar-preco-com-desconto', type: 'complete_code', title: 'Complete o cálculo com desconto', description: 'Escolha o operador que calcula o preço final depois de um desconto.', instructions: 'Digite o operador que produz o preço final correto.', starterCode: 'price ← 100\ndiscount ← 20\nfinalPrice ← price {{blank}} discount\nPRINT finalPrice', conceptIds: ['logic.variables', 'logic.operators'], difficulty: 'intermediate', status: 'published', order: 1,
    validation: { acceptedAnswers: ['-'] },
    feedback: { correct: 'Você escolheu o operador que reduz o preço pelo desconto.', partiallyCorrect: 'Revise como o desconto altera o preço inicial.', needsRevision: 'A operação escolhida não calcula um preço com desconto.', hint: 'O valor final deve ser 80, não maior que o preço inicial.', explanation: 'Operadores descrevem transformações entre valores. Um desconto reduz o preço inicial.' },
    possibleSolution: 'price ← 100\ndiscount ← 20\nfinalPrice ← price - discount\nPRINT finalPrice',
  },
  'completar-condicao-de-acesso': {
    lessonId: 'condicoes-e-tomada-de-decisao', courseId, moduleId: 'dados-e-decisoes', slug: 'completar-condicao-de-acesso', type: 'complete_code', title: 'Complete a condição de acesso', description: 'Complete uma comparação que inclui pessoas com 18 anos ou mais.', instructions: 'Digite o operador de comparação adequado.', starterCode: 'READ age\n\nIF age {{blank}} 18 THEN\n    PRINT "Acesso permitido"\nELSE\n    PRINT "Acesso não permitido"\nEND IF', conceptIds: ['logic.operators', 'logic.condition'], difficulty: 'application', status: 'published', order: 1,
    validation: { acceptedAnswers: ['>='] },
    feedback: { correct: 'Você incluiu corretamente o caso de fronteira: 18 anos.', partiallyCorrect: 'Revise o operador usado no limite.', needsRevision: 'A condição não representa “18 anos ou mais”.', hint: 'Teste mentalmente as idades 17, 18 e 19.', explanation: '“Ou mais” inclui o próprio limite. Por isso, a comparação precisa ser maior ou igual.' },
    possibleSolution: 'READ age\n\nIF age >= 18 THEN\n    PRINT "Acesso permitido"\nELSE\n    PRINT "Acesso não permitido"\nEND IF',
  },
  'completar-limite-do-loop': {
    lessonId: 'repeticoes-e-loops', courseId, moduleId: 'repeticao-e-organizacao', slug: 'completar-limite-do-loop', type: 'complete_code', title: 'Complete o limite do loop', description: 'Defina o limite para mostrar os números de 1 até 5.', instructions: 'Digite o último número que deve ser incluído na repetição.', starterCode: 'FOR counter FROM 1 TO {{blank}}\n    PRINT counter\nEND FOR', conceptIds: ['logic.loop'], difficulty: 'intermediate', status: 'published', order: 1,
    validation: { acceptedAnswers: ['5'] },
    feedback: { correct: 'Você definiu uma repetição com cinco passagens, de 1 até 5.', partiallyCorrect: 'Revise o valor final da sequência.', needsRevision: 'O limite não produz a sequência solicitada.', hint: 'Liste os valores que devem aparecer: 1, 2, 3, 4 e 5.', explanation: 'O limite de um loop determina até onde o contador avança antes de encerrar.' },
    possibleSolution: 'FOR counter FROM 1 TO 5\n    PRINT counter\nEND FOR',
  },
  'completar-funcao-de-soma': {
    lessonId: 'funcoes-e-reutilizacao', courseId, moduleId: 'repeticao-e-organizacao', slug: 'completar-funcao-de-soma', type: 'complete_code', title: 'Complete a função de soma', description: 'Complete o retorno de uma função que reutiliza um cálculo simples.', instructions: 'Digite o operador que a função deve usar para somar seus parâmetros.', starterCode: 'FUNCTION sum(a, b)\n    RETURN a {{blank}} b\nEND FUNCTION', conceptIds: ['logic.function', 'logic.variables'], difficulty: 'intermediate', status: 'published', order: 1,
    validation: { acceptedAnswers: ['+'] },
    feedback: { correct: 'Você completou a operação que a função precisa retornar.', partiallyCorrect: 'Revise a transformação esperada entre os parâmetros.', needsRevision: 'O retorno não produz a soma pedida.', hint: 'A função deve receber dois valores e devolver o total deles.', explanation: 'Parâmetros são valores de entrada. O retorno entrega o resultado que outras partes do algoritmo poderão usar.' },
    possibleSolution: 'FUNCTION sum(a, b)\n    RETURN a + b\nEND FUNCTION',
  },
  'organizar-confirmacao-de-pedido': {
    lessonId: 'decomposicao-de-problemas', courseId, moduleId: 'repeticao-e-organizacao', slug: 'organizar-confirmacao-de-pedido', type: 'order_steps', title: 'Organize a confirmação de um pedido', description: 'Ordene responsabilidades para que uma confirmação só seja mostrada depois das etapas necessárias.', instructions: 'Organize as etapas respeitando o dado que cada uma produz para a próxima.', conceptIds: ['logic.algorithm', 'logic.instructions', 'logic.function'], difficulty: 'application', status: 'published', order: 1,
    steps: [
      { id: 'mostrar-confirmacao', content: 'showConfirmation(total)' },
      { id: 'receber-itens', content: 'readItems()' },
      { id: 'calcular-total', content: 'total ← calculateTotal(items)' },
      { id: 'verificar-pagamento', content: 'checkPayment(total)' },
    ],
    validation: { correctOrder: ['receber-itens', 'calcular-total', 'verificar-pagamento', 'mostrar-confirmacao'] },
    feedback: { correct: 'Você separou e ordenou responsabilidades de acordo com as dependências do pedido.', partiallyCorrect: 'Quase lá. Verifique o que cada etapa precisa receber antes de começar.', needsRevision: 'A confirmação ainda aparece antes de informações essenciais estarem disponíveis.', hint: 'Itens produzem o total; o total é necessário para verificar o pagamento; só então a confirmação faz sentido.', explanation: 'Decompor um problema ajuda a dar responsabilidade clara a cada passo e evita usar valores antes de calculá-los.' },
    possibleSolution: 'readItems()\ntotal ← calculateTotal(items)\ncheckPayment(total)\nshowConfirmation(total)',
  },
  'calculadora-de-media-integrada': {
    lessonId: 'exercicios-de-logica', courseId, moduleId: 'repeticao-e-organizacao', slug: 'calculadora-de-media-integrada', type: 'write_code', title: 'Calculadora de média', description: 'Escreva um algoritmo em pseudocódigo que calcule a média de duas notas e comunique o resultado.', instructions: 'Leia duas notas, calcule a média e mostre “Aprovado” quando a média for maior ou igual a 6. Caso contrário, mostre “Revisar conteúdo”. Use pseudocódigo claro.', starterCode: '# Escreva aqui seu algoritmo em pseudocódigo.', conceptIds: ['logic.input', 'logic.processing', 'logic.output', 'logic.variables', 'logic.operators', 'logic.condition'], difficulty: 'application', status: 'published', order: 1,
    validation: {
      requiredChecks: [
        { id: 'duas-entradas', type: 'minimum_input_operations', minimum: 2, message: 'duas operações de entrada para as notas' },
        { id: 'guardar-media', type: 'contains_assignment', message: 'uma variável para guardar um resultado' },
        { id: 'somar-notas', type: 'contains_addition', message: 'a soma das duas notas' },
        { id: 'dividir-por-dois', type: 'contains_division_by', value: 2, message: 'a divisão da soma por 2' },
        { id: 'decidir-media', type: 'contains_conditional', message: 'uma condição IF ... END IF para decidir o resultado' },
        { id: 'caso-contrario', type: 'contains_else', message: 'um caso ELSE para a média abaixo do limite' },
        { id: 'mostrar-resultado', type: 'contains_output_operation', message: 'uma operação de saída para comunicar o resultado' },
        { id: 'mensagem-aprovado', type: 'contains_text', value: 'aprovado', message: 'a mensagem “Aprovado”' },
        { id: 'mensagem-revisar', type: 'contains_text', value: 'revisar conteudo', message: 'a mensagem “Revisar conteúdo”' },
      ],
    },
    feedback: { correct: 'Sua solução reuniu entradas, cálculo, condição e saídas necessárias.', partiallyCorrect: 'Sua lógica já tem partes importantes, mas ainda precisa completar alguns elementos do problema.', needsRevision: 'A solução ainda não reúne os elementos necessários para resolver o problema proposto.', hint: 'Organize o algoritmo em três momentos: receber notas, calcular a média e decidir qual mensagem mostrar.', explanation: 'Há várias formas válidas de escrever esse algoritmo. O importante é que os dados sejam recebidos, a média seja calculada e a condição escolha a saída correspondente.' },
    possibleSolution: 'READ grade1\nREAD grade2\naverage ← (grade1 + grade2) / 2\n\nIF average >= 6 THEN\n    PRINT "Aprovado"\nELSE\n    PRINT "Revisar conteúdo"\nEND IF',
  },
};

function explanationStep(id, title, content, conceptIds) {
  return { id, type: 'explanation', title, content, conceptIds };
}

function optionStep({ id, type, title, prompt, code, conceptIds, options, correctAnswer, correctFeedback, incorrectFeedback, hint }) {
  return { id, type, title, prompt, ...(code ? { code } : {}), conceptIds, options, correctAnswer, correctFeedback, incorrectFeedback, hint };
}

function textStep({ id, type, title, prompt, code, conceptIds, acceptedAnswers, correctFeedback, incorrectFeedback, hint, placeholder }) {
  return { id, type, title, prompt, ...(code ? { code } : {}), conceptIds, acceptedAnswers, correctFeedback, incorrectFeedback, hint, ...(placeholder ? { placeholder } : {}) };
}

function orderStep({ id, title, prompt, conceptIds, items, correctOrder, correctFeedback, incorrectFeedback, hint }) {
  return { id, type: 'order_code', title, prompt, conceptIds, items, correctOrder, correctFeedback, incorrectFeedback, hint };
}

function writeCodeStep({ id, title, prompt, conceptIds, requiredChecks, requiredFragments, correctFeedback, incorrectFeedback, hint, placeholder }) {
  return {
    id,
    type: 'write_code',
    title,
    prompt,
    conceptIds,
    ...(Array.isArray(requiredChecks) ? { requiredChecks } : {}),
    ...(Array.isArray(requiredFragments) ? { requiredFragments } : {}),
    correctFeedback,
    incorrectFeedback,
    hint,
    placeholder,
  };
}

function interactiveLesson({ id, moduleId, slug, title, description, order, conceptIds, objective, steps, checkpointActivity = false, video }) {
  const previousLesson = fundamentalsLessons[id];
  return {
    [id]: {
      courseId,
      courseSlug,
      moduleId,
      slug,
      title,
      description,
      order,
      status: 'published',
      estimatedMinutes: 7,
      objectives: [objective],
      content: { introduction: steps[0]?.content ?? description, explanation: steps[0]?.content ?? description, examples: [] },
      conceptIds,
      ...(Array.isArray(previousLesson?.sections) ? { sections: previousLesson.sections } : {}),
      ...(video ? { video } : {}),
      steps,
      ...(checkpointActivity ? { checkpointActivity: true } : {}),
    },
  };
}

// A Fase 9.3 mantém os IDs das doze aulas que já eram públicas e insere microaulas
// entre elas. Isso preserva os documentos de progresso históricos sem migração automática.
Object.assign(fundamentalsLessons,
  interactiveLesson({
    id: 'o-que-e-programacao', moduleId: 'introducao-programacao', slug: 'o-que-e-programacao', order: 1,
    title: 'O que é programação?', description: 'Transforme um problema em instruções claras que um computador consegue executar.',
    conceptIds: ['logic.programming', 'logic.instructions'], objective: 'Reconhecer programação como uma forma de descrever soluções precisas.',
    steps: [
      explanationStep('ideia', 'Programar é descrever uma solução', 'Programar é transformar um objetivo em passos que podem ser executados. O computador é rápido e consistente, mas não completa intenções vagas por conta própria.', ['logic.programming']),
      optionStep({ id: 'automacao', type: 'choose_code', title: 'Escolha uma tarefa automatizável', prompt: 'Qual descrição já contém uma regra que um programa pode repetir?', conceptIds: ['logic.programming', 'logic.instructions'], options: [option('vaga', 'Organizar os gastos de um jeito bom.', '“De um jeito bom” não define dados, regra ou resultado observável.'), option('regra', 'Somar os gastos informados e mostrar o total do mês.', 'Há dados de entrada, uma transformação e um resultado claro.'), option('manual', 'Lembrar mentalmente todos os gastos da semana.', 'Uma lembrança sem passos registrados não descreve uma automação.')], correctAnswer: 'regra', correctFeedback: 'Isso mesmo. A regra recebe dados, executa uma transformação e produz um resultado verificável.', incorrectFeedback: 'Ainda falta transformar a intenção em uma sequência observável.', hint: 'Procure uma opção com dados, ação e resultado.' }),
      orderStep({ id: 'sequencia', title: 'Organize uma primeira sequência', prompt: 'Coloque em ordem os passos de um programa que mostra o nome digitado.', conceptIds: ['logic.instructions'], items: [{ id: 'mostrar', content: 'Mostrar o nome na tela' }, { id: 'receber', content: 'Receber o nome informado' }], correctOrder: ['receber', 'mostrar'], correctFeedback: 'Perfeito. O dado precisa existir antes de ser usado.', incorrectFeedback: 'A sequência ainda tenta mostrar um dado antes de recebê-lo.', hint: 'Pergunte em que momento o nome passa a estar disponível.' }),
    ],
  }),
  interactiveLesson({
    id: 'como-computador-executa-instrucoes', moduleId: 'introducao-programacao', slug: 'como-computador-executa-instrucoes', order: 2,
    title: 'Instruções e ordem', description: 'Entenda por que o computador executa cada passo na ordem definida.',
    conceptIds: ['logic.programming', 'logic.instructions'], objective: 'Identificar dependências entre instruções de uma solução.',
    steps: [
      explanationStep('ordem', 'A ordem faz parte da lógica', 'Em geral, o computador executa uma instrução e depois segue para a próxima. Quando um passo usa o resultado de outro, inverter a ordem muda o que o programa consegue fazer.', ['logic.instructions']),
      optionStep({ id: 'dependencia', type: 'find_error', title: 'Encontre o passo fora de ordem', prompt: 'Qual é o problema nesta sequência para mostrar o dobro de um número?', code: '1. Mostrar o dobro\n2. Receber o número\n3. Calcular o dobro', conceptIds: ['logic.instructions'], options: [option('antes', 'O resultado é mostrado antes de o número ser recebido e calculado.', 'Essa é a falha: o valor ainda não existe quando a saída é solicitada.'), option('muito-curto', 'Há poucas instruções para o computador.', 'A quantidade de linhas não é o problema; a dependência entre elas é.'), option('sem-nome', 'O número deveria ter um nome mais longo.', 'Um nome claro ajuda, mas não corrige a ordem dos dados e do cálculo.')], correctAnswer: 'antes', correctFeedback: 'Certo. Primeiro recebemos o dado, depois calculamos e só então mostramos o resultado.', incorrectFeedback: 'Observe qual etapa produz o valor que a próxima precisa usar.', hint: 'A saída depende de um resultado que ainda não foi produzido.' }),
      optionStep({ id: 'saida', type: 'predict_output', title: 'Rastreie a sequência', prompt: 'Se o programa recebe 5, calcula o dobro e mostra o resultado, o que aparece?', conceptIds: ['logic.instructions'], options: [option('cinco', '5', '5 é a entrada; falta aplicar a transformação de dobrar.'), option('dez', '10', 'O dobro de 5 é 10, que é o valor mostrado ao final.'), option('vintecinco', '25', '25 seria 5 multiplicado por 5, não o dobro de 5.')], correctAnswer: 'dez', correctFeedback: 'Correto. Rastrear é acompanhar a entrada, a transformação e a saída.', incorrectFeedback: 'Faça uma etapa por vez: primeiro 5, depois o dobro.', hint: 'Dobrar significa somar o mesmo valor uma vez.' }),
    ],
  }),
  interactiveLesson({
    id: 'algoritmos-e-instrucoes', moduleId: 'introducao-programacao', slug: 'algoritmos-e-instrucoes', order: 3,
    title: 'Seu primeiro algoritmo', description: 'Use uma sequência finita e verificável para resolver uma tarefa simples.',
    conceptIds: ['logic.instructions', 'logic.algorithm'], objective: 'Organizar um algoritmo respeitando os dados de que cada passo depende.',
    video: { provider: 'youtube', videoId: 'mstMhMT_UeA', title: 'Curso de Algoritmos e Lógica de Programação — O que é e como funciona?', channelName: 'Hashtag Programação', language: 'pt-BR', educationalRole: 'Explicação complementar sobre algoritmo, lógica e pseudocódigo para iniciantes.' },
    steps: [
      explanationStep('algoritmo', 'Algoritmo é um plano de passos', 'Um algoritmo organiza instruções para chegar a um resultado e precisa terminar. Antes de codificar, simular uma entrada ajuda a descobrir se a ordem da solução faz sentido.', ['logic.algorithm']),
      orderStep({ id: 'media-ordem', title: 'Monte o algoritmo da média', prompt: 'Organize as linhas para calcular e mostrar a média de duas notas.', conceptIds: ['logic.algorithm', 'logic.instructions'], items: [{ id: 'mostrar', content: 'console.log(media);' }, { id: 'segunda-nota', content: 'const nota2 = 8;' }, { id: 'calcular', content: 'const media = (nota1 + nota2) / 2;' }, { id: 'primeira-nota', content: 'const nota1 = 6;' }], correctOrder: ['primeira-nota', 'segunda-nota', 'calcular', 'mostrar'], correctFeedback: 'Boa organização: as notas existem antes do cálculo, e a média existe antes da saída.', incorrectFeedback: 'Uma das linhas ainda usa uma informação que não foi definida.', hint: 'A média depende das duas notas; a saída depende da média.' }),
      optionStep({ id: 'teste', type: 'choose_output', title: 'Verifique com um caso', prompt: 'Com nota1 igual a 6 e nota2 igual a 8, qual saída confirma o algoritmo?', conceptIds: ['logic.algorithm'], options: [option('seis', '6', 'Esse é apenas o primeiro valor informado.'), option('sete', '7', 'A soma é 14 e 14 dividido por 2 resulta em 7.'), option('catorze', '14', '14 é a soma, mas ainda falta dividir por 2 para obter a média.')], correctAnswer: 'sete', correctFeedback: 'Correto. Um teste concreto mostra se o algoritmo produz a saída esperada.', incorrectFeedback: 'Siga o cálculo completo: some as notas e divida o resultado por 2.', hint: 'A média de dois valores usa a soma dividida por 2.' }),
    ],
  }),
  interactiveLesson({
    id: 'entrada-processamento-saida', moduleId: 'introducao-programacao', slug: 'entrada-processamento-saida', order: 4,
    title: 'Entrada, processamento e saída', description: 'Separe o que um sistema recebe, transforma e apresenta.',
    conceptIds: ['logic.input', 'logic.processing', 'logic.output', 'logic.algorithm'], objective: 'Classificar elementos de um problema em entrada, processamento e saída.',
    steps: [
      explanationStep('eps', 'Todo programa transforma informações', 'Entrada é o que chega ao programa; processamento é a regra aplicada; saída é o resultado comunicado. Uma calculadora recebe números, calcula e mostra um valor.', ['logic.input', 'logic.processing', 'logic.output']),
      optionStep({ id: 'classificar', type: 'choose_output', title: 'Identifique o processamento', prompt: 'Em um app de entrega que recebe distância e valor dos produtos, qual item é processamento?', conceptIds: ['logic.processing'], options: [option('endereco', 'Receber o endereço.', 'O endereço chega ao sistema: ele é uma entrada.'), option('total', 'Calcular desconto, frete e total.', 'Essas regras transformam os dados recebidos.'), option('mostrar', 'Mostrar o tempo estimado.', 'A informação apresentada é uma saída.')], correctAnswer: 'total', correctFeedback: 'Isso mesmo. Processar é aplicar regras aos dados para produzir novos resultados.', incorrectFeedback: 'Diferencie o que chega, o que é transformado e o que é mostrado.', hint: 'Procure a ação que faz cálculos usando as informações recebidas.' }),
      orderStep({ id: 'eps-ordem', title: 'Organize o fluxo', prompt: 'Coloque em ordem o fluxo de uma conversão de temperatura.', conceptIds: ['logic.input', 'logic.processing', 'logic.output'], items: [{ id: 'saida', content: 'Mostrar a temperatura em Fahrenheit' }, { id: 'processar', content: 'Calcular a conversão' }, { id: 'entrada', content: 'Receber a temperatura em Celsius' }], correctOrder: ['entrada', 'processar', 'saida'], correctFeedback: 'Perfeito. Primeiro o dado entra, depois é transformado e então comunicado.', incorrectFeedback: 'A transformação ou a saída aparece antes de existir uma temperatura para usar.', hint: 'A temperatura em Fahrenheit só existe depois do cálculo.' }),
    ],
  }),
  interactiveLesson({
    id: 'dados-valores-e-tipos', moduleId: 'dados-e-decisoes', slug: 'dados-valores-e-tipos', order: 5,
    title: 'Valores e tipos de dado', description: 'Diferencie números, textos e valores lógicos antes de programar com eles.',
    conceptIds: ['logic.data'], objective: 'Escolher a representação adequada para uma informação.',
    steps: [
      explanationStep('tipos', 'Nem todo valor é usado do mesmo jeito', 'Números representam quantidades e podem entrar em cálculos. Textos representam caracteres; valores lógicos representam respostas como verdadeiro ou falso.', ['logic.data']),
      optionStep({ id: 'cadastro', type: 'choose_code', title: 'Escolha a representação correta', prompt: 'Qual valor é mais adequado para registrar se uma pessoa aceitou os termos?', conceptIds: ['logic.data'], options: [option('texto', 'const aceitouTermos = "sim";', 'Texto pode exibir uma resposta, mas uma decisão de sim ou não fica mais clara como valor lógico.'), option('logico', 'const aceitouTermos = true;', 'true representa diretamente uma resposta lógica de sim.'), option('numero', 'const aceitouTermos = 1;', 'Um número pode ser convencionado, mas não comunica a intenção tão claramente quanto true ou false.')], correctAnswer: 'logico', correctFeedback: 'Correto. true e false representam valores lógicos.', incorrectFeedback: 'Pense em como o programa responderá a uma pergunta de sim ou não.', hint: 'Use um valor que já expresse verdadeiro ou falso.' }),
      optionStep({ id: 'idade', type: 'find_error', title: 'Analise um dado de idade', prompt: 'Um formulário recebe a idade como "18". Por que é importante tratá-la conscientemente antes de comparar idades?', conceptIds: ['logic.data'], options: [option('texto', 'Porque "18" é texto; a aparência de número não o torna automaticamente uma quantidade.', 'Esse valor contém caracteres e pode precisar de conversão antes de um cálculo ou comparação.'), option('sempre-numero', 'Porque qualquer valor com algarismos já é número para o programa.', 'A aparência não define como o programa trata o valor.'), option('igual', 'Porque "18" e 18 são sempre a mesma representação.', 'Eles podem parecer iguais para uma pessoa, mas texto e número têm papéis diferentes.')], correctAnswer: 'texto', correctFeedback: 'Exato. A operação pretendida orienta a forma adequada de representar o dado.', incorrectFeedback: 'Observe as aspas: elas indicam caracteres, não uma quantidade pronta para calcular.', hint: 'Compare o papel de "18" com o de 18 em um cálculo.' }),
    ],
  }),
  interactiveLesson({
    id: 'texto-e-numeros', moduleId: 'dados-e-decisoes', slug: 'texto-e-numeros', order: 6,
    title: 'Textos e números em JavaScript', description: 'Veja como declarar valores simples com const e como a sintaxe comunica o tipo.',
    conceptIds: ['logic.data'], objective: 'Reconhecer textos e números em declarações simples de JavaScript.',
    steps: [
      explanationStep('const', 'const cria um nome para um valor', 'Em JavaScript, const declara um valor que não será reatribuído naquele trecho. Aspas indicam texto; valores sem aspas, como 18, podem representar números.', ['logic.data']),
      textStep({ id: 'texto', type: 'fill_code', title: 'Complete um texto', prompt: 'Complete a linha para guardar o nome Lia como texto.', code: 'const nome = ___;', conceptIds: ['logic.data'], acceptedAnswers: ['"Lia"', "'Lia'"], correctFeedback: 'Certo. As aspas mostram que Lia é um texto.', incorrectFeedback: 'O nome precisa ser escrito como texto.', hint: 'Textos em JavaScript ficam entre aspas.' }),
      optionStep({ id: 'numero', type: 'choose_code', title: 'Escolha um número', prompt: 'Qual linha guarda a idade como número?', conceptIds: ['logic.data'], options: [option('com-aspas', 'const idade = "18";', 'Com aspas, 18 é texto.'), option('sem-aspas', 'const idade = 18;', 'Sem aspas, esse valor é numérico.'), option('palavra', 'const idade = dezoito;', 'dezoito não é um número nem um texto válido sem uma definição anterior.')], correctAnswer: 'sem-aspas', correctFeedback: 'Correto. A idade foi declarada como quantidade numérica.', incorrectFeedback: 'A declaração numérica usa o algarismo sem aspas.', hint: 'Procure o valor 18 que não está entre aspas.' }),
    ],
  }),
  interactiveLesson({
    id: 'variaveis-e-memoria', moduleId: 'dados-e-decisoes', slug: 'variaveis-e-memoria', order: 7,
    title: 'Variáveis e memória', description: 'Use let quando um valor precisa mudar durante a execução.',
    conceptIds: ['logic.data', 'logic.variables'], objective: 'Distinguir const de let e acompanhar o valor atual de uma variável.',
    steps: [
      explanationStep('let', 'let permite atualizar um valor', 'Use let para uma informação que poderá receber outro valor, como um saldo. O nome permanece; o valor associado a ele pode mudar conforme as instruções executadas.', ['logic.variables']),
      optionStep({ id: 'declaracao', type: 'choose_code', title: 'Escolha a declaração atualizável', prompt: 'Qual linha permite que saldo seja atualizado depois?', conceptIds: ['logic.variables'], options: [option('const', 'const saldo = 100;', 'const não pode receber uma nova atribuição depois.'), option('let', 'let saldo = 100;', 'let declara uma variável que pode receber outro valor.'), option('sem-valor', 'saldo recebe 100;', 'Essa não é a sintaxe de declaração em JavaScript.')], correctAnswer: 'let', correctFeedback: 'Isso mesmo. let é apropriado quando o valor pode mudar.', incorrectFeedback: 'Pense em qual palavra-chave permite uma nova atribuição.', hint: 'Use let para uma variável atualizável.' }),
      optionStep({ id: 'rastrear', type: 'predict_output', title: 'Rastreie o valor atual', prompt: 'O que aparece ao final?', code: 'let saldo = 100;\nsaldo = 150;\nconsole.log(saldo);', conceptIds: ['logic.variables'], options: [option('cem', '100', '100 foi o valor inicial, mas saldo recebeu um novo valor.'), option('cento-cinquenta', '150', 'A segunda linha substitui o valor guardado por saldo.'), option('duzentos-cinquenta', '250', 'Não existe uma soma entre os dois valores nessa sequência.')], correctAnswer: 'cento-cinquenta', correctFeedback: 'Correto. A variável guarda o valor mais recente atribuído a ela.', incorrectFeedback: 'Leia as linhas em ordem e observe a última atribuição a saldo.', hint: 'saldo recebe 150 antes de ser mostrado.' }),
    ],
  }),
  interactiveLesson({
    id: 'atualizando-variaveis', moduleId: 'dados-e-decisoes', slug: 'atualizando-variaveis', order: 8,
    title: 'Atualizando variáveis', description: 'Use o valor atual de uma variável para calcular e guardar o próximo valor.',
    conceptIds: ['logic.variables'], objective: 'Rastrear uma atualização baseada no valor atual de uma variável.',
    steps: [
      explanationStep('atualizar', 'Uma atualização lê e substitui', 'Na expressão saldo = saldo + 20, o lado direito usa o valor atual e calcula um novo resultado. Depois, esse resultado substitui o valor antigo guardado em saldo.', ['logic.variables']),
      textStep({ id: 'operacao', type: 'complete_line', title: 'Complete a atualização', prompt: 'Digite a linha que acrescenta 20 ao saldo atual.', code: 'let saldo = 150;\n___', conceptIds: ['logic.variables'], acceptedAnswers: ['saldo = saldo + 20;', 'saldo = saldo + 20'], correctFeedback: 'Certo. A atualização usa o valor atual e guarda o novo saldo.', incorrectFeedback: 'A linha precisa ler saldo, somar 20 e atribuir o resultado a saldo.', hint: 'Repita saldo nos dois lados do sinal de atribuição.' }),
      optionStep({ id: 'resultado', type: 'predict_output', title: 'Confira o rastreamento', prompt: 'Qual valor saldo guarda ao final?', code: 'let saldo = 100;\nsaldo = 150;\nsaldo = saldo + 20;', conceptIds: ['logic.variables'], options: [option('cem', '100', 'Esse é o valor inicial, já substituído.'), option('cento-cinquenta', '150', '150 é intermediário; há uma atualização posterior.'), option('cento-setenta', '170', '150 + 20 produz o valor final 170.'), option('duzentos-setenta', '270', 'Não se somam todos os valores que saldo já teve.')], correctAnswer: 'cento-setenta', correctFeedback: 'Perfeito: 100 → 150 → 170.', incorrectFeedback: 'Anote o valor de saldo após cada linha para não somar estados antigos.', hint: 'A última linha parte de 150, não de 100.' }),
    ],
  }),
  interactiveLesson({
    id: 'operadores', moduleId: 'dados-e-decisoes', slug: 'operadores', order: 9,
    title: 'Operadores aritméticos', description: 'Faça cálculos simples com +, -, * e / em JavaScript.',
    conceptIds: ['logic.data', 'logic.variables', 'logic.operators'], objective: 'Aplicar operadores aritméticos para transformar valores.',
    steps: [
      explanationStep('aritmeticos', 'Operadores calculam novos valores', '+ soma, - subtrai, * multiplica e / divide. Uma expressão aritmética produz um número que pode ser guardado em uma variável ou mostrado na tela.', ['logic.operators']),
      textStep({ id: 'desconto', type: 'fill_code', title: 'Complete o cálculo', prompt: 'Complete o operador para calcular o preço depois do desconto.', code: 'const preco = 100;\nconst desconto = 20;\nconst precoFinal = preco ___ desconto;', conceptIds: ['logic.operators'], acceptedAnswers: ['-'], correctFeedback: 'Correto. Um desconto reduz o preço inicial.', incorrectFeedback: 'O preço final precisa ficar menor que 100.', hint: 'Use o operador de subtração.' }),
      optionStep({ id: 'duas-etapas', type: 'choose_output', title: 'Calcule e compare', prompt: 'Qual alternativa descreve corretamente o resultado?', code: 'const preco = 100;\nconst desconto = 20;\nconst precoFinal = preco - desconto;\nconst atendeLimite = precoFinal >= 80;', conceptIds: ['logic.operators', 'logic.variables'], options: [option('correta', 'precoFinal vale 80 e atendeLimite vale true.', '100 - 20 é 80; 80 atende à comparação >= 80.'), option('limite-falso', 'precoFinal vale 80 e atendeLimite vale false.', '>= inclui o próprio limite 80.'), option('soma', 'precoFinal vale 120 e atendeLimite vale true.', 'O desconto deve ser subtraído, não somado.'), option('original', 'precoFinal vale 100 e atendeLimite vale true.', 'A variável precoFinal recebe o resultado da subtração.')], correctAnswer: 'correta', correctFeedback: 'Muito bem. Primeiro ocorre o cálculo; depois a comparação usa o resultado.', incorrectFeedback: 'Resolva a subtração antes de analisar a comparação.', hint: '80 é igual ao limite, e >= inclui igualdade.' }),
    ],
  }),
  interactiveLesson({
    id: 'comparacoes-e-valores-logicos', moduleId: 'dados-e-decisoes', slug: 'comparacoes-e-valores-logicos', order: 10,
    title: 'Comparações e valores lógicos', description: 'Use comparações para produzir true ou false.',
    conceptIds: ['logic.operators'], objective: 'Interpretar comparações como perguntas que produzem valores lógicos.',
    steps: [
      explanationStep('comparar', 'Uma comparação responde uma pergunta', 'Operadores como >, >=, <, <=, === e !== comparam valores. O resultado é true quando a pergunta é verdadeira e false quando ela não é.', ['logic.operators']),
      optionStep({ id: 'idade', type: 'choose_output', title: 'Leia uma comparação', prompt: 'Qual é o resultado de idade >= 18 quando idade vale 17?', code: 'const idade = 17;\nconst podeEntrar = idade >= 18;', conceptIds: ['logic.operators'], options: [option('true', 'true', '17 não atende à condição de ter 18 ou mais.'), option('false', 'false', '17 é menor que 18, então a comparação é falsa.'), option('dezessete', '17', '17 é o valor comparado, não o resultado lógico.')], correctAnswer: 'false', correctFeedback: 'Correto. A comparação responde false porque 17 não alcança o limite.', incorrectFeedback: 'Compare 17 com 18 e observe o operador >=.', hint: '>= pede um valor igual ou maior que 18.' }),
      optionStep({ id: 'igualdade', type: 'choose_code', title: 'Escolha a pergunta de igualdade', prompt: 'Qual expressão pergunta se senhaDigitada tem exatamente o mesmo valor de senhaCorreta?', conceptIds: ['logic.operators'], options: [option('atribuir', 'senhaDigitada = senhaCorreta', 'Essa linha atribui um valor; não faz uma comparação.'), option('igual', 'senhaDigitada === senhaCorreta', '=== compara se os dois valores são iguais.'), option('diferente', 'senhaDigitada !== senhaCorreta', '!== pergunta se os valores são diferentes.')], correctAnswer: 'igual', correctFeedback: 'Isso mesmo. === é usado aqui para comparar igualdade.', incorrectFeedback: 'Diferencie atribuir um valor de fazer uma pergunta sobre dois valores.', hint: 'A comparação de igualdade usa três sinais de igual em JavaScript.' }),
    ],
  }),
  interactiveLesson({
    id: 'primeira-condicao', moduleId: 'dados-e-decisoes', slug: 'primeira-condicao', order: 11,
    title: 'Sua primeira condição', description: 'Use if para executar uma ação somente quando uma regra for verdadeira.',
    conceptIds: ['logic.operators', 'logic.condition'], objective: 'Ler uma condição if simples e prever seu efeito.',
    steps: [
      explanationStep('if', 'if escolhe um caminho', 'A estrutura if verifica uma condição. Se o resultado for true, o bloco entre chaves é executado; se for false, aquele bloco é ignorado.', ['logic.condition']),
      textStep({ id: 'condicao', type: 'complete_line', title: 'Complete a condição', prompt: 'Complete a linha que mostra uma mensagem quando a idade é 18 ou mais.', code: 'const idade = 18;\nif (idade ___ 18) {\n  console.log("Entrada permitida");\n}', conceptIds: ['logic.operators', 'logic.condition'], acceptedAnswers: ['>='], correctFeedback: 'Certo. >= inclui exatamente 18.', incorrectFeedback: 'A regra diz “18 ou mais”, então o limite precisa ser incluído.', hint: 'Teste mentalmente as idades 17, 18 e 19.' }),
      optionStep({ id: 'executar', type: 'predict_output', title: 'Preveja o bloco executado', prompt: 'O que aparece quando o código é executado?', code: 'const idade = 20;\nif (idade >= 18) {\n  console.log("Entrada permitida");\n}', conceptIds: ['logic.condition'], options: [option('permitida', 'Entrada permitida', '20 atende à condição, portanto o bloco if executa.'), option('nada', 'Nada aparece', 'O bloco não é ignorado porque a condição é verdadeira.'), option('negada', 'Entrada negada', 'Essa mensagem não existe neste código.')], correctAnswer: 'permitida', correctFeedback: 'Perfeito. Como 20 é maior que 18, o bloco é executado.', incorrectFeedback: 'Avalie a comparação antes de decidir se o console.log roda.', hint: '20 >= 18 resulta em true.' }),
    ],
  }),
  interactiveLesson({
    id: 'condicoes-e-tomada-de-decisao', moduleId: 'dados-e-decisoes', slug: 'condicoes-e-tomada-de-decisao', order: 12,
    title: 'if e else', description: 'Ofereça um caminho alternativo quando a condição não for atendida.',
    conceptIds: ['logic.operators', 'logic.condition'], objective: 'Escolher entre dois caminhos usando if e else.',
    video: { provider: 'youtube', videoId: 'dd6AbL-hAnE', title: 'Estruturas Condicionais If Else — Aula 3 — Curso de Algoritmos e Lógica de Programação', channelName: 'Hashtag Programação', language: 'pt-BR', educationalRole: 'Explicação complementar sobre condições e operadores comparativos.' },
    steps: [
      explanationStep('else', 'else trata o outro caso', 'Quando uma condição é false, else permite executar um caminho alternativo. Os dois blocos tornam explícito o que acontece em cada situação da regra.', ['logic.condition']),
      optionStep({ id: 'saida', type: 'predict_output', title: 'Rastreie if e else', prompt: 'Qual mensagem aparece para uma nota igual a 5?', code: 'const nota = 5;\nif (nota >= 6) {\n  console.log("Aprovado");\n} else {\n  console.log("Revisar conteúdo");\n}', conceptIds: ['logic.condition', 'logic.operators'], options: [option('aprovado', 'Aprovado', '5 não atende a nota >= 6.'), option('revisar', 'Revisar conteúdo', 'Como a condição é falsa, o bloco else é executado.'), option('duas', 'As duas mensagens', 'if e else escolhem apenas um dos caminhos.')], correctAnswer: 'revisar', correctFeedback: 'Correto. O else atende o caso em que a condição não é verdadeira.', incorrectFeedback: 'Compare 5 com 6 e escolha apenas o bloco correspondente.', hint: '5 >= 6 resulta em false.' }),
      optionStep({ id: 'estrutura', type: 'choose_code', title: 'Escolha uma estrutura completa', prompt: 'Qual opção mostra if e else com os dois caminhos da regra?', conceptIds: ['logic.condition'], options: [option('correta', 'if (saldo >= 0) { console.log("Permitido"); } else { console.log("Bloqueado"); }', 'A condição e os dois caminhos estão explícitos.'), option('sem-condicao', 'else { console.log("Bloqueado"); }', 'else depende de uma condição if anterior.'), option('mensagem', 'console.log("saldo >= 0");', 'Mostrar texto não avalia nem escolhe um caminho.')], correctAnswer: 'correta', correctFeedback: 'Isso mesmo. A estrutura define o que fazer quando a regra é verdadeira e falsa.', incorrectFeedback: 'Uma decisão precisa da pergunta e dos dois possíveis caminhos.', hint: 'Procure uma condição if seguida de else.' }),
    ],
  }),
  interactiveLesson({
    id: 'limites-em-condicoes', moduleId: 'dados-e-decisoes', slug: 'limites-em-condicoes', order: 13,
    title: 'Limites nas condições', description: 'Teste valores de fronteira para escolher o operador correto.',
    conceptIds: ['logic.operators', 'logic.condition'], objective: 'Escolher comparações que incluem ou excluem corretamente um valor limite.',
    steps: [
      explanationStep('fronteira', 'O valor limite merece um teste próprio', 'Palavras como “ou mais” e “no máximo” incluem o limite. Testar um valor abaixo, exatamente no limite e acima dele ajuda a confirmar se a comparação representa a regra.', ['logic.condition', 'logic.operators']),
      optionStep({ id: 'idade', type: 'find_error', title: 'Corrija o caso de fronteira', prompt: 'A regra diz “clientes com 18 anos ou mais podem continuar”, mas o código usa idade > 18. Qual correção é necessária?', conceptIds: ['logic.operators', 'logic.condition'], options: [option('maior-igual', 'Trocar para idade >= 18.', '>= inclui 18 e os valores maiores.'), option('igual', 'Trocar para idade === 18.', 'Isso aceitaria apenas 18 e excluiria 19, 20 e outros valores válidos.'), option('manter', 'Manter idade > 18.', 'Essa condição deixa de fora exatamente quem tem 18.')], correctAnswer: 'maior-igual', correctFeedback: 'Certo. O operador >= representa “18 ou mais”.', incorrectFeedback: 'Teste as idades 17, 18 e 19 contra a regra.', hint: 'O valor do limite também deve ser aceito.' }),
      optionStep({ id: 'maximo', type: 'choose_output', title: 'Aplique “no máximo”', prompt: 'Qual condição permite retirar um livro quando a pessoa tem no máximo 2 empréstimos?', conceptIds: ['logic.operators', 'logic.condition'], options: [option('menor', 'emprestimos < 2', 'Essa condição exclui quem tem exatamente 2 empréstimos.'), option('menor-igual', 'emprestimos <= 2', '<= aceita 0, 1 e 2, como a regra pede.'), option('igual', 'emprestimos === 2', 'Essa condição excluiria quem tem 0 ou 1 empréstimo.')], correctAnswer: 'menor-igual', correctFeedback: 'Perfeito. “No máximo” inclui o próprio limite.', incorrectFeedback: 'Liste os valores que deveriam ser aceitos: 0, 1 e 2.', hint: 'Use uma comparação que aceite o 2.' }),
    ],
  }),
  interactiveLesson({
    id: 'combinando-condicoes', moduleId: 'dados-e-decisoes', slug: 'combinando-condicoes', order: 14,
    title: 'Combinando condições', description: 'Use && quando duas regras precisam ser verdadeiras ao mesmo tempo.',
    conceptIds: ['logic.operators', 'logic.condition'], objective: 'Interpretar uma condição composta simples com &&.',
    steps: [
      explanationStep('e-logico', '&& exige duas respostas verdadeiras', 'O operador && significa “e”. Uma condição como idade >= 18 && aceitouTermos só é true quando as duas partes são verdadeiras.', ['logic.condition', 'logic.operators']),
      textStep({ id: 'completar', type: 'fill_code', title: 'Complete a condição composta', prompt: 'Digite o operador que exige idade suficiente e aceite dos termos.', code: 'if (idade >= 18 ___ aceitouTermos) {\n  console.log("Cadastro liberado");\n}', conceptIds: ['logic.condition'], acceptedAnswers: ['&&'], correctFeedback: 'Correto. && exige que as duas condições sejam verdadeiras.', incorrectFeedback: 'A regra pede as duas exigências ao mesmo tempo.', hint: 'Use o operador lógico “e” de JavaScript.' }),
      optionStep({ id: 'avaliar', type: 'predict_output', title: 'Avalie os dois requisitos', prompt: 'Com idade igual a 20 e aceitouTermos igual a false, a condição idade >= 18 && aceitouTermos resulta em quê?', conceptIds: ['logic.condition'], options: [option('true', 'true', 'A idade atende, mas aceitouTermos é false; as duas partes não são verdadeiras.'), option('false', 'false', '&& só produz true quando ambos os lados são true.'), option('vinte', '20', '20 é um dos valores usados, não o resultado lógico.')], correctAnswer: 'false', correctFeedback: 'Isso mesmo. Um requisito não atendido torna a condição composta falsa.', incorrectFeedback: 'Avalie cada parte antes de combinar os resultados.', hint: 'true && false resulta em false.' }),
    ],
  }),
  interactiveLesson({
    id: 'por-que-repetir', moduleId: 'repeticao-e-organizacao', slug: 'por-que-repetir', order: 15,
    title: 'Por que repetir?', description: 'Reconheça situações em que uma mesma regra precisa ser aplicada várias vezes.',
    conceptIds: ['logic.instructions', 'logic.loop'], objective: 'Identificar um problema que se beneficia de repetição controlada.',
    steps: [
      explanationStep('repeticao', 'Repetir evita copiar a mesma regra', 'Quando uma tarefa é feita para vários itens, copiar linhas iguais dificulta mudanças. Um loop expressa que uma mesma regra será repetida de forma controlada.', ['logic.loop']),
      optionStep({ id: 'escolha', type: 'choose_code', title: 'Encontre um caso de repetição', prompt: 'Qual situação tem um padrão que pode ser repetido por um loop?', conceptIds: ['logic.loop'], options: [option('unica', 'Mostrar uma mensagem de boas-vindas uma única vez.', 'Uma única ação não precisa de repetição.'), option('lista', 'Mostrar cada uma das 20 tarefas de uma lista.', 'A mesma ação de mostrar pode acontecer para cada tarefa.'), option('diferentes', 'Calcular frete, depois enviar e-mail e depois trocar a cor da página.', 'Essas ações têm responsabilidades diferentes, sem um padrão repetido claro.')], correctAnswer: 'lista', correctFeedback: 'Correto. Um loop pode aplicar a mesma ação a cada item da lista.', incorrectFeedback: 'Procure uma situação com a mesma regra aplicada várias vezes.', hint: 'A palavra “cada” costuma indicar repetição.' }),
      optionStep({ id: 'risco', type: 'find_error', title: 'Evite a cópia excessiva', prompt: 'Por que copiar console.log("Lembrete") dez vezes é uma solução frágil?', conceptIds: ['logic.loop', 'logic.instructions'], options: [option('manutencao', 'Porque uma mudança exigirá editar muitas cópias da mesma regra.', 'Um loop centraliza a ação e facilita alterar a quantidade.'), option('impossivel', 'Porque JavaScript proíbe repetir console.log.', 'JavaScript permite, mas repetir linhas não é a melhor organização.'), option('rapido', 'Porque o computador executará uma única linha mais devagar.', 'O problema principal é manutenção e clareza, não essa velocidade.')], correctAnswer: 'manutencao', correctFeedback: 'Exato. Repetição controlada reduz cópias e facilita mudanças.', incorrectFeedback: 'Pense no trabalho de alterar a mesma mensagem em muitos lugares.', hint: 'Uma regra repetida em cópias cria muitos pontos para corrigir.' }),
    ],
  }),
  interactiveLesson({
    id: 'repeticoes-e-loops', moduleId: 'repeticao-e-organizacao', slug: 'repeticoes-e-loops', order: 16,
    title: 'Seu primeiro loop', description: 'Leia um loop for que repete uma ação com um contador.',
    conceptIds: ['logic.variables', 'logic.operators', 'logic.condition', 'logic.loop'], objective: 'Rastrear as passagens de um loop for simples.',
    video: { provider: 'youtube', videoId: 'WdaWoxTiWnU', title: 'Estruturas de Repetição For e While — Aula 4 — Curso de Algoritmos e Lógica de Programação', channelName: 'Hashtag Programação', language: 'pt-BR', educationalRole: 'Explicação complementar sobre contadores, condições de parada e repetição.' },
    steps: [
      explanationStep('for', 'for combina início, condição e atualização', 'Um loop for pode criar um contador, verificar se ele ainda atende ao limite e atualizá-lo depois de cada passagem. Isso torna a quantidade de repetições visível no próprio código.', ['logic.loop']),
      optionStep({ id: 'saida', type: 'choose_output', title: 'Preveja a saída do loop', prompt: 'Quais números aparecem?', code: 'for (let contador = 1; contador <= 3; contador += 1) {\n  console.log(contador);\n}', conceptIds: ['logic.loop', 'logic.variables'], options: [option('um-dois-tres', '1, 2 e 3', 'O contador começa em 1, inclui 3 e depois passa a 4 para encerrar.'), option('zero-um-dois', '0, 1 e 2', 'O contador foi inicializado em 1, não em 0.'), option('um-dois-tres-quatro', '1, 2, 3 e 4', '4 não atende à condição contador <= 3.')], correctAnswer: 'um-dois-tres', correctFeedback: 'Correto. O limite <= 3 inclui o 3 e encerra quando o contador vira 4.', incorrectFeedback: 'Liste os valores aceitos pela condição antes de cada passagem.', hint: 'O contador começa em 1 e só executa enquanto for menor ou igual a 3.' }),
      textStep({ id: 'limite', type: 'complete_line', title: 'Complete o limite', prompt: 'Digite o número que faz o loop mostrar de 1 até 5.', code: 'for (let contador = 1; contador <= ___; contador += 1) {\n  console.log(contador);\n}', conceptIds: ['logic.loop'], acceptedAnswers: ['5'], correctFeedback: 'Perfeito. O 5 também será mostrado porque o operador é <=.', incorrectFeedback: 'O último valor que deve aparecer é 5.', hint: 'O limite deve incluir o último número da sequência.' }),
    ],
  }),
  interactiveLesson({
    id: 'contadores-e-acumuladores', moduleId: 'repeticao-e-organizacao', slug: 'contadores-e-acumuladores', order: 17,
    title: 'Contadores e acumuladores', description: 'Atualize valores dentro de um loop para contar ou somar resultados.',
    conceptIds: ['logic.variables', 'logic.operators', 'logic.loop'], objective: 'Distinguir um contador de um acumulador em uma repetição.',
    steps: [
      explanationStep('contador', 'Valores podem mudar a cada passagem', 'Um contador acompanha quantas vezes algo aconteceu. Um acumulador guarda um total e recebe uma nova soma a cada passagem do loop.', ['logic.variables', 'logic.loop']),
      optionStep({ id: 'total', type: 'predict_output', title: 'Rastreie um acumulador', prompt: 'Qual valor total guarda após o loop?', code: 'let total = 0;\nfor (let numero = 1; numero <= 3; numero += 1) {\n  total = total + numero;\n}', conceptIds: ['logic.variables', 'logic.operators', 'logic.loop'], options: [option('tres', '3', '3 é apenas o último valor de numero; total soma todas as passagens.'), option('seis', '6', 'total passa por 1, depois 3 e por fim 6.'), option('zero', '0', '0 é o início, mas total é atualizado dentro do loop.')], correctAnswer: 'seis', correctFeedback: 'Certo. O acumulador guarda 0 + 1 + 2 + 3.', incorrectFeedback: 'Acompanhe total depois de cada passagem, não apenas o contador.', hint: 'Some 1, depois 2 e depois 3 ao valor já guardado.' }),
      textStep({ id: 'atualizar-contador', type: 'fill_code', title: 'Complete a atualização do contador', prompt: 'Digite a linha que avança o contador em uma unidade.', code: 'let contador = 1;\n// depois de executar o bloco\n___', conceptIds: ['logic.variables', 'logic.loop'], acceptedAnswers: ['contador += 1;', 'contador += 1', 'contador = contador + 1;', 'contador = contador + 1'], correctFeedback: 'Isso mesmo. O contador se aproxima do limite a cada passagem.', incorrectFeedback: 'A atualização precisa aumentar o valor atual em uma unidade.', hint: 'Use += 1 ou atribua contador + 1 de volta a contador.' }),
    ],
  }),
  interactiveLesson({
    id: 'condicoes-de-parada', moduleId: 'repeticao-e-organizacao', slug: 'condicoes-de-parada', order: 18,
    title: 'Condições de parada', description: 'Evite loops infinitos verificando o valor que aproxima a condição do fim.',
    conceptIds: ['logic.variables', 'logic.condition', 'logic.loop'], objective: 'Identificar por que um loop termina ou permanece infinito.',
    steps: [
      explanationStep('parada', 'Todo loop precisa se aproximar do fim', 'Um loop continua enquanto sua condição for true. Para terminar, alguma instrução precisa mudar o valor que a condição observa.', ['logic.loop', 'logic.condition']),
      optionStep({ id: 'erro', type: 'find_error', title: 'Encontre o loop infinito', prompt: 'Qual alteração está faltando neste código?', code: 'let contador = 1;\nwhile (contador <= 3) {\n  console.log(contador);\n}', conceptIds: ['logic.loop', 'logic.variables'], options: [option('atualizar', 'Adicionar contador += 1 dentro do bloco.', 'Assim contador avança até 4 e a condição se torna falsa.'), option('mensagem', 'Adicionar outra mensagem no console.', 'Uma mensagem não muda o valor que controla o loop.'), option('zero', 'Trocar o início para contador = 0 sem outra alteração.', 'Sem atualização, qualquer valor inicial continuará preso na condição.')], correctAnswer: 'atualizar', correctFeedback: 'Correto. O contador precisa mudar para que a condição deixe de ser verdadeira.', incorrectFeedback: 'Pergunte qual valor a condição lê e onde ele é atualizado.', hint: 'contador é usado na condição, mas não muda dentro do bloco.' }),
      optionStep({ id: 'limite', type: 'choose_output', title: 'Teste o momento de parar', prompt: 'Quando o loop abaixo deixa de executar?', code: 'while (contador < 4) {\n  contador += 1;\n}', conceptIds: ['logic.loop', 'logic.condition'], options: [option('tres', 'Quando contador vale 3.', '3 ainda é menor que 4; o loop ainda executa.'), option('quatro', 'Quando contador vale 4.', '4 não é menor que 4, então a condição fica falsa.'), option('nunca', 'Ele nunca para.', 'O contador é atualizado e eventualmente chega a 4.')], correctAnswer: 'quatro', correctFeedback: 'Muito bem. O loop para quando a condição contador < 4 deixa de ser verdadeira.', incorrectFeedback: 'Verifique o primeiro valor que não satisfaz “menor que 4”.', hint: 'O limite não é incluído por <.' }),
    ],
  }),
  interactiveLesson({
    id: 'funcoes-e-reutilizacao', moduleId: 'repeticao-e-organizacao', slug: 'funcoes-e-reutilizacao', order: 19,
    title: 'Por que criar funções?', description: 'Agrupe uma tarefa repetida sob um nome claro e reutilizável.',
    conceptIds: ['logic.instructions', 'logic.variables', 'logic.operators', 'logic.function'], objective: 'Reconhecer uma lógica repetida que deve virar função.',
    steps: [
      explanationStep('funcao', 'Uma função dá nome a uma responsabilidade', 'Quando a mesma lógica aparece em vários lugares, uma função a concentra em um único ponto. Um bom nome revela o que a tarefa faz, como calcularTotal ou mostrarBoasVindas.', ['logic.function']),
      optionStep({ id: 'duplicacao', type: 'find_error', title: 'Reduza a lógica duplicada', prompt: 'Três telas calculam preço vezes quantidade. Qual mudança organiza melhor o código?', conceptIds: ['logic.function'], options: [option('funcao', 'Criar calcularTotal(preco, quantidade) e chamá-la nas três telas.', 'A fórmula fica em um lugar e pode ser reutilizada com dados diferentes.'), option('copiar', 'Copiar a mesma fórmula em uma quarta tela.', 'Mais cópias criam mais pontos para corrigir depois.'), option('nomes', 'Trocar os nomes das variáveis em cada tela, mantendo as cópias.', 'Nomes diferentes não eliminam a repetição da mesma responsabilidade.')], correctAnswer: 'funcao', correctFeedback: 'Correto. A função concentra uma regra repetida e deixa a intenção explícita.', incorrectFeedback: 'Procure a opção que remove cópias sem esconder o cálculo.', hint: 'A mesma fórmula deve ter uma única definição reutilizável.' }),
      optionStep({ id: 'nome', type: 'choose_code', title: 'Escolha um nome responsável', prompt: 'Qual nome descreve melhor uma função que recebe um valor e calcula seu desconto?', conceptIds: ['logic.function'], options: [option('generico', 'function fazerTudo(valor) { }', '“Fazer tudo” não explica a responsabilidade.'), option('desconto', 'function calcularDesconto(valor) { }', 'O nome comunica a tarefa e o parâmetro mostra o dado de entrada.'), option('vago', 'function coisa(valor) { }', '“Coisa” não ajuda a entender o objetivo da função.')], correctAnswer: 'desconto', correctFeedback: 'Isso mesmo. Um nome claro torna a função mais fácil de ler e reutilizar.', incorrectFeedback: 'Prefira um nome que descreva a tarefa específica.', hint: 'A função deve dizer que calcula desconto.' }),
    ],
  }),
  interactiveLesson({
    id: 'criando-uma-funcao', moduleId: 'repeticao-e-organizacao', slug: 'criando-uma-funcao', order: 20,
    title: 'Criando uma função', description: 'Defina uma função JavaScript e chame-a para executar uma tarefa.',
    conceptIds: ['logic.instructions', 'logic.function'], objective: 'Distinguir a definição de uma função de sua chamada.',
    steps: [
      explanationStep('definir', 'Definir não é o mesmo que chamar', 'A definição informa o que a função fará; a chamada pede que ela execute. Em JavaScript, function nome() { } cria a função e nome() a chama.', ['logic.function']),
      orderStep({ id: 'ordem', title: 'Organize uma função simples', prompt: 'Coloque as linhas na ordem para definir e usar uma função de saudação.', conceptIds: ['logic.function', 'logic.instructions'], items: [{ id: 'chamar', content: 'mostrarOla();' }, { id: 'fim', content: '}' }, { id: 'corpo', content: '  console.log("Olá");' }, { id: 'inicio', content: 'function mostrarOla() {' }], correctOrder: ['inicio', 'corpo', 'fim', 'chamar'], correctFeedback: 'Perfeito. Primeiro definimos a função; depois fazemos a chamada.', incorrectFeedback: 'O bloco da função precisa começar e terminar antes de ser chamado.', hint: 'A chave de fechamento encerra a definição antes da chamada.' }),
      optionStep({ id: 'chamada', type: 'choose_output', title: 'Identifique a chamada', prompt: 'Qual linha executa uma função chamada mostrarOla?', conceptIds: ['logic.function'], options: [option('definicao', 'function mostrarOla() { }', 'Essa linha define a função, mas não a executa.'), option('chamada', 'mostrarOla();', 'Os parênteses após o nome fazem a chamada.'), option('texto', 'console.log("mostrarOla");', 'Isso mostra um texto; não chama a função.')], correctAnswer: 'chamada', correctFeedback: 'Correto. mostrarOla() pede a execução da função definida.', incorrectFeedback: 'A chamada usa o nome da função seguido de parênteses.', hint: 'Procure o nome sem a palavra function e com ().' }),
    ],
  }),
  interactiveLesson({
    id: 'parametros-de-funcao', moduleId: 'repeticao-e-organizacao', slug: 'parametros-de-funcao', order: 21,
    title: 'Parâmetros de função', description: 'Envie valores para uma função usar em uma tarefa reutilizável.',
    conceptIds: ['logic.variables', 'logic.function'], objective: 'Relacionar parâmetros a valores enviados na chamada de uma função.',
    steps: [
      explanationStep('parametros', 'Parâmetros recebem dados da chamada', 'Parâmetros são nomes definidos entre os parênteses da função. Ao chamar a função, fornecemos valores que ela poderá usar dentro do seu bloco.', ['logic.function', 'logic.variables']),
      optionStep({ id: 'resultado', type: 'predict_output', title: 'Rastreie um parâmetro', prompt: 'O que aparece ao executar a chamada?', code: 'function mostrarNome(nome) {\n  console.log(nome);\n}\nmostrarNome("Lia");', conceptIds: ['logic.function'], options: [option('nome', 'nome', 'nome é o parâmetro, que recebe o valor fornecido na chamada.'), option('lia', 'Lia', 'A chamada entrega "Lia" ao parâmetro nome.'), option('nada', 'Nada aparece', 'A função é chamada e executa console.log(nome).')], correctAnswer: 'lia', correctFeedback: 'Certo. O parâmetro nome recebe o valor "Lia" durante essa chamada.', incorrectFeedback: 'Veja qual valor está dentro dos parênteses da chamada.', hint: 'mostrarNome recebe "Lia".' }),
      textStep({ id: 'declarar', type: 'complete_line', title: 'Complete o parâmetro', prompt: 'Complete a função que mostra a cidade recebida.', code: 'function mostrarCidade(___) {\n  console.log(cidade);\n}', conceptIds: ['logic.function'], acceptedAnswers: ['cidade'], correctFeedback: 'Perfeito. cidade é o nome do parâmetro usado dentro da função.', incorrectFeedback: 'O console.log usa um nome que precisa ser recebido pela função.', hint: 'Use cidade como parâmetro.' }),
    ],
  }),
  interactiveLesson({
    id: 'retorno-de-funcoes', moduleId: 'repeticao-e-organizacao', slug: 'retorno-de-funcoes', order: 22,
    title: 'Retorno de funções', description: 'Use return para entregar um resultado de volta a quem chamou a função.',
    conceptIds: ['logic.variables', 'logic.operators', 'logic.function'], objective: 'Interpretar o valor retornado por uma função simples.',
    steps: [
      explanationStep('return', 'return entrega o resultado da tarefa', 'Uma função que calcula algo pode usar return para devolver um valor. Quem chamou a função pode guardar esse retorno em uma variável ou usá-lo em outra expressão.', ['logic.function']),
      textStep({ id: 'retornar', type: 'fill_code', title: 'Complete o retorno', prompt: 'Digite a palavra que devolve a soma de a e b.', code: 'function somar(a, b) {\n  ___ a + b;\n}', conceptIds: ['logic.function'], acceptedAnswers: ['return'], correctFeedback: 'Correto. return devolve o resultado da função.', incorrectFeedback: 'A função precisa enviar o valor calculado de volta para quem a chamou.', hint: 'Use a palavra return antes da expressão.' }),
      optionStep({ id: 'usar-retorno', type: 'predict_output', title: 'Use o retorno', prompt: 'O que aparece ao final?', code: 'function dobrar(numero) {\n  return numero * 2;\n}\nconst resultado = dobrar(4);\nconsole.log(resultado);', conceptIds: ['logic.function', 'logic.variables'], options: [option('quatro', '4', '4 é o valor enviado; a função devolve o dobro.'), option('oito', '8', 'dobrar(4) retorna 8, que é guardado em resultado.'), option('dezesseis', '16', 'A função multiplica por 2 apenas uma vez.')], correctAnswer: 'oito', correctFeedback: 'Excelente. O retorno 8 é guardado em resultado e então mostrado.', incorrectFeedback: 'Siga o valor enviado, a multiplicação dentro da função e o retorno.', hint: '4 multiplicado por 2 resulta em 8.' }),
    ],
  }),
  interactiveLesson({
    id: 'decomposicao-de-problemas', moduleId: 'repeticao-e-organizacao', slug: 'decomposicao-de-problemas', order: 23,
    title: 'Decompondo um problema', description: 'Separe um problema maior em responsabilidades pequenas e conectadas.',
    conceptIds: ['logic.algorithm', 'logic.instructions', 'logic.function'], objective: 'Organizar uma solução em etapas com responsabilidades claras.',
    steps: [
      explanationStep('decompor', 'Problemas grandes ficam mais claros em partes', 'Em vez de “processar pedido”, separe receber itens, calcular total, verificar pagamento e mostrar confirmação. Cada parte pode ser entendida e testada com mais clareza.', ['logic.algorithm', 'logic.function']),
      orderStep({ id: 'pedido', title: 'Organize um pedido', prompt: 'Coloque as responsabilidades na ordem em que seus resultados ficam disponíveis.', conceptIds: ['logic.algorithm', 'logic.instructions', 'logic.function'], items: [{ id: 'confirmar', content: 'mostrarConfirmacao(total)' }, { id: 'pagamento', content: 'verificarPagamento(total)' }, { id: 'itens', content: 'const itens = receberItens();' }, { id: 'total', content: 'const total = calcularTotal(itens);' }], correctOrder: ['itens', 'total', 'pagamento', 'confirmar'], correctFeedback: 'Certo. Cada etapa recebe um dado já produzido pela anterior.', incorrectFeedback: 'Uma etapa ainda tenta usar itens ou total antes de esses dados existirem.', hint: 'Receba itens antes de calcular total; calcule total antes de verificar ou confirmar.' }),
      optionStep({ id: 'responsabilidade', type: 'choose_code', title: 'Escolha uma responsabilidade clara', prompt: 'Qual função tem uma responsabilidade mais bem definida?', conceptIds: ['logic.function'], options: [option('tudo', 'function processarTudo() { }', 'O nome esconde muitas tarefas possíveis.'), option('total', 'function calcularTotal(itens) { }', 'O nome indica exatamente o resultado que a função deve produzir.'), option('coisa', 'function fazerCoisa(itens) { }', '“Coisa” não comunica a tarefa da função.')], correctAnswer: 'total', correctFeedback: 'Muito bem. Uma responsabilidade clara facilita ler, testar e modificar o código.', incorrectFeedback: 'Prefira um nome que diga qual tarefa específica será executada.', hint: 'Procure a função que descreve o resultado calculado.' }),
    ],
  }),
  interactiveLesson({
    id: 'exercicios-de-logica', moduleId: 'repeticao-e-organizacao', slug: 'exercicios-de-logica', order: 24,
    title: 'Desafio integrado de lógica', description: 'Combine dados, condições, loops e funções em uma pequena solução JavaScript.',
    conceptIds: ['logic.programming', 'logic.instructions', 'logic.algorithm', 'logic.input', 'logic.processing', 'logic.output', 'logic.data', 'logic.variables', 'logic.operators', 'logic.condition', 'logic.loop', 'logic.function'], objective: 'Aplicar os fundamentos do curso em uma solução curta e organizada.', checkpointActivity: true,
    steps: [
      explanationStep('integrar', 'Agora organize uma solução completa', 'Uma solução integrada pode receber dados, calcular um resultado, tomar uma decisão e mostrar uma saída. Não tente resolver tudo de uma vez: siga a dependência entre as partes.', ['logic.algorithm', 'logic.instructions']),
      optionStep({ id: 'rastrear', type: 'choose_output', title: 'Rastreie uma solução integrada', prompt: 'Qual mensagem será mostrada?', code: 'function calcularTotal(preco, quantidade) {\n  return preco * quantidade;\n}\nconst total = calcularTotal(20, 3);\nif (total >= 50) {\n  console.log("Frete grátis");\n} else {\n  console.log("Frete cobrado");\n}', conceptIds: ['logic.function', 'logic.variables', 'logic.operators', 'logic.condition', 'logic.output'], options: [option('gratis', 'Frete grátis', '20 * 3 resulta em 60, e 60 atende a total >= 50.'), option('cobrado', 'Frete cobrado', 'A condição não compara a quantidade 3; compara o total 60.'), option('nenhuma', 'Nenhuma mensagem', 'A função retorna um total e a condição escolhe um dos dois blocos.')], correctAnswer: 'gratis', correctFeedback: 'Correto. A função devolve 60, e a condição seleciona a primeira mensagem.', incorrectFeedback: 'Rastreie: parâmetros → retorno da função → variável total → condição.', hint: '20 multiplicado por 3 é 60.' }),
      writeCodeStep({
        id: 'escrever',
        title: 'Escreva uma solução curta',
        prompt: 'Escreva JavaScript que guarde 2 e 3 em variáveis, calcule a soma em total e mostre total no console.',
        conceptIds: ['logic.variables', 'logic.operators', 'logic.output'],
        requiredChecks: [
          { id: 'primeiro-valor', type: 'declares_value', value: '2', message: 'Declare uma variável com o valor 2.' },
          { id: 'segundo-valor', type: 'declares_value', value: '3', message: 'Declare uma variável com o valor 3.' },
          { id: 'calculo-total', type: 'declares_sum', variable: 'total', message: 'Calcule a soma e guarde o resultado em total.' },
          { id: 'mostrar-total', type: 'logs_variable', variable: 'total', message: 'Mostre total com console.log(total).' },
        ],
        correctFeedback: 'Boa solução. Você declarou valores, calculou um total e comunicou o resultado.',
        incorrectFeedback: 'A solução ainda não reúne todos os elementos pedidos.',
        hint: 'Crie duas variáveis, use + para somar e passe total para console.log.',
        placeholder: 'let primeiroNumero = 2;\nlet segundoNumero = 3;\n// continue aqui',
      }),
    ],
  })
);

// Etapas adicionais com finalidades distintas: elas aprofundam o raciocínio de cada
// microaula sem repetir a mesma pergunta com outra redação.
const interactivePracticeExtensions = {
  'algoritmos-e-instrucoes': [
    textStep({ id: 'media-divisor', type: 'fill_code', title: 'Complete o cálculo da média', prompt: 'Complete o divisor para calcular a média de duas notas.', code: 'const media = (nota1 + nota2) / ___;', conceptIds: ['logic.algorithm'], acceptedAnswers: ['2'], correctFeedback: 'Correto. A média de duas notas divide a soma por 2.', incorrectFeedback: 'Há duas notas na soma, então o total deve ser dividido pela quantidade de valores.', hint: 'Conte quantas notas participam do cálculo.' }),
  ],
  'entrada-processamento-saida': [
    optionStep({ id: 'pedido-eps', type: 'choose_code', title: 'Separe as partes de um pedido', prompt: 'Em uma loja, qual sequência classifica corretamente endereço, cálculo do frete e valor mostrado?', conceptIds: ['logic.input', 'logic.processing', 'logic.output'], options: [option('correta', 'Entrada: endereço; processamento: calcular frete; saída: mostrar total.', 'O endereço é recebido, o frete é calculado e o total é informado.'), option('troca', 'Entrada: calcular frete; processamento: endereço; saída: mostrar total.', 'Calcular frete transforma dados; não é um dado recebido.'), option('saida', 'Entrada: endereço; processamento: mostrar total; saída: calcular frete.', 'Mostrar total comunica o resultado, enquanto calcular frete é a transformação.')], correctAnswer: 'correta', correctFeedback: 'Muito bem. O fluxo começa com dados, aplica uma regra e comunica o resultado.', incorrectFeedback: 'Pergunte qual elemento chega ao sistema, qual faz o cálculo e qual é exibido.', hint: 'O endereço é informado antes de qualquer cálculo.' }),
  ],
  'dados-valores-e-tipos': [
    optionStep({ id: 'aceite', type: 'choose_code', title: 'Represente uma escolha', prompt: 'Qual declaração representa melhor se a pessoa aceitou os termos?', conceptIds: ['logic.data'], options: [option('logico', 'const aceitouTermos = true;', 'true representa diretamente uma resposta de sim ou não.'), option('texto', 'const aceitouTermos = "sim";', 'Esse texto pode ser exibido, mas não é a representação lógica mais direta para uma escolha.'), option('numero', 'const aceitouTermos = 1;', 'Um número pode ser usado por convenção, mas não comunica tão claramente uma decisão quanto true ou false.')], correctAnswer: 'logico', correctFeedback: 'Certo. Valores lógicos representam escolhas com true ou false.', incorrectFeedback: 'A informação é uma decisão, não uma medida nem um texto para exibir.', hint: 'Pense em uma resposta que só pode ser sim ou não.' }),
  ],
  'texto-e-numeros': [
    optionStep({ id: 'mostrar-texto', type: 'predict_output', title: 'Leia um texto guardado', prompt: 'O que aparece no console?', code: 'const cidade = "Recife";\nconsole.log(cidade);', conceptIds: ['logic.data'], options: [option('recife', 'Recife', 'A variável cidade guarda o texto Recife e ele é mostrado no console.'), option('cidade', 'cidade', 'cidade é o nome da variável; o valor guardado nela é Recife.'), option('aspas', '"Recife" com as aspas', 'As aspas fazem parte da escrita do texto no código, não do valor exibido.')], correctAnswer: 'recife', correctFeedback: 'Correto. O programa mostra o valor de texto armazenado na variável.', incorrectFeedback: 'Diferencie o nome da variável do texto que ela guarda.', hint: 'Veja o valor depois do sinal de igual.' }),
  ],
  'variaveis-e-memoria': [
    optionStep({ id: 'const-ou-let', type: 'find_error', title: 'Escolha a declaração que pode mudar', prompt: 'Qual declaração impede atualizar a pontuação depois?', conceptIds: ['logic.variables'], options: [option('const', 'const pontos = 0;', 'const é adequado quando o valor não muda; para uma pontuação atualizável, use let.'), option('let', 'let pontos = 0;', 'let permite guardar um novo valor em pontos mais adiante.'), option('nome', 'let pontuacaoAtual = 0;', 'O nome pode variar; o importante é usar let quando o valor será atualizado.')], correctAnswer: 'const', correctFeedback: 'Isso mesmo. Uma pontuação que muda precisa de uma variável declarada com let.', incorrectFeedback: 'Observe qual palavra reserva um valor que não deve receber nova atribuição.', hint: 'Escolha a opção que não permite reatribuir o valor.' }),
  ],
  'atualizando-variaveis': [
    textStep({ id: 'somar-saldo', type: 'complete_line', title: 'Atualize usando o valor atual', prompt: 'Escreva a linha que adiciona 20 ao saldo atual.', code: 'let saldo = 150;\n// complete a atualização\n___', conceptIds: ['logic.variables'], acceptedAnswers: ['saldo = saldo + 20;', 'saldo = saldo + 20', 'saldo += 20;', 'saldo += 20'], correctFeedback: 'Correto. A nova atribuição usa o saldo atual e guarda 170 no mesmo lugar.', incorrectFeedback: 'A expressão deve usar saldo dos dois lados: como valor atual e como local para guardar o resultado.', hint: 'Some 20 ao valor que já está em saldo.' }),
  ],
  operadores: [
    optionStep({ id: 'precedencia', type: 'predict_output', title: 'Calcule uma expressão em etapas', prompt: 'Qual é o valor de total?', code: 'const total = (10 + 2) * 3;\nconsole.log(total);', conceptIds: ['logic.operators'], options: [option('trinta-seis', '36', 'Os parênteses fazem 10 + 2 primeiro; 12 * 3 resulta em 36.'), option('dezesseis', '16', 'Esse resultado não aplica a multiplicação por 3 depois da soma.'), option('quarenta', '40', 'Não há soma de 10 com 2 * 3 nesse código: os parênteses mudam a ordem.')], correctAnswer: 'trinta-seis', correctFeedback: 'Perfeito. Primeiro resolvemos a operação entre parênteses, depois multiplicamos.', incorrectFeedback: 'Comece pelo trecho entre parênteses antes de aplicar o operador seguinte.', hint: '10 + 2 resulta em 12.' }),
  ],
  'comparacoes-e-valores-logicos': [
    optionStep({ id: 'resultado-logico', type: 'choose_output', title: 'Interprete uma comparação', prompt: 'Qual valor será guardado em temAcesso?', code: 'const temAcesso = 5 > 3;', conceptIds: ['logic.operators'], options: [option('true', 'true', '5 é maior que 3, portanto a comparação é verdadeira.'), option('false', 'false', 'false seria o resultado se a afirmação 5 > 3 não fosse verdadeira.'), option('cinco', '5', 'A comparação produz um valor lógico, não repete o primeiro número.')], correctAnswer: 'true', correctFeedback: 'Correto. Comparações respondem com true ou false.', incorrectFeedback: 'Leia a expressão como uma pergunta: “5 é maior que 3?”.', hint: 'A primeira quantidade é maior que a segunda.' }),
  ],
  'primeira-condicao': [
    optionStep({ id: 'regra-acesso', type: 'choose_code', title: 'Escreva a regra de acesso', prompt: 'Qual condição permite continuar apenas a quem tem 18 anos ou mais?', conceptIds: ['logic.condition', 'logic.operators'], options: [option('maior-ou-igual', 'if (idade >= 18) {\n  console.log("Pode continuar");\n}', '>= inclui a idade limite de 18 anos.'), option('maior', 'if (idade > 18) {\n  console.log("Pode continuar");\n}', '> excluiria quem tem exatamente 18 anos.'), option('menor', 'if (idade < 18) {\n  console.log("Pode continuar");\n}', '< selecionaria justamente quem ainda não atingiu a idade mínima.')], correctAnswer: 'maior-ou-igual', correctFeedback: 'Certo. A condição representa a regra sem excluir o valor de fronteira.', incorrectFeedback: 'A regra diz “18 ou mais”, portanto o próprio 18 precisa passar.', hint: 'Procure o operador que inclui igualdade.' }),
    optionStep({ id: 'igual-ou-atribuicao', type: 'find_error', title: 'Compare, não atribua', prompt: 'Qual linha faz uma comparação de idade com 18 em vez de tentar atribuir um valor?', conceptIds: ['logic.condition', 'logic.operators'], options: [option('comparar', 'if (idade === 18) { }', '=== pergunta se idade tem o mesmo valor que 18.'), option('atribuir', 'if (idade = 18) { }', '= é usado para atribuir um valor, não para testar uma regra.'), option('texto', 'if (idade "18") { }', 'Falta um operador entre idade e o valor comparado.')], correctAnswer: 'comparar', correctFeedback: 'Correto. Dentro de uma condição, === verifica igualdade.', incorrectFeedback: 'Diferencie o operador de atribuição = do operador de comparação ===.', hint: 'A comparação de igualdade usa três sinais de igual.' }),
  ],
  'condicoes-e-tomada-de-decisao': [
    optionStep({ id: 'empate', type: 'predict_output', title: 'Teste os dois caminhos', prompt: 'Qual mensagem aparece quando nota vale 6?', code: 'const nota = 6;\nif (nota >= 6) {\n  console.log("Aprovado");\n} else {\n  console.log("Revisar");\n}', conceptIds: ['logic.condition', 'logic.operators'], options: [option('aprovado', 'Aprovado', '6 atende à condição nota >= 6 e executa o primeiro bloco.'), option('revisar', 'Revisar', 'else só executa quando a condição é falsa; 6 não torna a condição falsa.'), option('ambas', 'As duas mensagens', 'if/else escolhe apenas um dos dois caminhos para essa execução.')], correctAnswer: 'aprovado', correctFeedback: 'Muito bem. A condição verdadeira escolhe o bloco if.', incorrectFeedback: 'Verifique se o valor 6 está incluído em “maior ou igual a 6”.', hint: '>= inclui igualdade.' }),
    textStep({ id: 'palavra-else', type: 'complete_line', title: 'Complete o caminho alternativo', prompt: 'Digite a palavra que inicia o bloco usado quando a condição é falsa.', code: 'if (temIngresso) {\n  console.log("Entrar");\n} ___ {\n  console.log("Comprar ingresso");\n}', conceptIds: ['logic.condition'], acceptedAnswers: ['else'], correctFeedback: 'Correto. else define o caminho alternativo da condição.', incorrectFeedback: 'O segundo bloco é executado quando a primeira condição não é atendida.', hint: 'Use a palavra reservada do caminho alternativo.' }),
    writeCodeStep({
      id: 'escrever-condicao',
      title: 'Escreva uma condição de maioridade',
      prompt: 'Com idade já declarada, escreva uma condição que mostre "Maior de idade" quando idade for maior ou igual a 18.',
      conceptIds: ['logic.condition', 'logic.operators'],
      requiredChecks: [
        { id: 'if', type: 'contains_if', message: 'Sua condição ainda não usa if.' },
        { id: 'comparar-idade', type: 'compares_variable_to_value', variable: 'idade', operator: '>=', value: '18', message: 'Compare idade com 18 usando >=.' },
        { id: 'mensagem', type: 'logs_message', value: 'maior de idade', message: 'Mostre a mensagem "Maior de idade" com console.log.' },
      ],
      correctFeedback: 'Correto. Você criou uma condição que inclui quem tem exatamente 18 anos.',
      incorrectFeedback: 'Revise a estrutura da condição de maioridade.',
      hint: 'Uma condição começa com if e a regra “18 ou mais” usa >=.',
      placeholder: 'if (idade >= 18) {\n  console.log("Maior de idade");\n}',
    }),
  ],
  'limites-em-condicoes': [
    optionStep({ id: 'acima-limite', type: 'predict_output', title: 'Verifique o valor limite', prompt: 'Qual resultado aparece com pontos igual a 100?', code: 'const pontos = 100;\nif (pontos > 100) {\n  console.log("Bônus");\n} else {\n  console.log("Sem bônus");\n}', conceptIds: ['logic.condition', 'logic.operators'], options: [option('sem-bonus', 'Sem bônus', '100 não é maior que 100, então a condição é falsa.'), option('bonus', 'Bônus', 'Para receber Bônus, pontos precisaria ser maior que 100.'), option('erro', 'O programa apresenta erro', 'A comparação e os dois blocos formam uma condição válida.')], correctAnswer: 'sem-bonus', correctFeedback: 'Certo. O operador > não inclui o próprio limite.', incorrectFeedback: 'Compare 100 com 100: eles são iguais, não um maior que o outro.', hint: 'A regra usa >, não >=.' }),
    optionStep({ id: 'corrigir-fronteira', type: 'find_error', title: 'Corrija a regra do limite', prompt: 'A regra é “clientes com 18 anos ou mais podem continuar”. Qual alteração corrige um código que usa idade > 18?', conceptIds: ['logic.condition', 'logic.operators'], options: [option('maior-ou-igual', 'Trocar > por >=.', '>= inclui 18 e também todas as idades maiores.'), option('menor', 'Trocar > por <.', '< escolheria pessoas mais novas, invertendo a regra.'), option('igual', 'Trocar > por ===.', '=== aceitaria apenas 18 e excluiria quem tem 19 ou mais.')], correctAnswer: 'maior-ou-igual', correctFeedback: 'Perfeito. >= representa “18 ou mais” com precisão.', incorrectFeedback: 'A mudança precisa incluir o limite sem excluir valores acima dele.', hint: 'Use um operador que combine maior com igualdade.' }),
  ],
  'combinando-condicoes': [
    optionStep({ id: 'duas-regras', type: 'choose_output', title: 'Avalie duas regras juntas', prompt: 'Qual valor terá podeEntrar?', code: 'const idade = 20;\nconst temDocumento = true;\nconst podeEntrar = idade >= 18 && temDocumento;', conceptIds: ['logic.condition', 'logic.operators'], options: [option('true', 'true', 'As duas partes são verdadeiras: a idade atende ao limite e há documento.'), option('false', 'false', '&& só seria false se uma das partes fosse falsa.'), option('vinte', '20', 'A expressão combinada produz uma decisão lógica, não a idade.')], correctAnswer: 'true', correctFeedback: 'Correto. && exige que as duas regras sejam verdadeiras.', incorrectFeedback: 'Avalie cada condição separadamente antes de combinar os resultados.', hint: '20 >= 18 é verdadeiro e temDocumento também é true.' }),
    textStep({ id: 'operador-e', type: 'fill_code', title: 'Complete a condição combinada', prompt: 'Digite o operador que exige as duas condições verdadeiras.', code: 'if (temCadastro ___ confirmouEmail) {\n  console.log("Acesso liberado");\n}', conceptIds: ['logic.condition', 'logic.operators'], acceptedAnswers: ['&&'], correctFeedback: 'Isso mesmo. && combina duas regras que precisam ser atendidas juntas.', incorrectFeedback: 'A condição pede cadastro e confirmação de e-mail ao mesmo tempo.', hint: 'Em JavaScript, o “e” lógico usa dois sinais de &.' }),
  ],
  'por-que-repetir': [
    optionStep({ id: 'tarefa-repetida', type: 'choose_code', title: 'Reconheça uma repetição útil', prompt: 'Qual tarefa tem uma regra que faz sentido repetir?', conceptIds: ['logic.loop'], options: [option('lista', 'Mostrar cada nome de uma lista de alunos.', 'A mesma ação pode ser aplicada a vários itens da lista.'), option('unico', 'Definir o título fixo de uma página.', 'Um título fixo é escrito uma vez; não há itens semelhantes para percorrer.'), option('decisao', 'Escolher entre duas mensagens para uma única idade.', 'Essa é uma decisão, não uma tarefa repetida para vários itens.')], correctAnswer: 'lista', correctFeedback: 'Certo. Loops evitam repetir manualmente uma mesma ação para vários elementos.', incorrectFeedback: 'Procure uma tarefa que tenha vários itens recebendo o mesmo tratamento.', hint: 'Pense em uma ação feita uma vez para cada aluno.' }),
    optionStep({ id: 'nao-duplicar', type: 'find_error', title: 'Evite cópias manuais', prompt: 'Qual solução fica difícil de manter quando a lista cresce?', conceptIds: ['logic.loop'], options: [option('copias', 'Escrever uma linha de console.log para cada aluno manualmente.', 'Cada novo aluno exige alterar o código e aumenta o risco de esquecer alguém.'), option('repeticao', 'Usar uma estrutura de repetição para tratar cada aluno.', 'A mesma regra atende a qualquer quantidade de alunos da lista.'), option('regra', 'Definir uma ação clara para cada aluno.', 'Uma ação clara é necessária; a repetição pode aplicá-la aos itens.')], correctAnswer: 'copias', correctFeedback: 'Isso mesmo. Copiar a mesma instrução torna a solução frágil quando os dados mudam.', incorrectFeedback: 'A opção problemática é a que obriga editar o programa para cada novo item.', hint: 'Procure a opção que multiplica linhas iguais.' }),
  ],
  'repeticoes-e-loops': [
    optionStep({ id: 'saida-for', type: 'predict_output', title: 'Acompanhe as voltas do loop', prompt: 'Quais valores são mostrados?', code: 'for (let numero = 1; numero <= 3; numero += 1) {\n  console.log(numero);\n}', conceptIds: ['logic.loop', 'logic.variables', 'logic.operators'], options: [option('um-a-tres', '1, 2 e 3', 'O contador começa em 1, aumenta de um em um e inclui 3.'), option('zero-a-dois', '0, 1 e 2', 'O código não começa em 0; começa em 1.'), option('um-a-quatro', '1, 2, 3 e 4', 'Quando numero chega a 4, a condição numero <= 3 fica falsa.')], correctAnswer: 'um-a-tres', correctFeedback: 'Perfeito. O loop executa para 1, 2 e 3 e então para.', incorrectFeedback: 'Observe início, condição e atualização do contador.', hint: 'A condição permite números até 3.' }),
    optionStep({ id: 'atualizacao-for', type: 'find_error', title: 'Encontre a atualização necessária', prompt: 'Qual parte faz o contador avançar em um loop for?', code: 'for (let indice = 0; indice < 3; ___) {\n  console.log(indice);\n}', conceptIds: ['logic.loop', 'logic.variables'], options: [option('avancar', 'indice += 1', 'Essa atualização aproxima indice do limite e permite o fim do loop.'), option('reiniciar', 'indice = 0', 'Reiniciar o contador em cada volta impede que ele chegue ao limite.'), option('mostrar', 'console.log(indice)', 'Mostrar o valor não altera o contador.')], correctAnswer: 'avancar', correctFeedback: 'Correto. A atualização é o que muda o contador a cada volta.', incorrectFeedback: 'O contador precisa receber um valor diferente para se aproximar do limite.', hint: 'Some uma unidade ao índice atual.' }),
    writeCodeStep({
      id: 'escrever-loop',
      title: 'Escreva um loop de 1 até 3',
      prompt: 'Usando a variável contador, escreva um loop for que mostre os números de 1 até 3 no console.',
      conceptIds: ['logic.loop', 'logic.variables', 'logic.operators', 'logic.condition'],
      requiredChecks: [
        { id: 'estrutura-for', type: 'for_counter_range', counter: 'contador', start: 1, end: 3, message: 'O loop precisa iniciar contador em 1, continuar até 3 e atualizá-lo a cada volta.' },
        { id: 'mostrar-contador', type: 'logs_variable', variable: 'contador', message: 'Mostre o valor atual com console.log(contador).' },
      ],
      correctFeedback: 'Muito bem. Seu loop cria um contador, repete enquanto ele vai até 3 e mostra cada valor.',
      incorrectFeedback: 'Revise início, limite, atualização e a linha exibida dentro do loop.',
      hint: 'No for, use contador começando em 1, a condição contador <= 3 e uma atualização de uma unidade.',
      placeholder: 'for (let contador = 1; contador <= 3; contador += 1) {\n  console.log(contador);\n}',
    }),
  ],
  'contadores-e-acumuladores': [
    optionStep({ id: 'escolher-acumulador', type: 'choose_code', title: 'Escolha quem soma valores', prompt: 'Qual variável deve receber cada preço para calcular o total de um carrinho?', conceptIds: ['logic.variables', 'logic.operators', 'logic.loop'], options: [option('total', 'total = total + preco;', 'Um acumulador usa o total atual e adiciona o próximo preço.'), option('contador', 'contador = contador + 1;', 'Isso conta itens, mas não soma os seus preços.'), option('fixo', 'total = preco;', 'Isso substitui o total a cada item e perde os preços anteriores.')], correctAnswer: 'total', correctFeedback: 'Certo. O acumulador preserva o total anterior antes de somar o novo valor.', incorrectFeedback: 'O cálculo precisa usar o total já acumulado e o preço do item atual.', hint: 'A linha deve mencionar total dos dois lados da atribuição.' }),
    optionStep({ id: 'somar-iteracoes', type: 'predict_output', title: 'Rastreie um acumulador', prompt: 'Qual é o valor final de total?', code: 'let total = 0;\nfor (let numero = 1; numero <= 3; numero += 1) {\n  total = total + numero;\n}', conceptIds: ['logic.variables', 'logic.operators', 'logic.loop'], options: [option('seis', '6', 'total recebe 0 + 1, depois 1 + 2 e depois 3 + 3: o resultado é 6.'), option('tres', '3', '3 é o último valor de numero, mas total soma todos os valores.'), option('zero', '0', 'total é atualizado dentro de cada volta; ele não permanece no valor inicial.')], correctAnswer: 'seis', correctFeedback: 'Muito bem. O acumulador guarda a soma parcial a cada passagem.', incorrectFeedback: 'Anote total após cada volta para não confundi-lo com o contador.', hint: 'Some 1, depois 2, depois 3.' }),
  ],
  'condicoes-de-parada': [
    orderStep({ id: 'ordem-while', title: 'Organize um loop que termina', prompt: 'Coloque as linhas na ordem de um loop que mostra 1 e depois encerra.', conceptIds: ['logic.loop', 'logic.variables', 'logic.condition'], items: [{ id: 'fim', content: '}' }, { id: 'atualizar', content: '  contador += 1;' }, { id: 'mostrar', content: '  console.log(contador);' }, { id: 'inicio', content: 'while (contador < 2) {' }, { id: 'declarar', content: 'let contador = 1;' }], correctOrder: ['declarar', 'inicio', 'mostrar', 'atualizar', 'fim'], correctFeedback: 'Certo. O contador é criado antes da condição e atualizado dentro do loop para que ele termine.', incorrectFeedback: 'A variável precisa existir antes da condição, e a atualização precisa acontecer antes de voltar a testar.', hint: 'Comece declarando contador e termine fechando o bloco.' }),
    optionStep({ id: 'infinito', type: 'find_error', title: 'Evite um loop infinito', prompt: 'Por que este loop não termina?', code: 'let contador = 1;\nwhile (contador < 3) {\n  console.log(contador);\n}', conceptIds: ['logic.loop', 'logic.variables', 'logic.condition'], options: [option('sem-atualizacao', 'contador nunca é atualizado dentro do bloco.', 'Como contador continua valendo 1, contador < 3 permanece verdadeiro.'), option('condicao-curta', 'A condição usa poucos caracteres.', 'O tamanho da condição não determina se o loop termina.'), option('console', 'console.log impede a parada.', 'Mostrar um valor não impede a parada; o problema é o contador não mudar.')], correctAnswer: 'sem-atualizacao', correctFeedback: 'Correto. Todo loop precisa de uma mudança que possa tornar sua condição falsa.', incorrectFeedback: 'Pergunte qual linha aproxima contador do limite 3.', hint: 'Procure uma atualização de contador que está faltando.' }),
  ],
  'funcoes-e-reutilizacao': [
    optionStep({ id: 'responsabilidade', type: 'choose_code', title: 'Delimite uma responsabilidade', prompt: 'Qual função organiza melhor a regra de calcular o preço final?', conceptIds: ['logic.function', 'logic.operators'], options: [option('calcular', 'function calcularPrecoFinal(preco, desconto) {\n  return preco - desconto;\n}', 'A função recebe os dados necessários e devolve exatamente o resultado de sua responsabilidade.'), option('misturar', 'function cadastrarECalcular(preco, desconto) {\n  // cria conta e calcula preço\n}', 'Misturar cadastro com cálculo cria responsabilidades diferentes na mesma função.'), option('copiar', 'Repetir preco - desconto em cada tela.', 'Cópias mantêm a regra espalhada em vez de reutilizá-la.')], correctAnswer: 'calcular', correctFeedback: 'Muito bem. Uma função pequena e específica é mais fácil de reutilizar e revisar.', incorrectFeedback: 'A melhor escolha isola apenas o cálculo, sem misturar tarefas diferentes.', hint: 'Procure a opção que recebe preço e desconto e devolve só o valor final.' }),
    optionStep({ id: 'chamada-reutilizada', type: 'predict_output', title: 'Reutilize a mesma regra', prompt: 'Qual valor é mostrado?', code: 'function dobrar(numero) {\n  return numero * 2;\n}\nconsole.log(dobrar(3));', conceptIds: ['logic.function', 'logic.operators'], options: [option('seis', '6', 'A chamada envia 3 e a função devolve 3 multiplicado por 2.'), option('tres', '3', '3 é o argumento enviado, mas a função transforma esse valor antes de devolver.'), option('nove', '9', 'A função usa multiplicação por 2, não por 3.')], correctAnswer: 'seis', correctFeedback: 'Correto. A mesma função pode ser chamada com diferentes valores sem reescrever sua lógica.', incorrectFeedback: 'Siga o argumento 3 até a expressão numero * 2.', hint: 'Dobrar 3 produz 6.' }),
  ],
  'criando-uma-funcao': [
    optionStep({ id: 'definicao-valida', type: 'choose_code', title: 'Defina uma função válida', prompt: 'Qual trecho cria uma função chamada mostrarMensagem?', conceptIds: ['logic.function'], options: [option('funcao', 'function mostrarMensagem() {\n  console.log("Olá");\n}', 'A palavra function, o nome, os parênteses e o bloco formam a definição.'), option('chamada', 'mostrarMensagem();', 'Essa é uma chamada, mas pressupõe que a função já tenha sido definida.'), option('texto', 'const mostrarMensagem = "Olá";', 'Isso guarda um texto, não define um bloco de instruções reutilizável.')], correctAnswer: 'funcao', correctFeedback: 'Certo. A definição descreve o que a função fará quando for chamada.', incorrectFeedback: 'Procure a estrutura que começa com function e abre um bloco de código.', hint: 'Uma definição começa pela palavra function.' }),
    optionStep({ id: 'ordem-definir-chamar', type: 'find_error', title: 'Use a função depois de defini-la', prompt: 'Qual reorganização deixa clara a intenção de definir e depois executar uma saudação?', conceptIds: ['logic.function', 'logic.instructions'], options: [option('definir-primeiro', 'Definir mostrarOla e, na linha seguinte, chamar mostrarOla().', 'A leitura fica clara: primeiro sabemos o que a função faz, depois pedimos sua execução.'), option('somente-chamar', 'Manter apenas mostrarOla().', 'Sem definição, não está claro qual bloco será executado.'), option('texto', 'Mostrar a palavra "mostrarOla" no console.', 'Exibir o nome como texto não executa a função.')], correctAnswer: 'definir-primeiro', correctFeedback: 'Correto. Separar definição e chamada deixa a sequência compreensível.', incorrectFeedback: 'A melhor opção apresenta a função e depois a utiliza.', hint: 'Uma chamada precisa de uma função que já saiba o que fazer.' }),
    writeCodeStep({
      id: 'escrever-funcao',
      title: 'Crie uma função de saudação',
      prompt: 'Crie uma função chamada saudacao que mostre "Olá" quando for executada.',
      conceptIds: ['logic.function'],
      requiredChecks: [
        { id: 'definicao', type: 'defines_function', name: 'saudacao', parameters: [], message: 'Defina a função com function saudacao().' },
        { id: 'mensagem', type: 'logs_message', value: 'ola', message: 'Dentro da função, mostre a mensagem "Olá" com console.log.' },
      ],
      correctFeedback: 'Correto. Você definiu uma função com nome e uma responsabilidade simples.',
      incorrectFeedback: 'Revise como uma função é definida e o que ela deve mostrar.',
      hint: 'Uma função sem parâmetros começa com function, recebe o nome saudacao e abre um bloco entre chaves.',
      placeholder: 'function saudacao() {\n  console.log("Olá");\n}',
    }),
  ],
  'parametros-de-funcao': [
    optionStep({ id: 'enviar-parametro', type: 'choose_code', title: 'Envie o dado pedido', prompt: 'Qual chamada envia "Ana" para a função mostrarNome(nome)?', conceptIds: ['logic.function'], options: [option('ana', 'mostrarNome("Ana");', '"Ana" ocupa a posição do parâmetro nome durante essa chamada.'), option('parametro', 'mostrarNome(nome);', 'nome é usado dentro da função; fora dela, esse identificador pode nem existir.'), option('sem-valor', 'mostrarNome();', 'Sem argumento, a função não recebe o nome que deveria mostrar.')], correctAnswer: 'ana', correctFeedback: 'Isso mesmo. O argumento "Ana" é entregue ao parâmetro nome.', incorrectFeedback: 'A chamada precisa trazer o valor que a função deve usar.', hint: 'Coloque o texto Ana dentro dos parênteses da chamada.' }),
    optionStep({ id: 'parametros-diferentes', type: 'predict_output', title: 'Compare duas chamadas', prompt: 'O que é mostrado pela segunda chamada?', code: 'function mostrarCidade(cidade) {\n  console.log(cidade);\n}\nmostrarCidade("Recife");\nmostrarCidade("Belém");', conceptIds: ['logic.function'], options: [option('belem', 'Belém', 'Na segunda chamada, o parâmetro cidade recebe o novo valor "Belém".'), option('recife', 'Recife', 'Recife foi usado na primeira chamada; cada chamada pode fornecer outro argumento.'), option('ambas', 'Recife e Belém juntos', 'Cada console.log acontece em sua chamada; a pergunta pede apenas a segunda.')], correctAnswer: 'belem', correctFeedback: 'Correto. Parâmetros permitem reutilizar a mesma função com valores diferentes.', incorrectFeedback: 'Observe o argumento da segunda chamada, não o da primeira.', hint: 'A segunda linha de chamada usa Belém.' }),
  ],
  'retorno-de-funcoes': [
    optionStep({ id: 'retorno-ou-mensagem', type: 'choose_code', title: 'Entregue um valor para outra linha usar', prompt: 'Qual corpo de função permite guardar o dobro em uma variável depois da chamada?', conceptIds: ['logic.function', 'logic.operators'], options: [option('return', 'return numero * 2;', 'return entrega o resultado para a expressão que chamou a função.'), option('mostrar', 'console.log(numero * 2);', 'Mostrar informa alguém, mas não devolve o valor para ser guardado na chamada.'), option('texto', '"numero * 2";', 'Um texto não calcula nem devolve o dobro.')], correctAnswer: 'return', correctFeedback: 'Certo. return permite que outro trecho use o resultado calculado.', incorrectFeedback: 'A pergunta pede um valor que possa ser guardado após a chamada.', hint: 'Use a palavra que devolve um resultado da função.' }),
    textStep({ id: 'retornar-total', type: 'complete_line', title: 'Devolva o total calculado', prompt: 'Escreva a linha que devolve a variável total ao final da função.', code: 'function calcularTotal(preco, quantidade) {\n  const total = preco * quantidade;\n  ___\n}', conceptIds: ['logic.function', 'logic.variables', 'logic.operators'], acceptedAnswers: ['return total;', 'return total'], correctFeedback: 'Perfeito. A função entrega o valor guardado em total para quem a chamou.', incorrectFeedback: 'A linha deve usar return seguido da variável que contém o cálculo.', hint: 'Devolva total usando a palavra return.' }),
    writeCodeStep({
      id: 'escrever-retorno',
      title: 'Crie uma função que devolve o dobro',
      prompt: 'Crie uma função chamada dobro que recebe numero e retorna numero * 2.',
      conceptIds: ['logic.function', 'logic.operators'],
      requiredChecks: [
        { id: 'definicao', type: 'defines_function', name: 'dobro', parameters: ['numero'], message: 'Defina a função como function dobro(numero).' },
        { id: 'retorno', type: 'returns_multiplication', variable: 'numero', factor: 2, message: 'A função precisa retornar numero * 2.' },
      ],
      correctFeedback: 'Perfeito. A função recebe um número e devolve o dobro para quem a chamou.',
      incorrectFeedback: 'Revise o nome da função, o parâmetro recebido e o valor devolvido.',
      hint: 'Use return para devolver o cálculo; console.log apenas mostra uma mensagem e não devolve o valor.',
      placeholder: 'function dobro(numero) {\n  return numero * 2;\n}',
    }),
  ],
  'decomposicao-de-problemas': [
    optionStep({ id: 'dados-primeiro', type: 'find_error', title: 'Encontre a dependência ausente', prompt: 'Por que esta sequência não pode calcular o total corretamente?', code: 'const total = calcularTotal(itens);\nconst itens = receberItens();', conceptIds: ['logic.algorithm', 'logic.instructions', 'logic.function'], options: [option('itens-depois', 'itens é usado antes de receber um valor.', 'calcularTotal precisa receber itens que já existam.'), option('nome-total', 'A variável deveria se chamar resultado.', 'Um nome diferente não corrige o uso de um dado antes de ele existir.'), option('funcao-longa', 'calcularTotal deveria ter um nome mais longo.', 'O problema é a ordem das dependências, não o tamanho do nome.')], correctAnswer: 'itens-depois', correctFeedback: 'Correto. Primeiro obtemos os dados; depois uma função pode transformá-los.', incorrectFeedback: 'Veja qual nome aparece na primeira linha antes de ser declarado.', hint: 'itens só recebe um valor na segunda linha.' }),
    optionStep({ id: 'separar-responsabilidades', type: 'choose_code', title: 'Separe as tarefas de um pedido', prompt: 'Qual divisão torna mais claro corrigir apenas o cálculo do total depois?', conceptIds: ['logic.function'], options: [option('separada', 'receberItens(), calcularTotal(itens) e mostrarConfirmacao(total).', 'Cada função tem uma etapa específica, então alterar o cálculo não afeta as outras responsabilidades.'), option('misturada', 'processarPedidoCompleto() com todas as etapas sem separação.', 'Uma única função grande dificulta localizar qual parte precisa mudar.'), option('copiada', 'Repetir o cálculo total em cada tela de confirmação.', 'Cópias espalham a mesma regra e tornam correções inconsistentes.')], correctAnswer: 'separada', correctFeedback: 'Muito bem. Responsabilidades separadas tornam a solução mais legível e ajustável.', incorrectFeedback: 'Procure a opção que isola receber, calcular e comunicar o resultado.', hint: 'Cada nome deve representar uma tarefa pequena.' }),
  ],
  'exercicios-de-logica': [
    orderStep({ id: 'fluxo-integrado', title: 'Organize a solução integrada', prompt: 'Coloque as etapas na ordem em que os dados ficam disponíveis.', conceptIds: ['logic.input', 'logic.processing', 'logic.condition', 'logic.output'], items: [{ id: 'saida', content: 'Mostrar a mensagem escolhida' }, { id: 'decisao', content: 'Verificar se a média atende ao limite' }, { id: 'calculo', content: 'Calcular a média das notas' }, { id: 'entrada', content: 'Receber as duas notas' }], correctOrder: ['entrada', 'calculo', 'decisao', 'saida'], correctFeedback: 'Certo. A decisão depende da média, e a saída depende da decisão.', incorrectFeedback: 'Nenhuma etapa pode usar um dado que ainda não foi recebido ou calculado.', hint: 'Comece pelas notas e termine comunicando a mensagem.' }),
    optionStep({ id: 'limite-integrado', type: 'choose_output', title: 'Teste o caso de fronteira', prompt: 'Qual mensagem o código mostra quando media vale 6?', code: 'const media = 6;\nif (media >= 6) {\n  console.log("Aprovado");\n} else {\n  console.log("Revisar");\n}', conceptIds: ['logic.condition', 'logic.operators', 'logic.output'], options: [option('aprovado', 'Aprovado', 'O valor 6 atende à condição media >= 6.'), option('revisar', 'Revisar', 'else só é usado quando a condição é falsa; aqui ela é verdadeira.'), option('sem-saida', 'Nenhuma mensagem', 'Uma das duas mensagens é sempre escolhida pelo if/else.')], correctAnswer: 'aprovado', correctFeedback: 'Correto. O limite está incluído porque a condição usa >=.', incorrectFeedback: 'Observe se o operador inclui o próprio valor 6.', hint: '>= significa “maior ou igual”.' }),
    optionStep({ id: 'funcao-integrada', type: 'find_error', title: 'Use o resultado da função', prompt: 'Qual linha guarda o retorno de calcularMedia para a condição usar depois?', conceptIds: ['logic.function', 'logic.variables', 'logic.condition'], options: [option('guardar', 'const media = calcularMedia(nota1, nota2);', 'A chamada devolve um valor que é guardado em media para a próxima etapa.'), option('mostrar', 'console.log(calcularMedia);', 'Isso mostra a referência da função, sem chamá-la nem guardar seu resultado.'), option('texto', 'const media = "calcularMedia";', 'Isso guarda apenas um texto com o nome, não o cálculo.')], correctAnswer: 'guardar', correctFeedback: 'Muito bem. A função é chamada, seu retorno é guardado e então pode alimentar uma condição.', incorrectFeedback: 'A solução precisa de parênteses para chamar a função e de uma variável para guardar o retorno.', hint: 'Use calcularMedia com as duas notas dentro dos parênteses.' }),
  ],
};

Object.entries(interactivePracticeExtensions).forEach(([lessonId, additionalSteps]) => {
  const lesson = fundamentalsLessons[lessonId];
  lesson.steps.push(...additionalSteps);
  lesson.estimatedMinutes = Math.max(lesson.estimatedMinutes, 4 + lesson.steps.length);
});

export const fundamentalsCurriculum = {
  courses: {
    'comecando-do-zero-e-logica': {
      trackId: 'fundamentos-desenvolvimento', slug: courseSlug, title: 'Fundamentos de Programação e Lógica', description: 'Construa uma base de raciocínio com passos curtos, interações e JavaScript introdutório.', order: 1, status: 'published', estimatedMinutes: 210,
    },
    'html-e-css': { trackId: 'fundamentos-desenvolvimento', slug: 'html-e-css', title: 'HTML e CSS', description: 'Currículo planejado para estruturar páginas com HTML e criar estilos com CSS.', order: 2, status: 'draft', estimatedMinutes: 520 },
    'javascript-essencial': { trackId: 'fundamentos-desenvolvimento', slug: 'javascript-essencial', title: 'JavaScript Essencial', description: 'Currículo planejado para aplicar lógica e interatividade no navegador com JavaScript.', order: 3, status: 'draft', estimatedMinutes: 660 },
    'projeto-web': { trackId: 'fundamentos-desenvolvimento', slug: 'projeto-web', title: 'Projeto Web', description: 'Currículo planejado para integrar HTML, CSS e JavaScript em uma aplicação simples.', order: 4, status: 'draft', estimatedMinutes: 360 },
  },
  modules: {
    'introducao-programacao': { courseId, title: 'Entendendo programação', description: 'Da ideia de programar à organização de algoritmos e fluxos de dados.', order: 1, status: 'published' },
    'dados-e-decisoes': { courseId, title: 'Dados e decisões', description: 'Valores, variáveis, operadores e regras para escolher caminhos.', order: 2, status: 'published' },
    'repeticao-e-organizacao': { courseId, title: 'Repetição e organização', description: 'Loops e funções para resolver tarefas de forma organizada e reutilizável.', order: 3, status: 'published' },
    'fundamentos-web': { courseId: draftCourseId.htmlCss, title: 'Fundamentos da Web', description: 'Planejado: como páginas são entregues e estruturadas com HTML.', order: 1, status: 'draft' },
    'css-fundamentos': { courseId: draftCourseId.htmlCss, title: 'CSS', description: 'Planejado: apresentação, layout e responsividade com CSS.', order: 2, status: 'draft' },
    'projeto-html-css': { courseId: draftCourseId.htmlCss, title: 'Projeto', description: 'Planejado: uma página completa com HTML e CSS.', order: 3, status: 'draft' },
    'javascript-primeiros-passos': { courseId: draftCourseId.javascript, title: 'Primeiros passos', description: 'Planejado: base de JavaScript.', order: 1, status: 'draft' },
    'javascript-controle': { courseId: draftCourseId.javascript, title: 'Controle', description: 'Planejado: condições, operadores lógicos e loops.', order: 2, status: 'draft' },
    'javascript-organizacao': { courseId: draftCourseId.javascript, title: 'Organização', description: 'Planejado: funções, arrays e objetos.', order: 3, status: 'draft' },
    'javascript-navegador': { courseId: draftCourseId.javascript, title: 'JavaScript no navegador', description: 'Planejado: DOM, eventos e alteração da página.', order: 4, status: 'draft' },
    'projeto-web-fundamentos': { courseId: draftCourseId.project, title: 'Projeto Web', description: 'Planejado: construção guiada de uma aplicação simples.', order: 1, status: 'draft' },
  },
  lessons: { ...fundamentalsLessons, ...draftLessons },
  concepts: {
    'logic.programming': { name: 'Programação', description: 'Planejamento e escrita de instruções para resolver problemas com computadores.', category: 'logic', order: 1, status: 'published' },
    'logic.instructions': { name: 'Instruções', description: 'Passos claros e executáveis que orientam o comportamento de um programa.', category: 'logic', order: 2, status: 'published' },
    'logic.algorithm': { name: 'Algoritmo', description: 'Sequência ordenada e finita de passos para alcançar um resultado.', category: 'logic', order: 3, status: 'published' },
    'logic.input': { name: 'Entrada', description: 'Dados fornecidos a um sistema antes de uma regra ser processada.', category: 'logic', order: 4, status: 'published' },
    'logic.processing': { name: 'Processamento', description: 'Operações e regras que transformam dados em um resultado.', category: 'logic', order: 5, status: 'published' },
    'logic.output': { name: 'Saída', description: 'Resultado ou informação que um sistema comunica após processar dados.', category: 'logic', order: 6, status: 'published' },
    'logic.data': { name: 'Dados e valores', description: 'Informações representadas e manipuladas por um programa.', category: 'logic', order: 7, status: 'published' },
    'logic.variables': { name: 'Variáveis', description: 'Nomes usados para guardar e atualizar valores durante a execução.', category: 'logic', order: 8, status: 'published' },
    'logic.operators': { name: 'Operadores', description: 'Símbolos que calculam, comparam ou combinam valores.', category: 'logic', order: 9, status: 'published' },
    'logic.condition': { name: 'Condições', description: 'Regras que escolhem caminhos de execução a partir de um resultado lógico.', category: 'logic', order: 10, status: 'published' },
    'logic.loop': { name: 'Repetições e loops', description: 'Estruturas que repetem passos com uma condição de controle e parada.', category: 'logic', order: 11, status: 'published' },
    'logic.function': { name: 'Funções', description: 'Blocos nomeados de instruções que organizam e reutilizam uma tarefa.', category: 'logic', order: 12, status: 'published' },
  },
  activities: fundamentalsActivities,
  practicalExercises: fundamentalsPracticalExercises,
};
