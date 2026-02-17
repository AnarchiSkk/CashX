import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBalance } from '../../hooks/useBalance';
import { useMissions } from '../../hooks/useMissions';
import { CASINO_STATS } from '../../lib/gameLogic';
import CoinRain from '../ui/CoinRain';

const { numbers, redNumbers, blackNumbers, payouts } = CASINO_STATS.roulette;

const getNumberColor = (n) => {
    if (n === 0) return 'green';
    return redNumbers.includes(n) ? 'red' : 'black';
};

const BET_TYPES = [
    { id: 'red', label: 'Rouge', payout: 1, color: 'bg-red-600' },
    { id: 'black', label: 'Noir', payout: 1, color: 'bg-gray-800' },
    { id: 'odd', label: 'Impair', payout: 1 },
    { id: 'even', label: 'Pair', payout: 1 },
    { id: 'low', label: '1-18', payout: 1 },
    { id: 'high', label: '19-36', payout: 1 },
    { id: 'dozen1', label: '1-12', payout: 2 },
    { id: 'dozen2', label: '13-24', payout: 2 },
    { id: 'dozen3', label: '25-36', payout: 2 },
];

// The wheel order for European roulette
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
    11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
    22, 18, 29, 7, 28, 12, 35, 3, 26
];

export default function RouletteGame() {
    const { balance, addCoins, removeCoins } = useBalance();
    const { trackGame } = useMissions();
    const [bets, setBets] = useState({});
    const [chipValue, setChipValue] = useState(25);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [history, setHistory] = useState([]);
    const [lastWin, setLastWin] = useState(null);
    const [autoPlaying, setAutoPlaying] = useState(false);
    const [showCoinRain, setShowCoinRain] = useState(false);
    const autoRef = useRef(false);
    const lastBetsRef = useRef({});

    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

    const placeBet = (betId) => {
        if (spinning || chipValue > balance - totalBet) return;
        setBets(prev => ({ ...prev, [betId]: (prev[betId] || 0) + chipValue }));
    };

    const placeNumberBet = (num) => {
        if (spinning || chipValue > balance - totalBet) return;
        setBets(prev => ({ ...prev, [`num_${num}`]: (prev[`num_${num}`] || 0) + chipValue }));
    };

    const clearBets = () => {
        if (spinning) return;
        setBets({});
    };

    const checkWin = useCallback((num) => {
        let totalWinnings = 0;
        const color = getNumberColor(num);

        Object.entries(bets).forEach(([betId, amount]) => {
            let won = false;

            if (betId === 'red' && color === 'red') won = true;
            if (betId === 'black' && color === 'black') won = true;
            if (betId === 'odd' && num > 0 && num % 2 === 1) won = true;
            if (betId === 'even' && num > 0 && num % 2 === 0) won = true;
            if (betId === 'low' && num >= 1 && num <= 18) won = true;
            if (betId === 'high' && num >= 19 && num <= 36) won = true;
            if (betId === 'dozen1' && num >= 1 && num <= 12) won = true;
            if (betId === 'dozen2' && num >= 13 && num <= 24) won = true;
            if (betId === 'dozen3' && num >= 25 && num <= 36) won = true;
            if (betId === `num_${num}`) won = true;

            if (won) {
                const payout = betId.startsWith('num_') ? 35 : (BET_TYPES.find(b => b.id === betId)?.payout || 1);
                totalWinnings += amount + (amount * payout);
            }
        });

        return totalWinnings;
    }, [bets]);

    const spin = useCallback(() => {
        if (totalBet === 0 || spinning) return;

        removeCoins(totalBet);
        lastBetsRef.current = { ...bets };
        setSpinning(true);
        setResult(null);
        setLastWin(null);

        // Random result
        const winningNumber = numbers[Math.floor(Math.random() * numbers.length)];

        // Wheel animation
        const numberIndex = WHEEL_ORDER.indexOf(winningNumber);
        const degreesPerSlot = 360 / WHEEL_ORDER.length;
        const targetAngle = 360 * 5 + (360 - numberIndex * degreesPerSlot);
        setWheelRotation(prev => prev + targetAngle);

        setTimeout(() => {
            setResult(winningNumber);
            setSpinning(false);

            const winnings = checkWin(winningNumber);
            const profit = winnings - totalBet;

            if (winnings > 0) {
                addCoins(winnings);
                setLastWin({ winnings, profit });
                if (winnings > 5000) setShowCoinRain(true);
            } else {
                setLastWin({ winnings: 0, profit: -totalBet });
            }

            setHistory(prev => [{
                number: winningNumber,
                color: getNumberColor(winningNumber),
                won: winnings > 0,
                profit
            }, ...prev.slice(0, 19)]);

            trackGame('roulette', winnings > 0, winnings);
            setBets({});

            if (autoRef.current) {
                setBets(lastBetsRef.current);
                setTimeout(() => spin(), 2000);
            }
        }, 4500);
    }, [totalBet, spinning, bets, numbers, checkWin, removeCoins, addCoins, trackGame]);

    const toggleAuto = useCallback(() => {
        if (autoRef.current) {
            autoRef.current = false;
            setAutoPlaying(false);
        } else {
            autoRef.current = true;
            setAutoPlaying(true);
            if (!spinning && totalBet > 0) spin();
        }
    }, [spinning, totalBet, spin]);

    useEffect(() => { return () => { autoRef.current = false; }; }, []);

    // Table layout: 3 rows x 12 columns
    const tableNumbers = [];
    for (let col = 0; col < 12; col++) {
        for (let row = 2; row >= 0; row--) {
            tableNumbers.push(col * 3 + row + 1);
        }
    }

    return (
        <div className="space-y-4">
            {/* Result display */}
            <AnimatePresence>
                {lastWin && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-center py-3 rounded-xl ${lastWin.profit > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/10'}`}
                    >
                        <span className={`text-xl font-bold ${lastWin.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {lastWin.profit > 0 ? `+${lastWin.winnings.toLocaleString()} X-Coins 🎉` : `−${Math.abs(lastWin.profit)} X-Coins`}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {/* Wheel */}
                <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center xl:col-span-1">
                    <div className="relative w-48 h-48 mb-4">
                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-emerald-400"></div>

                        {/* Wheel */}
                        <motion.div
                            className="w-full h-full rounded-full border-4 border-gold-500/30 relative overflow-hidden"
                            style={{ rotate: wheelRotation }}
                            animate={{ rotate: wheelRotation }}
                            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
                        >
                            {WHEEL_ORDER.map((num, i) => {
                                const angle = (i / WHEEL_ORDER.length) * 360;
                                const color = getNumberColor(num);
                                return (
                                    <div
                                        key={num}
                                        className="absolute w-full h-full"
                                        style={{ transform: `rotate(${angle}deg)` }}
                                    >
                                        <div
                                            className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 text-center text-[6px] font-bold py-0.5
                        ${color === 'red' ? 'text-red-400' : color === 'green' ? 'text-emerald-400' : 'text-white/60'}`}
                                        >
                                            {num}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="absolute inset-4 rounded-full bg-casino-dark flex items-center justify-center">
                                <span className="text-xl font-black text-white/30">
                                    {result !== null ? result : '?'}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Result badge */}
                    {result !== null && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`px-4 py-2 rounded-xl text-lg font-bold
                ${getNumberColor(result) === 'red' ? 'bg-red-500/20 text-red-400' :
                                    getNumberColor(result) === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                                        'bg-white/10 text-white'}`}
                        >
                            {result}
                        </motion.div>
                    )}

                    {/* History dots */}
                    <div className="flex flex-wrap gap-1 mt-4 justify-center max-w-[200px]">
                        {history.slice(0, 20).map((h, i) => (
                            <div
                                key={i}
                                className={`w-6 h-6 rounded-full text-[8px] font-bold flex items-center justify-center
                  ${h.color === 'red' ? 'bg-red-600 text-white' :
                                        h.color === 'green' ? 'bg-emerald-500 text-white' :
                                            'bg-gray-700 text-white'}`}
                            >
                                {h.number}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Betting table */}
                <div className="xl:col-span-3 glass rounded-2xl p-4">
                    {/* Number grid */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            {/* Zero */}
                            <div className="flex gap-1 mb-1">
                                <button
                                    onClick={() => placeNumberBet(0)}
                                    disabled={spinning}
                                    className={`w-12 h-10 rounded-lg text-xs font-bold transition-all
                    bg-emerald-600/30 text-emerald-400 border border-emerald-500/30
                    hover:bg-emerald-500/40 disabled:opacity-50
                    ${bets['num_0'] ? 'ring-2 ring-emerald-400' : ''}`}
                                >
                                    0{bets['num_0'] ? ` (${bets['num_0']})` : ''}
                                </button>
                            </div>

                            {/* Number grid 3 rows x 12 cols */}
                            {[2, 1, 0].map(row => (
                                <div key={row} className="flex gap-1 mb-1">
                                    {Array.from({ length: 12 }, (_, col) => {
                                        const num = col * 3 + row + 1;
                                        const color = getNumberColor(num);
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => placeNumberBet(num)}
                                                disabled={spinning}
                                                className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all disabled:opacity-50
                          ${color === 'red' ? 'bg-red-600/30 text-red-400 border border-red-500/20 hover:bg-red-500/40' :
                                                        'bg-gray-700/30 text-white/60 border border-white/5 hover:bg-white/10'}
                          ${bets[`num_${num}`] ? 'ring-2 ring-gold-400' : ''}`}
                                            >
                                                {num}
                                                {bets[`num_${num}`] ? <span className="block text-[8px] text-gold-400">{bets[`num_${num}`]}</span> : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* Outside bets */}
                            <div className="grid grid-cols-3 gap-1 mt-2">
                                {['dozen1', 'dozen2', 'dozen3'].map(d => {
                                    const betType = BET_TYPES.find(b => b.id === d);
                                    return (
                                        <button
                                            key={d}
                                            onClick={() => placeBet(d)}
                                            disabled={spinning}
                                            className={`py-2 rounded-lg text-xs font-semibold glass transition-all
                        hover:bg-white/10 disabled:opacity-50
                        ${bets[d] ? 'border-2 border-gold-400 text-gold-400' : 'text-white/50'}`}
                                        >
                                            {betType.label} {bets[d] ? `(${bets[d]})` : ''}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-6 gap-1 mt-1">
                                {BET_TYPES.slice(0, 6).map(bet => (
                                    <button
                                        key={bet.id}
                                        onClick={() => placeBet(bet.id)}
                                        disabled={spinning}
                                        className={`py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50
                      ${bet.id === 'red' ? 'bg-red-600/30 text-red-400 hover:bg-red-500/40' :
                                                bet.id === 'black' ? 'bg-gray-700/30 text-white/60 hover:bg-white/10' :
                                                    'glass text-white/50 hover:bg-white/10'}
                      ${bets[bet.id] ? 'ring-2 ring-gold-400' : ''}`}
                                    >
                                        {bet.label} {bets[bet.id] ? `(${bets[bet.id]})` : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
                        {/* Chip selector */}
                        <div className="flex gap-1">
                            {[5, 25, 100, 500, 1000].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setChipValue(v)}
                                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all
                    ${chipValue === v
                                            ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-casino-dark scale-110 shadow-glow-gold'
                                            : 'glass text-white/40 hover:text-white'}`}
                                >
                                    {v >= 1000 ? '1K' : v}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1" />

                        <span className="text-sm text-white/30">
                            Mise : <span className="text-gold-400 font-bold">{totalBet}</span>
                        </span>

                        <button onClick={clearBets} disabled={spinning} className="btn-secondary text-xs px-3 py-2 disabled:opacity-30">
                            <i className="ph-light ph-x mr-1"></i> Effacer
                        </button>

                        <button
                            onClick={spin}
                            disabled={spinning || totalBet === 0}
                            className="btn-primary px-6 py-2 disabled:opacity-50"
                        >
                            {spinning ? '🎡 Spinning...' : 'Tourner'}
                        </button>

                        <button
                            onClick={toggleAuto}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
                ${autoPlaying ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30'}`}
                        >
                            {autoPlaying ? '⏸ Stop' : '▶ Auto'}
                        </button>
                    </div>

                    <div className="mt-2 text-[10px] text-white/15 flex gap-4">
                        <span>Roulette Européenne · Simple zéro</span>
                        <span>Avantage : {(CASINO_STATS.roulette.houseEdge * 100).toFixed(1)}%</span>
                        <span>RTP : {(CASINO_STATS.roulette.rtp * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <CoinRain active={showCoinRain} onComplete={() => setShowCoinRain(false)} />
        </div>
    );
}
