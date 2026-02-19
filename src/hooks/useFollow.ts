import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const useFollow = (authorUsername: string) => {
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        console.log(`[useFollow] Effect triggered. auth=${isAuthenticated}, author=${authorUsername}`);
        if (isAuthenticated && authorUsername) {
            checkFollowStatus();
        }

        // Check for pending follow intent after login
        try {
            const pendingActionRaw = localStorage.getItem('pending_action');
            if (isAuthenticated && pendingActionRaw) {
                const action = JSON.parse(pendingActionRaw);
                console.log('[useFollow] Found pending action:', action);

                // Validate action type, target, and expiration (1 hour)
                const isValid =
                    action.type === 'follow_author' &&
                    action.target === authorUsername &&
                    (Date.now() - action.timestamp) < 3600000; // 1 hour validity

                if (isValid) {
                    console.log('[useFollow] Executing valid pending action');
                    handleFollow(); // Execute the pending action
                    localStorage.removeItem('pending_action'); // Clear after execution
                    toast.success(t('author.auto_followed', 'Ação pendente executada: Agora segue este autor!'));
                } else if ((Date.now() - action.timestamp) >= 3600000) {
                    console.log('[useFollow] Pending action expired, removing');
                    // Clean up expired actions
                    localStorage.removeItem('pending_action');
                }
            }
        } catch (e) {
            console.error("[useFollow] Error parsing pending action", e);
            localStorage.removeItem('pending_action');
        }
    }, [isAuthenticated, authorUsername]);

    const checkFollowStatus = async () => {
        if (!authorUsername) return;
        console.log(`[useFollow] checkFollowStatus for: ${authorUsername}`);
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const status = await apiService.checkFollowStatus(authorUsername, token);
                console.log(`[useFollow] Follow status: ${status}`);
                setIsFollowing(status);
            }
        } catch (error) {
            console.error('[useFollow] checkFollowStatus error:', error);
        }
    };

    const handleFollow = async () => {
        console.log(`[useFollow] handleFollow for: ${authorUsername}. auth=${isAuthenticated}`);
        if (!authorUsername) {
            console.warn('[useFollow] No authorUsername provided');
            return;
        }

        if (!isAuthenticated) {
            console.log('[useFollow] Saving pending action and opening AuthModal');
            // Save structured pending action
            const pendingAction = {
                type: 'follow_author',
                target: authorUsername,
                timestamp: Date.now()
            };
            localStorage.setItem('pending_action', JSON.stringify(pendingAction));
            setIsAuthModalOpen(true);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            console.log(`[useFollow] Got token: ${!!token}`);
            if (!token) throw new Error('No token');

            if (isFollowing) {
                console.log(`[useFollow] Unfollowing ${authorUsername}`);
                await apiService.unfollowAuthor(authorUsername, token);
                setIsFollowing(false);
                toast.success(t('author.unfollowed', 'Deixou de seguir este autor'));
            } else {
                console.log(`[useFollow] Following ${authorUsername}`);
                await apiService.followAuthor(authorUsername, token);
                setIsFollowing(true);
                toast.success(t('author.followed', 'Agora está a seguir este autor!'));
            }
        } catch (error) {
            console.error('[useFollow] handleFollow error:', error);
            toast.error(t('author.error', 'Erro ao atualizar estado de seguir'));
        } finally {
            setLoading(false);
        }
    };

    return {
        isFollowing,
        loading,
        handleFollow,
        isAuthModalOpen,
        closeAuthModal: () => setIsAuthModalOpen(false),
        onAuthSuccess: () => {
            setIsAuthModalOpen(false);
            // The useEffect will catch the pending follow logic
        }
    };
};
