import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBalance } from '../hooks/useBalance';

const packs = [
    {
        id: 'starter',
        name: 'Pack Starter',
        amount: 500,
        icon: '🎁',
        color: 'from-emerald-500/20 to-emerald-600/20',
        border: 'border-emerald-500/20',
        description: 'Un petit boost pour commencer',
        tag: 'Gratuit',
    },
    {
        id: 'lucky',
        name: 'Pack Lucky',
        amount: 2000,
        icon: '🍀',
        color: 'from-green-500/20 to-teal-600/20',
        border: 'border-green-500/20',
        description: 'La chance va tourner en votre faveur',
        tag: 'Populaire',
    },
    {
        id: 'high_roller',
        name: 'Pack High Roller',
        amount: 5000,
        icon: '💎',
        color: 'from-blue-500/20 to-indigo-600/20',
        border: 'border-blue-500/20',
        description: 'Pour les joueurs ambitieux',
        tag: 'Premium',
    },
    {
        id: 'vip',
        name: 'Pack VIP',
        amount: 15000,
        icon: '👑',
        color: 'from-gold-400/20 to-gold-600/20',
        border: 'border-gold-500/20',
        description: 'Le pack ultime des champions',
        tag: 'Exclusif',
    },
    {
        id: 'whale',
        name: 'Pack Whale',
        amount: 50000,
        icon: '🐋',
        color: 'from-purple-500/20 to-pink-600/20',
        border: 'border-purple-500/20',
        description: 'Dominez la compétition',
        tag: 'Légendaire',
    },
    {
        id: 'daily',
        name: 'Bonus Quotidien',
        amount: 100,
        icon: '📅',
        color: 'from-orange-500/20 to-red-600/20',
        border: 'border-orange-500/20',
        description: 'Revenez chaque jour',
        tag: 'Quotidien',
    },
];

export default function Boutique() {
    const { addCoins } = useBalance();
    const [claimedPacks, setClaimedPacks] = useState(() => {
        const saved = localStorage.getItem('cashx_claimed_packs');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSuccess, setShowSuccess] = useState(null);

    useEffect(() => {
        localStorage.setItem('cashx_claimed_packs', JSON.stringify(claimedPacks));
    }, [claimedPacks]);

    const claimPack = (pack) => {
        if (claimedPacks.includes(pack.id)) return;

        addCoins(pack.amount);
        setClaimedPacks(prev => [...prev, pack.id]);
        setShowSuccess(pack.id);
        setTimeout(() => setShowSuccess(null), 2000);
    };

    const isClaimed = (packId) => claimedPacks.includes(packId);

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="ph-light ph-storefront text-emerald-400"></i>
                    Boutique
                </h1>
                <p className="text-white/40 text-sm mt-1">
                    Récupérez vos packs de X-Coins gratuits ! Chaque pack ne peut être réclamé qu'une seule fois.
                </p>
            </motion.div>

            {/* Info banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5 border border-gold-500/10 bg-gradient-to-r from-gold-500/5 to-transparent"
            >
                <div className="flex items-center gap-3">
                    <i className="ph-light ph-info text-gold-400 text-2xl"></i>
                    <div>
                        <p className="text-gold-400 font-semibold text-sm">Mode Social Casino</p>
                        <p className="text-white/40 text-xs">
                            Les X-Coins sont 100% gratuits et n'ont aucune valeur monétaire réelle.
                            Chaque pack ne peut être réclamé qu'<strong className="text-white/60">une seule fois</strong>.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Claimed counter */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-white/30">
                    Packs réclamés : <span className="text-emerald-400 font-semibold">{claimedPacks.length}/{packs.length}</span>
                </span>
            </div>

            {/* Packs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.map((pack, i) => {
                    const claimed = isClaimed(pack.id);
                    return (
                        <motion.div
                            key={pack.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={`glass rounded-2xl overflow-hidden border transition-all duration-300
                ${claimed
                                    ? 'border-white/5 opacity-50'
                                    : `${pack.border} hover:scale-[1.02] hover:shadow-lg cursor-pointer`}`}
                            onClick={() => !claimed && claimPack(pack)}
                        >
                            {/* Visual */}
                            <div className={`h-32 bg-gradient-to-br ${pack.color} flex items-center justify-center relative`}>
                                <motion.span
                                    className="text-5xl"
                                    animate={!claimed ? { y: [0, -5, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {pack.icon}
                                </motion.span>
                                <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/10 text-white/70">
                                    {pack.tag}
                                </span>
                                {claimed && (
                                    <div className="absolute inset-0 bg-casino-dark/60 flex items-center justify-center">
                                        <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                                            <i className="ph-light ph-check-circle"></i> Réclamé
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="text-white font-bold">{pack.name}</h3>
                                <p className="text-white/40 text-xs mt-1">{pack.description}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                            <span className="text-[7px] font-black text-casino-dark">X</span>
                                        </div>
                                        <span className="text-gold-400 font-bold">{pack.amount.toLocaleString()}</span>
                                    </div>
                                    {!claimed ? (
                                        <span className="text-xs text-emerald-400 font-medium">
                                            Réclamer →
                                        </span>
                                    ) : (
                                        <span className="text-xs text-white/20">✓ Réclamé</span>
                                    )}
                                </div>

                                {/* Success animation */}
                                {showSuccess === pack.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg text-center"
                                    >
                                        +{pack.amount} X-Coins ajoutés ! 🎉
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
