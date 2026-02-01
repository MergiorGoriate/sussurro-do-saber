
import React from 'react';
import { Target, Users, BookOpen, Lightbulb, Brain, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-brand-blue py-20 px-4 overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="relative max-w-5xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Sobre o Sussurros do Saber</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
              Transformando a curiosidade em conhecimento profundo. Um espaço dedicado à ciência, educação e cultura.
            </p>
         </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-blue-400 text-sm font-black uppercase tracking-widest mb-6">
                <Target className="w-4 h-4" /> Nossa Missão
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Democratizar o Acesso ao Conhecimento Académico</h2>
              <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                O "Sussurros do Saber" nasceu da necessidade de criar uma ponte entre a academia complexa e o público curioso. Acreditamos que a ciência não deve ficar trancada em laboratórios ou artigos pagos.
              </p>
              <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed">
                Apoiamos activamente a futura associação Sussurros do Saber, servindo como plataforma digital para as suas iniciativas de literacia científica.
              </p>
           </div>
           <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-brand-light dark:bg-slate-900 p-6 rounded-3xl border border-blue-100 dark:border-slate-800 transition-all hover:shadow-lg">
                 <BookOpen className="w-8 h-8 text-brand-blue mb-4" />
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg">Educação</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Conteúdos rigorosos adaptados para todos.</p>
              </div>
              <div className="bg-brand-light dark:bg-slate-900 p-6 rounded-3xl border border-blue-100 dark:border-slate-800 mt-8 transition-all hover:shadow-lg">
                 <Lightbulb className="w-8 h-8 text-brand-blue mb-4" />
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg">Inovação</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Explorando as fronteiras da tecnologia.</p>
              </div>
              <div className="bg-brand-light dark:bg-slate-900 p-6 rounded-3xl border border-blue-100 dark:border-slate-800 transition-all hover:shadow-lg">
                 <Users className="w-8 h-8 text-brand-blue mb-4" />
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg">Comunidade</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Conectando estudantes e especialistas.</p>
              </div>
               <div className="bg-brand-light dark:bg-slate-900 p-6 rounded-3xl border border-blue-100 dark:border-slate-800 mt-8 transition-all hover:shadow-lg">
                 <Brain className="w-8 h-8 text-brand-blue mb-4" />
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg">Pensamento Crítico</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Análise profunda além das manchetes.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Stats/Highlight - Secção Ajustada para melhor visibilidade Dark Mode */}
      <section className="bg-gray-50 dark:bg-slate-900/50 py-20 border-y border-gray-100 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-16">O que nos move</h2>
            <div className="grid md:grid-cols-3 gap-12">
               <div className="flex flex-col items-center group">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-sm dark:shadow-blue-500/5 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                    <Award className="w-10 h-10 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-slate-100">Excelência</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-base max-w-xs leading-relaxed">Compromisso com a veracidade e rigor científico em cada publicação.</p>
               </div>
               <div className="flex flex-col items-center group">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-sm dark:shadow-blue-500/5 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                    <Users className="w-10 h-10 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-slate-100">Inclusão</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-base max-w-xs leading-relaxed">Linguagem acessível sem perder a profundidade dos temas académicos.</p>
               </div>
               <div className="flex flex-col items-center group">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-sm dark:shadow-blue-500/5 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                    <Lightbulb className="w-10 h-10 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-slate-100">Curiosidade</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-base max-w-xs leading-relaxed">Incentivar a pergunta "porquê?" em todas as gerações de mentes inquietas.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;
