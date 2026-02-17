import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBalance } from '../../hooks/useBalance';
import { useMissions } from '../../hooks/useMissions';
import { CASINO_STATS, createDeck } from '../../lib/gameLogic';
import CoinRain from '../ui/CoinRain';

const { getHandValue, blackjackPays, dealerStandsOn } = CASINO_STATS.blackjack;

const Card = ({ card, hidden = false, index = 0 }) => {
    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, rotateY: hidden ? 180 : 0 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.3, delay: index * 0.15 }}
            className="relative"
        >
            {hidden ? (
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400/30 flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-blue-300/50 font-bold">?</span>
                </div>
            ) : (
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border border-white/20 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                    <span className={`text-lg sm:text-xl font-black ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                        {card.rank}
                    </span>
                    <span className={`text-lg sm:text-xl ${isRed ? 'text-red-500' : 'text-gray-700'}`}>
                        {card.suit}
                    </span>
                    <span className={`absolute top-1 left-1.5 text-[8px] font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                        {card.rank}{card.suit}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default function BlackjackGame() {
    const { balance, addCoins, removeCoins } = useBalance();
    const { trackGame } = useMissions();
    const [betAmount, setBetAmount] = useState(100);
    const [deck, setDeck] = useState(() => createDeck());
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [phase, setPhase] = useState('betting'); // betting, playing, dealer, result
    const [result, setResult] = useState(null); // win, lose, push, blackjack
    const [showDealerCard, setShowDealerCard] = useState(false);
    const [history, setHistory] = useState([]);
    const [autoPlaying, setAutoPlaying] = useState(false);
    const [showCoinRain, setShowCoinRain] = useState(false);
    const [splitHands, setSplitHands] = useState(null);
    const [doubledDown, setDoubledDown] = useState(false);
    const autoRef = useRef(false);
    const deckRef = useRef(deck);

    const drawCard = useCallback(() => {
        if (deckRef.current.length < 20) {
            deckRef.current = createDeck();
        }
        return deckRef.current.pop();
    }, []);

    const deal = useCallback(() => {
        if (betAmount > balance || phase === 'playing' || phase === 'dealer') return;

        removeCoins(betAmount);
        setResult(null);
        setShowDealerCard(false);
        setDoubledDown(false);
        setSplitHands(null);

        const p1 = drawCard();
        const d1 = drawCard();
        const p2 = drawCard();
        const d2 = drawCard();

        const pHand = [p1, p2];
        const dHand = [d1, d2];

        setPlayerHand(pHand);
        setDealerHand(dHand);
        setPhase('playing');

        // Check for natural blackjack
        const pValue = getHandValue(pHand);
        const dValue = getHandValue(dHand);

        if (pValue === 21) {
            setShowDealerCard(true);
            if (dValue === 21) {
                // Push
                addCoins(betAmount);
                finishGame('push', 0, pHand, dHand);
            } else {
                // Blackjack! 3:2
                const winnings = Math.floor(betAmount + betAmount * blackjackPays);
                addCoins(winnings);
                finishGame('blackjack', winnings - betAmount, pHand, dHand);
            }
        }
    }, [betAmount, balance, phase, drawCard, removeCoins, addCoins]);

    const finishGame = useCallback((res, profit, pHand, dHand) => {
        setResult(res);
        setPhase('result');
        setShowDealerCard(true);

        const won = res === 'win' || res === 'blackjack';
        setHistory(prev => [{
            result: res,
            profit,
            playerValue: getHandValue(pHand || playerHand),
            dealerValue: getHandValue(dHand || dealerHand),
        }, ...prev.slice(0, 14)]);

        trackGame('blackjack', won, won ? profit + betAmount : 0);
        if (profit > 5000) setShowCoinRain(true);

        if (autoRef.current) {
            setTimeout(() => deal(), 2000);
        }
    }, [playerHand, dealerHand, betAmount, trackGame, deal]);

    const dealerPlay = useCallback((dHand) => {
        setPhase('dealer');
        setShowDealerCard(true);

        const playDealer = (hand) => {
            let currentHand = [...hand];
            const step = () => {
                const value = getHandValue(currentHand);
                if (value < dealerStandsOn) {
                    const card = drawCard();
                    currentHand = [...currentHand, card];
                    setDealerHand([...currentHand]);
                    setTimeout(step, 600);
                } else {
                    // Resolve
                    const dealerValue = getHandValue(currentHand);
                    const playerValue = getHandValue(playerHand);
                    const effectiveBet = doubledDown ? betAmount * 2 : betAmount;

                    if (dealerValue > 21) {
                        addCoins(effectiveBet * 2);
                        finishGame('win', effectiveBet, playerHand, currentHand);
                    } else if (dealerValue > playerValue) {
                        finishGame('lose', -effectiveBet, playerHand, currentHand);
                    } else if (dealerValue < playerValue) {
                        addCoins(effectiveBet * 2);
                        finishGame('win', effectiveBet, playerHand, currentHand);
                    } else {
                        addCoins(effectiveBet);
                        finishGame('push', 0, playerHand, currentHand);
                    }
                }
            };
            setTimeout(step, 600);
        };

        playDealer(dHand);
    }, [playerHand, drawCard, addCoins, finishGame, betAmount, doubledDown]);

    const hit = useCallback(() => {
        if (phase !== 'playing') return;
        const card = drawCard();
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);

        const value = getHandValue(newHand);
        if (value > 21) {
            setShowDealerCard(true);
            const effectiveBet = doubledDown ? betAmount * 2 : betAmount;
            finishGame('lose', -effectiveBet, newHand, dealerHand);
        } else if (value === 21) {
            dealerPlay(dealerHand);
        }
    }, [phase, playerHand, dealerHand, drawCard, finishGame, dealerPlay, betAmount, doubledDown]);

    const stand = useCallback(() => {
        if (phase !== 'playing') return;
        dealerPlay(dealerHand);
    }, [phase, dealerHand, dealerPlay]);

    const doubleDown = useCallback(() => {
        if (phase !== 'playing' || playerHand.length !== 2 || betAmount > balance) return;
        removeCoins(betAmount);
        setDoubledDown(true);
        const card = drawCard();
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);

        const value = getHandValue(newHand);
        if (value > 21) {
            setShowDealerCard(true);
            finishGame('lose', -(betAmount * 2), newHand, dealerHand);
        } else {
            dealerPlay(dealerHand);
        }
    }, [phase, playerHand, dealerHand, betAmount, balance, drawCard, removeCoins, finishGame, dealerPlay]);

    const playerValue = getHandValue(playerHand);
    const dealerValue = showDealerCard ? getHandValue(dealerHand) : getHandValue([dealerHand[0]].filter(Boolean));

    const resultMessages = {
        win: { text: 'Vous gagnez ! 🎉', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        blackjack: { text: 'BLACKJACK ! 🃏💎', color: 'text-gold-400', bg: 'bg-gold-500/10' },
        lose: { text: 'Le croupier gagne', color: 'text-red-400', bg: 'bg-red-500/10' },
        push: { text: 'Égalité — Mise remboursée', color: 'text-white/60', bg: 'bg-white/5' },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Game area */}
            <div className="lg:col-span-2 glass rounded-2xl p-5 lg:p-8 flex flex-col">
                {/* Blackjack pays banner */}
                <div className="text-center mb-6">
                    <p className="text-xs text-white/20 tracking-widest uppercase">Blackjack Pays 3 to 2</p>
                    <p className="text-[10px] text-white/10">Dealer must stand on {dealerStandsOn}</p>
                </div>

                {/* Dealer */}
                <div className="text-center mb-8">
                    <p className="text-xs text-white/30 mb-3">
                        Croupier {dealerHand.length > 0 && `• ${showDealerCard ? getHandValue(dealerHand) : '?'}`}
                    </p>
                    <div className="flex gap-2 justify-center min-h-[112px]">
                        {dealerHand.map((card, i) => (
                            <Card key={card.id} card={card} hidden={i === 1 && !showDealerCard} index={i} />
                        ))}
                    </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className={`text-center py-3 rounded-xl mb-6 ${resultMessages[result].bg}`}
                        >
                            <span className={`text-xl font-bold ${resultMessages[result].color}`}>
                                {resultMessages[result].text}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player */}
                <div className="text-center mt-auto">
                    <div className="flex gap-2 justify-center min-h-[112px] mb-3">
                        {playerHand.map((card, i) => (
                            <Card key={card.id} card={card} index={i} />
                        ))}
                    </div>
                    <p className="text-xs text-white/50">
                        Votre main • <span className={`font-bold ${playerValue > 21 ? 'text-red-400' : playerValue === 21 ? 'text-emerald-400' : 'text-white'}`}>
                            {playerValue || 0}
                        </span>
                        {doubledDown && <span className="text-gold-400 ml-2">× 2</span>}
                    </p>
                </div>

                {/* Action buttons */}
                {phase === 'playing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 justify-center mt-6"
                    >
                        <button onClick={doubleDown} disabled={playerHand.length !== 2 || betAmount > balance}
                            className="btn-gold px-5 py-3 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                            DOUBLE
                        </button>
                        <button onClick={stand} className="btn-secondary px-8 py-3 text-sm font-bold">
                            STAND
                        </button>
                        <button onClick={hit} className="btn-primary px-8 py-3 text-sm font-bold">
                            HIT
                        </button>
                    </motion.div>
                )}

                {/* Stats footer */}
                <div className="flex items-center justify-between mt-6 text-[10px] text-white/15">
                    <span>6 Decks · Dealer stands on {dealerStandsOn}</span>
                    <span>RTP {(CASINO_STATS.blackjack.rtp * 100).toFixed(1)}%</span>
                </div>
            </div>

            {/* Controls */}
            <div className="glass rounded-2xl p-5 space-y-5">
                <h3 className="text-lg font-bold text-white">🃏 Blackjack</h3>

                {/* Bet */}
                <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Mise</label>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))}
                        className="input-field"
                        disabled={phase === 'playing' || phase === 'dealer'}
                    />
                    <div className="flex gap-1.5 mt-2">
                        {[10, 50, 100, 250, 500].map(v => (
                            <button key={v} onClick={() => setBetAmount(v)}
                                disabled={phase === 'playing'}
                                className="flex-1 py-1.5 rounded-lg text-xs bg-casino-dark text-white/40 hover:text-white transition-all disabled:opacity-30">
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Deal button */}
                {(phase === 'betting' || phase === 'result') && (
                    <button onClick={deal} disabled={betAmount > balance}
                        className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                        {betAmount > balance ? 'Solde insuffisant' : '🎴 Distribuer'}
                    </button>
                )}

                {/* Auto play */}
                <button
                    onClick={() => {
                        if (autoRef.current) {
                            autoRef.current = false;
                            setAutoPlaying(false);
                        } else {
                            autoRef.current = true;
                            setAutoPlaying(true);
                            if (phase === 'betting' || phase === 'result') deal();
                        }
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
            ${autoPlaying ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30'}`}
                >
                    {autoPlaying ? '⏸ Stop Auto' : '▶ Autoplay (Basic Strategy)'}
                </button>

                {/* History */}
                <div>
                    <p className="text-xs text-white/30 mb-2">Historique</p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {history.map((h, i) => (
                            <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-casino-dark">
                                <span className="text-white/30">
                                    {h.playerValue} vs {h.dealerValue}
                                </span>
                                <span className={
                                    h.result === 'win' || h.result === 'blackjack' ? 'text-emerald-400' :
                                        h.result === 'lose' ? 'text-red-400' : 'text-white/40'
                                }>
                                    {h.result === 'blackjack' ? '🃏 BJ' :
                                        h.result === 'win' ? '✓ Win' :
                                            h.result === 'lose' ? '✗ Lose' : '= Push'}
                                    <span className="ml-1">
                                        {h.profit > 0 ? `+${h.profit}` : h.profit < 0 ? h.profit : '0'}
                                    </span>
                                </span>
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-xs text-white/20">Pas encore de parties</p>}
                    </div>
                </div>

                {/* Quick rules */}
                <div className="text-[10px] text-white/15 space-y-0.5">
                    <p>• Blackjack paie 3:2</p>
                    <p>• Le croupier tire jusqu'à {dealerStandsOn}</p>
                    <p>• Double autorisé sur 2 cartes</p>
                    <p>• 6 jeux de cartes</p>
                </div>
            </div>

            <CoinRain active={showCoinRain} onComplete={() => setShowCoinRain(false)} />
        </div>
    );
}
