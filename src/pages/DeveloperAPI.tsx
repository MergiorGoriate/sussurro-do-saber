
import React from 'react';
/* Importing Link from react-router-dom to resolve missing exported member error */
import { Link } from 'react-router-dom';
import { Terminal, Code, Cpu, Globe, Database, Copy, Check, ArrowRight, ChevronRight, Zap } from 'lucide-react';

const CodeBlock = ({ code, language = 'json' }: { code: string, language?: string }) => {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-slate-500 font-mono uppercase">{language}</span>
        <button onClick={copy} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="bg-slate-900 text-blue-400 p-6 rounded-2xl font-mono text-sm overflow-x-auto border border-slate-800 shadow-2xl">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const DeveloperAPI: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Estilo Tech */}
      <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Terminal size={14} /> Developer Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Sussurros API <span className="text-blue-500">v1.0</span></h1>
          <p className="text-slate-400 text-xl max-w-2xl font-light leading-relaxed">
            Integre o conhecimento científico do nosso blog nas suas aplicações. Uma API RESTful pensada para a disseminação do saber.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Menu Lateral de Navegação */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-32 space-y-8">
              <nav className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Introdução</p>
                <a href="#auth" className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm font-bold text-sm transition-all">
                  <Zap size={16} /> Autenticação
                </a>
                <a href="#endpoints" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white shadow-sm text-brand-blue font-bold text-sm transition-all">
                  <Globe size={16} /> Endpoints
                </a>
              </nav>

              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">SDK disponível</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Instale o nosso wrapper oficial para Node.js e Python.</p>
                <code className="block bg-slate-100 p-2 rounded text-[10px] font-mono text-slate-600 mb-4">npm install @sussurros/api</code>
                <button className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-blue transition-colors">GitHub Repo</button>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="lg:col-span-9 space-y-20">
            <section id="intro" className="bg-white p-10 md:p-16 rounded-4xl shadow-sm border border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Começar a usar</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                A API do Sussurros do Saber segue os princípios REST. Todas as respostas foram retornadas no formato JSON e os erros utilizam códigos de estado HTTP padrão.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <Database className="text-brand-blue mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Base URL</h4>
                  <p className="text-xs text-slate-500 font-mono">api.sussurros.pt/v1</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <Code className="text-brand-blue mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">CORS</h4>
                  <p className="text-xs text-slate-500">Ativado para todos os domínios</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <Cpu className="text-brand-blue mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Rate Limit</h4>
                  <p className="text-xs text-slate-500">100 req / minuto</p>
                </div>
              </div>
            </section>

            <section id="endpoints" className="space-y-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-grow bg-slate-200"></div>
                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Documentação de Endpoints</h3>
                <div className="h-px flex-grow bg-slate-200"></div>
              </div>

              {/* Endopoint: Listar Artigos */}
              <div className="bg-white rounded-4xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-lg font-black text-xs">GET</span>
                    <code className="font-mono text-slate-700 font-bold">/articles</code>
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Listar Artigos</span>
                </div>
                <div className="p-8 md:p-12 space-y-8">
                  <p className="text-slate-600">Retorna uma lista paginada de todos os artigos publicados, ordenados pela data de publicação mais recente.</p>
                  
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Exemplo de Resposta</h4>
                  <CodeBlock code={`{
  "status": "success",
  "data": [
    {
      "id": "1",
      "title": "Computação Quântica: O Futuro da Tecnologia",
      "author": "Mergior Goriate",
      "category": "Tecnologia",
      "readTime": 12,
      "date": "20 Out 2024"
    },
    ...
  ],
  "pagination": {
    "total": 38,
    "page": 1,
    "limit": 10
  }
}`} />
                </div>
              </div>

              {/* Endopoint: Detalhes do Artigo */}
              <div className="bg-white rounded-4xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-lg font-black text-xs">GET</span>
                    <code className="font-mono text-slate-700 font-bold">/articles/:id</code>
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Detalhes do Artigo</span>
                </div>
                <div className="p-8 md:p-12 space-y-8">
                  <p className="text-slate-600">Recupera o conteúdo completo e metadados detalhados de um artigo específico através do seu identificador único.</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px]">
                          <th className="pb-4">Parâmetro</th>
                          <th className="pb-4">Tipo</th>
                          <th className="pb-4">Descrição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <tr>
                          <td className="py-4 font-mono text-brand-blue font-bold">id</td>
                          <td className="py-4 text-slate-500 italic">string</td>
                          <td className="py-4 text-slate-600">O ID único do artigo (obrigatório).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Exemplo de Resposta</h4>
                  <CodeBlock code={`{
  "id": "1",
  "title": "Computação Quântica",
  "content": "A computação quântica representa...",
  "meta": {
    "views": 1540,
    "likes": 39
  }
}`} />
                </div>
              </div>
            </section>

            <section className="p-12 bg-brand-blue rounded-4xl text-white text-center shadow-2xl shadow-blue-500/30">
               <h3 className="text-3xl font-bold mb-4">Pronto para construir o futuro?</h3>
               <p className="text-blue-100 mb-8 max-w-xl mx-auto">Solicite uma chave de API para produção e tenha acesso a métricas avançadas e webhooks em tempo real.</p>
               <button className="px-10 py-4 bg-white text-brand-blue rounded-2xl font-bold hover:bg-slate-50 transition-colors">Solicitar API Key</button>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DeveloperAPI;
