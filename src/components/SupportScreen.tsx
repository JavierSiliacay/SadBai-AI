import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Heart, Facebook, Instagram, Github } from 'lucide-react';
import { io } from 'socket.io-client';
import { Language } from '../types';
import { deleteModelAllInfoInCache, hasModelInCache } from '@mlc-ai/web-llm';
import { Trash2 } from 'lucide-react';

export const SupportScreen = ({ language }: { language: Language }) => {
  const [totalHugs, setTotalHugs] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathText, setBreathText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [canHug, setCanHug] = useState(true);
  const [hasModel, setHasModel] = useState(false);

  useEffect(() => {
    // Check if model exists
    hasModelInCache('Qwen2.5-1.5B-Instruct-q4f16_1-MLC').then(setHasModel);
    const newSocket = io();
    setSocket(newSocket);
    
    newSocket.on('totalHugs', (count: number) => {
      setTotalHugs(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendHug = () => {
    if (socket && canHug) {
      socket.emit('sendHug');
      setCanHug(false);
      setTimeout(() => setCanHug(true), 1000);
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    let step = 0;
    const texts = language === 'bisaya' 
      ? ['Inhale...', 'Hold...', 'Exhale...'] 
      : language === 'tagalog' ? ['Langhap...', 'Pigil...', 'Buga...'] : ['Inhale...', 'Hold...', 'Exhale...'];
    
    setBreathText(texts[0]);
    const interval = setInterval(() => {
      step = (step + 1) % 3;
      setBreathText(texts[step]);
    }, 4000);

    return () => {
      clearInterval(interval);
      setIsBreathing(false);
    };
  };

  const handleDeleteModel = async () => {
    const confirmDelete = window.confirm(
      language === 'bisaya' 
        ? "Sigurado ka gusto nimo e-delete ang AI engine? Mubakante ni ug ~1GB nga storage sa imong device." 
        : language === 'tagalog' ? "Sigurado ka bang gusto mong burahin ang AI engine? Makakapag-free ito ng ~1GB sa storage mo." 
        : "Are you sure you want to delete the AI engine? This will free up ~1GB of storage on your device."
    );

    if (confirmDelete) {
      try {
        await deleteModelAllInfoInCache('Qwen2.5-1.5B-Instruct-q4f16_1-MLC');
        localStorage.removeItem('sadbai_offline_enabled');
        setHasModel(false);
        alert(language === 'bisaya' ? "Malamposon nga na delete!" : "Successfully deleted!");
        window.location.reload();
      } catch (err) {
        console.error("Error deleting model:", err);
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col p-6 gap-8 overflow-y-auto pb-32">
      {/* Header */}
      <section className="text-center mt-4">
        <h2 className="text-2xl font-h1 font-bold text-on-background">
          {language === 'bisaya' ? 'Imong Safety Kit' : language === 'tagalog' ? 'Iyong Safety Kit' : 'Your Safety Kit'}
        </h2>
        <p className="text-sm text-on-surface-variant mt-2 opacity-80">
          {language === 'bisaya' 
            ? 'Kung medyo bug-at na ang paminaw, naa mi diri.' 
            : language === 'tagalog' ? 'Kung medyo mabigat na ang pakiramdam, narito kami.' : 'If things feel a bit heavy, we are here for you.'}
        </p>
      </section>

      {/* Breathing Tool */}
      <motion.div 
        className="bg-surface-container/30 backdrop-blur-xl rounded-[32px] p-8 border border-white/5 flex flex-col items-center gap-6"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center gap-2 text-primary">
          <Wind size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">
            {language === 'bisaya' ? 'Guided nga Pagginhawa' : language === 'tagalog' ? 'Guided na Paghinga' : 'Guided Breathing'}
          </span>
        </div>

        <div className="relative flex items-center justify-center w-48 h-48">
          <AnimatePresence>
            {isBreathing && (
              <>
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="w-32 h-32 bg-primary/30 rounded-full border-2 border-primary/50"
                  animate={{ scale: [1, 1.8, 1] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            )}
          </AnimatePresence>
          <div className="z-10 text-xl font-bold text-primary">
            {!isBreathing ? (
              <button 
                onClick={startBreathing}
                className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all font-bold"
              >
                Start
              </button>
            ) : breathText}
          </div>
        </div>
      </motion.div>

      {/* Solidarity Hub */}
      <div className="grid grid-cols-1 gap-4">
        <motion.button 
          onClick={sendHug}
          whileTap={canHug ? { scale: 0.95 } : {}}
          className={`bg-tertiary-container/20 border border-tertiary/20 p-6 rounded-[32px] flex flex-col items-center gap-3 text-center transition-all ${!canHug ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-tertiary-container/30'}`}
        >
          <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
            <Heart fill="currentColor" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-on-surface">
              {language === 'bisaya' ? 'Hatag og Hug' : language === 'tagalog' ? 'Magbigay ng Hug' : 'Send a Hug'}
            </h3>
            <p className="text-xs text-outline mt-1">
              {language === 'bisaya' 
                ? 'Pakit-a ang uban nga wala sila nag-inusara.' 
                : language === 'tagalog' ? 'Ipakita sa iba na hindi sila nag-iisa.' : 'Show others that they are not alone.'}
            </p>
          </div>
          <div className="mt-2 px-4 py-1 rounded-full bg-tertiary/10 text-tertiary text-sm font-black">
            {totalHugs.toLocaleString()} HUGS SENT
          </div>
        </motion.button>
      </div>

      {/* Storage Management */}
      {hasModel && (
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-outline px-2">
            {language === 'bisaya' ? 'Pagdumala sa Storage' : language === 'tagalog' ? 'Pamamahala ng Storage' : 'Storage Management'}
          </h3>
          <button 
            onClick={handleDeleteModel}
            className="p-4 rounded-2xl bg-error-container/10 border border-error/30 flex justify-between items-center hover:bg-error-container/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                <Trash2 size={18} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-error">
                  {language === 'bisaya' ? 'I-delete ang AI Engine' : language === 'tagalog' ? 'Burahin ang AI Engine' : 'Delete AI Engine'}
                </p>
                <p className="text-[10px] text-error/70">
                  {language === 'bisaya' ? 'Makabakante ug ~1GB nga storage' : language === 'tagalog' ? 'Mag-free ng ~1GB na storage' : 'Free up ~1GB of storage space'}
                </p>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* Developer Hub */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-outline px-2">
          Reach the Developer
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Facebook', url: 'https://facebook.com/siliacayjavier', icon: <Facebook size={18} />, label: '@siliacayjavier' },
            { name: 'Instagram', url: 'https://www.instagram.com/itsyaboi_vier', icon: <Instagram size={18} />, label: '@itsyaboi_vier' },
            { name: 'GitHub', url: 'https://github.com/JavierSiliacay/SadBai-AI', icon: <Github size={18} />, label: '@javiersiliacay' }
          ].map((s, i) => (
            <a 
              key={i} 
              href={s.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{s.name}</p>
                  <p className="text-[10px] text-outline">{s.label}</p>
                </div>
              </div>
              <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart size={14} fill="currentColor" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="mt-4 pb-8 text-center px-6">
        <p className="text-[10px] text-outline leading-relaxed italic opacity-60">
          This platform was architected and deployed within a single 24-hour development sprint. We appreciate your patience as we continue to refine the experience.
        </p>
      </footer>
    </div>
  );
};
