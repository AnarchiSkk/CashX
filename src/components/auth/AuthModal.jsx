import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function AuthModal({ isOpen, onClose }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signInWithGoogle, playAsGuest } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error: err } = await signIn(email, password);
                if (err) setError(err.message || 'Erreur de connexion');
                else onClose();
            } else {
                const { error: err } = await signUp(email, password, username);
                if (err) setError(err.message || 'Erreur lors de l\'inscription');
                else onClose();
            }
        } catch (err) {
            setError('Une erreur est survenue');
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        setError('');
        const { error: err } = await signInWithGoogle();
        if (err) setError(err.message || 'Erreur Google');
        else onClose();
    };

    const handleGuest = () => {
        playAsGuest();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-strong rounded-3xl w-full max-w-md p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-glow-emerald">
                                <span className="text-2xl font-black text-white">X</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {mode === 'login' ? 'Connexion' : 'Créer un compte'}
                            </h2>
                            <p className="text-sm text-white/40 mt-1">
                                {mode === 'login' ? 'Retrouvez vos X-Coins' : 'Recevez 1000 X-Coins gratuits !'}
                            </p>
                        </div>

                        {/* Google button */}
                        <button
                            onClick={handleGoogle}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all mb-4"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuer avec Google
                        </button>

                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-xs text-white/30">ou</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'signup' && (
                                <div>
                                    <label className="text-xs text-white/40 mb-1.5 block">Nom d'utilisateur</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input-field"
                                        placeholder="CryptoKing99"
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-white/40 mb-1.5 block">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/40 mb-1.5 block">Mot de passe</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'Créer mon compte')}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <div className="text-center mt-5">
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                {mode === 'login' ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
                            </button>
                        </div>

                        {/* Guest mode */}
                        <div className="mt-4 pt-4 border-t border-white/5 text-center">
                            <button
                                onClick={handleGuest}
                                className="text-xs text-white/30 hover:text-white/60 transition-colors"
                            >
                                <i className="ph-light ph-game-controller mr-1"></i>
                                Jouer en tant qu'invité
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
