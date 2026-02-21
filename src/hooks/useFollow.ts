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

        if (isAuthenticated && authorUsername) {
            checkFollowStatus();
        }

        // Check for pending follow intent after login
        try {
            const pendingActionRaw = localStorage.getItem('pending_action');
            if (isAuthenticated && pendingActionRaw) {
                const action = JSON.parse(pendingActionRaw);


                // Validate action type, target, and expiration (1 hour)
                const isValid =
                    action.type === 'follow_author' &&
                    action.target === authorUsername &&
                    (Date.now() - action.timestamp) < 3600000; // 1 hour validity

                if (isValid) {

                    handleFollow(); // Execute the pending action
                    localStorage.removeItem('pending_action'); // Clear after execution
                    toast.success(t('author.auto_followed', 'Ação pendente executada: Agora segue este autor!'));
                } else if ((Date.now() - action.timestamp) >= 3600000) {

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

        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const status = await apiService.checkFollowStatus(authorUsername, token);

                setIsFollowing(status);
            }
        } catch (error) {
            console.error('[useFollow] checkFollowStatus error:', error);
        }
    };

    const handleFollow = async () => {


        if (!authorUsername || authorUsername === 'undefined') {
            console.error('[useFollow] ABORT: Invalid or missing authorUsername:', authorUsername);
            toast.error(t('author.invalid_username', 'Erro: Utilizador não identificado'));
            return;
        }

        if (!isAuthenticated) {

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

            if (!token) throw new Error('Security token (JWT) is missing from storage');

            if (isFollowing) {

                await apiService.unfollowAuthor(authorUsername, token);
                setIsFollowing(false);
                toast.success(t('author.unfollowed', 'Deixou de seguir este autor'));
            } else {

                await apiService.followAuthor(authorUsername, token);
                setIsFollowing(true);
                toast.success(t('author.followed', 'Agora está a seguir este autor!'));
            }
        } catch (error: any) {
            console.error('[useFollow] handleFollow CRITICAL ERROR:', error);
            const msg = error.message || 'Erro desconhecido';
            toast.error(`${t('author.error', 'Erro ao atualizar estado de seguir')}: ${msg}`);
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
