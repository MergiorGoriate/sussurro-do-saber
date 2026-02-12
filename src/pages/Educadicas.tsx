import React, { useState } from 'react';
import { Lightbulb, Clock, Brain, BookOpen, PenTool, Coffee, CheckCircle, Target, Layers, Microscope } from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  category: 'Métodos' | 'Produtividade' | 'Bem-estar';
  description: string;
  icon: React.ReactNode;
  content: string[];
  scientificBasis: string; // New field for scientific explanation
}

const TIPS: Tip[] = [
  {
    id: 'pomodoro',
    title: 'Técnica Pomodoro',
    category: 'Produtividade',
    description: 'Gerencie o seu tempo dividindo o trabalho em intervalos focados.',
    icon: <Clock className="w-8 h-8 text-red-500" />,
    content: [
      'Escolha uma tarefa a ser executada.',
      'Ajuste o cronómetro para 25 minutos (um Pomodoro).',
      'Trabalhe na tarefa até que o alarme toque.',
      'Faça uma pausa curta (5 minutos).',
      'A cada 4 Pomodoros, faça uma pausa mais longa (15-30 minutos).'
    ],
    scientificBasis: 'Desenvolvida por Francesco Cirillo nos anos 80, esta técnica combate a procrastinação ao reduzir a ansiedade temporal. Estudos sobre "time-boxing" mostram que pausas frequentes mantêm a agilidade mental e que o cérebro humano tem dificuldade em manter o foco sustentado (atenção vigilante) por períodos superiores a 90 minutos (ritmos ultradianos).'
  },
  {
    id: 'feynman',
    title: 'Técnica Feynman',
    category: 'Métodos',
    description: 'Aprenda qualquer conceito complexo ensinando-o de forma simples.',
    icon: <Brain className="w-8 h-8 text-brand-blue" />,
    content: [
      'Escolha um conceito que deseja aprender.',
      'Finja que está a explicar a uma criança de 12 anos.',
      'Identifique as falhas na sua explicação (o que não sabe explicar bem).',
      'Revise o material original para preencher essas lacunas.',
      'Simplifique e use analogias.'
    ],
    scientificBasis: 'Baseada no "Efeito Protégé", um fenómeno psicológico onde os alunos que se preparam para ensinar outros demonstram melhor compreensão e retenção do que aqueles que estudam apenas para si. O esforço cognitivo de simplificação obriga à reestruturação da informação e consolidação na memória de longo prazo (Nestojko et al., 2014).'
  },
  {
    id: 'mind-mapping',
    title: 'Mapas Mentais',
    category: 'Métodos',
    description: 'Visualize conexões entre ideias para melhorar a memorização.',
    icon: <Layers className="w-8 h-8 text-purple-500" />,
    content: [
      'Comece com o tema central no meio da página.',
      'Crie ramificações para os subtemas principais.',
      'Use palavras-chave curtas em vez de frases longas.',
      'Use cores diferentes para cada ramo principal.',
      'Adicione desenhos ou ícones para reforçar a memória visual.'
    ],
    scientificBasis: 'Popularizados por Tony Buzan, os mapas mentais exploram o pensamento irradiante e a codificação dual (texto + imagem). A neurociência sugere que o cérebro processa informação visual 60.000 vezes mais rápido que texto linear. A estrutura não-linear mimetiza a arquitetura das redes neurais, facilitando a associação de ideias (Davies, 2011).'
  },
  {
    id: 'active-recall',
    title: 'Active Recall (Evocação)',
    category: 'Métodos',
    description: 'A forma mais eficiente de estudar baseada em evidências científicas.',
    icon: <Target className="w-8 h-8 text-orange-500" />,
    content: [
      'Em vez de reler passivamente, teste-se a si mesmo.',
      'Feche o livro e tente recitar o que aprendeu.',
      'Crie perguntas durante o estudo para responder depois.',
      'Use Flashcards para forçar o cérebro a recuperar a informação.',
      'Quanto mais esforço fizer para lembrar, mais forte será a memória.'
    ],
    scientificBasis: 'O "Efeito de Teste" (Testing Effect) é um dos achados mais robustos da psicologia cognitiva. Roediger & Butler (2011) demonstraram que o ato de recuperar informação da memória fortalece as vias neurais mais do que a reexposição ao conteúdo. O esforço cognitivo sinaliza ao hipocampo que a informação é vital, prevenindo o esquecimento.'
  },
  {
    id: 'sleep-learning',
    title: 'Sono e Aprendizagem',
    category: 'Bem-estar',
    description: 'Por que dormir bem é tão importante quanto estudar.',
    icon: <Coffee className="w-8 h-8 text-indigo-500" />,
    content: [
      'O cérebro consolida memórias durante o sono REM.',
      'Dormir menos de 7 horas reduz a capacidade de concentração.',
      'Evite estudar na cama para não associar o local de descanso ao stress.',
      'Tente manter um horário de sono regular.',
      'Uma sesta de 20 minutos pode restaurar a energia mental à tarde.'
    ],
    scientificBasis: 'Durante o sono, especificamente na fase de ondas lentas (NREM) e REM, o cérebro reencena padrões de atividade neural do dia, transferindo memórias do hipocampo (armazenamento temporário) para o neocórtex (armazenamento permanente). A privação de sono impede essa consolidação e acumula adenosina e beta-amiloide, toxinas que prejudicam a cognição (Walker, 2017).'
  },
  {
    id: 'spaced-repetition',
    title: 'Repetição Espaçada',
    category: 'Métodos',
    description: 'Combata a "Curva do Esquecimento" revendo o conteúdo na hora certa.',
    icon: <BookOpen className="w-8 h-8 text-green-500" />,
    content: [
      'Não estude tudo de uma vez (cramming).',
      'Revise o conteúdo 1 dia depois, depois 3 dias, 1 semana e 1 mês.',
      'Use apps como Anki para automatizar os intervalos.',
      'Isso transfere o conhecimento da memória de curto para longo prazo.',
      'Ideal para aprender idiomas, datas históricas e definições.'
    ],
    scientificBasis: 'Baseada na "Curva do Esquecimento" de Hermann Ebbinghaus (1885). A memória decai exponencialmente com o tempo. Ao reintroduzir a informação no momento exato em que estamos prestes a esquecê-la, reiniciamos a curva de esquecimento num nível mais alto, tornando a memória cada vez mais duradoura com menos esforço total.'
  }
];

const Educadicas: React.FC = () => {
  const [filter, setFilter] = useState<'Todos' | 'Métodos' | 'Produtividade' | 'Bem-estar'>('Todos');

  const filteredTips = filter === 'Todos' ? TIPS : TIPS.filter(t => t.category === filter);

  const handleFilterChange = (cat: 'Todos' | 'Métodos' | 'Produtividade' | 'Bem-estar') => {
    setFilter(cat);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-brand-light/30 pb-20">
      {/* Header */}
      <div className="bg-brand-blue text-white py-16 mb-10 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
            <Lightbulb className="w-64 h-64" />
         </div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Lightbulb className="w-8 h-8 text-yellow-300 mr-2" />
              <span className="font-bold text-yellow-100 tracking-wide uppercase text-sm">Laboratório de Estudos</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
               Educadicas
            </h1>
            
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
               Um guia prático com as melhores estratégias de aprendizagem, produtividade e bem-estar para potenciar os seus estudos.
            </p>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-4">
          {['Todos', 'Métodos', 'Produtividade', 'Bem-estar'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat as any)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all transform hover:-translate-y-0.5 ${
                filter === cat 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                <div className="p-8 pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      {tip.icon}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      tip.category === 'Métodos' ? 'bg-blue-100 text-blue-700' :
                      tip.category === 'Produtividade' ? 'bg-red-100 text-red-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {tip.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {tip.description}
                  </p>
                </div>
                
                <div className="bg-gray-50/50 p-8 pt-4 border-t border-gray-50 flex flex-col gap-6 flex-grow">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-brand-blue" />
                      Como aplicar:
                    </h4>
                    <ul className="space-y-3 mb-6">
                      {tip.content.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Scientific Basis Section */}
                  <div className="mt-auto bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                     <h4 className="font-bold text-brand-blue text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Microscope className="w-3 h-3" /> Fundamentação Científica
                     </h4>
                     <p className="text-xs text-gray-600 leading-relaxed italic">
                        "{tip.scientificBasis}"
                     </p>
                  </div>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Educadicas;