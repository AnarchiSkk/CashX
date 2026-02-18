import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

export function usePlayTime() {
    const { user, isGuest } = useAuth();
    const [timeSinceLastClaim, setTimeSinceLastClaim] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);

    const fetchLastClaim = useCallback(async () => {
        if (!user || isGuest || !isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('last_reward_claim')
            .eq('id', user.id)
            .single();

        if (data?.last_reward_claim) {
            const lastClaim = new Date(data.last_reward_claim).getTime();
            const now = Date.now();
            setTimeSinceLastClaim(Math.floor((now - lastClaim) / 1000));
        }
        setLoading(false);
    }, [user, isGuest]);

    useEffect(() => {
        fetchLastClaim();

        // Update local timer every second
        const interval = setInterval(() => {
            setTimeSinceLastClaim(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [fetchLastClaim]);

    const claimReward = async (amount, requiredMinutes) => {
        if (!user || isGuest) return { error: 'Connectez-vous pour réclamer' };

        try {
            const { data, error } = await supabase.rpc('claim_loyalty_reward', {
                reward_amount: amount,
                time_required_minutes: requiredMinutes
            });

            if (error) throw error;

            // Reset timer locally on success
            setTimeSinceLastClaim(0);
            return { data };
        } catch (err) {
            console.error('Error claiming reward:', err);
            return { error: err.message || 'Erreur lors de la réclamation' };
        }
    };

    return { timeSinceLastClaim, loading, claimReward, refresh: fetchLastClaim };
}
