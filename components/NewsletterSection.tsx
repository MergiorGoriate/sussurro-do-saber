
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Loader2, CheckCircle } from 'lucide-react';
/* Importing Link from react-router-dom to resolve missing exported member error */
import { Link } from 'react-router-dom';

const NewsletterSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setStatus('loading');
    try {
      const success = await storageService.addSubscriber(formData.email);
      if (success) {
        setStatus('success');
        setFormData({ name: '', email: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section className="w-full bg-[#d6eaff] py-10 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        
        {/* Lado Esquerdo: Composição Visual - Tamanho Reduzido */}
        <div className="relative flex justify-center lg:justify-end order-2 lg:order-1">
          <Link to="/about" className="relative w-[220px] h-[280px] md:w-[320px] md:h-[400px] block group transition-transform hover:scale-[1.02] duration-500">
            {/* Efeito de Camadas (Retângulos Azuis) */}
            <div className="absolute top-6 -right-6 w-full h-full bg-[#0051ba] rounded-2xl opacity-40 translate-x-4"></div>
            <div className="absolute top-3 -right-3 w-full h-full bg-[#0051ba] rounded-2xl opacity-70 translate-x-2"></div>
            <div className="absolute inset-0 bg-[#0051ba] rounded-3xl shadow-xl"></div>
            
            {/* Imagem da Pessoa - Negra Africana representativa */}
            <img 
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop" 
              alt="Subscreva a nossa newsletter"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl z-10 brightness-105 contrast-100 group-hover:opacity-95 transition-opacity"
            />
          </Link>
        </div>

        {/* Lado Direito: Formulário - Tipografia Ajustada */}
        <div className="flex flex-col space-y-6 order-1 lg:order-2">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] leading-tight tracking-tight">
              Conteúdos exclusivos
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-light">
              Receba curiosidades e dicas sobre ciência e cultura pop no seu e-mail.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center space-y-3 animate-in fade-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h3 className="text-xl font-bold text-gray-800">Inscrição confirmada!</h3>
              <p className="text-sm text-gray-500">Bem-vindo à nossa jornada.</p>
              <button onClick={() => setStatus('idle')} className="text-brand-blue text-sm font-bold hover:underline">Voltar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Nome</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-brand-blue outline-none shadow-sm transition-all text-gray-900" 
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">E-mail*</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-brand-blue outline-none shadow-sm transition-all text-gray-900" 
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto bg-[#0051ba] text-white px-10 py-3.5 rounded-full font-bold text-lg hover:bg-[#003da0] active:scale-95 transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assinar Agora'}
                </button>
                <p className="text-[10px] text-gray-500 leading-relaxed max-w-[250px]">
                  Ao subscrever, aceita a nossa política de privacidade e o envio de comunicações informativas.
                </p>
              </div>
              {status === 'error' && <p className="text-red-500 text-xs font-bold">Erro ao processar subscrição. Tente novamente.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
