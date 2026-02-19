import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL as API_URL } from '../services/apiService';

interface AuthorRealtimeStats {
    views?: number;
    followers?: number;
    karma?: number;
}

export const useAuthorRealtime = (username: string, initialStats: AuthorRealtimeStats) => {
    const [stats, setStats] = useState<AuthorRealtimeStats>(initialStats);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        // Sync initial stats if prop changes (e.g. from API load)
        setStats(initialStats);
    }, [initialStats.views, initialStats.followers, initialStats.karma]);

    useEffect(() => {
        if (!username) return;

        const url = `${API_URL}/analytics/stream/author/${encodeURIComponent(username)}/`;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            // console.log('Author SSE Connected');
        };

        eventSource.addEventListener('update', (event) => {
            try {
                const data = JSON.parse(event.data);
                // data = { type: 'view'|'follower'|'karma', data: { delta: 1, total: 50 }, timestamp: ... }

                setStats(current => {
                    const newStats = { ...current };

                    if (data.type === 'view') {
                        // Increment views by delta
                        newStats.views = (newStats.views || 0) + (data.data.delta || 0);
                    } else if (data.type === 'follower') {
                        // Update total directly
                        newStats.followers = data.data.total;
                    } else if (data.type === 'karma') {
                        // Update total directly
                        newStats.karma = data.data.total;
                    }

                    return newStats;
                });
            } catch (err) {
                console.error('Error parsing SSE author update:', err);
            }
        });

        eventSource.onerror = (err) => {
            // Retrying is handled by browser usually, but we can close on fatal
            // console.error('SSE Author Error:', err);
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [username]);

    return stats;
};
