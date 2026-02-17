import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBalance } from '../../hooks/useBalance';
import { useMissions } from '../../hooks/useMissions';
import { CASINO_STATS } from '../../lib/gameLogic';
import CoinRain from '../ui/CoinRain';

const ROWS = 12;
const BALL_RADIUS = 6;
const PEG_RADIUS = 4;
const CANVAS_W = 400;
const CANVAS_H = 500;

export default function PlinkoGame() {
    const { balance, addCoins, removeCoins } = useBalance();
    const { trackGame } = useMissions();
    const [betAmount, setBetAmount] = useState(100);
    const [risk, setRisk] = useState('mid');
    const [playing, setPlaying] = useState(false);
    const [lastWin, setLastWin] = useState(null);
    const [history, setHistory] = useState([]);
    const [autoMode, setAutoMode] = useState(false);
    const [autoPlaying, setAutoPlaying] = useState(false);
    const [autoCount, setAutoCount] = useState(10);
    const [showCoinRain, setShowCoinRain] = useState(false);
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    const multipliers = CASINO_STATS.plinko.multipliers[risk];

    const getPegPositions = useCallback(() => {
        const pegs = [];
        const startY = 50;
        const rowSpacing = (CANVAS_H - 100) / ROWS;
        const pegSpacing = (CANVAS_W - 60) / (ROWS + 2);

        for (let row = 0; row < ROWS; row++) {
            const pegsInRow = row + 3;
            const rowWidth = (pegsInRow - 1) * pegSpacing;
            const startX = (CANVAS_W - rowWidth) / 2;

            for (let col = 0; col < pegsInRow; col++) {
                pegs.push({
                    x: startX + col * pegSpacing,
                    y: startY + row * rowSpacing,
                    row,
                    col,
                    hit: false,
                });
            }
        }
        return pegs;
    }, []);

    const dropBall = useCallback(() => {
        if (betAmount > balance || playing) return;

        removeCoins(betAmount);
        setPlaying(true);
        setLastWin(null);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = CANVAS_W * 2;
        canvas.height = CANVAS_H * 2;
        ctx.scale(2, 2);

        const pegs = getPegPositions();

        // Ball physics
        let ballX = CANVAS_W / 2 + (Math.random() * 10 - 5);
        let ballY = 10;
        let ballVY = 0;
        let ballVX = 0;
        const gravity = 0.15;
        const damping = 0.7;
        let resultIndex = null;
        const hitPegs = new Set();

        const slotWidth = (CANVAS_W - 40) / multipliers.length;

        const draw = () => {
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // Draw pegs
            pegs.forEach((peg, i) => {
                ctx.beginPath();
                ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
                if (hitPegs.has(i)) {
                    ctx.fillStyle = '#10b981';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#10b981';
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Draw multiplier slots
            multipliers.forEach((mult, i) => {
                const x = 20 + i * slotWidth;
                const y = CANVAS_H - 35;
                const isWinning = resultIndex === i;

                // Background
                let color;
                if (mult >= 10) color = 'rgba(239,68,68,0.3)';
                else if (mult >= 3) color = 'rgba(245,158,11,0.3)';
                else if (mult >= 1) color = 'rgba(16,185,129,0.3)';
                else color = 'rgba(100,100,100,0.2)';

                ctx.fillStyle = isWinning ? 'rgba(16,185,129,0.5)' : color;
                ctx.beginPath();
                ctx.roundRect(x + 1, y, slotWidth - 2, 28, 4);
                ctx.fill();

                if (isWinning) {
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Text
                ctx.fillStyle = isWinning ? '#10b981' : 'rgba(255,255,255,0.6)';
                ctx.font = 'bold 9px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`${mult}x`, x + slotWidth / 2, y + 18);
            });

            // Draw ball
            if (resultIndex === null) {
                const gradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, BALL_RADIUS);
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#059669');
                ctx.beginPath();
                ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#10b981';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        };

        const animate = () => {
            // Physics
            ballVY += gravity;
            ballX += ballVX;
            ballY += ballVY;

            // Peg collisions
            pegs.forEach((peg, i) => {
                const dx = ballX - peg.x;
                const dy = ballY - peg.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < BALL_RADIUS + PEG_RADIUS) {
                    hitPegs.add(i);
                    const angle = Math.atan2(dy, dx);
                    ballX = peg.x + Math.cos(angle) * (BALL_RADIUS + PEG_RADIUS + 1);
                    ballY = peg.y + Math.sin(angle) * (BALL_RADIUS + PEG_RADIUS + 1);
                    ballVX = Math.cos(angle) * 2 * damping + (Math.random() - 0.5) * 0.5;
                    ballVY = Math.abs(Math.sin(angle) * 2 * damping);
                }
            });

            // Wall collisions
            if (ballX < 20) { ballX = 20; ballVX = Math.abs(ballVX) * damping; }
            if (ballX > CANVAS_W - 20) { ballX = CANVAS_W - 20; ballVX = -Math.abs(ballVX) * damping; }

            // Reached bottom?
            if (ballY >= CANVAS_H - 45) {
                const slotIndex = Math.min(
                    multipliers.length - 1,
                    Math.max(0, Math.floor((ballX - 20) / slotWidth))
                );
                resultIndex = slotIndex;
                const mult = multipliers[slotIndex];
                const winnings = Math.floor(betAmount * mult);
                const profit = winnings - betAmount;

                setLastWin({ multiplier: mult, winnings, profit });
                addCoins(winnings);
                setHistory(prev => [{ mult, profit, won: profit > 0 }, ...prev.slice(0, 14)]);
                trackGame('plinko', profit > 0, winnings);

                if (winnings > 5000) setShowCoinRain(true);

                draw();
                setPlaying(false);

                if (autoPlaying && autoCount > 1) {
                    setAutoCount(prev => prev - 1);
                    setTimeout(() => dropBall(), 1000);
                } else {
                    setAutoPlaying(false);
                }
                return;
            }

            draw();
            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);
    }, [betAmount, balance, risk, multipliers, playing, autoPlaying, autoCount, getPegPositions, removeCoins, addCoins, trackGame]);

    useEffect(() => {
        // Draw initial state
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = CANVAS_W * 2;
        canvas.height = CANVAS_H * 2;
        ctx.scale(2, 2);

        const pegs = getPegPositions();
        pegs.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fill();
        });

        const slotWidth = (CANVAS_W - 40) / multipliers.length;
        multipliers.forEach((mult, i) => {
            const x = 20 + i * slotWidth;
            const y = CANVAS_H - 35;
            let color;
            if (mult >= 10) color = 'rgba(239,68,68,0.3)';
            else if (mult >= 3) color = 'rgba(245,158,11,0.3)';
            else if (mult >= 1) color = 'rgba(16,185,129,0.3)';
            else color = 'rgba(100,100,100,0.2)';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x + 1, y, slotWidth - 2, 28, 4);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = 'bold 9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${mult}x`, x + slotWidth / 2, y + 18);
        });

        return () => cancelAnimationFrame(animRef.current);
    }, [risk, multipliers, getPegPositions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* History panel */}
            <div className="glass rounded-2xl p-5 order-2 lg:order-1">
                <h3 className="text-sm font-semibold text-white mb-3">📊 Historique</h3>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                    {history.length === 0 && <p className="text-xs text-white/20">Pas encore de parties</p>}
                    {history.map((h, i) => (
                        <div key={i} className="flex justify-between text-xs px-3 py-2 rounded-lg bg-casino-dark">
                            <span className={`font-mono font-semibold ${h.won ? 'text-emerald-400' : 'text-red-400'}`}>
                                {h.mult}x
                            </span>
                            <span className={h.won ? 'text-emerald-400' : 'text-red-400'}>
                                {h.won ? '+' : ''}{h.profit}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div className="glass rounded-2xl p-4 flex flex-col items-center order-1 lg:order-2">
                <canvas
                    ref={canvasRef}
                    className="w-full max-w-[400px]"
                    style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
                />

                {lastWin && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 text-center rounded-xl px-4 py-2 ${lastWin.profit > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                    >
                        <span className="font-bold">{lastWin.multiplier}x</span>
                        <span className="mx-2">·</span>
                        <span>{lastWin.profit > 0 ? '+' : ''}{lastWin.profit} X-Coins</span>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="glass rounded-2xl p-5 space-y-5 order-3">
                {/* Risk */}
                <div>
                    <label className="text-xs text-white/40 mb-2 block">Risque</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['low', 'mid', 'high'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRisk(r)}
                                disabled={playing}
                                className={`py-2 rounded-xl text-xs font-semibold transition-all
                  ${risk === r
                                        ? r === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                                            : r === 'mid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                        : 'bg-casino-dark text-white/40'}`}
                            >
                                {r === 'low' ? 'Low' : r === 'mid' ? 'Mid' : 'High'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bet */}
                <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Mise (X-Coins)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-8 h-8 rounded-lg bg-casino-dark text-white/40">−</button>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                            className="input-field text-center flex-1"
                        />
                        <button onClick={() => setBetAmount(betAmount + 10)} className="w-8 h-8 rounded-lg bg-casino-dark text-white/40">+</button>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                        {[10, 25, 50, 100, 200].map(v => (
                            <button key={v} onClick={() => setBetAmount(v)} className="flex-1 py-1 rounded-lg text-[10px] bg-casino-dark text-white/40 hover:text-white transition-all">{v}</button>
                        ))}
                    </div>
                </div>

                {/* Autoplay */}
                <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Autoplay</label>
                    <div className="flex gap-2">
                        {[10, 25, 50, 100, 200].map(v => (
                            <button
                                key={v}
                                onClick={() => setAutoCount(v)}
                                className={`flex-1 py-1.5 rounded-lg text-xs transition-all ${autoCount === v ? 'bg-emerald-500/20 text-emerald-400' : 'bg-casino-dark text-white/40'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Play button */}
                <button
                    onClick={dropBall}
                    disabled={playing || betAmount > balance}
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                >
                    {playing ? 'En cours...' : betAmount > balance ? 'Solde insuffisant' : '🎮 PLAY'}
                </button>

                {/* Auto play toggle */}
                <button
                    onClick={() => {
                        if (autoPlaying) {
                            setAutoPlaying(false);
                        } else {
                            setAutoPlaying(true);
                            if (!playing) dropBall();
                        }
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${autoPlaying ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                    {autoPlaying ? '⏸ Stop Auto' : `▶ Auto (${autoCount})`}
                </button>

                {/* Stats */}
                <div className="text-[10px] text-white/20 flex justify-between">
                    <span>RTP: {(CASINO_STATS.plinko.rtp * 100).toFixed(0)}%</span>
                    <span>House Edge: {(CASINO_STATS.plinko.houseEdge * 100).toFixed(0)}%</span>
                </div>
            </div>

            <CoinRain active={showCoinRain} onComplete={() => setShowCoinRain(false)} />
        </div>
    );
}
