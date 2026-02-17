import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPanel({ isOpen, onClose }) {
    const { messages, sendMessage } = useChat();
    const [input, setInput] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input.trim());
            setInput('');
        }
    };

    const getMessageStyle = (msg) => {
        if (msg.type === 'system') return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10';
        if (msg.type === 'bigwin') return 'text-gold-400 bg-gold-500/10 border border-gold-500/20 animate-shake';
        if (msg.type === 'win') return 'text-emerald-300';
        if (msg.isOwn) return 'text-white bg-emerald-500/10';
        return 'text-white/70';
    };

    // Collapsed mini-bar (desktop)
    if (collapsed && !isOpen) {
        return (
            <div className="hidden xl:flex fixed top-0 right-0 h-full w-12 glass-strong flex-col items-center py-4 gap-3 z-30">
                <button
                    onClick={() => setCollapsed(false)}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all"
                >
                    <i className="ph-light ph-chat-circle-dots text-lg"></i>
                </button>
                <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <span className="text-[8px] text-gold-400 font-bold">{messages.length}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 xl:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <motion.div
                className={`fixed top-0 right-0 h-full z-50 xl:z-30 w-full sm:w-80 glass-strong flex flex-col
          transition-transform duration-300 xl:translate-x-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <h3 className="text-sm font-semibold text-white">Chat en direct</h3>
                        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                            {Math.floor(Math.random() * 200 + 150)} en ligne
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setCollapsed(true); onClose(); }}
                            className="hidden xl:flex w-7 h-7 rounded-lg hover:bg-white/5 items-center justify-center text-white/40 hover:text-white transition-all"
                        >
                            <i className="ph-light ph-minus text-sm"></i>
                        </button>
                        <button
                            onClick={onClose}
                            className="xl:hidden w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
                        >
                            <i className="ph-light ph-x text-sm"></i>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`px-3 py-2 rounded-xl text-xs ${getMessageStyle(msg)}`}
                        >
                            <span className="font-semibold mr-1">
                                {msg.type === 'bigwin' ? '🏆 ' : ''}{msg.user}
                            </span>
                            <span className={msg.type === 'bigwin' ? 'text-glow-gold' : ''}>
                                {msg.type === 'chat' || msg.type === 'system' ? msg.text : msg.text}
                            </span>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Écrire un message..."
                            className="input-field py-2 text-xs"
                        />
                        <button
                            type="submit"
                            className="px-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                        >
                            <i className="ph-light ph-paper-plane-right"></i>
                        </button>
                    </div>
                </form>
            </motion.div>
        </>
    );
}
