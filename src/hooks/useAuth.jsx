import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            // Guest mode by default when Supabase is not configured or no user
            const guestData = localStorage.getItem('cashx_guest');
            if (guestData) {
                setUser(JSON.parse(guestData));
                setIsGuest(true);
            }
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                setIsGuest(false);
            } else {
                 // Check for guest if not logged in
                const guestData = localStorage.getItem('cashx_guest');
                if (guestData) {
                    setUser(JSON.parse(guestData));
                    setIsGuest(true);
                }
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setIsGuest(false);
            } else {
                // Determine if we should fall back to guest or just be null
                // Ideally, on sign out, we might want to clear user or go to guest
               if (!session) {
                   const guestData = localStorage.getItem('cashx_guest');
                   if (guestData) {
                       setUser(JSON.parse(guestData));
                       setIsGuest(true);
                   } else {
                       setUser(null);
                       setIsGuest(false);
                   }
               }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, username) => {
        if (!isSupabaseConfigured()) {
            const guest = { id: 'guest-' + Date.now(), email, username, isGuest: true };
            localStorage.setItem('cashx_guest', JSON.stringify(guest));
            setUser(guest);
            setIsGuest(true);
            return { data: guest, error: null };
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        if (!isSupabaseConfigured()) {
            const guest = { id: 'guest-' + Date.now(), email, isGuest: true };
            localStorage.setItem('cashx_guest', JSON.stringify(guest));
            setUser(guest);
            setIsGuest(true);
            return { data: guest, error: null };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signInWithGoogle = async () => {
        if (!isSupabaseConfigured()) {
            const guest = { id: 'guest-google-' + Date.now(), email: 'google@guest.com', username: 'GoogleUser', isGuest: true };
            localStorage.setItem('cashx_guest', JSON.stringify(guest));
            setUser(guest);
            setIsGuest(true);
            return { data: guest, error: null };
        }
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        return { data, error };
    };

    const signOut = async () => {
        if (isGuest || !isSupabaseConfigured()) {
            localStorage.removeItem('cashx_guest');
            localStorage.removeItem('cashx_balance');
            localStorage.removeItem('cashx_claimed_packs');
            localStorage.removeItem('cashx_missions');
            setUser(null);
            setIsGuest(false);
            return;
        }
        await supabase.auth.signOut();
        setUser(null);
    };

    const playAsGuest = () => {
        const guest = {
            id: 'guest-' + Date.now(),
            email: null,
            username: 'Invité',
            isGuest: true
        };
        localStorage.setItem('cashx_guest', JSON.stringify(guest));
        setUser(guest);
        setIsGuest(true);
    };

    return (
        <AuthContext.Provider value={{
            user, loading, isGuest,
            signUp, signIn, signInWithGoogle, signOut, playAsGuest
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
