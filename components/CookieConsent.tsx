
import React, { useState, useEffect } from 'react';
/* Importing Link from react-router-dom to fix missing exported member error */
import { Link } from 'react-router-dom';
import { Cookie, X, Check } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage to see if user has already accepted/declined
    const consent = localStorage.getItem('sussurros_cookie_consent');
    
    if (!consent) {
      // Add a small delay so it doesn't pop up immediately upon load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sussurros_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    // We still store a value so we don't annoy the user again, 
    // but in a real app you might disable tracking scripts here.
    localStorage.setItem('sussurros_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6 z-50 p-4 md:max-w-md animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-4 relative">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <Cookie className="w-24 h-24 text-brand-blue" />
        </div>

        <div className="flex items-start gap-3 pr-6">
          <div className="bg-blue-50 p-2 rounded-full shrink-0">
            <Cookie className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Valorizamos a sua privacidade</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Utilizamos cookies para melhorar a sua experiência de navegação e analisar o tráfego do site. 
              Ao continuar, concorda com a nossa <Link to="/privacy" className="text-brand-blue font-bold hover:underline">Política de Privacidade</Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-brand-blue text-white py-2.5 px-4 rounded-lg font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Check className="w-4 h-4" />
            Aceitar tudo
          </button>
          <button 
            onClick={handleDecline}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Recusar
          </button>
        </div>

        {/* Close X button (top right) */}
        <button 
          onClick={handleDecline} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
