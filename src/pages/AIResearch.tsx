
import React, { useState } from 'react';
import { generateBlogContent } from '../services/geminiService';
import { Sparkles, BookOpen, PenTool, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Article, Category } from '../types';

const AIResearch: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'explanation' | 'essay'>('explanation');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const navigate = useNavigate();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus('loading');
    try {
      const result = await generateBlogContent(topic, type);

      const newArticle: Article = {
        id: `ai-${Date.now()}`,
        title: result.title,
        excerpt: result.excerpt,
        content: result.content,
        author: 'Sussurros AI (Gemini 2.5)',
        date: new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' }),
        category: Category.AI_GENERATED,
        imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
        readTime: Math.ceil(result.content.split(' ').length / 200),
        status: 'published',
        likes: 0,
        views: 0,
        metrics: { citations: 0, altmetricScore: 0, viewCount: 0, downloadCount: 0 },
        journalMeta: {
          doi: `10.3390/ai${Date.now()}`,
          issn: '2024-AI',
          volume: 1,
          issue: 1,
          receivedDate: new Date().toISOString(),
          acceptedDate: new Date().toLocaleDateString()
        },
        slug: `ai-research-${Date.now()}`
      };

      navigate(`/article/${newArticle.id}`, { state: newArticle });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
          <Sparkles className="w-6 h-6 text-brand-blue" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-blue mb-4">
          Laboratório de Ideias
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Utilize a nossa inteligência artificial para criar guias de estudo instantâneos ou ensaios reflexivos sobre qualquer tema académico.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <form onSubmit={handleGenerate} className="space-y-8">

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              O que deseja explorar hoje?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: A influência da arte no Renascimento, Fotossíntese, Estoicismo..."
              className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-brand-blue focus:ring-0 outline-none transition-colors bg-white text-gray-900 placeholder-gray-400"
              disabled={status === 'loading'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('explanation')}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 group ${type === 'explanation'
                  ? 'border-brand-blue bg-[#E0F2FE] ring-1 ring-[#0033aa]/20 scale-[1.02] shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-[#E0F2FE]/30 hover:shadow-md hover:scale-[1.01]'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className={`w-5 h-5 ${type === 'explanation' ? 'text-[#0033aa]' : 'text-gray-400 group-hover:text-[#0033aa]'}`} />
                <span className={`font-serif font-bold ${type === 'explanation' ? 'text-[#0033aa]' : 'text-gray-900 group-hover:text-[#0033aa]'}`}>
                  Explicação Académica
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Ideal para estudantes. Simplifica conceitos complexos mantendo o rigor científico.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setType('essay')}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 group ${type === 'essay'
                  ? 'border-brand-blue bg-[#E0F2FE] ring-1 ring-[#0033aa]/20 scale-[1.02] shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-[#E0F2FE]/30 hover:shadow-md hover:scale-[1.01]'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <PenTool className={`w-5 h-5 ${type === 'essay' ? 'text-[#0033aa]' : 'text-gray-400 group-hover:text-[#0033aa]'}`} />
                <span className={`font-serif font-bold ${type === 'essay' ? 'text-[#0033aa]' : 'text-gray-900 group-hover:text-[#0033aa]'}`}>
                  Ensaio Reflexivo
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Ideal para inspiração. Cria pontes entre o tema, a sociedade e o desenvolvimento humano.
              </p>
            </button>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Ocorreu um erro ao gerar o conteúdo. Verifique a chave API ou tente novamente mais tarde.</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'loading' || !topic.trim()}
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-medium text-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Escrevendo...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Conteúdo
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              O conteúdo é gerado por IA (Gemini 2.5) e deve ser verificado para fins académicos rigorosos.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIResearch;
