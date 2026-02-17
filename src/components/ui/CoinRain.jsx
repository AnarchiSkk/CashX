import { useEffect, useRef, useCallback } from 'react';

export default function CoinRain({ active, duration = 3000, onComplete }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    const startRain = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const coins = [];
        const coinCount = 60;

        for (let i = 0; i < coinCount; i++) {
            coins.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                size: Math.random() * 15 + 10,
                speedY: Math.random() * 4 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: Math.random() * 0.1 - 0.05,
                opacity: 1,
                delay: Math.random() * 500,
            });
        }

        const startTime = Date.now();

        const drawCoin = (coin) => {
            ctx.save();
            ctx.translate(coin.x, coin.y);
            ctx.rotate(coin.rotation);
            ctx.globalAlpha = coin.opacity;

            // Outer circle
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.size);
            grad.addColorStop(0, '#fbbf24');
            grad.addColorStop(0.7, '#f59e0b');
            grad.addColorStop(1, '#d97706');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
            ctx.fill();

            // Inner circle
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(-coin.size * 0.2, -coin.size * 0.2, coin.size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // X symbol
            ctx.fillStyle = '#92400e';
            ctx.font = `bold ${coin.size * 0.8}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('X', 0, 1);

            ctx.restore();
        };

        const animate = () => {
            const elapsed = Date.now() - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let allDone = true;

            for (const coin of coins) {
                if (elapsed < coin.delay) { allDone = false; continue; }

                coin.y += coin.speedY;
                coin.x += coin.speedX;
                coin.rotation += coin.rotSpeed;

                if (elapsed > duration - 500) {
                    coin.opacity = Math.max(0, coin.opacity - 0.02);
                }

                if (coin.y < canvas.height + coin.size && coin.opacity > 0) {
                    allDone = false;
                    drawCoin(coin);
                }
            }

            if (!allDone && elapsed < duration + 1000) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onComplete?.();
            }
        };

        animate();
    }, [duration, onComplete]);

    useEffect(() => {
        if (active) {
            startRain();
        }
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [active, startRain]);

    if (!active) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[200] pointer-events-none"
        />
    );
}
