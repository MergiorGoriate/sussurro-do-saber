import { useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook para confirmar uma visualização real do artigo.
 * Critérios: 15 segundos na página OR scroll >= 30%.
 */
export const useViewConfirmed = (articleId: number | string | undefined) => {
    const hasConfirmed = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const sessionId = useRef(Math.random().toString(36).substring(2, 15));

    useEffect(() => {
        if (!articleId || hasConfirmed.current) return;

        const confirm = async () => {
            if (hasConfirmed.current) return;
            hasConfirmed.current = true;

            // Clean up listeners immediately
            window.removeEventListener('scroll', handleScroll);
            if (timerRef.current) clearTimeout(timerRef.current);

            await apiService.confirmView(articleId, sessionId.current);
        };

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            if (scrollPercent >= 30) {
                confirm();
            }
        };

        // Criteria 1: 15 seconds timer
        timerRef.current = setTimeout(() => {
            confirm();
        }, 15000);

        // Criteria 2: Scroll observer
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [articleId]);
};
