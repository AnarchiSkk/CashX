import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { motion } from 'framer-motion';
import AuthModal from '../auth/AuthModal';

export default function Header({ onToggleSidebar, onToggleChat }) {
    const { user, isGuest, signOut } = useAuth();
    const { balance } = useBalance();
    const [showAuth, setShowAuth] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-30 glass-strong h-16 flex items-center px-4 lg:px-6 gap-4">
                {/* Burger button */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden text-white/60 hover:text-white transition-colors p-2"
                >
                    <i className="ph-light ph-list text-xl"></i>
                </button>

                {/* Search bar */}
                <div className="flex-1 max-w-md hidden sm:block">
                    <div className="relative">
                        <i className="ph-light ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/30"></i>
                        <input
                            type="text"
                            placeholder="Rechercher un jeu..."
                            className="input-field pl-10 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 sm:hidden" />

                {/* Balance display */}
                <motion.div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass cursor-default"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow-gold animate-pulse-glow" style={{ '--tw-shadow': '0 0 10px rgba(245,158,11,0.4)' }}>
                        <span className="text-[10px] font-black text-casino-dark">X</span>
                    </div>
                    <motion.span
                        key={balance}
                        initial={{ scale: 1.2, color: '#10b981' }}
                        animate={{ scale: 1, color: '#e2e8f0' }}
                        className="font-bold text-sm tabular-nums"
                    >
                        {balance.toLocaleString()}
                    </motion.span>
                    <span className="text-white/40 text-xs hidden sm:inline">X-Coins</span>
                </motion.div>

                {/* Profile / Auth */}
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all"
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                <i className="ph-light ph-user text-sm text-white"></i>
                            </div>
                            <span className="text-sm font-medium text-white/80 hidden md:inline">
                                {isGuest ? 'Invité' : (user.user_metadata?.username || user.email?.split('@')[0] || 'Joueur')}
                            </span>
                            <i className="ph-light ph-caret-down text-white/40 text-xs"></i>
                        </button>

                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 top-12 w-48 rounded-xl glass-strong p-2 z-50"
                                >
                                    {isGuest && (
                                        <button
                                            onClick={() => { setShowDropdown(false); setShowAuth(true); }}
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                                        >
                                            <i className="ph-light ph-sign-in"></i>
                                            Créer un compte
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setShowDropdown(false); signOut(); }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <i className="ph-light ph-sign-out"></i>
                                        Déconnexion
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAuth(true)}
                        className="btn-primary text-sm px-4 py-2"
                    >
                        <i className="ph-light ph-sign-in mr-1"></i>
                        Connexion
                    </button>
                )}

                {/* Chat toggle (mobile) */}
                <button
                    onClick={onToggleChat}
                    className="xl:hidden text-white/60 hover:text-white transition-colors p-2"
                >
                    <i className="ph-light ph-chat-circle-dots text-xl"></i>
                </button>
            </header>

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </>
    );
}
