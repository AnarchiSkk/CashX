import { motion } from 'framer-motion';

// Simulated leaderboard data
const players = Array.from({ length: 50 }, (_, i) => ({
    rank: i + 1,
    username: [
        'CryptoKing99', 'LuckyAce', 'GoldRush88', 'NeonWolf', 'DiamondHands',
        'MoonBet', 'StarPlayer', 'ThunderBolt', 'PhoenixRise', 'ShadowFox',
        'IronWhale', 'CosmicSpin', 'NightOwl77', 'VelvetQ', 'ZenMaster',
        'RoyalFlush', 'FireStorm', 'OceanBlue', 'MysticRose', 'TitanBet',
        'PixelPro', 'AlphaWin', 'BetaLuck', 'GammaRoll', 'DeltaSpin',
        'EpsilonAce', 'ZetaCash', 'EtaGold', 'ThetaMax', 'IotaWin',
        'KappaKing', 'LambdaLuck', 'MuMaster', 'NuNinja', 'XiXtreme',
        'OmicronOG', 'PiPlayer', 'RhoRoller', 'SigmaStar', 'TauTop',
        'UpsilonUltra', 'PhiFlash', 'ChiChamp', 'PsiPower', 'OmegaOne',
        'AceHigh', 'BetBoss', 'CashCow', 'DiceDemon', 'EliteEdge',
    ][i],
    balance: Math.floor(Math.max(0, 500000 - i * 8000 + Math.random() * 5000)),
    gamesPlayed: Math.floor(Math.random() * 2000 + 100),
    winRate: Math.floor(Math.random() * 30 + 35),
}));

const getRankBadge = (rank) => {
    if (rank === 1) return { emoji: '🥇', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' };
    if (rank === 2) return { emoji: '🥈', color: 'text-gray-300', bg: 'bg-gray-400/10 border-gray-400/20' };
    if (rank === 3) return { emoji: '🥉', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    return { emoji: '', color: 'text-white/40', bg: '' };
};

export default function Leaderboard() {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="ph-light ph-trophy text-gold-400"></i>
                    Classement
                </h1>
                <p className="text-white/40 text-sm mt-1">Top 50 des joueurs CashX par solde total</p>
            </motion.div>

            {/* Top 3 cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {players.slice(0, 3).map((player, i) => {
                    const badge = getRankBadge(player.rank);
                    return (
                        <motion.div
                            key={player.rank}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={`glass rounded-2xl p-5 border ${badge.bg} text-center`}
                        >
                            <span className="text-4xl mb-2 block">{badge.emoji}</span>
                            <p className={`text-lg font-bold ${badge.color}`}>{player.username}</p>
                            <p className="text-2xl font-black gradient-text-gold mt-1">
                                {player.balance.toLocaleString()}
                            </p>
                            <p className="text-xs text-white/30 mt-1">X-Coins</p>
                            <div className="flex justify-center gap-4 mt-3">
                                <div>
                                    <p className="text-xs text-white/50 font-semibold">{player.gamesPlayed}</p>
                                    <p className="text-[10px] text-white/20">Parties</p>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-400 font-semibold">{player.winRate}%</p>
                                    <p className="text-[10px] text-white/20">Win Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs text-white/30 font-medium px-5 py-3">Rang</th>
                                <th className="text-left text-xs text-white/30 font-medium px-5 py-3">Joueur</th>
                                <th className="text-right text-xs text-white/30 font-medium px-5 py-3">Solde</th>
                                <th className="text-right text-xs text-white/30 font-medium px-5 py-3 hidden sm:table-cell">Parties</th>
                                <th className="text-right text-xs text-white/30 font-medium px-5 py-3 hidden sm:table-cell">Win Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.slice(3).map((player, i) => (
                                <motion.tr
                                    key={player.rank}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.02 * i }}
                                    className="border-b border-white/3 hover:bg-white/3 transition-colors"
                                >
                                    <td className="px-5 py-3 text-sm text-white/40 font-mono">{player.rank}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                                                <span className="text-xs font-bold text-emerald-400">
                                                    {player.username[0]}
                                                </span>
                                            </div>
                                            <span className="text-sm text-white/70 font-medium">{player.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm text-gold-400 font-semibold tabular-nums">
                                        {player.balance.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm text-white/30 hidden sm:table-cell tabular-nums">
                                        {player.gamesPlayed}
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm hidden sm:table-cell">
                                        <span className={player.winRate > 50 ? 'text-emerald-400' : 'text-white/30'}>
                                            {player.winRate}%
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
