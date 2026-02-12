import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    // Simulate API call
    setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setStatus('idle');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-brand-light/30">
      <div className="bg-brand-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Tem alguma dúvida, sugestão ou quer apenas dizer olá? Estamos aqui para ouvir.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Cards - Stacks on desktop, side-by-side on tablet, stacked on mobile */}
          <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 h-fit">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Mail className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 text-sm mb-4">Para questões gerais e parcerias.</p>
                <a href="mailto:sussurrosdosaber@gmail.com" className="text-brand-blue font-bold hover:underline">sussurrosdosaber@gmail.com</a>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <MapPin className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Localização</h3>
                <p className="text-gray-600 text-sm">Nampula, Moçambique</p>
             </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                <p className="text-gray-600">Obrigado pelo seu contato. Responderemos o mais breve possível.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-brand-blue font-bold hover:underline">Enviar outra mensagem</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all bg-white text-gray-900"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all bg-white text-gray-900"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem</label>
                  <textarea 
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all resize-none bg-white text-gray-900"
                    placeholder="Como podemos ajudar?"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full bg-brand-blue text-white font-bold py-4 rounded-lg hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;