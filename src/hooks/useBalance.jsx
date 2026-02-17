import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

const BalanceContext = createContext(null);

const INITIAL_BALANCE = 1000;

export function BalanceProvider({ children }) {
    const { user, isGuest } = useAuth();
    const [balance, setBalance] = useState(INITIAL_BALANCE);
    const [loading, setLoading] = useState(true);

    // Load balance
    useEffect(() => {
        if (!user) {
            setBalance(INITIAL_BALANCE);
            setLoading(false);
            return;
        }

        if (isGuest || !isSupabaseConfigured()) {
            const saved = localStorage.getItem('cashx_balance');
            setBalance(saved ? parseInt(saved) : INITIAL_BALANCE);
            setLoading(false);
            return;
        }

        // Fetch from Supabase
        const fetchBalance = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', user.id)
                .single();

            if (data) {
                setBalance(data.balance);
            } else if (error?.code === 'PGRST116') {
                // Profile doesn't exist, create it
                await supabase.from('profiles').insert({
                    id: user.id,
                    username: user.user_metadata?.username || user.email?.split('@')[0] || 'Player',
                    balance: INITIAL_BALANCE,
                });
                setBalance(INITIAL_BALANCE);
            }
            setLoading(false);
        };

        fetchBalance();
    }, [user, isGuest]);

    const updateBalance = useCallback(async (delta) => {
        const newBalance = Math.max(0, balance + delta);
        setBalance(newBalance);

        if (isGuest || !isSupabaseConfigured()) {
            localStorage.setItem('cashx_balance', newBalance.toString());
            return newBalance;
        }

        if (user && isSupabaseConfigured()) {
            await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', user.id);
        }

        return newBalance;
    }, [balance, user, isGuest]);

    const addCoins = useCallback((amount) => updateBalance(amount), [updateBalance]);
    const removeCoins = useCallback((amount) => updateBalance(-amount), [updateBalance]);

    return (
        <BalanceContext.Provider value={{ balance, loading, updateBalance, addCoins, removeCoins }}>
            {children}
        </BalanceContext.Provider>
    );
}

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) throw new Error('useBalance must be used within BalanceProvider');
    return context;
};
