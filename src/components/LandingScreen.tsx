import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Footer } from './Layout';
import { Language } from '../types';
import { io } from 'socket.io-client';
import { CloudOff, Download, X } from 'lucide-react';
import type { InitProgressReport } from '@mlc-ai/web-llm';

export const LandingScreen = ({ 
  onStart, 
  onEnableOffline, 
  isOfflineMode 
}: { 
  onStart: (lang: Language) => void;
  onEnableOffline: (
    onProgress: (progress: InitProgressReport) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ) => void;
  isOfflineMode: boolean;
}) => {
  const [lang, setLang] = useState<Language>('bisaya');
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<InitProgressReport | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  React.useEffect(() => {
    // Check if app is in standalone mode
    const checkStandalone = () => {
      const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore
      const isIOSStandalone = window.navigator.standalone === true;
      setIsStandalone(isStandaloneQuery || isIOSStandalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    const socket = io();
    
    socket.on('activeUsers', (count: number) => {
      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for iOS Safari which doesn't support beforeinstallprompt
      alert("Tap the Share icon at the bottom of your browser and select 'Add to Home Screen' to install SadBai.");
    }
  };

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
          className="mt-4 w-full flex flex-col items-center gap-4"
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

          {!isOfflineMode ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-outline hover:text-tertiary transition-colors"
            >
              <CloudOff size={16} />
              Enable Offline Mode
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tertiary">
              <CloudOff size={16} />
              Offline Mode Active
            </div>
          )}
        </motion.div>
      </main>

      {/* Offline Mode Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-high border border-outline-variant/30 rounded-3xl p-6 max-w-[400px] w-full shadow-2xl relative overflow-hidden"
            >
              {!isDownloading && (
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-outline hover:text-on-surface"
                >
                  <X size={20} />
                </button>
              )}

              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                  <CloudOff size={24} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-on-surface text-center mb-2">
                Go Fully Offline
              </h3>
              
              {!isStandalone ? (
                <>
                  <p className="text-sm text-on-surface-variant text-center mb-6">
                    <span className="font-bold text-tertiary">Step 1: Install the App</span><br/>
                    To use SadBai fully offline without an internet connection, you must install it to your device's home screen first.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleInstallApp}
                      className="w-full py-3 rounded-full bg-tertiary text-on-tertiary font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors"
                    >
                      <Download size={18} />
                      Install App
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-3 rounded-full text-on-surface-variant font-bold text-sm uppercase tracking-wider hover:bg-surface-variant/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : isDownloading ? (
                <>
                  <p className="text-sm text-on-surface-variant text-center mb-6">
                    Downloading the AI engine directly into your device...
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                      <span>Downloading...</span>
                      <span>{progress ? Math.round(progress.progress * 100) : 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-tertiary transition-all duration-300"
                        style={{ width: `${progress ? progress.progress * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-center text-outline truncate">
                      {progress?.text || "Initializing..."}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant text-center mb-6">
                    <span className="font-bold text-tertiary">Step 2: Download AI Engine</span><br/>
                    App installed! Now, you need to download the AI engine (~1.5GB). You only need to do this once.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsDownloading(true);
                        onEnableOffline(
                          (p) => setProgress(p),
                          () => {
                            setIsDownloading(false);
                            setShowModal(false);
                          },
                          (err) => {
                            console.error(err);
                            setIsDownloading(false);
                            setShowModal(false);
                            alert("Failed to load offline model. See console.");
                          }
                        );
                      }}
                      className="w-full py-3 rounded-full bg-tertiary text-on-tertiary font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors"
                    >
                      <Download size={18} />
                      Start Download
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-3 rounded-full text-on-surface-variant font-bold text-sm uppercase tracking-wider hover:bg-surface-variant/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer language={lang} />
    </div>
  );
};
