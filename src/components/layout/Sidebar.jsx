import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { path: '/', label: 'Lobby', icon: 'ph-light ph-house-simple' },
    { path: '/leaderboard', label: 'Classement', icon: 'ph-light ph-trophy' },
    { path: '/missions', label: 'Missions', icon: 'ph-light ph-target' },
    { path: '/boutique', label: 'Boutique', icon: 'ph-light ph-storefront' },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed top-0 left-0 h-full z-50 w-64 glass-strong flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-glow-emerald">
                        <span className="text-white font-black text-lg">X</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Cash<span className="gradient-text">X</span>
                        </h1>
                        <p className="text-[10px] text-white/40 tracking-widest uppercase">Social Casino</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto lg:hidden text-white/50 hover:text-white transition-colors"
                    >
                        <i className="ph-light ph-x text-xl"></i>
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 mt-4 space-y-1">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <i className={`${item.icon} text-xl group-hover:scale-110 transition-transform`}></i>
                            <span className="font-medium text-sm">{item.label}</span>
                            {item.path === location.pathname && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow-emerald"
                                />
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10">
                    <p className="text-xs text-emerald-400 font-semibold mb-1">💎 Social Casino</p>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                        Jouez gratuitement avec des X-Coins. Aucun argent réel.
                    </p>
                </div>
            </motion.aside>
        </>
    );
}
