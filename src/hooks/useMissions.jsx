import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useBalance } from './useBalance';

const MissionsContext = createContext(null);

const INITIAL_MISSIONS = [
    {
        id: 'crash_10',
        title: 'Pilote de Crash',
        description: 'Jouer 10 parties de Crash',
        game: 'crash',
        target: 10,
        progress: 0,
        reward: 500,
        completed: false,
        claimed: false,
        icon: '🚀',
    },
    {
        id: 'plinko_5',
        title: 'Maître du Plinko',
        description: 'Jouer 5 parties de Plinko',
        game: 'plinko',
        target: 5,
        progress: 0,
        reward: 300,
        completed: false,
        claimed: false,
        icon: '🔮',
    },
    {
        id: 'blackjack_win_3',
        title: 'As du Blackjack',
        description: 'Gagner 3 parties de Blackjack',
        game: 'blackjack_win',
        target: 3,
        progress: 0,
        reward: 750,
        completed: false,
        claimed: false,
        icon: '🃏',
    },
    {
        id: 'roulette_10',
        title: 'Roi de la Roulette',
        description: 'Jouer 10 parties de Roulette',
        game: 'roulette',
        target: 10,
        progress: 0,
        reward: 500,
        completed: false,
        claimed: false,
        icon: '🎡',
    },
    {
        id: 'sugar_rush_5',
        title: 'Sugar Addict',
        description: 'Jouer 5 parties de Sugar Rush',
        game: 'sugarrush',
        target: 5,
        progress: 0,
        reward: 400,
        completed: false,
        claimed: false,
        icon: '🍬',
    },
    {
        id: 'big_win',
        title: 'Big Winner',
        description: 'Gagner plus de 5000 X-Coins en une seule partie',
        game: 'any_bigwin',
        target: 1,
        progress: 0,
        reward: 2000,
        completed: false,
        claimed: false,
        icon: '💎',
    },
    {
        id: 'play_all',
        title: 'Explorateur',
        description: 'Jouer à chacun des 5 jeux au moins une fois',
        game: 'play_all',
        target: 5,
        progress: 0,
        reward: 1000,
        completed: false,
        claimed: false,
        icon: '🗺️',
        gamesPlayed: [],
    },
    {
        id: 'total_50',
        title: 'Joueur Assidu',
        description: 'Jouer 50 parties au total',
        game: 'any',
        target: 50,
        progress: 0,
        reward: 3000,
        completed: false,
        claimed: false,
        icon: '🏆',
    },
];

export function MissionsProvider({ children }) {
    const { addCoins } = useBalance();
    const [missions, setMissions] = useState(() => {
        const saved = localStorage.getItem('cashx_missions');
        return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    });

    useEffect(() => {
        localStorage.setItem('cashx_missions', JSON.stringify(missions));
    }, [missions]);

    const trackGame = useCallback((gameId, isWin = false, winAmount = 0) => {
        setMissions(prev => prev.map(mission => {
            if (mission.completed) return mission;

            let newProgress = mission.progress;

            // Game-specific missions
            if (mission.game === gameId) {
                newProgress = mission.progress + 1;
            }
            // Win-specific missions
            if (mission.game === `${gameId}_win` && isWin) {
                newProgress = mission.progress + 1;
            }
            // Any game missions
            if (mission.game === 'any') {
                newProgress = mission.progress + 1;
            }
            // Big win mission
            if (mission.game === 'any_bigwin' && winAmount > 5000) {
                newProgress = 1;
            }
            // Play all games
            if (mission.game === 'play_all') {
                const played = new Set(mission.gamesPlayed || []);
                played.add(gameId);
                return {
                    ...mission,
                    gamesPlayed: [...played],
                    progress: played.size,
                    completed: played.size >= mission.target,
                };
            }

            const completed = newProgress >= mission.target;
            return { ...mission, progress: Math.min(newProgress, mission.target), completed };
        }));
    }, []);

    const claimReward = useCallback((missionId) => {
        setMissions(prev => prev.map(mission => {
            if (mission.id === missionId && mission.completed && !mission.claimed) {
                addCoins(mission.reward);
                return { ...mission, claimed: true };
            }
            return mission;
        }));
    }, [addCoins]);

    const resetMissions = useCallback(() => {
        setMissions(INITIAL_MISSIONS);
        localStorage.removeItem('cashx_missions');
    }, []);

    return (
        <MissionsContext.Provider value={{ missions, trackGame, claimReward, resetMissions }}>
            {children}
        </MissionsContext.Provider>
    );
}

export const useMissions = () => {
    const context = useContext(MissionsContext);
    if (!context) throw new Error('useMissions must be used within MissionsProvider');
    return context;
};
