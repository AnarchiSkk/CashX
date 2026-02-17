import { motion } from 'framer-motion';
import { useMissions } from '../hooks/useMissions';

export default function Missions() {
    const { missions, claimReward } = useMissions();

    const activeMissions = missions.filter(m => !m.claimed);
    const completedMissions = missions.filter(m => m.claimed);

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="ph-light ph-target text-emerald-400"></i>
                    Missions
                </h1>
                <p className="text-white/40 text-sm mt-1">Complétez des défis pour gagner des X-Coins bonus !</p>
            </motion.div>

            {/* Progress summary */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5 flex flex-wrap items-center gap-6"
            >
                <div>
                    <p className="text-3xl font-black gradient-text">
                        {missions.filter(m => m.completed).length}/{missions.length}
                    </p>
                    <p className="text-xs text-white/30">Missions complétées</p>
                </div>
                <div>
                    <p className="text-3xl font-black gradient-text-gold">
                        {missions.reduce((acc, m) => acc + (m.claimed ? m.reward : 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-white/30">X-Coins réclamés</p>
                </div>
                <div>
                    <p className="text-3xl font-black text-white/60">
                        {missions.filter(m => m.completed && !m.claimed).length}
                    </p>
                    <p className="text-xs text-white/30">À réclamer</p>
                </div>
            </motion.div>

            {/* Active missions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ph-light ph-lightning text-gold-400"></i>
                    Missions actives
                    <span className="text-xs text-white/20">({activeMissions.length})</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeMissions.map((mission, i) => (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={`glass rounded-2xl p-5 border transition-all duration-300
                ${mission.completed
                                    ? 'border-emerald-500/30 shadow-glow-emerald'
                                    : 'border-casino-border hover:border-white/10'}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-3xl">{mission.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold">{mission.title}</h3>
                                    <p className="text-white/40 text-sm mt-0.5">{mission.description}</p>

                                    {/* Progress bar */}
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-white/30">{mission.progress}/{mission.target}</span>
                                            <span className="text-emerald-400 font-semibold">
                                                +{mission.reward} X-Coins
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-casino-dark overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Claim button */}
                                    {mission.completed && !mission.claimed && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => claimReward(mission.id)}
                                            className="btn-gold mt-3 text-sm px-4 py-2"
                                        >
                                            <i className="ph-light ph-gift mr-1"></i>
                                            Réclamer {mission.reward} X-Coins
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Completed missions */}
            {completedMissions.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white/40 mb-4 flex items-center gap-2">
                        <i className="ph-light ph-check-circle text-emerald-500/50"></i>
                        Missions terminées
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {completedMissions.map((mission) => (
                            <div key={mission.id} className="glass rounded-xl p-4 opacity-50 border border-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{mission.icon}</span>
                                    <div>
                                        <p className="text-white/60 font-medium text-sm line-through">{mission.title}</p>
                                        <p className="text-emerald-500/50 text-xs">+{mission.reward} X-Coins réclamés ✓</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
