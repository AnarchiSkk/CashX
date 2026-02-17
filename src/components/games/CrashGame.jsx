import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBalance } from '../../hooks/useBalance';
import { useMissions } from '../../hooks/useMissions';
import { CASINO_STATS } from '../../lib/gameLogic';
import CoinRain from '../ui/CoinRain';

export default function CrashGame() {
    const { balance, addCoins, removeCoins } = useBalance();
    const { trackGame } = useMissions();
    const [betAmount, setBetAmount] = useState(100);
    const [autoCashout, setAutoCashout] = useState(2.0);
    const [multiplier, setMultiplier] = useState(1.0);
    const [crashPoint, setCrashPoint] = useState(null);
    const [phase, setPhase] = useState('betting'); // betting, running, crashed, cashedout
    const [profit, setProfit] = useState(0);
    const [history, setHistory] = useState([]);
    const [autoMode, setAutoMode] = useState(false);
    const [autoPlaying, setAutoPlaying] = useState(false);
    const [showCoinRain, setShowCoinRain] = useState(false);
    const animRef = useRef(null);
    const startTimeRef = useRef(null);
    const canvasRef = useRef(null);

    const drawGraph = useCallback((currentMultiplier, crashed) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth * 2;
        const h = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        const cw = w / 2;
        const ch = h / 2;

        ctx.clearRect(0, 0, cw, ch);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const y = ch - (i * ch / 10);
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
        }

        // Curve
        const points = [];
        const maxX = cw - 20;
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const totalSteps = Math.min(200, Math.floor(elapsed * 30));

        for (let i = 0; i <= totalSteps; i++) {
            const t = i / Math.max(totalSteps, 1);
            const m = 1 + (currentMultiplier - 1) * (t * t);
            const x = 20 + t * (maxX - 20);
            const y = ch - 20 - ((m - 1) / Math.max(currentMultiplier - 1, 0.1)) * (ch - 40);
            points.push({ x, y: Math.max(5, y) });
        }

        if (points.length > 1) {
            const gradient = ctx.createLinearGradient(0, ch, 0, 0);
            gradient.addColorStop(0, crashed ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)');
            gradient.addColorStop(1, crashed ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)');

            // Fill
            ctx.beginPath();
            ctx.moveTo(points[0].x, ch - 20);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, ch - 20);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = crashed ? '#ef4444' : '#10b981';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Dot at end
            const last = points[points.length - 1];
            ctx.beginPath();
            ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = crashed ? '#ef4444' : '#10b981';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
            ctx.strokeStyle = crashed ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }, []);

    const startGame = useCallback(() => {
        if (betAmount > balance || betAmount <= 0) return;

        removeCoins(betAmount);
        const cp = CASINO_STATS.crash.getCrashPoint();
        setCrashPoint(cp);
        setMultiplier(1.0);
        setPhase('running');
        setProfit(0);
        startTimeRef.current = Date.now();

        const animate = () => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const m = Math.pow(Math.E, elapsed * 0.15); // exponential growth
            const currentMultiplier = parseFloat(m.toFixed(2));

            if (currentMultiplier >= cp) {
                setMultiplier(parseFloat(cp.toFixed(2)));
                setPhase('crashed');
                drawGraph(cp, true);
                setHistory(prev => [{ point: cp, won: false }, ...prev.slice(0, 9)]);
                trackGame('crash', false, 0);

                if (autoPlaying) {
                    setTimeout(() => startGame(), 2000);
                }
                return;
            }

            setMultiplier(currentMultiplier);
            drawGraph(currentMultiplier, false);

            // Auto cashout
            if (autoCashout > 0 && currentMultiplier >= autoCashout) {
                cashOut(currentMultiplier);
                return;
            }

            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);
    }, [betAmount, balance, autoCashout, autoPlaying, drawGraph, removeCoins, trackGame]);

    const cashOut = useCallback((currentMult) => {
        if (phase !== 'running' && !currentMult) return;
        const m = currentMult || multiplier;
        cancelAnimationFrame(animRef.current);

        const winnings = Math.floor(betAmount * m);
        const prof = winnings - betAmount;
        addCoins(winnings);
        setProfit(prof);
        setPhase('cashedout');
        setHistory(prev => [{ point: m, won: true, profit: prof }, ...prev.slice(0, 9)]);
        trackGame('crash', true, winnings);

        if (winnings > 5000) {
            setShowCoinRain(true);
        }

        if (autoPlaying) {
            setTimeout(() => startGame(), 2000);
        }
    }, [phase, multiplier, betAmount, addCoins, trackGame, autoPlaying, startGame]);

    useEffect(() => {
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    const toggleAutoPlay = () => {
        if (autoPlaying) {
            setAutoPlaying(false);
        } else {
            setAutoPlaying(true);
            if (phase === 'betting') startGame();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="glass rounded-2xl p-5 space-y-5">
                {/* Manual / Auto toggle */}
                <div className="flex rounded-xl bg-casino-dark p-1">
                    <button
                        onClick={() => setAutoMode(false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${!autoMode ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40'}`}
                    >
                        Manuel <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1"></span>
                    </button>
                    <button
                        onClick={() => setAutoMode(true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${autoMode ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40'}`}
                    >
                        Auto <i className="ph-light ph-robot ml-1"></i>
                    </button>
                </div>

                {/* Bet amount */}
                <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Mise (X-Coins)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={betAmount}
                            onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                            className="input-field flex-1"
                            disabled={phase === 'running'}
                        />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                        {[10, 50, 100, 500].map(v => (
                            <button
                                key={v}
                                onClick={() => setBetAmount(v)}
                                disabled={phase === 'running'}
                                className="flex-1 py-1.5 rounded-lg text-xs text-white/50 bg-casino-dark hover:bg-white/5 transition-all disabled:opacity-30"
                            >
                                {v}
                            </button>
                        ))}
                        <button
                            onClick={() => setBetAmount(balance)}
                            disabled={phase === 'running'}
                            className="flex-1 py-1.5 rounded-lg text-xs text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 transition-all disabled:opacity-30"
                        >
                            Max
                        </button>
                    </div>
                </div>

                {/* Auto cashout */}
                <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Auto Cashout</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAutoCashout(Math.max(1.1, autoCashout - 0.1))}
                            className="w-8 h-8 rounded-lg bg-casino-dark text-white/40 hover:text-white flex items-center justify-center"
                        >−</button>
                        <input
                            type="number"
                            value={autoCashout}
                            onChange={e => setAutoCashout(parseFloat(e.target.value) || 1.1)}
                            step="0.1"
                            className="input-field text-center flex-1"
                        />
                        <button
                            onClick={() => setAutoCashout(autoCashout + 0.1)}
                            className="w-8 h-8 rounded-lg bg-casino-dark text-white/40 hover:text-white flex items-center justify-center"
                        >+</button>
                    </div>
                </div>

                {/* Action button */}
                {phase === 'betting' || phase === 'crashed' || phase === 'cashedout' ? (
                    <button
                        onClick={startGame}
                        disabled={betAmount > balance}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        {betAmount > balance ? 'Solde insuffisant' : `Miser ${betAmount} X-Coins`}
                    </button>
                ) : (
                    <button
                        onClick={() => cashOut()}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-casino-dark bg-gradient-to-r from-gold-400 to-gold-500 shadow-glow-gold hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all active:scale-95"
                    >
                        Encaisser {Math.floor(betAmount * multiplier)} X-Coins
                    </button>
                )}

                {/* Auto play */}
                {autoMode && (
                    <button
                        onClick={toggleAutoPlay}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${autoPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
                    >
                        {autoPlaying ? '⏸ Arrêter Auto' : '▶ Lancer Auto'}
                    </button>
                )}

                {/* History */}
                <div>
                    <p className="text-xs text-white/30 mb-2">Historique</p>
                    <div className="space-y-1">
                        {history.map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-casino-dark">
                                <span className={`font-mono font-semibold ${h.won ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {h.point.toFixed(2)}x
                                </span>
                                {h.won && <span className="text-emerald-400">+{h.profit}</span>}
                                {!h.won && <span className="text-red-400">Crash</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Graph */}
            <div className="lg:col-span-2 glass rounded-2xl p-5 flex flex-col">
                {/* Top history bar */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {history.slice(0, 10).map((h, i) => (
                        <span
                            key={i}
                            className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap
                ${h.point >= 2 ? 'bg-emerald-500/20 text-emerald-400' :
                                    h.point >= 1.5 ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-red-500/20 text-red-400'}`}
                        >
                            {h.point.toFixed(2)}x
                        </span>
                    ))}
                </div>

                {/* Canvas graph */}
                <div className="flex-1 relative min-h-[300px] rounded-xl bg-casino-dark/50 overflow-hidden">
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                    {/* Center multiplier display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <motion.div
                                key={multiplier}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className={`text-6xl lg:text-7xl font-black tabular-nums
                  ${phase === 'crashed' ? 'text-red-500 text-glow-emerald' :
                                        phase === 'cashedout' ? 'text-gold-400 text-glow-gold' :
                                            phase === 'running' ? 'gradient-text' :
                                                'text-white/20'}`}
                                style={phase === 'crashed' ? { textShadow: '0 0 30px rgba(239,68,68,0.5)' } : {}}
                            >
                                {multiplier.toFixed(2)}x
                            </motion.div>
                            <p className={`text-sm mt-2 font-medium ${phase === 'crashed' ? 'text-red-400' :
                                    phase === 'cashedout' ? 'text-gold-400' :
                                        phase === 'running' ? 'text-emerald-400' :
                                            'text-white/20'
                                }`}>
                                {phase === 'crashed' ? '💥 Crash !' :
                                    phase === 'cashedout' ? `💰 +${profit} X-Coins !` :
                                        phase === 'running' ? 'En cours...' :
                                            'Placez votre mise'}
                            </p>
                        </div>
                    </div>

                    {/* Rocket emoji */}
                    {phase === 'running' && (
                        <motion.div
                            className="absolute text-3xl"
                            animate={{
                                x: [20, canvasRef.current?.offsetWidth ? canvasRef.current.offsetWidth - 50 : 300],
                                y: [canvasRef.current?.offsetHeight ? canvasRef.current.offsetHeight - 60 : 200, 30],
                            }}
                            transition={{ duration: 10, ease: 'easeOut' }}
                        >
                            🚀
                        </motion.div>
                    )}
                </div>

                {/* Stats footer */}
                <div className="flex items-center justify-between mt-4 text-xs text-white/30">
                    <span>Avantage maison : {(CASINO_STATS.crash.houseEdge * 100).toFixed(0)}%</span>
                    <span>RTP : {(CASINO_STATS.crash.rtp * 100).toFixed(0)}%</span>
                </div>
            </div>

            <CoinRain active={showCoinRain} onComplete={() => setShowCoinRain(false)} />
        </div>
    );
}
