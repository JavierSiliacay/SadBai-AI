import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, LogOut, Waves, Heart, Wind, Moon, Droplets, X, Music, Link as LinkIcon, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react';
import { Language } from '../types';

interface MoodCardProps {
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  animate?: boolean;
  onClick: () => void;
}

const MoodCard = ({ title, badge, description, icon, colorClass, animate, onClick }: MoodCardProps) => (
  <button 
    onClick={onClick}
    className={`group flex flex-col items-start gap-4 p-7 rounded-[2rem] bg-gradient-to-br from-surface-container/30 to-${colorClass}/5 backdrop-blur-2xl border border-${colorClass}/20 hover:border-${colorClass}/40 transition-all duration-700 text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-${colorClass}/40 shadow-[0_8px_40px_rgba(0,0,0,0.4)] ${animate ? 'animate-breathing' : ''}`}
  >
    <div className={`absolute inset-0 bg-gradient-to-tr from-${colorClass}/5 via-transparent to-transparent opacity-40`}></div>
    <div className={`absolute -top-12 -right-12 w-48 h-48 bg-${colorClass}/15 rounded-full blur-[50px] group-hover:bg-${colorClass}/25 transition-colors duration-700`}></div>
    <div className={`w-14 h-14 rounded-2xl bg-surface-variant/40 flex items-center justify-center text-${colorClass} group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`}>
      {icon}
    </div>
    <div className="relative z-10 w-full">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h2 className="text-xl font-semibold text-on-surface">{title}</h2>
        <span className={`text-[11px] font-bold uppercase tracking-widest text-${colorClass} px-3 py-1 rounded-full border border-${colorClass}/30 bg-${colorClass}/10 shadow-[0_0_12px_rgba(0,0,0,0.2)] backdrop-blur-md`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  </button>
);

const TikTokModal = ({ isOpen, onClose, videoId, title, colorClass }: { isOpen: boolean, onClose: () => void, videoId: string, title: string, colorClass: string }) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (isOpen && videoId) {
      setHasInteracted(false); // reset on new video
    }
  }, [isOpen, videoId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center text-center p-8 backdrop-blur-xl`}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-8 z-20">
              <div className="text-left">
                <p className="text-[10px] text-primary tracking-[0.3em] uppercase font-black mb-1">Sonic Grounding</p>
                <h3 className="text-xl font-bold text-on-surface leading-tight">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-on-surface/50 hover:text-on-surface transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Visual Sanctuary Area */}
            <div 
              className="relative w-full aspect-square flex items-center justify-center mb-8 z-10"
            >
              {/* Interaction Overlay */}
              {/* If playing, this captures all clicks (blocking redirects) and reloads the iframe to stop.
                  If paused, this briefly disappears on mousedown to allow the 'Play' click to reach TikTok. */}
              <div 
                className="absolute inset-0 z-30 cursor-pointer rounded-full"
                onMouseDown={() => {
                  if (hasInteracted) {
                    // Currently playing, so stop it by reloading
                    setHasInteracted(false);
                  } else {
                    // Currently stopped, so play it by clicking through
                    setHasInteracted(true);
                    const shield = document.getElementById('tiktok-shield');
                    if (shield) {
                      shield.style.pointerEvents = 'none';
                      // Wait longer to ensure the browser processes the mouseup/click on the iframe
                      setTimeout(() => {
                        if (shield) shield.style.pointerEvents = 'auto';
                      }, 500); 
                    }
                  }
                }}
                id="tiktok-shield"
              />

              {/* TikTok iframe area */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border border-white/5">
                <div className="w-[180%] h-[180%] absolute flex items-center justify-center pointer-events-auto opacity-[0.25] blur-md transition-opacity duration-700">
                  {/* We always render the iframe but we change the SRC to reload/stop it */}
                  <iframe 
                    key={hasInteracted ? 'playing' : 'stopped'}
                    src={hasInteracted ? `https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&muted=0` : ''}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                </div>
              </div>

              {/* Decorative sphere — Visual feedback */}
              <div className="relative flex items-center justify-center z-20 pointer-events-none">
                <motion.div 
                  animate={hasInteracted ? { 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                    boxShadow: [
                      "0 0 40px rgba(192, 193, 255, 0.2)",
                      "0 0 80px rgba(192, 193, 255, 0.4)",
                      "0 0 40px rgba(192, 193, 255, 0.2)"
                    ]
                  } : {
                    scale: [1, 1.05, 1],
                    opacity: [0.4, 0.6, 0.4],
                    boxShadow: "0 0 30px rgba(192, 193, 255, 0.15)"
                  }}
                  transition={{ 
                    duration: hasInteracted ? 4 : 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-white/20 backdrop-blur-3xl"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {hasInteracted ? (
                    <>
                      <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Pause size={32} className="text-white" fill="currentColor" />
                      </motion.div>
                      <motion.span 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90"
                      >
                        Playing
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Play size={32} className="text-white" fill="currentColor" />
                      </motion.div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">
                        Tap to Play
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-on-surface/50 leading-relaxed px-4 mb-8 z-10">
              {hasInteracted 
                ? "Close your eyes. Breathe. Let the music carry you."
                : "Tap the circle to start. Sound plays through TikTok — unmute if needed."}
            </p>

            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] text-outline hover:text-primary hover:bg-white/10 transition-all active:scale-95 z-10"
            >
              End Session
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const MoodMusicScreen = ({ onEndSession, language }: { onEndSession: () => void, language: Language }) => {
  const [activeVideo, setActiveVideo] = useState<{ id: string, title: string, color: string } | null>(null);
  const [selectionMode, setSelectionMode] = useState<any | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const moodData = {
    sadbai: { 
      title: "SadBai Mode", 
      color: "primary",
      options: [
        { id: "7478157811927584008", label: "What if? #1" },
        { id: "7465920338220600594", label: "What if? #2" },
        { id: "7512793744286993686", label: "What if? #3" },
        { id: "7451798655335435527", label: "Kinabuhi ug Musika" },
        { id: "7583022073585405204", label: "Hunghong sa Kasingkasing" },
        { id: "7603001103638269186", label: "Handumanan" }
      ]
    },
    hinay: { 
      title: language === 'bisaya' ? "Hinay Mode" : language === 'tagalog' ? "Dahan-dahan Mode" : "Chill Mode", 
      color: "tertiary",
      options: [
        { id: "7429634998799486215", label: "Pahuway Una" },
        { id: "7159134475102850331", label: "Hinay-hinay Lang" },
        { id: "7516842543598898450", label: "Kalinaw" }
      ]
    },
    moveon: { 
      title: "Move On Mode", 
      color: "secondary",
      options: [
        { id: "7382907255944973574", label: "Bag-ong Sugod" },
        { id: "7610752233369505046", label: "Padayon" },
        { id: "7187723333167877403", label: "Kaya Ra Ni" }
      ]
    },
    hilom: { 
      title: "Hilom Mode", 
      color: "primary",
      options: [
        { id: "7607281966676856082", label: "Kahilom" },
        { id: "7616358178258717972", label: "Huning sa Gabii" },
        { id: "7620043796369263892", label: "Palandong" },
        { id: "7481990731658333448", label: "Kalma" },
        { id: "7202675050149907738", label: "Huna-huna" },
        { id: "7338727353717132550", label: "Mata sa Kagabhion" }
      ]
    }
  };

  const extractVideoId = (url: string) => {
    // Standard and Tracking Links: tiktok.com/@user/video/7237895254130085125?is_from_webapp=1...
    // Also matches: www.tiktok.com/v/7237895254130085125
    const match = url.match(/\/video\/(\d+)/) || url.match(/\/v\/(\d+)/);
    if (match && match[1]) return match[1];

    // Handle plain numeric IDs if the user just pastes the ID
    if (/^\d+$/.test(url.trim())) return url.trim();

    return null;
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(customUrl);
    if (id) {
      setActiveVideo({ id, title: "Custom Sound", color: selectionMode.color });
      setSelectionMode(null);
      setCustomUrl("");
      setUrlError("");
    } else {
      setUrlError(language === 'bisaya' ? "Invalid link. Kinahanglan og full video link." : "Invalid link. Need a full video link.");
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto flex flex-col gap-8 relative z-10">
      <section className="flex flex-col items-center text-center gap-2 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high/40 border border-outline-variant/30 text-primary text-[13px] font-medium backdrop-blur-md mb-2 shadow-sm">
          <Waves size={16} />
          Sonic Grounding
        </div>
        <h1 className="text-3xl font-semibold text-on-surface">
          {language === 'bisaya' ? 'Pangitaa ang Imong Kaluas' : language === 'tagalog' ? 'Hanapin ang Iyong Kapanatagan' : 'Find Your Sonic Sanctuary'}
        </h1>
        <p className="text-base text-on-surface-variant max-w-lg mt-2">
          {language === 'bisaya' 
            ? 'Ang musika maoy mogunit sa kabug-at kon ang mga pulong mapakyas. Pagpili og mode nga motakdo sa imong kahimtang karon.'
            : language === 'tagalog' ? 'Musika ang nagdadala ng kabigatan kapag ang mga salita ay kulang. Pumili ng mode na tumutugma sa iyong nararamdaman ngayon.' : 'Music carries the weight when words fall short. Choose a mode that matches your current state.'}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodCard 
          title="SadBai Mode"
          badge={language === 'bisaya' ? 'Ipagawas' : language === 'tagalog' ? 'Ilabas' : 'Vent'}
          description={language === 'bisaya' 
            ? "Mabug-at ug emosyonal nga mga kanta. Hugot songs para makahilak ka og maayo." 
            : language === 'tagalog' ? "Mabigat at emosyonal na mga kanta. Hugot songs para makaiyak ka nang mabuti." : "Heavy, emotional tracks. Hugot songs to help you let it all out."}
          icon={<Droplets size={28} className="drop-shadow-[0_0_8px_rgba(192,193,255,0.6)]" fill="currentColor" />}
          colorClass="primary"
          animate
          onClick={() => setSelectionMode(moodData.sadbai)}
        />
        <MoodCard 
          title={moodData.hinay.title}
          badge={language === 'bisaya' ? 'Pakalma' : language === 'tagalog' ? 'Pakalma' : 'Calm'}
          description={language === 'bisaya'
            ? "Acoustic covers ug hinay nga Bisaya indie para sa pagpahulay sa imong huna-huna."
            : language === 'tagalog' ? "Acoustic covers at dahan-dahang Tagalog indie para sa pagpapahinga ng iyong isip." : "Acoustic covers and mellow indie vibes to rest your mind."}
          icon={<Heart size={28} className="drop-shadow-[0_0_8px_rgba(60,221,199,0.6)]" fill="currentColor" />}
          colorClass="tertiary"
          onClick={() => setSelectionMode(moodData.hinay)}
        />
        <MoodCard 
          title="Move On Mode"
          badge={language === 'bisaya' ? 'Bawi' : language === 'tagalog' ? 'Bawi' : 'Rise'}
          description={language === 'bisaya'
            ? "Mga kanta sa kaisog ug paglaum. Para sa pagsugod og usab karong adlawa."
            : language === 'tagalog' ? "Mga kanta ng lakas at pag-asa. Para sa pagsisimulang muli ngayong araw." : "Songs of strength and hope. To help you start fresh today."}
          icon={<Wind size={28} className="drop-shadow-[0_0_8px_rgba(221,183,255,0.6)]" fill="currentColor" />}
          colorClass="secondary"
          onClick={() => setSelectionMode(moodData.moveon)}
        />
        <MoodCard 
          title={moodData.hilom.title}
          badge={language === 'bisaya' ? 'Huna-huna' : language === 'tagalog' ? 'Muni-muni' : 'Reflect'}
          description={language === 'bisaya'
            ? "Ambient sounds ug hinay nga ulan. Walay lyrics, kalingaw lang sa kamingaw."
            : language === 'tagalog' ? "Ambient sounds at mahinang ulan. Walay lyrics, kalingaw lang sa katahimikan." : "Ambient sounds and gentle rain. No lyrics, just peace in solitude."}
          icon={<Moon size={28} className="drop-shadow-[0_0_8px_rgba(144,143,160,0.6)]" fill="currentColor" />}
          colorClass="outline"
          onClick={() => setSelectionMode(moodData.hilom)}
        />
      </div>

      {/* Selection Modal */}
      <AnimatePresence>
        {selectionMode && (
          <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectionMode(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-surface-container-high rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-auto md:max-h-[85vh] border-t border-white/10 md:border border-white/5"
            >
              <div className="p-8 pb-4 flex items-center justify-between relative shrink-0">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full md:hidden" />
                <div className="mt-2">
                  <h3 className={`text-2xl font-bold text-on-surface`}>{selectionMode.title}</h3>
                  <p className="text-sm text-outline mt-1">
                    {language === 'bisaya' ? 'Pagpili og sound nga motakdo nimo' : language === 'tagalog' ? 'Pumili ng sound na tumutugma sa iyo' : 'Choose a sound that resonates'}
                  </p>
                </div>
                <button onClick={() => setSelectionMode(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 pt-4 space-y-8 custom-scrollbar pb-32">
                {/* Curated List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-outline uppercase tracking-widest text-[11px] font-black">
                    <Music size={14} />
                    {language === 'bisaya' ? 'Curated Tracks' : language === 'tagalog' ? 'Curated Tracks' : 'Curated Tracks'}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {selectionMode.options.map((opt: any) => (
                      <button 
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setActiveVideo({ id: opt.id, title: opt.label, color: selectionMode.color });
                          setSelectionMode(null);
                        }}
                        className="w-full p-5 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-medium text-on-surface">{opt.label}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 size={18} className="text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Link Section */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-outline uppercase tracking-widest text-[11px] font-black">
                    <LinkIcon size={14} />
                    {language === 'bisaya' ? 'Paggamit og Imong Link' : language === 'tagalog' ? 'Gumamit ng Iyong Link' : 'Use Your Own Link'}
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="https://www.tiktok.com/..."
                        value={customUrl}
                        onChange={(e) => {
                          setCustomUrl(e.target.value);
                          setUrlError("");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                      />
                      {urlError && (
                        <div className="flex items-center gap-2 mt-2 text-error text-xs px-1">
                          <AlertCircle size={14} />
                          {urlError}
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const id = extractVideoId(customUrl);
                        if (id) {
                          setActiveVideo({ id, title: "Custom Sound", color: selectionMode.color });
                          setSelectionMode(null);
                          setCustomUrl("");
                          setUrlError("");
                        } else {
                          setUrlError(language === 'bisaya' ? "Invalid link. Kinahanglan og full video link." : "Invalid link. Need a full video link.");
                        }
                      }}
                      disabled={!customUrl.trim()}
                      className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {language === 'bisaya' ? 'I-apply ang Sound' : language === 'tagalog' ? 'I-apply ang Sound' : 'Apply Sound'}
                    </button>
                  </div>
                </div>
                
                {/* Final spacer to ensure scrolling reaches the very end */}
                <div className="h-20" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TikTokModal 
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoId={activeVideo?.id || ""}
        title={activeVideo?.title || ""}
        colorClass={activeVideo?.color || "primary"}
      />

      <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 w-full">
        <button 
          onClick={() => alert("This feature is not yet functional and currently working if the dev has some spare time")}
          className="w-full md:w-auto px-10 py-4 rounded-full bg-surface-container-high/20 border border-white/5 text-on-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-surface-container-high/40 hover:border-primary/30 hover:shadow-[0_0_25px_rgba(192,193,255,0.1)] backdrop-blur-2xl transition-all duration-500 active:scale-95 group"
        >
          <Download size={20} className="group-hover:rotate-12 transition-transform" />
          {language === 'bisaya' ? 'I-download ang Summary' : language === 'tagalog' ? 'I-download ang Summary' : 'Download Summary'}
        </button>
        <button 
          onClick={onEndSession}
          className="w-full md:w-auto px-10 py-4 rounded-full bg-error-container/5 border border-white/5 text-error text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-error-container/15 hover:border-error/30 hover:shadow-[0_0_25px_rgba(255,180,171,0.05)] backdrop-blur-2xl transition-all duration-500 active:scale-95 group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          {language === 'bisaya' ? 'Tapuson ang Session' : language === 'tagalog' ? 'Tapusin ang Session' : 'End Session'}
        </button>
      </div>
    </main>
  );
};


