import React from 'react';
import { Network, ShieldCheck, MessageSquare, Music, LifeBuoy } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../types';

export const Header = () => (
  <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-slate-950/70 backdrop-blur-2xl border-b border-white/5 shadow-xl">
    <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-3">
      <img src="/logo.png" alt="SadBai AI Logo" className="h-14 w-14 md:h-16 md:w-16 object-contain" />
      <motion.h1 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-h1 tracking-[0.2em] text-lg md:text-xl font-bold text-primary drop-shadow-[0_0_12px_rgba(192,193,255,0.5)]"
      >
        SadBai AI
      </motion.h1>
    </button>
    <button className="text-outline hover:text-primary transition-colors">
      <ShieldCheck size={24} />
    </button>
  </header>
);

export const Footer = ({ language }: { language?: 'bisaya' | 'tagalog' | 'english' }) => (
  <footer className="flex flex-col items-center gap-4 px-10 mb-24 w-full py-12 bg-transparent opacity-40 transition-opacity duration-300">
    <p className="text-xs text-center leading-relaxed text-outline-variant">
      {language === 'bisaya' ? 'Ang imong kasingkasing luwas diri.' : language === 'tagalog' ? 'Ang iyong puso ay ligtas dito.' : 'Your heart is safe here.'} © 2026 SadBai AI
    </p>
    <div className="flex gap-4">
      <a className="text-xs text-outline hover:text-primary transition-colors" href="#">Privacy Settings</a>
      <a className="text-xs text-outline hover:text-primary transition-colors" href="#">Data Safety</a>
      <a className="text-xs text-outline hover:text-primary transition-colors" href="#">Encryption Status</a>
    </div>
  </footer>
);

// Better custom SVG for Face holding mask
const FaceMaskIcon = ({ size = 24, fill = "none" }: { size?: number, fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* The Face */}
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" opacity={fill !== 'none' ? 0.3 : 1} />
    {/* The Mask being held to the side */}
    <path d="M18 7a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <circle cx="9" cy="9" r="0.5" fill="currentColor" />
    <circle cx="15" cy="9" r="0.5" fill="currentColor" />
  </svg>
);

export const BottomNav = ({ activeScreen, setScreen }: { activeScreen: Screen, setScreen: (s: Screen) => void }) => (
  <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-8 pb-safe bg-surface-container-lowest/80 backdrop-blur-2xl rounded-t-[32px] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
    <button 
      onClick={() => setScreen('chat')}
      className={`transition-all ${activeScreen === 'chat' ? 'text-primary drop-shadow-[0_0_12px_rgba(192,193,255,0.5)] scale-110' : 'text-outline opacity-60 hover:opacity-100'}`}
    >
      <MessageSquare size={24} fill={activeScreen === 'chat' ? 'currentColor' : 'none'} />
    </button>
    <button 
      onClick={() => setScreen('music')}
      className={`transition-all ${activeScreen === 'music' ? 'text-primary drop-shadow-[0_0_12px_rgba(192,193,255,0.5)] scale-110' : 'text-outline opacity-60 hover:opacity-100'}`}
    >
      <Music size={24} fill={activeScreen === 'music' ? 'currentColor' : 'none'} />
    </button>
    <button 
      onClick={() => setScreen('reflection')}
      className={`transition-all ${activeScreen === 'reflection' ? 'text-primary drop-shadow-[0_0_12px_rgba(192,193,255,0.5)] scale-110' : 'text-outline opacity-60 hover:opacity-100'}`}
    >
      <FaceMaskIcon size={24} fill={activeScreen === 'reflection' ? 'currentColor' : 'none'} />
    </button>
    <button 
      onClick={() => setScreen('support')}
      className={`transition-all ${activeScreen === 'support' ? 'text-primary drop-shadow-[0_0_12px_rgba(192,193,255,0.5)] scale-110' : 'text-outline opacity-60 hover:opacity-100'}`}
    >
      <LifeBuoy size={24} fill={activeScreen === 'support' ? 'currentColor' : 'none'} />
    </button>
  </nav>
);
