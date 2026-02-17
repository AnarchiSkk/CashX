// Casino stats constants for all games
// These define house edges and RTP (Return To Player) percentages
// modeled after real-world casino standards

export const CASINO_STATS = {
    crash: {
        name: 'Crash',
        houseEdge: 0.04, // 4% house edge
        rtp: 0.96,       // 96% RTP
        // Crash point formula: max(1, 0.96 / random())
        // This ensures the house has a 4% edge
        getCrashPoint: () => {
            const r = Math.random();
            if (r < 0.04) return 1.0; // instant crash 4% of the time
            return Math.max(1, 0.96 / r);
        },
        maxMultiplier: 1000,
    },

    plinko: {
        name: 'Plinko',
        houseEdge: 0.03, // 3% house edge
        rtp: 0.97,       // 97% RTP
        rows: 12,
        multipliers: {
            low: [5.6, 2.1, 1.1, 1, 0.5, 0.3, 0.5, 1, 1.1, 2.1, 5.6],
            mid: [13, 3, 1.3, 0.7, 0.4, 0.2, 0.4, 0.7, 1.3, 3, 13],
            high: [29, 4, 1.5, 0.5, 0.3, 0.1, 0.3, 0.5, 1.5, 4, 29],
        },
    },

    sugarRush: {
        name: 'Sugar Rush',
        houseEdge: 0.038, // 3.8% house edge
        rtp: 0.962,       // 96.2% RTP (like Pragmatic Play)
        symbols: ['🍬', '🍭', '🧸', '⭐', '💚', '💜', '❤️', '🍇'],
        // Cluster pays: 5+ matching symbols in a cluster
        payTable: {
            '🍬': { 5: 1.5, 6: 2, 7: 3, 8: 5, 10: 10, 15: 50 },
            '🍭': { 5: 1.5, 6: 2, 7: 3, 8: 5, 10: 10, 15: 50 },
            '🧸': { 5: 2, 6: 3, 7: 5, 8: 8, 10: 15, 15: 75 },
            '⭐': { 5: 2.5, 6: 4, 7: 6, 8: 10, 10: 20, 15: 100 },
            '💚': { 5: 3, 6: 5, 7: 8, 8: 12, 10: 25, 15: 150 },
            '💜': { 5: 4, 6: 6, 7: 10, 8: 15, 10: 30, 15: 200 },
            '❤️': { 5: 5, 6: 8, 7: 12, 8: 20, 10: 50, 15: 500 },
            '🍇': { 5: 8, 6: 12, 7: 20, 8: 30, 10: 100, 15: 1000 },
        },
        gridSize: { rows: 7, cols: 7 },
    },

    roulette: {
        name: 'Roulette',
        houseEdge: 0.027, // 2.7% house edge (European single-zero)
        rtp: 0.973,       // 97.3% RTP
        numbers: Array.from({ length: 37 }, (_, i) => i), // 0-36
        redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
        blackNumbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
        payouts: {
            straight: 35,  // single number
            split: 17,     // 2 numbers
            street: 11,    // 3 numbers
            corner: 8,     // 4 numbers
            line: 5,       // 6 numbers
            dozen: 2,      // 12 numbers
            column: 2,     // 12 numbers
            red: 1, black: 1,
            odd: 1, even: 1,
            low: 1, high: 1,  // 1-18 / 19-36
        },
    },

    blackjack: {
        name: 'Blackjack',
        houseEdge: 0.005, // 0.5% house edge (with basic strategy)
        rtp: 0.995,       // 99.5% RTP
        blackjackPays: 1.5, // 3:2
        dealerStandsOn: 17,
        suits: ['♠', '♥', '♦', '♣'],
        ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
        getCardValue: (rank) => {
            if (['J', 'Q', 'K'].includes(rank)) return 10;
            if (rank === 'A') return 11;
            return parseInt(rank);
        },
        getHandValue: (hand) => {
            let value = 0;
            let aces = 0;
            for (const card of hand) {
                if (['J', 'Q', 'K'].includes(card.rank)) value += 10;
                else if (card.rank === 'A') { value += 11; aces++; }
                else value += parseInt(card.rank);
            }
            while (value > 21 && aces > 0) { value -= 10; aces--; }
            return value;
        },
    },
};

// Shared utility for weighted random selection
export function weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return i;
    }
    return weights.length - 1;
}

// Generate a shuffled deck of cards
export function createDeck(numDecks = 6) {
    const { suits, ranks } = CASINO_STATS.blackjack;
    const deck = [];
    for (let d = 0; d < numDecks; d++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ rank, suit, id: `${rank}${suit}-${d}-${Math.random()}` });
            }
        }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
