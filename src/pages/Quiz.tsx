
import React, { useState } from 'react';
import { CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw, Microscope, Cpu, Rocket, BookOpen, Sparkles, Dna, Shuffle, Church } from 'lucide-react';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  categoryColor: string;
  questionPool: Question[]; // All available questions
}

// Active Quiz State (Subset of questions)
interface ActiveQuizSession {
  categoryId: string;
  title: string;
  questions: Question[];
  categoryColor: string;
}

const QUIZ_POOLS: QuizCategory[] = [
  {
    id: 'tech-expert',
    title: 'Mestre da Tecnologia',
    description: 'De hardware a IA: teste o seu conhecimento sobre a revolução digital.',
    icon: <Cpu className="w-8 h-8" />,
    categoryColor: 'bg-blue-100 text-blue-600',
    questionPool: [
      { text: 'O que significa a sigla "WWW" na navegação web?', options: ['World Wide Web', 'World Web Wide', 'Western Web World', 'Wide Web World'], correctIndex: 0 },
      { text: 'Qual destas linguagens de programação é conhecida por usar indentação para definir blocos de código?', options: ['Java', 'C++', 'Python', 'PHP'], correctIndex: 2 },
      { text: 'Quem é considerado o "pai" da Computação Teórica e Inteligência Artificial?', options: ['Bill Gates', 'Steve Jobs', 'Alan Turing', 'Elon Musk'], correctIndex: 2 },
      { text: 'O que é "Phishing"?', options: ['Um tipo de pescaria digital', 'Uma tentativa fraudulenta de obter dados sensíveis', 'Um software de edição de fotos', 'Um componente de hardware'], correctIndex: 1 },
      { text: 'Qual componente é considerado o "cérebro" do computador?', options: ['Disco Rígido (HD)', 'Memória RAM', 'Placa de Vídeo', 'Processador (CPU)'], correctIndex: 3 },
      { text: 'Qual empresa criou o sistema operativo Android?', options: ['Apple', 'Microsoft', 'Google', 'Samsung'], correctIndex: 2 },
      { text: 'O que significa a sigla PDF?', options: ['Portable Document Format', 'Personal Data File', 'Print Document File', 'Public Digital Format'], correctIndex: 0 },
      { text: 'Qual foi o primeiro computador eletrónico de uso geral?', options: ['ENIAC', 'Univac', 'IBM PC', 'Altair'], correctIndex: 0 },
      { text: 'O que é um "Bug" em informática?', options: ['Um vírus', 'Uma falha no código', 'Um tipo de hardware', 'Um programa espião'], correctIndex: 1 },
      { text: 'Qual é the principal função da memória RAM?', options: ['Armazenar dados permanentemente', 'Processar gráficos', 'Armazenar dados temporários em uso', 'Conectar à internet'], correctIndex: 2 },
      { text: 'Quem fundou a Microsoft?', options: ['Steve Jobs', 'Bill Gates e Paul Allen', 'Mark Zuckerberg', 'Jeff Bezos'], correctIndex: 1 },
      { text: 'O que significa "HTTP"?', options: ['High Transfer Text Protocol', 'HyperText Transfer Protocol', 'Hyper Transfer Text Program', 'Hybrid Text Transfer Protocol'], correctIndex: 1 },
      { text: 'Qual destas é uma distribuição Linux?', options: ['Windows 10', 'macOS', 'Ubuntu', 'iOS'], correctIndex: 2 },
      { text: 'O que é a "Nuvem" (Cloud Computing)?', options: ['Servidores remotos acessíveis via Internet', 'Um satélite', 'Uma rede Wi-Fi local', 'Um tipo de ecrã'], correctIndex: 0 },
      { text: 'Em que ano foi lançado o primeiro iPhone?', options: ['2005', '2007', '2009', '2010'], correctIndex: 1 },
      { text: 'Qual a unidade básica de informação num computador?', options: ['Byte', 'Bit', 'Megabyte', 'Pixel'], correctIndex: 1 },
      { text: 'Quem é a programadora considerada a primeira da história?', options: ['Ada Lovelace', 'Grace Hopper', 'Marie Curie', 'Margaret Hamilton'], correctIndex: 0 },
      { text: 'O que significa IA?', options: ['Informação Aleatória', 'Inteligência Artificial', 'Internet Aberta', 'Interface Avançada'], correctIndex: 1 },
      { text: 'Qual rede social foi criada por Mark Zuckerberg?', options: ['Twitter', 'LinkedIn', 'Facebook', 'TikTok'], correctIndex: 2 },
      { text: 'O que é um algoritmo?', options: ['Um tipo de logaritmo', 'Uma sequência de instruções para resolver um problema', 'Uma peça do computador', 'Um vírus de internet'], correctIndex: 1 }
    ]
  },
  {
    id: 'history-time',
    title: 'Viajante da História',
    description: 'História de Moçambique, África e grandes eventos mundiais.',
    icon: <BookOpen className="w-8 h-8" />,
    categoryColor: 'bg-amber-100 text-amber-600',
    questionPool: [
      { text: 'Em que ano Moçambique conquistou a sua independência?', options: ['1974', '1975', '1980', '1962'], correctIndex: 1 },
      { text: 'Quem foi o primeiro presidente de Moçambique independente?', options: ['Joaquim Chissano', 'Eduardo Mondlane', 'Samora Machel', 'Armando Guebuza'], correctIndex: 2 },
      { text: 'Qual foi o nome da capital de Moçambique antes da independência?', options: ['Lourenço Marques', 'Vila Pery', 'João Belo', 'Porto Amélia'], correctIndex: 0 },
      { text: 'Quem foi o arquiteto da unidade nacional e fundador da FRELIMO?', options: ['Samora Machel', 'Eduardo Mondlane', 'Marcelino dos Santos', 'Josina Machel'], correctIndex: 1 },
      { text: 'Qual era o nome do último imperador do Império de Gaza?', options: ['Mawewe', 'Gungunhana (Ngungunhane)', 'Mzila', 'Shaka Zulu'], correctIndex: 1 },
      { text: 'Onde foram assinados os Acordos Geral de Paz em 1992?', options: ['Maputo', 'Lusaka', 'Roma', 'Lisboa'], correctIndex: 2 },
      { text: 'Qual destas é considerada uma heroína da luta de libertação de Moçambique?', options: ['Josina Machel', 'Rainha Nzinga', 'Graça Machel', 'Lurdes Mutola'], correctIndex: 0 },
      { text: 'A Ilha de Moçambique foi a primeira capital do país. Em que província se situa?', options: ['Cabo Delgado', 'Sofala', 'Nampula', 'Inhambane'], correctIndex: 2 },
      { text: 'Qual grande barragem está localizada no rio Zambeze, em Tete?', options: ['Barragem dos Pequenos Libombos', 'Barragem de Chicamba', 'Barragem de Cahora Bassa', 'Barragem de Massingir'], correctIndex: 2 },
      { text: 'Quem foi Thomas Sankara?', options: ['Líder do Burkina Faso', 'Presidente da África do Sul', 'Rei do Essuatíni', 'Primeiro Ministro do Gana'], correctIndex: 0 },
      { text: 'Qual país africano nunca foi formalmente colonizado?', options: ['Nigéria', 'Etiópia', 'Quénia', 'Angola'], correctIndex: 1 },
      { text: 'Quem foi o líder da luta contra o Apartheid na África do Sul?', options: ['Desmond Tutu', 'Steve Biko', 'Nelson Mandela', 'Jacob Zuma'], correctIndex: 2 },
      { text: 'Qual é o nome do império antigo famoso pelas suas construções de pedra no Zimbabué?', options: ['Império do Mali', 'Grande Zimbabué', 'Reino do Congo', 'Império Zulu'], correctIndex: 1 },
      { text: 'Onde se realizou a conferência que dividiu África pelas potências europeias em 1884?', options: ['Londres', 'Paris', 'Berlim', 'Lisboa'], correctIndex: 2 },
      { text: 'Quem foi Kwame Nkrumah?', options: ['Primeiro presidente do Gana e pan-africanista', 'Líder do Egipto', 'Presidente da Tanzânia', 'Rei de Marrocos'], correctIndex: 0 },
      { text: 'Qual o nome da moeda de Moçambique?', options: ['Rand', 'Kwanza', 'Metical', 'Dólar'], correctIndex: 2 },
      { text: 'O massacre de Mueda ocorreu em que ano?', options: ['1960', '1962', '1955', '1970'], correctIndex: 0 },
      { text: 'Quem pintou a "Mona Lisa"?', options: ['Michelangelo', 'Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso'], correctIndex: 2 },
      { text: 'Em que ano terminou a Segunda Guerra Mundial?', options: ['1945', '1939', '1918', '1950'], correctIndex: 0 },
      { text: 'Qual civilização construiu as pirâmides de Gizé?', options: ['Romanos', 'Maias', 'Gregos', 'Egípcios'], correctIndex: 3 },
      { text: 'Quem foi o primeiro imperador de Roma?', options: ['Júlio César', 'Augusto', 'Nero', 'Trajano'], correctIndex: 1 },
      { text: 'Qual navegador português descobriu o caminho marítimo para a Índia?', options: ['Pedro Álvares Cabral', 'Cristóvão Colombo', 'Vasco da Gama', 'Bartolomeu Dias'], correctIndex: 2 },
      { text: 'A Revolução Francesa iniciou-se em que ano?', options: ['1789', '1800', '1750', '1900'], correctIndex: 0 },
      { text: 'Quem escreveu "Os Lusíadas"?', options: ['Fernando Pessoa', 'Luís de Camões', 'Eça de Queirós', 'Saramago'], correctIndex: 1 }
    ]
  },
  {
    id: 'bio-life',
    title: 'Segredos da Biologia',
    description: 'Explore a vida, desde a célula microscópica até à anatomia humana.',
    icon: <Dna className="w-8 h-8" />,
    categoryColor: 'bg-green-100 text-green-600',
    questionPool: [
      { text: 'Qual é a "central de energia" da célula?', options: ['Núcleo', 'Mitocôndria', 'Ribossoma', 'Citoplasma'], correctIndex: 1 },
      { text: 'Quantos cromossomas tem, normalmente, uma célula humana?', options: ['23', '42', '46', '92'], correctIndex: 2 },
      { text: 'Qual é o maior órgão do corpo humano?', options: ['Fígado', 'Intestino Grosso', 'Cérebro', 'Pele'], correctIndex: 3 },
      { text: 'O que as plantas absorvem para realizar a fotossíntese?', options: ['Oxigénio', 'Dióxido de Carbono', 'Nitrogénio', 'Hélio'], correctIndex: 1 },
      { text: 'Qual tipo sanguíneo é considerado o doador universal?', options: ['A Positivo', 'AB Negativo', 'O Negativo', 'O Positivo'], correctIndex: 2 },
      { text: 'Qual é a molécula que carrega a informação genética?', options: ['RNA', 'Proteína', 'DNA', 'Lípido'], correctIndex: 2 },
      { text: 'Quantos ossos tem o corpo humano adulto?', options: ['206', '300', '150', '250'], correctIndex: 0 },
      { text: 'Qual é a função dos glóbulos vermelhos?', options: ['Combater infeções', 'Coagular o sangue', 'Transportar oxigénio', 'Produzir hormonas'], correctIndex: 2 },
      { text: 'Qual é o maior animal terrestre?', options: ['Elefante Africano', 'Girafa', 'Hipopótamo', 'Rinoceronte'], correctIndex: 0 },
      { text: 'O que estuda a Botânica?', options: ['Animais', 'Rochas', 'Plantas', 'Estrelas'], correctIndex: 2 },
      { text: 'Qual vitamina é produzida pelo corpo quando exposto ao sol?', options: ['Vitamina C', 'Vitamina D', 'Vitamina A', 'Vitamina B12'], correctIndex: 1 },
      { text: 'Onde ocorre a digestão inicial dos alimentos?', options: ['Estômago', 'Boca', 'Intestino', 'Esófago'], correctIndex: 1 },
      { text: 'Os antibióticos são usados para combater:', options: ['Vírus', 'Bactérias', 'Fungos', 'Todos os anteriores'], correctIndex: 1 },
      { text: 'Qual é o músculo mais forte do corpo humano (proporcionalmente)?', options: ['Bíceps', 'Língua', 'Masseter (Mandíbula)', 'Glúteo'], correctIndex: 2 },
      { text: 'Como se chamam os animais que comem plantas e carne?', options: ['Herbívoros', 'Carnívoros', 'Omnívoros', 'Detritívoros'], correctIndex: 2 },
      { text: 'Qual parte do cérebro controla o equilíbrio?', options: ['Cerebelo', 'Lobo Frontal', 'Hipocampo', 'Bulbo'], correctIndex: 0 }
    ]
  },
  {
    id: 'bible-knowledge',
    title: 'Bíblia Sagrada',
    description: 'Teste os seus conhecimentos sobre as histórias, personagens e ensinamentos das Escrituras.',
    icon: <Church className="w-8 h-8" />,
    categoryColor: 'bg-indigo-100 text-indigo-600',
    questionPool: [
      { text: 'Qual é the primeiro livro da Bíblia?', options: ['Êxodo', 'Génesis', 'Salmos', 'Levítico'], correctIndex: 1 },
      { text: 'Quem construiu a arca para salvar a sua família e os animais do dilúvio?', options: ['Moisés', 'Abraão', 'Noé', 'Isaac'], correctIndex: 2 },
      { text: 'Quantos mandamentos foram entregues a Moisés no Monte Sinai?', options: ['7', '10', '12', '40'], correctIndex: 1 },
      { text: 'Quem derrotou o gigante Golias com uma funda e uma pedra?', options: ['Saul', 'Salomão', 'David', 'Sansão'], correctIndex: 2 },
      { text: 'Em que cidade nasceu Jesus?', options: ['Nazaré', 'Jerusalém', 'Belém', 'Jericó'], correctIndex: 2 },
      { text: 'Qual é o último livro do Novo Testamento?', options: ['Judas', 'Apocalipse', 'Hebreus', 'Tiago'], correctIndex: 1 },
      { text: 'Quem foi o homem mais forte da Bíblia, cujo segredo estava no cabelo?', options: ['Gideão', 'Sansão', 'Golias', 'Pedro'], correctIndex: 1 },
      { text: 'Quem liderou os israelitas na saída do Egito, atravessando o Mar Vermelho?', options: ['Josué', 'Moisés', 'José', 'Aarão'], correctIndex: 1 },
      { text: 'Qual apóstolo negou Jesus três vezes antes do galo cantar?', options: ['João', 'Judas Iscariotes', 'Pedro', 'Tomé'], correctIndex: 2 },
      { text: 'Quem foi traído por Judas Iscariotes por 30 moedas de prata?', options: ['Jesus', 'Lázaro', 'João Batista', 'Estêvão'], correctIndex: 0 },
      { text: 'Qual é o livro mais longo da Bíblia, composto por cânticos e orações?', options: ['Provérbios', 'Salmos', 'Isaías', 'Génesis'], correctIndex: 1 },
      { text: 'Quem foi engolido por um grande peixe após tentar fugir da ordem de Deus?', options: ['Jonas', 'Daniel', 'Elias', 'Eliseu'], correctIndex: 0 },
      { text: 'Qual era o nome do jardim onde viviam Adão e Eva?', options: ['Gersêmani', 'Éden', 'Canaã', 'Sinai'], correctIndex: 1 },
      { text: 'Qual filho de Jacob recebeu uma túnica de várias cores e foi vendido pelos irmãos?', options: ['Benjamim', 'Rúben', 'José', 'Judá'], correctIndex: 2 },
      { text: 'Quantos apóstolos Jesus escolheu originalmente para o seguirem?', options: ['10', '12', '7', '40'], correctIndex: 1 },
      { text: 'Quem foi a mãe de Jesus?', options: ['Maria Madalena', 'Marta', 'Maria', 'Isabel'], correctIndex: 2 },
      { text: 'Quem escreveu a maior parte das epístolas (cartas) no Novo Testamento?', options: ['Pedro', 'Lucas', 'Paulo', 'Tiago'], correctIndex: 2 },
      { text: 'Qual foi o primeiro milagre realizado por Jesus segundo o Evangelho de João?', options: ['Curar um cego', 'Andar sobre as águas', 'Transformar água em vinho', 'Multiplicar pães'], correctIndex: 2 },
      { text: 'Qual rei de Israel foi famoso por pedir sabedoria a Deus?', options: ['Saul', 'David', 'Salomão', 'Herodes'], correctIndex: 2 },
      { text: 'Quem foi lançado na cova dos leões mas foi protegido por um anjo?', options: ['Elias', 'Daniel', 'Sadraque', 'Misael'], correctIndex: 1 }
    ]
  },
  {
    id: 'astro-space',
    title: 'Astronomia: Além da Terra',
    description: 'Viaje pelas estrelas, planetas e mistérios do cosmos.',
    icon: <Rocket className="w-8 h-8" />,
    categoryColor: 'bg-purple-100 text-purple-600',
    questionPool: [
      { text: 'Qual é o planeta mais próximo do Sol?', options: ['Vénus', 'Marte', 'Mercúrio', 'Terra'], correctIndex: 2 },
      { text: 'O que é um Buraco Negro?', options: ['Uma estrela sem luz', 'Uma região de gravidade intensa', 'Um buraco na camada de ozono', 'Um planeta gasoso'], correctIndex: 1 },
      { text: 'Qual é o nome da nossa galáxia?', options: ['Andrómeda', 'Via Láctea', 'Triângulo', 'Centaurus A'], correctIndex: 1 },
      { text: 'Em que ano o homem pisou na Lua pela primeira vez?', options: ['1959', '1969', '1971', '1980'], correctIndex: 1 },
      { text: 'Qual planeta do Sistema Solar tem os anéis mais visíveis?', options: ['Júpiter', 'Saturno', 'Urano', 'Neptuno'], correctIndex: 1 },
      { text: 'Qual é o maior planeta do Sistema Solar?', options: ['Saturno', 'Júpiter', 'Terra', 'Neptuno'], correctIndex: 1 },
      { text: 'O Sol é:', options: ['Um planeta', 'Uma estrela', 'Um satélite', 'Um asteróide'], correctIndex: 1 },
      { text: 'Quantas luas tem a Terra?', options: ['1', '2', '0', '3'], correctIndex: 0 },
      { text: 'Qual planeta é conhecido como o "Planeta Vermelho"?', options: ['Vénus', 'Marte', 'Júpiter', 'Mercúrio'], correctIndex: 1 },
      { text: 'Quem foi o primeiro humano a viajar para o espaço?', options: ['Neil Armstrong', 'Yuri Gagarin', 'Buzz Aldrin', 'Laika'], correctIndex: 1 },
      { text: 'O que causa as marés na Terra?', options: ['O vento', 'A rotação da Terra', 'A gravidade da Lua', 'O Sol'], correctIndex: 2 },
      { text: 'O que é um ano-luz?', options: ['Uma medida de tempo', 'Uma medida de distância', 'Uma medida de brilho', 'Uma medida de velocidade'], correctIndex: 1 },
      { text: 'Qual é a estrela mais próxima da Terra?', options: ['Próxima Centauri', 'Sirius', 'O Sol', 'Betelgeuse'], correctIndex: 2 },
      { text: 'Como se chama o telescópio espacial lançado em 1990?', options: ['James Webb', 'Hubble', 'Galileo', 'Kepler'], correctIndex: 1 },
      { text: 'Plutão é classificado atualmente como:', options: ['Planeta', 'Planeta Anão', 'Estrela', 'Satélite'], correctIndex: 1 }
    ]
  },
  {
    id: 'general-science',
    title: 'Ciência Pura',
    description: 'Física, Química e os elementos fundamentais da natureza.',
    icon: <Microscope className="w-8 h-8" />,
    categoryColor: 'bg-teal-100 text-teal-600',
    questionPool: [
      { text: 'Qual é o símbolo químico da água?', options: ['H2O', 'CO2', 'O2', 'NaCl'], correctIndex: 0 },
      { text: 'Qual é a velocidade da luz no vácuo (aproximadamente)?', options: ['300.000 km/s', '1.000 km/s', '150.000 km/s', 'Imensurável'], correctIndex: 0 },
      { text: 'Quem formulou a Teoria da Relatividade?', options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Galileu Galilei'], correctIndex: 1 },
      { text: 'Qual é o elemento mais abundante no universo?', options: ['Oxigénio', 'Carbono', 'Hidrogénio', 'Ferro'], correctIndex: 2 },
      { text: 'O que mede a escala de pH?', options: ['Temperatura', 'Acidez ou alcalinidade', 'Densidade', 'Radioatividade'], correctIndex: 1 },
      { text: 'Qual é o metal líquido à temperatura ambiente?', options: ['Ferro', 'Mercúrio', 'Ouro', 'Prata'], correctIndex: 1 },
      { text: 'Qual a fórmula química do sal de cozinha?', options: ['KCl', 'NaCl', 'HCl', 'NaOH'], correctIndex: 1 },
      { text: 'O que diz a 3ª Lei de Newton?', options: ['Inércia', 'Ação e Reação', 'Gravidade', 'Relatividade'], correctIndex: 1 },
      { text: 'Qual partícula do átomo tem carga negativa?', options: ['Protão', 'Neutrão', 'Eletrão', 'Fotão'], correctIndex: 2 },
      { text: 'O que é a Tabela Periódica?', options: ['Um calendário', 'Uma lista de elementos químicos', 'Uma tabela de preços', 'Um mapa estelar'], correctIndex: 1 },
      { text: 'A que temperatura a água ferve (ao nível do mar)?', options: ['90°C', '100°C', '110°C', '80°C'], correctIndex: 1 },
      { text: 'Quem descobriu a penicilina?', options: ['Louis Pasteur', 'Alexander Fleming', 'Marie Curie', 'Darwin'], correctIndex: 1 },
      { text: 'O diamante é feito de qual elemento?', options: ['Carbono', 'Ferro', 'Silício', 'Ouro'], correctIndex: 0 },
      { text: 'O que é a gravidade?', options: ['Uma força de repulsão', 'Uma força de atração entre massas', 'Eletricidade estática', 'Magnetismo'], correctIndex: 1 }
    ]
  },
  {
    id: 'curiosities-fun',
    title: 'Curiosidades & Fatos',
    description: 'Fatos surpreendentes sobre o mundo que provavelmente desconhece.',
    icon: <Sparkles className="w-8 h-8" />,
    categoryColor: 'bg-pink-100 text-pink-600',
    questionPool: [
      { text: 'Qual animal tem 3 corações?', options: ['Baleia Azul', 'Polvo', 'Elefante', 'Tubarão'], correctIndex: 1 },
      { text: 'Qual é o único alimento que nunca se estraga?', options: ['Arroz', 'Sal', 'Mel', 'Feijão'], correctIndex: 2 },
      { text: 'Quantos dentes tem um ser humano adulto (com sisos)?', options: ['28', '30', '32', '34'], correctIndex: 2 },
      { text: 'Qual é o país mais pequeno do mundo?', options: ['Mónaco', 'Vaticano', 'San Marino', 'Liechtenstein'], correctIndex: 1 },
      { text: 'As impressões digitais dos Koalas são muito parecidas com as de qual outro animal?', options: ['Humanos', 'Macacos', 'Preguiças', 'Ursos'], correctIndex: 0 },
      { text: 'Qual animal dorme de pé?', options: ['Cavalo', 'Cão', 'Gato', 'Leão'], correctIndex: 0 },
      { text: 'Quantos fusos horários tem a Rússia?', options: ['5', '9', '11', '7'], correctIndex: 2 },
      { text: 'Qual é o rio mais longo do mundo?', options: ['Amazonas', 'Nilo', 'Yangtzé', 'Mississipi'], correctIndex: 1 },
      { text: 'Qual é o animal mais rápido do mundo (em terra)?', options: ['Leão', 'Chita (Guepardo)', 'Gazela', 'Cavalo'], correctIndex: 1 },
      { text: 'Quantos anos vive uma tartaruga gigante?', options: ['50', '80', 'Mais de 100', '20'], correctIndex: 2 },
      { text: 'Qual é a língua mais falada do mundo (nativos)?', options: ['Inglês', 'Espanhol', 'Mandarim', 'Português'], correctIndex: 2 },
      { text: 'Onde foram inventadas as batatas fritas?', options: ['EUA', 'França', 'Bélgica', 'Alemanha'], correctIndex: 2 },
      { text: 'Qual é o músculo que trabalha mais no corpo?', options: ['Coração', 'Pernas', 'Braços', 'Olhos'], correctIndex: 0 },
      { text: 'As bananas são radioativas?', options: ['Não', 'Sim, ligeiramente (Potássio)', 'Apenas as verdes', 'Impossível saber'], correctIndex: 1 }
    ]
  }
];

const QUESTIONS_PER_ROUND = 10;

const QuizPage: React.FC = () => {
  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const startQuiz = (category: QuizCategory) => {
    // Randomize and select a subset of questions
    const shuffled = [...category.questionPool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_ROUND);

    setActiveSession({
      categoryId: category.id,
      title: category.title,
      questions: selectedQuestions,
      categoryColor: category.categoryColor
    });
    
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    
    window.scrollTo(0, 0); // Scroll to top when starting
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption === null || !activeSession) return;
    
    const correct = activeSession.questions[currentQuestionIndex].correctIndex === selectedOption;
    if (correct) {
      setScore(score + 1);
    }
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    if (!activeSession) return;

    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      window.scrollTo(0, 0); // Scroll to top on next question
    } else {
      setShowResults(true);
      window.scrollTo(0, 0); // Scroll to top on results
    }
  };

  const resetQuiz = () => {
    setActiveSession(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    window.scrollTo(0, 0); // Scroll to top on reset
  };

  // --- Render: List of Quizzes ---
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-slate-950 py-16 px-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Título Ajustado para o Dark Mode */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue dark:text-blue-400 mb-4 tracking-tight">Quiz & Testes de Conhecimento</h1>
            <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Desafie o seu cérebro com os nossos testes baseados nos temas do Sussurros do Saber. Escolha uma categoria e responda a <strong className="dark:text-slate-200">{QUESTIONS_PER_ROUND} questões aleatórias</strong> do nosso banco de dados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {QUIZ_POOLS.map((quiz, idx) => (
              <div 
                key={quiz.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-slate-800 overflow-hidden group hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${quiz.categoryColor}`}>
                    {quiz.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{quiz.title}</h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">{quiz.description}</p>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-6 pt-4 border-t border-gray-50 dark:border-slate-800">
                    <span className="flex items-center gap-1"><Shuffle className="w-3 h-3" /> Aleatórias: {QUESTIONS_PER_ROUND}</span>
                    <span>Nível: Médio</span>
                  </div>
                  <button 
                    onClick={() => startQuiz(quiz)}
                    className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95"
                  >
                    Começar Agora <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Results ---
  if (showResults) {
    const percentage = Math.round((score / activeSession.questions.length) * 100);
    let message = '';
    let subMessage = '';
    
    if (percentage === 100) {
      message = 'Perfeito! Você é um Mestre!';
      subMessage = 'Impressionante! Você domina completamente este assunto.';
    } else if (percentage >= 80) {
      message = 'Excelente Trabalho!';
      subMessage = 'Você tem um conhecimento muito sólido.';
    } else if (percentage >= 60) {
      message = 'Muito Bem!';
      subMessage = 'Bom resultado, mas ainda há espaço para aprender mais.';
    } else if (percentage >= 40) {
      message = 'Bom Esforço!';
      subMessage = 'Continue a ler o nosso blog para melhorar os seus conhecimentos.';
    } else {
      message = 'Não Desista!';
      subMessage = 'O erro é o primeiro passo para a aprendizagem. Tente novamente!';
    }

    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full p-10 text-center border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-700 ease-out">
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-brand-blue dark:text-blue-400 mb-2">Quiz Completado!</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8 font-medium">{activeSession.title}</p>
          
          <div className="flex justify-center items-end gap-2 mb-6">
            <span className="text-6xl font-black text-gray-900 dark:text-white">{score}</span>
            <span className="text-2xl font-bold text-gray-400 dark:text-slate-500 mb-2">/{activeSession.questions.length}</span>
          </div>
          
          <div className="mb-8">
             <p className="text-xl font-bold text-brand-blue dark:text-blue-400 mb-1">{message}</p>
             <p className="text-sm text-gray-500 dark:text-slate-400">{subMessage}</p>
          </div>
          
          <button 
            onClick={resetQuiz}
            className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <RotateCcw className="w-5 h-5" />
            Voltar aos Quizzes
          </button>
        </div>
      </div>
    );
  }

  // --- Render: Question ---
  const question = activeSession.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-blue-50/30 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg max-w-2xl w-full border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header with Progress */}
        <div className="bg-gray-50 dark:bg-slate-800/50 px-8 py-6 border-b border-gray-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                 <span className={`p-2 rounded-xl shadow-sm ${activeSession.categoryColor}`}>
                    {QUIZ_POOLS.find(p => p.id === activeSession.categoryId)?.icon}
                 </span>
                 <span className="font-bold text-gray-800 dark:text-white text-lg">{activeSession.title}</span>
              </div>
              <span className="text-sm font-bold text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-700">
                {currentQuestionIndex + 1} / {activeSession.questions.length}
              </span>
           </div>
           {/* Progress Bar */}
           <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
             <div 
               className="bg-brand-blue h-2 transition-all duration-500 ease-out rounded-full"
               style={{ width: `${((currentQuestionIndex + 1) / activeSession.questions.length) * 100}%` }}
             ></div>
           </div>
        </div>

        <div key={currentQuestionIndex} className="p-8 md:p-12 animate-in slide-in-from-right-8 fade-in duration-500 fill-mode-both">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-snug">
            {question.text}
          </h2>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              let optionClass = "w-full p-5 rounded-2xl border-2 text-left font-medium transition-all duration-200 flex items-center justify-between group text-lg ";
              
              if (isAnswerChecked) {
                if (index === question.correctIndex) {
                  optionClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 shadow-sm";
                } else if (index === selectedOption) {
                  optionClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400";
                } else {
                  optionClass += "border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-600 opacity-60";
                }
              } else {
                if (selectedOption === index) {
                  optionClass += "border-brand-blue bg-[#E0F2FE] dark:bg-blue-900/30 text-[#0033aa] dark:text-blue-300 shadow-md scale-[1.02] ring-1 ring-[#0033aa]/20";
                } else {
                  optionClass += "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-[#E0F2FE]/30 dark:hover:bg-slate-700/50 hover:shadow-md hover:scale-[1.01]";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={optionClass}
                  disabled={isAnswerChecked}
                >
                  <span>{option}</span>
                  {isAnswerChecked && index === question.correctIndex && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
                  {isAnswerChecked && index === selectedOption && index !== question.correctIndex && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-slate-800">
            <button 
               onClick={resetQuiz}
               className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-sm font-bold px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
               Sair
            </button>

            {!isAnswerChecked ? (
              <button
                onClick={checkAnswer}
                disabled={selectedOption === null}
                className="px-8 py-3.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95"
              >
                Verificar Resposta
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-8 py-3.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2 transform active:scale-95 animate-in fade-in slide-in-from-right-2"
              >
                {currentQuestionIndex === activeSession.questions.length - 1 ? 'Ver Resultados' : 'Próxima Questão'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
