import { usePlayTime } from '../hooks/usePlayTime';
import { useAuth } from '../hooks/useAuth';

// ... (keep imports)

export default function Boutique() {
    const { addCoins } = useBalance();
    const { user, isGuest } = useAuth();
    const { timeSinceLastClaim, claimReward } = usePlayTime();

    // Config for loyalty reward
    const REWARD_INTERVAL_MINUTES = 30;
    const REWARD_AMOUNT = 500;

    const [claimedPacks, setClaimedPacks] = useState(() => {
        const saved = localStorage.getItem('cashx_claimed_packs');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSuccess, setShowSuccess] = useState(null);
    const [rewardLoading, setRewardLoading] = useState(false);

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

    const handleLoyaltyClaim = async () => {
        if (rewardLoading) return;
        setRewardLoading(true);
        const { data, error } = await claimReward(REWARD_AMOUNT, REWARD_INTERVAL_MINUTES);

        if (data) {
            addCoins(REWARD_AMOUNT); // Update local balance immediately
            setShowSuccess('loyalty');
            setTimeout(() => setShowSuccess(null), 2000);
        } else {
            alert(error || 'Erreur');
        }
        setRewardLoading(false);
    };

    const isClaimed = (packId) => claimedPacks.includes(packId);

    // Calculate progress for loyalty
    const secondsRequired = REWARD_INTERVAL_MINUTES * 60;
    const progress = Math.min(100, (timeSinceLastClaim / secondsRequired) * 100);
    const timeRemaining = Math.max(0, secondsRequired - timeSinceLastClaim);
    const minutesLeft = Math.floor(timeRemaining / 60);
    const secondsLeft = timeRemaining % 60;

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

            {/* Loyalty Reward Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-strong rounded-2xl p-6 border border-gold-500/20 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <i className="ph-fill ph-clock text-9xl text-gold-400"></i>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow-gold">
                        <i className="ph-fill ph-gift text-3xl text-casino-dark"></i>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-bold text-white">Récompense de Fidélité</h2>
                        <p className="text-white/50 text-sm mt-1">
                            Gagnez {REWARD_AMOUNT} X-Coins toutes les {REWARD_INTERVAL_MINUTES} minutes de présence !
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-3 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                        <div className="text-right text-xs text-gold-400 mt-1 font-mono">
                            {progress >= 100 ? 'Prêt à réclamer !' : `${minutesLeft}m ${secondsLeft}s restants`}
                        </div>
                    </div>

                    <div>
                        {!user || isGuest ? (
                            <div className="text-xs text-white/30 text-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                                Connectez-vous pour<br />accéder aux récompenses
                            </div>
                        ) : (
                            <button
                                onClick={handleLoyaltyClaim}
                                disabled={progress < 100 || rewardLoading}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg
                                ${progress >= 100
                                        ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-casino-dark hover:scale-105 shadow-glow-gold cursor-pointer'
                                        : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                            >
                                {rewardLoading ? '...' : (progress >= 100 ? 'Réclamer' : 'En attente')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Success animation for loyalty */}
                {showSuccess === 'loyalty' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"
                    >
                        <i className="ph-fill ph-check-circle"></i>
                        +{REWARD_AMOUNT} X-Coins !
                    </motion.div>
                )}
            </motion.div>

            {/* Info banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5 border border-gold-500/10 bg-gradient-to-r from-gold-500/5 to-transparent"
            >
                {/* ... existing info banner content ... */}
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
