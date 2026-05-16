"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GeneratorView from '@/components/features/GeneratorView';
import { Hexagon, Sparkles, Image as ImageIcon, Library, Download, ExternalLink } from 'lucide-react';
import { LiquidPanel, LiquidButton } from '@/components/ui/liquid-glass';
import { cn } from '@/lib/utils';
import { PRESET_STYLES } from '@/lib/styles-data';

type Tab = 'generate' | 'gallery' | 'styles';

export type SavedImage = {
  url: string;
  prompt: string;
  timestamp: number;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedImage[]>([]);

  const handleApplyStyle = (stylePrompt: string) => {
    setPrompt(stylePrompt);
    setActiveTab('generate');
  };

  const handleGenerateSuccess = (images: string[], finalPrompt: string) => {
    const newImages = images.map(url => ({ url, prompt: finalPrompt, timestamp: Date.now() + Math.random() }));
    setHistory(prev => [...newImages, ...prev]);
  };

  return (
    <main className="h-screen relative w-full flex flex-col z-10 overflow-hidden">
      <header className="flex-shrink-0 px-4 md:px-6 lg:px-10 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all border-b border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/20 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-[14px] bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Hexagon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              幻境制造机
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">BETA</span>
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">MIRAGE STUDIO x LIQUID GLASS</p>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="flex items-center gap-2 md:gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 overflow-x-auto pb-1 md:pb-0 hide-scrollbar"
        >
          <TabButton 
            active={activeTab === 'generate'} 
            onClick={() => setActiveTab('generate')}
            icon={<Sparkles size={16}/>}
          >
            绘域空间
          </TabButton>
          <TabButton 
            active={activeTab === 'gallery'} 
            onClick={() => setActiveTab('gallery')}
            icon={<ImageIcon size={16}/>}
          >
            图集存档
          </TabButton>
          <TabButton 
            active={activeTab === 'styles'} 
            onClick={() => setActiveTab('styles')}
            icon={<Library size={16}/>}
          >
            风格库
          </TabButton>
        </motion.div>
      </header>

      <div className="flex-1 w-full flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden relative min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full flex flex-col min-h-0"
            >
              <GeneratorView 
                globalPrompt={prompt} 
                setGlobalPrompt={setPrompt} 
                referenceImage={referenceImage}
                setReferenceImage={setReferenceImage}
                onGenerateSuccess={handleGenerateSuccess} 
              />
            </motion.div>
          )}
          
          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full flex flex-col min-h-0"
            >
              <LiquidPanel className="w-full h-full flex flex-col overflow-hidden">
                <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between z-10 shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      图集存档
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">您的所有历史产出影像均存档于此，仅保存在当前会话。</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 min-h-0">
                  {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <ImageIcon size={48} className="mx-auto mb-4 text-slate-500" strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200">档案库为空</p>
                      <p className="text-sm mt-2 text-slate-500">请先在绘域空间进行影像生成</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-8">
                      {history.map((img, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.05, 0.5) }}
                          key={img.timestamp} 
                          className="group relative aspect-square rounded-[2rem] overflow-hidden bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-sm transition-all hover:shadow-xl dark:hover:shadow-blue-900/20"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={img.url} 
                            alt="Saved AI Generation" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <p className="text-white/90 text-sm line-clamp-2 mb-3 font-medium drop-shadow-md">{img.prompt}</p>
                            <div className="flex gap-2 w-full">
                              <LiquidButton 
                                 variant="primary"
                                 onClick={() => { setReferenceImage(img.url); setActiveTab('generate'); }}
                                 className="flex-1 py-2 px-2 text-[13px] bg-blue-600/80 hover:bg-blue-600 border-none shadow-sm"
                              >
                                <ImageIcon size={14} /> 作为参考
                              </LiquidButton>
                              <LiquidButton 
                                 variant="secondary"
                                 onClick={() => window.open(img.url, '_blank')}
                                 className="py-2 px-3 text-[13px] shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md"
                              >
                                <ExternalLink size={14} /> 全尺寸
                              </LiquidButton>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </LiquidPanel>
            </motion.div>
          )}

          {activeTab === 'styles' && (
            <motion.div 
              key="styles"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full flex flex-col min-h-0"
            >
              <LiquidPanel className="w-full h-full flex flex-col overflow-hidden">
                <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between z-10 shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      预设风格库
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">点击直接应用预设咒语模板并自动返回造物枢纽。</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto pb-8">
                    {PRESET_STYLES.map((st, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={st.name} 
                        className="group flex flex-col p-6 rounded-3xl bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 border border-white/50 dark:border-white/10 shadow-sm transition-all hover:shadow-xl dark:hover:shadow-blue-900/20 cursor-pointer"
                        onClick={() => handleApplyStyle(st.prompt)}
                      >
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">{st.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {st.tags?.map(t => (
                            <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 relative">
                          {st.prompt}
                        </p>
                        <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex justify-end">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            加载图谱 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </LiquidPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 relative outline-none",
        active 
          ? "text-slate-900 dark:text-white" 
          : "hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      )}
    >
      {active && (
        <motion.div 
          layoutId="active-tab"
          className="absolute inset-0 bg-white/60 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/5 rounded-xl pointer-events-none"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}
