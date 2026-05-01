import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Send, Lock, Loader2 } from 'lucide-react';
import { Message, Language } from '../types';

interface ChatScreenProps {
  messages: Message[];
  onSendMessage: (content: string, image?: string) => void;
  isAiLoading: boolean;
  language: Language;
}

export const ChatScreen = ({ messages, onSendMessage, isAiLoading, language }: ChatScreenProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.7));
        } catch (e) {
          console.error("Compression failed, using original", e);
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        console.error("Image load failed, using original");
        resolve(base64Str);
      };
      img.src = base64Str;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setSelectedImage(compressed);
        setIsImageProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.includes('image')) {
      const blob = item.getAsFile();
      if (blob) {
        setIsImageProcessing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result as string);
          setSelectedImage(compressed);
          setIsImageProcessing(false);
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || selectedImage) && !isImageProcessing) {
      onSendMessage(inputValue, selectedImage || undefined);
      setInputValue('');
      setSelectedImage(null);
    }
  };

  const emotionalChips = language === 'bisaya' 
    ? ["Gikapoy", "Luh-ing", "Anxious", "Sakit"]
    : language === 'tagalog' ? ["Pagod na", "Luhaan", "Anxious", "Masakit"] : ["Tired", "Crying", "Anxious", "Hurting"];

  return (
    <main className="flex-grow flex flex-col z-10 pt-24 pb-4 px-6 w-full max-w-3xl mx-auto relative h-[calc(100vh-80px)]">
      <div className="flex flex-col items-center justify-center mb-8 opacity-80 shrink-0">
        <h2 className="text-2xl font-medium text-on-surface mb-2">
          {language === 'bisaya' ? 'Ipagawas ang Gibati' : language === 'tagalog' ? 'Ilabas ang Nararamdaman' : 'Express Your Feelings'}
        </h2>
        <span className="text-xs text-outline flex items-center gap-2">
          <Lock size={14} />
          Your session is temporary and private.
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto flex flex-col gap-4 pb-32 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-lg text-on-surface ${
                  msg.role === 'user' 
                    ? 'chat-bubble-user rounded-tr-sm' 
                    : 'chat-bubble-ai rounded-tl-sm'
                }`}
              >
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="Attached content" 
                    className="max-w-full rounded-lg mb-2 shadow-sm border border-white/10" 
                  />
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isAiLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full justify-start"
            >
              <div className="chat-bubble-ai rounded-2xl rounded-tl-sm p-4 text-on-surface shadow-lg max-w-[85%] flex items-center gap-2">
                <span className="w-2 h-2 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-4 mb-2 justify-start max-w-[85%]">
            {emotionalChips.map((chip) => (
              <button 
                key={chip}
                onClick={() => onSendMessage(chip)}
                className="glass-panel px-4 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-[100px] left-0 w-full px-6 flex justify-center z-40 pointer-events-none">
        <div className="w-full max-w-3xl pointer-events-auto relative">
          <AnimatePresence>
            {(selectedImage || isImageProcessing) && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full mb-4 left-0 p-2 glass-panel rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
              >
                <div className="relative group">
                  {isImageProcessing ? (
                    <div className="h-20 w-20 flex items-center justify-center bg-surface-variant/30 rounded-lg border border-dashed border-primary/30">
                      <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  ) : (
                    <>
                      <img src={selectedImage!} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-error/90 transition-colors"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
                <div className="pr-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {isImageProcessing ? 'Processing image...' : 'Image attached'}
                  </p>
                  <p className="text-[10px] text-outline">
                    {isImageProcessing ? 'Optimizing for speed' : 'Ready to process...'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={handleSubmit}
            className="w-full relative"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
              <div className={`glass-panel rounded-[28px] p-2 flex items-end gap-2 breathing-glow transition-all duration-300 ${isAiLoading ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImageProcessing || isAiLoading}
                  className={`p-3 transition-colors shrink-0 rounded-full hover:bg-surface-variant/50 ${selectedImage ? 'text-primary' : 'text-outline hover:text-primary'} disabled:opacity-30`}
                >
                  <ImageIcon size={24} />
                </button>
                <div className="flex-grow relative">
                  <textarea 
                    className="w-full bg-transparent border-none text-on-surface font-body-md placeholder-outline resize-none py-3 px-2 focus:ring-0 max-h-[120px] overflow-y-auto scrollbar-hide" 
                    placeholder={isAiLoading 
                      ? (language === 'bisaya' ? "Naminaw si SadBai..." : "Nakikinig si SadBai...") 
                      : (language === 'bisaya' ? "Ipagawas tanan..." : "Ilabas ang lahat...")
                    } 
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isAiLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    onPaste={handlePaste}
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedImage) || isImageProcessing || isAiLoading}
                  className="bg-secondary-container text-on-secondary-container p-3 rounded-full shrink-0 hover:bg-secondary-container/90 transition-all active:scale-95 shadow-md flex items-center justify-center disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={24} fill="currentColor" />
                </button>
              </div>
          </form>
        </div>
      </div>
    </main>
  );
};
