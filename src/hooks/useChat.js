import { useState, useEffect, useCallback } from 'react';

const BOT_NAMES = [
    'CryptoKing99', 'LuckyAce', 'GoldRush88', 'NeonWolf', 'DiamondHands',
    'MoonBet', 'StarPlayer', 'ThunderBolt', 'PhoenixRise', 'ShadowFox',
    'IronWhale', 'CosmicSpin', 'NightOwl77', 'VelvetQ', 'ZenMaster',
    'RoyalFlush', 'FireStorm', 'OceanBlue', 'MysticRose', 'TitanBet',
];

const GAME_NAMES = ['Crash', 'Plinko', 'Sugar Rush', 'Roulette', 'Blackjack'];

const CHAT_MESSAGES = [
    'gg !', 'incroyable 🔥', 'let\'s goooo', 'nice win !', 'à mon tour 😎',
    'ce site est dingue', 'qui joue au crash ?', 'roulette rouge ou noir ?',
    'blackjack MVP 🃏', 'plinko high risk ftw', 'sugar rush 💎',
    'quel multiplicateur !', 'all in 🎰', 'vamos !', 'cashout rapide 💨',
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateBotMessage() {
    const type = Math.random();
    const name = randomFrom(BOT_NAMES);

    if (type < 0.4) {
        // Regular chat message
        return { type: 'chat', user: name, text: randomFrom(CHAT_MESSAGES), time: new Date() };
    } else if (type < 0.7) {
        // Small win
        const game = randomFrom(GAME_NAMES);
        const amount = Math.floor(Math.random() * 500 + 50);
        return { type: 'win', user: name, text: `a gagné ${amount} X-Coins au ${game} !`, amount, time: new Date() };
    } else if (type < 0.95) {
        // Medium win
        const game = randomFrom(GAME_NAMES);
        const amount = Math.floor(Math.random() * 3000 + 500);
        return { type: 'win', user: name, text: `a gagné ${amount} X-Coins au ${game} !`, amount, time: new Date() };
    } else {
        // Big win (>5000) — shown less frequently
        const game = randomFrom(GAME_NAMES);
        const amount = Math.floor(Math.random() * 20000 + 5000);
        return { type: 'bigwin', user: name, text: `🎉 JACKPOT ! a gagné ${amount.toLocaleString()} X-Coins au ${game} !`, amount, time: new Date() };
    }
}

export function useChat() {
    const [messages, setMessages] = useState([
        { type: 'system', user: 'CashX', text: '🎰 Bienvenue sur CashX ! Bonne chance à tous !', time: new Date() },
        { type: 'system', user: 'CashX', text: '💰 1000 X-Coins offerts pour les nouveaux joueurs !', time: new Date() },
    ]);

    useEffect(() => {
        // Regular chat messages every 3-8 seconds
        const chatInterval = setInterval(() => {
            const msg = generateBotMessage();
            if (msg.type !== 'bigwin') {
                setMessages(prev => [...prev.slice(-50), msg]);
            }
        }, Math.random() * 5000 + 3000);

        // Big wins every 2-3 minutes
        const bigWinInterval = setInterval(() => {
            const name = randomFrom(BOT_NAMES);
            const game = randomFrom(GAME_NAMES);
            const amount = Math.floor(Math.random() * 50000 + 5000);
            setMessages(prev => [...prev.slice(-50), {
                type: 'bigwin',
                user: name,
                text: `🎉 JACKPOT ! a gagné ${amount.toLocaleString()} X-Coins au ${game} !`,
                amount,
                time: new Date(),
            }]);
        }, Math.random() * 60000 + 120000);

        return () => {
            clearInterval(chatInterval);
            clearInterval(bigWinInterval);
        };
    }, []);

    const sendMessage = useCallback((text, username = 'Vous') => {
        setMessages(prev => [...prev.slice(-50), {
            type: 'chat',
            user: username,
            text,
            time: new Date(),
            isOwn: true,
        }]);
    }, []);

    return { messages, sendMessage };
}
