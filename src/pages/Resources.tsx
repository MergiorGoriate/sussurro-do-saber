
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Download, Beaker, MapPin, Search, BookOpen, 
  ChevronRight, Filter, Info, Layers, GraduationCap, 
  ClipboardCheck, Sparkles, Loader2, Rss 
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { EducationalResource, ResourceType } from '../types';

const MOCK_RESOURCES: EducationalResource[] = [
  {
    id: 'res-1',
    title: 'Guia de Experiências: Ciclo da Água em Garrafa PET',
    description: 'Aprenda a criar um ecossistema fechado para observar o ciclo da água usando apenas materiais recicláveis.',
    type: 'Experiência',
    subject: 'Ciências Naturais',
    isLocal: true,
    isLowCost: true,
    fileSize: '1.2 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-2',
    title: 'História de Moçambique: Dos Reinos à Independência',
    description: 'Ficha de exercícios e resumo estruturado sobre os principais marcos históricos do país.',
    type: 'Ficha',
    subject: 'História',
    isLocal: true,
    fileSize: '850 KB',
    downloadUrl: '#'
  },
  {
    id: 'res-3',
    title: 'Plano de Aula: Introdução à Astronomia e Observação Local',
    description: 'Um plano detalhado para professores do ensino secundário, adaptado para observação do céu no hemisfério sul.',
    type: 'Plano de Aula',
    subject: 'Geografia/Física',
    isLocal: true,
    fileSize: '2.1 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-4',
    title: 'Manual de Literacia Digital para Comunidades',
    description: 'PDF instrutivo sobre segurança na internet e uso básico de ferramentas digitais em smartphones.',
    type: 'Manual',
    subject: 'Tecnologia',
    isLocal: true,
    isLowCost: true,
    fileSize: '4.5 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-5',
    title: 'Experiência de Química: Indicador de pH com Couve Roxa',
    description: 'Identifique substâncias ácidas e básicas com ingredientes comuns de cozinha.',
    type: 'Experiência',
    subject: 'Química',
    isLocal: false,
    isLowCost: true,
    fileSize: '1.1 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-6',
    title: 'Cálculo Mental: Desafios e Práticas',
    description: 'Conjunto de fichas progressivas para melhorar a agilidade aritmética sem calculadora.',
    type: 'Ficha',
    subject: 'Matemática',
    isLocal: false,
    fileSize: '920 KB',
    downloadUrl: '#'
  }
];

const ResourceCard: React.FC<{ resource: EducationalResource }> = ({ resource }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // BIG DATA: Track Download
    analyticsService.trackEvent('download_recurso', resource.id, resource.subject);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const getIcon = () => {
    switch (resource.type) {
      case 'Experiência': return <Beaker className="text-orange-500" />;
      case 'Plano de Aula': return <ClipboardCheck className="text-blue-500" />;
      case 'Manual': return <BookOpen className="text-green-500" />;
      default: return <FileText className="text-slate-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
          {getIcon()}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
            {resource.type}
          </span>
          {resource.isLocal && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-brand-blue dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <MapPin size={10} /> Local
            </span>
          )}
        </div>
      </div>
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
        {resource.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow leading-relaxed line-clamp-3">
        {resource.description}
      </p>
      <div className="pt-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{resource.subject}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{resource.fileSize}</span>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50 shrink-0 ml-2"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>{isDownloading ? 'A baixar' : 'Baixar'}</span>
        </button>
      </div>
    </div>
  );
};

const Resources: React.FC = () => {
  const [filter, setFilter] = useState<ResourceType | 'Todos'>('Todos');
  const [search, setSearch] = useState('');
  const filteredResources = MOCK_RESOURCES.filter(r => {
    const matchesFilter = filter === 'Todos' || r.type === filter;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                         r.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const categories: (ResourceType | 'Todos')[] = ['Todos', 'Ficha', 'Plano de Aula', 'Experiência', 'Manual'];
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 transition-colors duration-300 overflow-x-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <section className="bg-brand-blue py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-8">
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>Ferramentas para o Saber</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Recursos <span className="text-amber-400">Educativos</span>
          </h1>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[32px] p-4 md:p-6 lg:p-8 shadow-2xl shadow-blue-900/10 border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 md:gap-6 items-stretch xl:items-center">
          <div className="relative flex-grow xl:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 md:py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-900 dark:text-white transition-all text-sm shadow-inner"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                  filter === cat 
                    ? 'bg-brand-blue text-white shadow-lg ring-2 ring-blue-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
