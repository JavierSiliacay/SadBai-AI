import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Heart, ArrowRight, Flower2, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface ReflectionData {
  summary: string;
  truth: string;
  nextStep: string;
}

export const ReflectionScreen = ({ data, language, isLoading }: { data: ReflectionData | null, language: Language, isLoading: boolean }) => {
  const defaultData: ReflectionData = language === 'tagalog' ? {
    summary: "Dumaan ka sa mahirap na panahon at nararamdaman mong parang wala kang patutunguhan.",
    truth: "Mahalaga ang nararamdaman mo dahil totoo iyan para sa iyo.",
    nextStep: "Magpahinga muna ngayon. Bukas, magsimula sa isang maliit na bagay."
  } : language === 'bisaya' ? {
    summary: "Nag-agi ka og lisod nga phase sa imong life ug gibati nimo nga lowkey walay padulngan.",
    truth: "Important kaayo imong gibati kay valid ug tinuod na para nimo.",
    nextStep: "Pahuway sa for now. Ugma, pagsugod og usa ka gamay nga butang, dasurb nimo."
  } : {
    summary: "You've been through a difficult time and felt like you were going nowhere.",
    truth: "Your feelings are important because they are real to you.",
    nextStep: "Rest for now. Tomorrow, start with one small thing."
  };

  const finalData = data || defaultData;

  return (
    <main className="flex-grow pt-[88px] pb-[120px] px-6 max-w-3xl mx-auto w-full flex flex-col gap-6 relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-primary mb-8"
            >
              <Sparkles size={64} className="opacity-50" />
            </motion.div>
            <h2 className="text-2xl font-h1 font-bold text-on-background mb-4">
              {language === 'bisaya' ? 'Kadiyot lang, gihan-ay sa nako imong feelings... ✨' : language === 'tagalog' ? 'Sandali lang, inaayos ko lang ang iyong mga nararamdaman... 🫂' : 'Hold on, just organizing your feelings for a second... 🥺'}
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
              {language === 'bisaya' 
                ? 'Naminaw kog maayo nimo. Kadiyot lang ha, gihan-ay nako ni tanan para makita nimo ang katin-awan yarn ✨.' 
                : language === 'tagalog' ? 'Nakikinig ako nang mabuti sa lahat ng sinabi mo. Sandali lang, inaayos ko lang ito para makita mo ang katinuan 🫂.' : 'I have been listening closely to everything you shared. Just a moment while I organize your thoughts so you can see things clearly 🥺.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-center mt-8"
      >
        <h2 className="text-3xl font-semibold text-primary-fixed drop-shadow-sm">SadBai's Reflection</h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-container/40 backdrop-blur-3xl rounded-2xl p-7 relative overflow-hidden border-l-2 border-l-tertiary/50 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 text-tertiary opacity-80 mt-1">
            <Flower2 size={24} />
          </div>
          <div className="space-y-4 text-lg text-on-surface-variant leading-relaxed">
            <p>
              {language === 'bisaya' 
                ? 'Naminaw ko nimo pag-ayo, for real. Okay ra gyud na mobati og kaguol karon. Dasurb nimo ma-validate imong feelings.' 
                : language === 'tagalog' ? 'Nakikinig ako sa iyo nang mabuti. Okay lang na makaramdam ng kalungkutan ngayon. Mahalaga ka, at totoo ang iyong mga nararamdaman.' : 'I’ve been listening to you closely. It’s okay to feel sad right now. You are valued, and your feelings are real.'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 mb-2 flex items-center gap-3">
        <span className="h-px bg-surface-variant flex-grow"></span>
        <span className="text-[13px] font-medium text-outline uppercase tracking-widest px-2">Closure & Clarity Engine</span>
        <span className="h-px bg-surface-variant flex-grow"></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container/40 backdrop-blur-2xl rounded-2xl p-6 border-t border-t-primary/10 hover:border-t-primary/30 transition-all duration-500 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4 text-primary-fixed">
            <History size={24} />
            <h3 className="text-lg font-semibold tracking-tight">{language === 'bisaya' ? 'Unsay Nahitabo' : language === 'tagalog' ? 'Anong Nangyari' : 'What Happened'}</h3>
          </div>
          <p className="text-sm text-on-surface-variant/90 leading-relaxed">
            {finalData.summary}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container/40 backdrop-blur-2xl rounded-2xl p-6 border-t border-t-secondary/10 hover:border-t-secondary/30 transition-all duration-500 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4 text-secondary-fixed">
            <Heart size={24} />
            <h3 className="text-lg font-semibold tracking-tight">{language === 'bisaya' ? 'Kamatuoran' : language === 'tagalog' ? 'Katotohanan' : 'The Truth'}</h3>
          </div>
          <p className="text-sm text-on-surface-variant/90 leading-relaxed">
            {finalData.truth}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-container/40 backdrop-blur-2xl rounded-2xl p-6 border-t border-t-tertiary/10 hover:border-t-tertiary/30 transition-all duration-500 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4 text-tertiary-fixed">
            <ArrowRight size={24} />
            <h3 className="text-lg font-semibold tracking-tight">{language === 'bisaya' ? 'Focus Sunod' : language === 'tagalog' ? 'Focus Susunod' : 'Focus Next'}</h3>
          </div>
          <p className="text-sm text-on-surface-variant/90 leading-relaxed">
            {finalData.nextStep}
          </p>
        </motion.div>
      </div>
    </main>
  );
};

