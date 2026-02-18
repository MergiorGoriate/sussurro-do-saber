
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Brain, Loader2, BookOpen, Lightbulb, ChevronRight } from 'lucide-react';
// GoogleGenAI import removed as AI logic moved to backend

interface Message {
  role: 'user' | 'model';
  text: string;
}

const FormattedChatMessage: React.FC<{ text: string; role: 'user' | 'model' }> = ({ text, role }) => {
  const formatInline = (line: string) => {
    let processed = line.replace(/#/g, '');
    const parts = processed.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic opacity-90">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const blocks = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className={`space-y-3 ${role === 'model' ? 'text-justify' : 'text-left'} leading-relaxed font-sans`}>
      {blocks.map((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
          const content = trimmed.substring(2);
          return (
            <div key={index} className="flex gap-2 ml-1 items-start">
              <ChevronRight size={14} className="mt-1 text-brand-blue shrink-0" />
              <span className="text-sm">{formatInline(content)}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const parts = trimmed.split(/^\d+\.\s/);
          const number = trimmed.match(/^\d+/)?.[0];
          return (
            <div key={index} className="flex gap-2 ml-1 items-start">
              <span className="font-black text-brand-blue text-xs mt-0.5">{number}.</span>
              <span className="text-sm">{formatInline(parts[1])}</span>
            </div>
          );
        }
        return (
          <p key={index} className="text-sm hyphens-auto">
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/ai/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor AI');
      }

      const data = await response.json();
      const modelMessage: Message = {
        role: 'model',
        text: data.text || 'Peço desculpa, tive uma pequena falha no processamento NLP.'
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Ocorreu um erro no processamento de linguagem. Verifique se o servidor backend está ativo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickOptions = [
    { label: 'Sugerir um artigo', icon: BookOpen, action: 'Analise o blog e sugira-me um tema interessante para ler.' },
    { label: 'Resumir ciência', icon: Lightbulb, action: 'Faça um resumo NLP sobre um conceito científico fascinante.' },
    { label: 'O que é NLP?', icon: Brain, action: 'Como o Processamento de Linguagem Natural ajuda este blog?' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] font-sans flex flex-col items-start">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-32px)] sm:w-[380px] md:w-[420px] h-[70vh] max-h-[650px] bg-white dark:bg-slate-950 rounded-[24px] sm:rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-brand-blue p-5 sm:p-6 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                <img src="https://69697dc3356a14887c615411.imgix.net/logo.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight tracking-tight">Sussurros AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-100/80">NLP Ativo</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} title="Fechar Chat" className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-slate-900/30">
            {messages.length === 0 && (
              <div className="space-y-6 animate-in fade-in duration-700">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed text-justify">
                    Olá! Sou o motor de <strong>Inteligência Linguística</strong> do blog. Posso analisar textos, resumir artigos e responder dúvidas complexas. Como posso ajudar?
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Capacidades NLP</p>
                  {quickOptions.map((opt, i) => (
                    <button key={i} onClick={() => handleSend(opt.action)} className="w-full flex items-center gap-3 p-3.5 sm:p-4 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-700 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-slate-700/50 hover:text-brand-blue transition-all group shadow-sm">
                      <opt.icon size={16} className="text-brand-blue group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[90%] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-tl-none'}`}>
                  <FormattedChatMessage text={msg.text} role={msg.role} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl sm:rounded-3xl rounded-tl-none shadow-sm border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-brand-blue" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Processando NLP...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Envie um comando ou dúvida..." className="w-full bg-gray-100 dark:bg-slate-900 border-none rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-4 sm:pl-5 pr-12 text-sm focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white" />
              <button type="submit" disabled={!input.trim() || isLoading} title="Enviar Mensagem" className="absolute right-2 p-2 sm:p-2.5 bg-brand-blue text-white rounded-lg sm:rounded-xl hover:bg-brand-dark transition-all disabled:opacity-30 active:scale-95"><Send size={18} /></button>
            </form>
            <div className="mt-3 text-center">
              <p className="text-[9px] text-gray-400 dark:text-slate-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5"><Sparkles size={10} className="text-brand-blue" /> Motor NLP por Gemini 2.0</p>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} title={isOpen ? "Fechar Assistente AI" : "Abrir Assistente AI"} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-90 ${isOpen ? 'bg-red-500 rotate-90 scale-90' : 'bg-brand-blue'} text-white`}>
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;
