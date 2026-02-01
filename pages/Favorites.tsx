
import React, { useState, useEffect } from 'react';
/* Importing Link from react-router-dom to fix missing exported member error */
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import ArticleCard from '../components/ArticleCard';
import { Bookmark, ArrowRight, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { Article } from '../types';

const Favorites: React.FC = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const allArticles = await storageService.getArticles();
        const interactions = storageService.getUserInteractions();
        const filtered = allArticles.filter(a => interactions.bookmarkedArticles.includes(a.id));
        setBookmarkedArticles(filtered);
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
    
    // Ouvir mudanças no storage (caso o utilizador remova dos favoritos em outra aba)
    window.addEventListener('storage-update', loadFavorites);
    return () => window.removeEventListener('storage-update', loadFavorites);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light/30 pb-20">
      <div className="bg-brand-blue text-white py-16 mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
          <Bookmark className="w-64 h-64" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Bookmark className="w-8 h-8 text-amber-300 mr-2 fill-current" />
            <span className="font-bold text-amber-100 tracking-wide uppercase text-sm">Biblioteca Pessoal</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
             Os Meus Favoritos
          </h1>
          
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
             A sua coleção curada de conhecimento. Artigos que guardou para ler mais tarde ou consultar novamente.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {bookmarkedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {bookmarkedArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ainda não guardou nenhum artigo</h2>
            <p className="text-gray-500 mb-8">
              Explore os nossos temas e clique no botão <strong>Guardar</strong> para criar a sua biblioteca personalizada de conhecimento.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-md hover:shadow-lg"
            >
              Explorar Artigos <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {bookmarkedArticles.length > 0 && (
           <div className="mt-20 p-8 bg-brand-blue rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
              <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Quer testar o seu saber?</h3>
                <p className="text-blue-100">Prepare-se para o nosso quiz semanal baseado nos temas que guardou.</p>
              </div>
              <Link to="/quiz" className="relative z-10 bg-white text-brand-blue px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">Ir para o Quiz</Link>
           </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
