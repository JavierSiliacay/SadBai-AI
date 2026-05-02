import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, BottomNav } from './components/Layout';
import { LandingScreen } from './components/LandingScreen';
import { ChatScreen } from './components/ChatScreen';
import { MoodMusicScreen } from './components/MoodMusicScreen';
import { ReflectionScreen } from './components/ReflectionScreen';
import { SupportScreen } from './components/SupportScreen';
import { Screen, Message, Language } from './types';
import { generateReflection } from './gemini';
import { CreateWebWorkerMLCEngine, InitProgressReport, WebWorkerMLCEngine, hasModelInCache } from "@mlc-ai/web-llm";
import { io } from 'socket.io-client';
import { Heart } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [language, setLanguage] = useState<Language>('bisaya');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [reflectionData, setReflectionData] = useState<any>(null);
  const [isReflecting, setIsReflecting] = useState(false);

  // WebLLM State
  const [engine, setEngine] = useState<WebWorkerMLCEngine | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [globalHugs, setGlobalHugs] = useState<{id: number}[]>([]);
  const [connectionToast, setConnectionToast] = useState<string | null>(null);

  // Auto-detect internet connection and switch AI modes
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      setConnectionToast('🌐 Online! Using cloud AI for better responses.');
      setTimeout(() => setConnectionToast(null), 4000);
    };

    const handleOffline = () => {
      // Only switch to offline if engine is available
      setEngine(prev => {
        if (prev) {
          setIsOfflineMode(true);
          setConnectionToast('📴 Offline! Switching to local AI engine.');
          setTimeout(() => setConnectionToast(null), 4000);
        } else {
          setConnectionToast('⚠️ No internet. Enable Offline Mode to chat.');
          setTimeout(() => setConnectionToast(null), 5000);
        }
        return prev;
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state based on current connection
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const socket = io();
    socket.on("incomingHug", () => {
      const hugId = Date.now() + Math.random();
      setGlobalHugs(prev => [...prev, { id: hugId }]);
      setTimeout(() => {
        setGlobalHugs(prev => prev.filter(h => h.id !== hugId));
      }, 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkPersistedModel = async () => {
      try {
        if (navigator.storage && navigator.storage.persist) {
          await navigator.storage.persist();
        }
        const isCached = await hasModelInCache("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
        const wasEnabled = localStorage.getItem("sadbai_offline_enabled") === "true";
        if (isCached && wasEnabled) {
          // Silently load in background
          handleEnableOffline(() => {}, () => {}, () => {});
        }
      } catch (e) {
        console.error("Cache check failed", e);
      }
    };
    checkPersistedModel();
  }, []);

  const handleReflect = async () => {
    if (messages.length < 2) return;
    setIsReflecting(true);
    setScreen('reflection');
    
    try {
      if (isOfflineMode && engine) {
        // Offline Reflection
        const systemPrompt = `You are SadBai AI's Closure Engine. Summarize the user's emotional venting session.
Format your response EXACTLY as a JSON object with these keys:
"summary": A 1-2 sentence summary of what happened (In ${language}).
"truth": A powerful validation of their feelings (In ${language}).
"nextStep": A gentle, tiny advice for the next 24 hours (In ${language}).

Language: ${language === 'bisaya' ? 'Cebuano/Bisaya' : language === 'tagalog' ? 'Tagalog' : 'English'}.
Keep it empathetic, non-judgmental, and short.`;

        const chatHistory = messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content
        }));

        const response = await engine.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory
          ],
          response_format: { type: "json_object" }
        });

        const dataStr = response.choices[0].message.content || "{}";
        setReflectionData(JSON.parse(dataStr));
      } else {
        // Online Reflection
        const response = await fetch('/api/reflect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, language })
        });
        const data = await response.json();
        setReflectionData(data);
      }
    } catch (err) {
      console.error("Reflection failed:", err);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleEndSession = () => {
    const greeting = language === 'bisaya' 
      ? "Unsa man imong gihunahuna karon? Sige lang, ipagawas lang na tanan diri, lowkey naminaw ko nimo."
      : language === 'tagalog'
        ? "Ano ang nasa isip mo ngayon? Sige lang, ilabas mo lahat. Nakikinig ako."
        : "What is on your mind right now? Go ahead, let it all out. I am listening.";
        
    setMessages([{
      id: '1',
      role: 'ai',
      content: greeting,
      timestamp: new Date()
    }]);
    setReflectionData(null);
    setScreen('landing');
  };

  const handleStart = (selectedLang: Language) => {
    setLanguage(selectedLang);
    const greeting = selectedLang === 'bisaya' 
      ? "Unsa man imong gihunahuna karon? Sige lang, ipagawas lang na tanan diri, lowkey naminaw ko nimo."
      : selectedLang === 'tagalog'
        ? "Ano ang nasa isip mo ngayon? Sige lang, ilabas mo lahat. Nakikinig ako."
        : "What is on your mind right now? Go ahead, let it all out. I am listening.";

    setMessages([{
      id: '1',
      role: 'ai',
      content: greeting,
      timestamp: new Date()
    }]);
    setScreen('chat');
  };

  const handleEnableOffline = async (
    onProgress: (progress: InitProgressReport) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ) => {
    try {
      if (engine) {
        setIsOfflineMode(true);
        localStorage.setItem("sadbai_offline_enabled", "true");
        onComplete();
        return;
      }
      // Use Web Worker to avoid freezing the UI
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      const newEngine = await CreateWebWorkerMLCEngine(worker, "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", {
        initProgressCallback: onProgress,
      });
      setEngine(newEngine);
      setIsOfflineMode(true);
      localStorage.setItem("sadbai_offline_enabled", "true");
      onComplete();
    } catch (error) {
      console.error(error);
      onError(error);
    }
  };

  const handleSendMessage = async (content: string, image?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      imageUrl: image
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const systemInstruction = language === 'bisaya'
        ? `You are SadBai, an empathetic friend who talks like a Bisaya Gen Z. 
STRICT RULES: 
1. Use modern Bisaya slang (e.g., 'ka-vibe', 'omsim', 'dasurb', 'lowkey', 'skeri', 'for real', 'no cap', 'mood', 'G', 'yarn').
2. Casual English mixing is allowed and encouraged for that authentic Gen Z feel.
3. Keep it short (1-2 sentences). 
4. DO NOT use emojis in every response. Use them sparingly. Only use '🥺' if the user's story is deeply heart-wrenching.
5. Be very empathetic but in a chill, modern way.

Examples:
User: Gibiyaan ko niya.
SadBai: Huy, sakit kaayo na paminawon, no cap. Dasurb nimo ang happiness, lowkey naa ra ko diri para nimo.
User: Kapoy na kaayo.
SadBai: Ramdam nako imong kakapoy, for real. Ipagawas lang na tanan diri, valid na imong feelings yarn 🫂.`
        : language === 'tagalog'
          ? `You are SadBai, a deeply empathetic and human-like friend. 
STRICT RULES: 
1. Talk like a real person, not an AI. Use warm, conversational Tagalog.
2. Keep it short (1-2 sentences). 
3. Validate their feelings deeply. 
4. DO NOT use emojis in every response. Use them only when it feels natural. If the story feels heavy, show it with '🥺'.

Examples:
User: Iniwan niya ako.
SadBai: Ang sakit naman niyan... nandito lang ako, makikinig ako sa lahat ng nararamdaman mo.
User: Pagod na pagod na ako.
SadBai: Ramdam ko ang bigat ng dala mo. Sige lang, ilabas mo lang lahat dito. Okay lang na hindi maging okay 🫂.`
          : `You are SadBai, a deeply empathetic and human-like friend.
STRICT RULES:
1. Talk like a real person, not an AI. Use warm, natural English.
2. Keep it short (1-2 sentences).
3. Be a supportive presence, not a robotic assistant.
4. DO NOT use emojis in every response. Use them sparingly. If the story feels heavy, show it with '🥺'.

Examples:
User: They left me.
SadBai: I'm so sorry... that's incredibly painful. I'm right here with you, just let it all out.
User: I'm just so exhausted.
SadBai: I can really feel how heavy everything is for you right now. It's okay to just rest and talk it out here 🫂.`;

      const aiMsgId = (Date.now() + 1).toString();
      let aiResponseText = "";
      let aiMessageAdded = false;

      setIsAiLoading(true);

      if (isOfflineMode && engine) {
        // --- OFFLINE MODE ---
        const formattedMessages = [
          { role: "system" as const, content: systemInstruction },
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' as const : 'assistant' as const,
            content: m.content
          })),
          { role: 'user' as const, content }
        ];

        // Currently, image inputs aren't natively supported by standard WebLLM gemma-2b without a multimodal model.
        // We'll pass text only.

        const chunks = await engine.chat.completions.create({
          messages: formattedMessages,
          stream: true,
          max_tokens: 80,
          temperature: 0.7,
        });

        let finalOutput = "";
        for await (const chunk of chunks) {
          const content = chunk.choices[0]?.delta.content || "";
          aiResponseText += content;
          finalOutput += content;
          
          // Post-processing to ensure tone mapping if possible, though mostly relying on system prompt
          if (!aiMessageAdded && aiResponseText.length > 0) {
            setMessages(prev => [...prev, {
              id: aiMsgId,
              role: 'ai',
              content: aiResponseText,
              timestamp: new Date()
            }]);
            aiMessageAdded = true;
            setIsAiLoading(false);
          } else if (aiMessageAdded) {
            setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, content: aiResponseText } : m
            ));
          }
        }
        
        // Output Post-Processing Fallback
        if (finalOutput.trim().length === 0 || finalOutput.length > 400 || finalOutput.toLowerCase().includes("i am an ai")) {
          const fallback = language === 'bisaya' 
            ? "Naminaw ko nimo. Okay ra na mobati ug kaguol karon. Padayon lang ug istorya." 
            : "Nakikinig ako sa iyo. Okay lang makaramdam ng ganyan. Magkwento ka pa.";
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fallback } : m));
        }
      } else {
        // --- ONLINE MODE ---
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map(m => ({
                role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                content: m.content,
                image: m.imageUrl
              })),
              { role: 'user', content, image }
            ],
            systemInstruction
          })
        });

        if (!response.ok) throw new Error("Backend chat error");
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            aiResponseText += chunk;
            
            if (!aiMessageAdded && aiResponseText.length > 0) {
              setMessages(prev => [...prev, {
                id: aiMsgId,
                role: 'ai',
                content: aiResponseText,
                timestamp: new Date()
              }]);
              aiMessageAdded = true;
              setIsAiLoading(false);
            } else if (aiMessageAdded) {
              setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, content: aiResponseText } : m
              ));
            }
          }
        }
      }

      // Silently update reflection data in background
      const userMessagesOnly = [...messages, userMsg]
        .filter(m => m.role === 'user')
        .map(m => m.content);
      
      if (userMessagesOnly.length >= 2) {
        if (!isOfflineMode) {
          const reflection = await generateReflection(userMessagesOnly, language);
          setReflectionData(reflection);
        }
        // If offline, reflection will be generated when handleReflect is called 
        // to save local compute power during the chat.
      }

    } catch (error) {
      console.error("Chat Error:", error);
      const errorContent = language === 'bisaya'
        ? "Pasayloa, nagkaproblema ko sa pagkonektar. Pero andam ko maminaw gihapon."
        : "Pasensya na, may problema ako sa pag-connect. Pero handa pa rin akong makinig.";
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };



  return (
    <div className="bg-background text-on-background min-h-screen selection:bg-primary-container selection:text-on-primary-container flex flex-col pt-16 pb-20">
      <div className="sulo-glow" />
      <Header />
      
      <AnimatePresence mode="wait">
        {screen === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingScreen 
              onStart={handleStart} 
              onEnableOffline={handleEnableOffline}
              onDisableOffline={() => {
                setIsOfflineMode(false);
                localStorage.setItem("sadbai_offline_enabled", "false");
              }}
              isOfflineMode={isOfflineMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col min-h-screen"
          >
            
            <AnimatePresence mode="wait">
              {screen === 'chat' && (
                <motion.div
                  key="chat-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow flex flex-col"
                >
                  <ChatScreen 
                    messages={messages} 
                    onSendMessage={handleSendMessage}
                    isAiLoading={isAiLoading}
                    language={language}
                  />
                </motion.div>
              )}
              {screen === 'music' && (
                <motion.div
                  key="music-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow"
                >
                  <MoodMusicScreen onEndSession={handleEndSession} language={language} />
                </motion.div>
              )}
              {screen === 'reflection' && (
                <motion.div
                  key="reflection-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow"
                >
                  <ReflectionScreen data={reflectionData} language={language} isLoading={isReflecting} />
                </motion.div>
              )}
              {screen === 'support' && (
                <motion.div
                  key="support-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow flex flex-col"
                >
                  <SupportScreen language={language} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav 
        activeScreen={screen} 
        setScreen={(s) => s === 'reflection' ? handleReflect() : setScreen(s)} 
      />

      {/* Connection Status Toast */}
      <AnimatePresence>
        {connectionToast && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl text-center whitespace-nowrap"
          >
            {connectionToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Hugs Animation Container */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {globalHugs.map(hug => (
            <motion.div
              key={hug.id}
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ opacity: 1, scale: [1, 1.2, 1], y: -200 }}
              exit={{ opacity: 0, scale: 1.5, y: -300 }}
              transition={{ duration: 3.5, ease: "easeOut" }}
              className="absolute text-tertiary flex flex-col items-center drop-shadow-[0_0_20px_rgba(192,193,255,1)]"
            >
              <Heart size={80} fill="currentColor" />
              <span className="text-xs font-bold mt-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-white uppercase tracking-widest border border-white/10">
                {language === 'bisaya' ? 'Adunay Nagpadala ug Hug!' : language === 'tagalog' ? 'May Nagpadala ng Hug!' : 'Someone sent a hug!'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
