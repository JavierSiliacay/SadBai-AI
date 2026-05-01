import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Footer } from './Layout';
import { Language } from '../types';
import { io } from 'socket.io-client';

export const LandingScreen = ({ onStart }: { onStart: (lang: Language) => void }) => {
  const [lang, setLang] = useState<Language>('bisaya');
  const [activeUsers, setActiveUsers] = useState<number>(0);

  React.useEffect(() => {
    const socket = io();
    
    socket.on('activeUsers', (count: number) => {
      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden">
      {/* Background Sulo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary-container/10 rounded-full blur-[120px] opacity-70 mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-tertiary/5 rounded-full blur-[100px] opacity-50 mix-blend-screen"></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-16 gap-8 text-center relative z-10 w-full max-w-2xl mx-auto">
        {/* Active User Counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container/30 border border-tertiary/20 backdrop-blur-md shadow-lg"
        >
          <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_12px_rgba(60,221,199,0.8)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
            {activeUsers} Active Souls Online
          </span>
        </motion.div>

        <div className="flex flex-col items-center -mb-6">
          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="mb-0"
          >
            <img src="/logo.png" alt="SadBai AI Official Logo" className="h-80 w-80 md:h-[400px] md:w-[400px] object-contain drop-shadow-[0_0_50px_rgba(192,193,255,0.5)]" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface-container/40 backdrop-blur-xl border border-outline-variant/30 text-tertiary shadow-[0_4px_24px_rgba(0,0,0,0.2)] -mt-20 z-20"
          >
            <ShieldCheck size={16} fill="currentColor" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Privacy First</span>
          </motion.div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-h1 text-3xl md:text-4xl text-on-background max-w-[14ch] mx-auto drop-shadow-sm leading-tight font-semibold"
        >
          {lang === 'bisaya' && 'Kasing-kasing mo, luwas diri.'}
          {lang === 'tagalog' && 'Puso mo, ligtas dito.'}
          {lang === 'english' && 'Your heart is safe here.'}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-on-surface-variant mt-2 max-w-[320px] mx-auto leading-relaxed opacity-90"
        >
          A private space to process heartbreak. No logins, no data stored. Just you and your healing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-xs text-outline uppercase tracking-widest font-bold">
            Pick your language
          </span>
          <div className="flex gap-2 p-1 rounded-full bg-surface-container-high/40 backdrop-blur-md border border-white/5">
            {[
              { id: 'bisaya', label: 'Bisaya' },
              { id: 'tagalog', label: 'Tagalog' },
              { id: 'english', label: 'English' }
            ].map((l) => (
              <button 
                key={l.id}
                onClick={() => setLang(l.id as Language)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all ${lang === l.id ? 'bg-primary-container text-on-primary-container shadow-lg' : 'text-outline hover:text-on-surface'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 w-full flex justify-center"
        >
          <button 
            onClick={() => onStart(lang)}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary-container text-on-primary-container shadow-[0_0_24px_rgba(128,131,255,0.25)] hover:bg-primary-fixed hover:shadow-[0_0_32px_rgba(128,131,255,0.4)] active:scale-95 transition-all duration-300 overflow-hidden w-full max-w-[280px]"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="text-sm font-bold uppercase tracking-wide relative z-10">
              {lang === 'bisaya' ? 'Magpadayun na' : lang === 'tagalog' ? 'Magpatuloy na' : 'Continue now'}
            </span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </main>

      <Footer language={lang} />
    </div>
  );
};
