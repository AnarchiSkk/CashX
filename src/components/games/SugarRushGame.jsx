import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBalance } from '../../hooks/useBalance';
import { useMissions } from '../../hooks/useMissions';
import { CASINO_STATS } from '../../lib/gameLogic';
import CoinRain from '../ui/CoinRain';

const SYMBOLS = ['🍬', '🍭', '🧸', '⭐', '💚', '💜', '❤️', '🍇'];
const GRID_ROWS = 7;
const GRID_COLS = 7;

function generateGrid() {
    return Array.from({ length: GRID_ROWS }, () =>
        Array.from({ length: GRID_COLS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    );
}

function findClusters(grid) {
    const visited = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
    const clusters = [];

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (visited[r][c]) continue;
            const symbol = grid[r][c];
            const cluster = [];
            const stack = [[r, c]];
            while (stack.length > 0) {
                const [cr, cc] = stack.pop();
                if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
                if (visited[cr][cc] || grid[cr][cc] !== symbol) continue;
                visited[cr][cc] = true;
                cluster.push([cr, cc]);
                stack.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
            }
            if (cluster.length >= 5) {
                clusters.push({ symbol, cells: cluster, size: cluster.length });
            }
        }
    }
    return clusters;
}

function calculateWin(clusters, bet) {
    const payTable = CASINO_STATS.sugarRush.payTable;
    let totalMultiplier = 0;

    clusters.forEach(cluster => {
        const symbolPays = payTable[cluster.symbol];
        if (!symbolPays) return;

        const sizes = Object.keys(symbolPays).map(Number).sort((a, b) => b - a);
        for (const size of sizes) {
            if (cluster.size >= size) {
                totalMultiplier += symbolPays[size];
                break;
            }
        }
    });

    return Math.floor(bet * totalMultiplier);
}

export default function SugarRushGame() {
    const { balance, addCoins, removeCoins } = useBalance();
    const { trackGame } = useMissions();
    const [betAmount, setBetAmount] = useState(100);
    const [grid, setGrid] = useState(generateGrid());
    const [spinning, setSpinning] = useState(false);
    const [winCells, setWinCells] = useState(new Set());
    const [lastWin, setLastWin] = useState(null);
    const [history, setHistory] = useState([]);
    const [autoPlaying, setAutoPlaying] = useState(false);
    const [showCoinRain, setShowCoinRain] = useState(false);
    const autoRef = useRef(false);

    const spin = useCallback(() => {
        if (betAmount > balance || spinning) return;

        removeCoins(betAmount);
        setSpinning(true);
        setWinCells(new Set());
        setLastWin(null);

        // Animate spinning columns
        let count = 0;
        const interval = setInterval(() => {
            count++;
            setGrid(generateGrid());
            if (count >= 15) {
                clearInterval(interval);

                // Generate final grid
                const finalGrid = generateGrid();
                setGrid(finalGrid);

                // Find clusters
                const clusters = findClusters(finalGrid);
                const winnings = calculateWin(clusters, betAmount);
                const profit = winnings - betAmount;

                // Highlight winning cells
                const cells = new Set();
                clusters.forEach(c => c.cells.forEach(([r, cc]) => cells.add(`${r}-${cc}`)));
                setWinCells(cells);

                if (winnings > 0) {
                    addCoins(winnings);
                    setLastWin({ winnings, profit, clusters: clusters.length });
                    if (winnings > 5000) setShowCoinRain(true);
                } else {
                    setLastWin({ winnings: 0, profit: -betAmount, clusters: 0 });
                }

                setHistory(prev => [{
                    win: winnings,
                    profit,
                    clusters: clusters.length,
                    won: profit > 0
                }, ...prev.slice(0, 14)]);

                trackGame('sugarrush', profit > 0, winnings);
                setSpinning(false);

                if (autoRef.current) {
                    setTimeout(() => spin(), 1500);
                }
            }
        }, 80);
    }, [betAmount, balance, spinning, removeCoins, addCoins, trackGame]);

    const toggleAutoPlay = useCallback(() => {
        if (autoRef.current) {
            autoRef.current = false;
            setAutoPlaying(false);
        } else {
            autoRef.current = true;
            setAutoPlaying(true);
            if (!spinning) spin();
        }
    }, [spinning, spin]);

    useEffect(() => {
        return () => { autoRef.current = false; };
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Grid */}
            <div className="lg:col-span-2 glass rounded-2xl p-4 lg:p-6">
                {/* Win display */}
                <AnimatePresence>
                    {lastWin && lastWin.winnings > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center mb-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <span className="text-2xl font-black gradient-text">+{lastWin.winnings.toLocaleString()} X-Coins</span>
                            <span className="text-white/30 text-xs ml-2">({lastWin.clusters} clusters)</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Symbols grid */}
                <div className="grid gap-1.5 sm:gap-2 max-w-[500px] mx-auto"
                    style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
                >
                    {grid.map((row, r) =>
                        row.map((symbol, c) => {
                            const isWin = winCells.has(`${r}-${c}`);
                            return (
                                <motion.div
                                    key={`${r}-${c}`}
                                    animate={spinning ? {
                                        rotateX: [0, 360],
                                        transition: { duration: 0.3, delay: c * 0.05 }
                                    } : isWin ? {
                                        scale: [1, 1.15, 1],
                                        transition: { duration: 0.4, repeat: 2 }
                                    } : {}}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl sm:text-3xl
                    transition-all duration-300
                    ${isWin
                                            ? 'bg-emerald-500/20 border-2 border-emerald-400/50 shadow-glow-emerald'
                                            : 'bg-casino-dark/50 border border-white/5'}`}
                                >
                                    {symbol}
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Bottom info */}
                <div className="flex items-center justify-between mt-4 text-xs text-white/20">
                    <span>Cluster Pays · 5+ symboles adjacents</span>
                    <span>RTP {(CASINO_STATS.sugarRush.rtp * 100).toFixed(1)}%</span>
                </div>
            </div>

            {/* Controls */}
            <div className="glass rounded-2xl p-5 space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    🍬 Sugar Rush
                </h3>

                {/* Bet */}
                <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Mise</label>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                        className="input-field"
                        disabled={spinning}
                    />
                    <div className="flex gap-1.5 mt-2">
                        {[10, 50, 100, 250, 500].map(v => (
                            <button key={v} onClick={() => setBetAmount(v)} disabled={spinning}
                                className="flex-1 py-1.5 rounded-lg text-xs bg-casino-dark text-white/40 hover:text-white transition-all disabled:opacity-30">{v}</button>
                        ))}
                    </div>
                </div>

                {/* Spin button */}
                <button
                    onClick={spin}
                    disabled={spinning || betAmount > balance}
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                >
                    {spinning ? '🔄 Spinning...' : betAmount > balance ? 'Solde insuffisant' : '🎰 SPIN'}
                </button>

                {/* Autoplay */}
                <button
                    onClick={toggleAutoPlay}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${autoPlaying ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}
                >
                    {autoPlaying ? '⏸ Stop Autoplay' : '▶ Autoplay'}
                </button>

                {/* Pay table */}
                <div>
                    <p className="text-xs text-white/30 mb-2">Table des gains</p>
                    <div className="space-y-1">
                        {SYMBOLS.slice(0, 5).map(s => (
                            <div key={s} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-casino-dark">
                                <span>{s}</span>
                                <span className="text-white/40">5+: {CASINO_STATS.sugarRush.payTable[s]?.[5] || '?'}x</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div>
                    <p className="text-xs text-white/30 mb-2">Historique</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {history.map((h, i) => (
                            <div key={i} className="flex justify-between text-xs px-2 py-1.5 rounded bg-casino-dark">
                                <span className="text-white/30">{h.clusters} clst</span>
                                <span className={h.won ? 'text-emerald-400' : 'text-red-400'}>
                                    {h.won ? '+' : ''}{h.profit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CoinRain active={showCoinRain} onComplete={() => setShowCoinRain(false)} />
        </div>
    );
}
