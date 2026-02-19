import { useState, useEffect, useRef } from 'react';

import { API_BASE_URL } from '../services/apiService';

interface RealtimeStats {
    views_delta: number;
    reading_now: number;
}

export const useArticleRealtime = (articleId: string | number | undefined, initialViews: number = 0) => {
    const [stats, setStats] = useState<RealtimeStats>({ views_delta: 0, reading_now: 0 });
    const [hasViewed, setHasViewed] = useState(false);

    // Heartbeat interval ref
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

    // View trigger refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const hasTriggeredView = useRef(false);

    useEffect(() => {
        if (!articleId) return;

        // 1. Setup SSE Connection
        const sse = new EventSource(`${API_BASE_URL}/analytics/stream/${articleId}/`);

        sse.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setStats(prev => ({ ...prev, ...data }));
            } catch (e) {
                console.error("SSE Parse Error", e);
            }
        };

        sse.addEventListener('stats', (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                setStats(prev => ({ ...prev, ...data }));
            } catch (e) {
                console.error("SSE Stats Parse Error", e);
            }
        });

        sse.onerror = (e) => {
            console.error("SSE Error", e);
            sse.close();
        };

        // 2. Setup Presence Heartbeat (every 15s)
        const sendHeartbeat = () => {
            if (document.visibilityState === 'visible') {
                fetch(`${API_BASE_URL}/analytics/presence/${articleId}/`, { method: 'POST' }).catch(() => { });
            }
        };

        sendHeartbeat(); // Initial
        heartbeatInterval.current = setInterval(sendHeartbeat, 15000);

        // 3. Setup View Trigger Logic
        // Trigger if > 10s on page OR scroll > 30%
        const triggerView = () => {
            if (hasTriggeredView.current) return;
            hasTriggeredView.current = true;

            fetch(`${API_BASE_URL}/analytics/view/${articleId}/`, { method: 'POST' })
                .then(() => setHasViewed(true))
                .catch(err => console.error("View record error", err));
        };

        // Time trigger (10s)
        timerRef.current = setTimeout(triggerView, 10000);

        // Scroll trigger (30%)
        const handleScroll = () => {
            if (hasTriggeredView.current) return;

            const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPercentage > 0.3) {
                triggerView();
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            sse.close();
            if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [articleId]);

    return {
        views: initialViews + stats.views_delta,
        readingNow: stats.reading_now,
        hasViewed
    };
};
