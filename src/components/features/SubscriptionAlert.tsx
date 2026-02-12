import React, { useState, useEffect } from 'react';
import { Brain, Bell, Loader2, Check } from 'lucide-react';

const SubscriptionAlert: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'subscribed'>('idle');

  useEffect(() => {
    // Check local storage to see if user has already interacted
    const subscriptionState = localStorage.getItem('sussurros_notification_status');
    
    // Only show if no preference is saved
    if (!subscriptionState) {
      // Delay appearance to simulate reading behavior (5 seconds)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session or permanently
    localStorage.setItem('sussurros_notification_status', 'dismissed');
  };

  const handleSubscribe = async () => {
    setStatus('requesting');
    
    // Simulate the browser permission request process
    // In a real PWA, you would call Notification.requestPermission() here
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
           // Success logic
        }
      }
      
      // Artificial delay for UX
      setTimeout(() => {
        setStatus('subscribed');
        localStorage.setItem('sussurros_notification_status', 'subscribed');
        
        // Close after showing success state briefly
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error("Notification error", error);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-4 md:left-8 z-[60] max-w-[360px] w-full bg-white rounded-lg shadow-2xl border border-gray-100 p-5 animate-in slide-in-from-left-4 fade-in duration-700">
      <div className="flex gap-4">
        {/* Brand Logo Area */}
        <div className="shrink-0">
          <div className="w-12 h-12 bg-brand-blue rounded-md flex items-center justify-center shadow-sm">
            {status === 'subscribed' ? (
               <Check className="w-6 h-6 text-white" />
            ) : (
               <Brain className="w-7 h-7 text-white" />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <p className="text-gray-800 font-medium text-sm leading-relaxed mb-5">
            {status === 'subscribed' 
              ? 'Obrigado! Você receberá as melhores novidades científicas.'
              : 'Inscreva-se para receber notificações do Sussurros do Saber'
            }
          </p>

          {status !== 'subscribed' && (
            <div className="flex justify-end items-center gap-4">
              <button 
                onClick={handleDismiss}
                className="text-brand-blue hover:text-brand-dark font-bold text-sm transition-colors"
              >
                Agora não
              </button>
              <button 
                onClick={handleSubscribe}
                disabled={status === 'requesting'}
                className="bg-brand-blue hover:bg-brand-dark text-white font-bold text-sm px-4 py-2 rounded-md transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
              >
                {status === 'requesting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  'Inscrever-se'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAlert;