import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CrashGame from '../components/games/CrashGame';
import PlinkoGame from '../components/games/PlinkoGame';
import SugarRushGame from '../components/games/SugarRushGame';
import RouletteGame from '../components/games/RouletteGame';
import BlackjackGame from '../components/games/BlackjackGame';

const gameComponents = {
    crash: CrashGame,
    plinko: PlinkoGame,
    'sugar-rush': SugarRushGame,
    roulette: RouletteGame,
    blackjack: BlackjackGame,
};

const gameNames = {
    crash: 'Crash',
    plinko: 'Plinko',
    'sugar-rush': 'Sugar Rush',
    roulette: 'Roulette',
    blackjack: 'Blackjack',
};

export default function GamePage() {
    const { id } = useParams();
    const GameComponent = gameComponents[id];

    if (!GameComponent) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">🎮</span>
                    <h2 className="text-xl font-bold text-white mb-2">Jeu introuvable</h2>
                    <Link to="/" className="text-emerald-400 hover:text-emerald-300 text-sm">
                        ← Retour au lobby
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Back button and title */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    to="/"
                    className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    <i className="ph-light ph-arrow-left"></i>
                </Link>
                <h1 className="text-xl font-bold text-white">{gameNames[id]}</h1>
            </div>

            <GameComponent />
        </motion.div>
    );
}
