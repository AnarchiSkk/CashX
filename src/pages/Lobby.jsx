import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useBalance } from '../hooks/useBalance';
import { useState } from 'react';
import AuthModal from '../components/auth/AuthModal';

const games = [
    {
        id: 'crash',
        name: 'Crash',
        description: 'Encaissez avant le crash !',
        icon: '🚀',
        gradient: 'from-blue-600/20 to-indigo-600/20',
        border: 'border-blue-500/20',
        hoverBorder: 'hover:border-blue-500/40',
        tag: 'Populaire',
        tagColor: 'bg-blue-500/20 text-blue-400',
        rtp: '96%',
    },
    {
        id: 'plinko',
        name: 'Plinko',
        description: 'Laissez tomber la bille !',
        icon: '🔮',
        gradient: 'from-purple-600/20 to-pink-600/20',
        border: 'border-purple-500/20',
        hoverBorder: 'hover:border-purple-500/40',
        tag: 'Fun',
        tagColor: 'bg-purple-500/20 text-purple-400',
        rtp: '97%',
    },
    {
        id: 'sugar-rush',
        name: 'Sugar Rush',
        description: 'Grille de symboles sucrés !',
        icon: '🍬',
        gradient: 'from-pink-600/20 to-rose-600/20',
        border: 'border-pink-500/20',
        hoverBorder: 'hover:border-pink-500/40',
        tag: 'Slots',
        tagColor: 'bg-pink-500/20 text-pink-400',
        rtp: '96.2%',
    },
    {
        id: 'roulette',
        name: 'Roulette',
        description: 'Faites vos jeux !',
        icon: '🎡',
        gradient: 'from-red-600/20 to-orange-600/20',
        border: 'border-red-500/20',
        hoverBorder: 'hover:border-red-500/40',
        tag: 'Classique',
        tagColor: 'bg-red-500/20 text-red-400',
        rtp: '97.3%',
    },
    {
        id: 'blackjack',
        name: 'Blackjack',
        description: 'Battez le croupier !',
        icon: '🃏',
        gradient: 'from-emerald-600/20 to-teal-600/20',
        border: 'border-emerald-500/20',
        hoverBorder: 'hover:border-emerald-500/40',
        tag: 'Cartes',
        tagColor: 'bg-emerald-500/20 text-emerald-400',
        rtp: '99.5%',
    },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Lobby() {
    const { user } = useAuth();
    const { balance } = useBalance();
    const [showAuth, setShowAuth] = useState(false);

    return (
        <div className="space-y-8">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl glass p-8 lg:p-12"
            >
                {/* Background glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold-500/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="badge-emerald mb-4 text-sm"
                    >
                        🎰 Social Casino
                    </motion.div>

                    <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
                        Bienvenue sur <span className="gradient-text">CashX</span>
                    </h1>
                    <p className="text-white/50 text-lg mb-6 max-w-lg">
                        {user
                            ? `Votre solde : ${balance.toLocaleString()} X-Coins. Bonne chance !`
                            : '1000 X-Coins offerts pour commencer ! Jouez gratuitement aux meilleurs jeux de casino.'}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link to="/game/crash">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary text-lg px-8 py-4"
                            >
                                Jouer Maintenant
                                <i className="ph-light ph-play ml-2"></i>
                            </motion.button>
                        </Link>
                        {!user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAuth(true)}
                                className="btn-secondary text-lg px-8 py-4"
                            >
                                <i className="ph-light ph-gift mr-2"></i>
                                Obtenir 1000 X-Coins
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {[
                    { label: 'Joueurs en ligne', value: '1,247', icon: 'ph-users' },
                    { label: 'Gains aujourd\'hui', value: '2.4M', icon: 'ph-coins' },
                    { label: 'Parties jouées', value: '18.5K', icon: 'ph-game-controller' },
                    { label: 'Plus gros gain', value: '125K', icon: 'ph-crown' },
                ].map((stat, i) => (
                    <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <i className={`ph-light ${stat.icon} text-emerald-400 text-lg`}></i>
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{stat.value}</p>
                            <p className="text-white/40 text-xs">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Games Grid */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <i className="ph-light ph-fire text-orange-400"></i>
                        Jeux Populaires
                    </h2>
                    <div className="flex gap-2">
                        {['Tous', 'Slots', 'Table', 'Instant'].map((f, i) => (
                            <button
                                key={f}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${i === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {games.map((game) => (
                        <motion.div key={game.id} variants={item}>
                            <Link to={`/game/${game.id}`}>
                                <div className={`card-game border ${game.border} ${game.hoverBorder}`}>
                                    {/* Game visual */}
                                    <div className={`h-44 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-casino-card/80 to-transparent"></div>

                                        {/* Floating icon */}
                                        <motion.span
                                            className="text-7xl relative z-10 filter drop-shadow-2xl"
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            {game.icon}
                                        </motion.span>

                                        {/* Tag */}
                                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-semibold ${game.tagColor}`}>
                                            {game.tag}
                                        </span>

                                        {/* RTP */}
                                        <span className="absolute bottom-3 right-3 text-[10px] text-white/30 font-mono">
                                            RTP {game.rtp}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold text-lg mb-1">{game.name}</h3>
                                        <p className="text-white/40 text-sm">{game.description}</p>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                                    <span className="text-[7px] font-black text-casino-dark">X</span>
                                                </div>
                                                <span className="text-xs text-white/50">Min: 10</span>
                                            </div>
                                            <span className="text-xs text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                                                Jouer →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </div>
    );
}
