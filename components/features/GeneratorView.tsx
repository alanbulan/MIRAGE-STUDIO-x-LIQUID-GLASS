"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LiquidPanel, LiquidButton, LiquidInput } from '@/components/ui/liquid-glass';
import { Sparkles, Image as ImageIcon, Layers, Download, Loader2, MessageSquare, AlertCircle, Wand2, Ratio } from 'lucide-react';
import { api, AVAILABLE_MODELS, parseApiResponse, ParsedResult } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PROMPT_ANALYSIS_MODIFIER } from '@/lib/styles-data';
import ImageEditorModal from './ImageEditorModal';

const ASPECT_RATIOS = [
  { label: '1:1', value: '1024x1024' },
  { label: '3:4', value: '1024x1365' },
  { label: '4:3', value: '1365x1024' },
  { label: '9:16', value: '1024x1792' },
  { label: '16:9', value: '1792x1024' },
];

export default function GeneratorView({ 
  globalPrompt, 
  setGlobalPrompt, 
  referenceImage,
  setReferenceImage,
  onGenerateSuccess 
}: { 
  globalPrompt: string, 
  setGlobalPrompt: (s: string) => void, 
  referenceImage: string | null,
  setReferenceImage: (s: string | null) => void,
  onGenerateSuccess?: (images: string[], prompt: string) => void 
}) {
  const [model, setModel] = useState(AVAILABLE_MODELS[0]);
  const [imagesNum, setImagesNum] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [isError, setIsError] = useState(false);

  const handleGenerate = async () => {
    if (!globalPrompt.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    setIsError(false);
    
    // Check if we need to prefix the prompt analysis modifier
    let finalPrompt = isAnalysisMode 
      ? `${PROMPT_ANALYSIS_MODIFIER}\n\n当前参考图提取描述 (如提供)：\n${globalPrompt}`
      : globalPrompt;

    if (referenceImage) {
      finalPrompt = `${finalPrompt}\n\n参考图: ![reference](${referenceImage})`;
    }
    
    try {
      const response = await api.generateImages({
        model,
        prompt: finalPrompt,
        n: imagesNum,
        size: aspectRatio
      });
      
      const parsed = parseApiResponse(response.data, response.status);
      setResult(parsed);
      setIsError(response.status >= 400);

      if (response.status < 400 && parsed.images && parsed.images.length > 0) {
        onGenerateSuccess?.(parsed.images, finalPrompt);
      }


    } catch (err: any) {
      setResult({ images: [], text: err.message || 'Network error occurred' });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 h-full overflow-y-auto lg:overflow-hidden pb-8 lg:pb-0 hide-scrollbar lg:custom-scrollbar">
      
      {/* Control Sidebar */}
      <LiquidPanel className="w-full lg:w-[340px] shrink-0 flex flex-col h-auto lg:h-full lg:overflow-hidden"
                   initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        
        <div className="p-5 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 lg:gap-8 lg:overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Layers size={20} />
              </span>
              造物枢纽
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">在这里设定多重宇宙的基准参数，探索无限可能。</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                模型引擎
              </label>
              <div className="relative">
                <div 
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 outline-none rounded-2xl px-4 py-3 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all shadow-inner cursor-pointer hover:bg-white/60 dark:hover:bg-black/40 flex justify-between items-center"
                >
                  <span>{model}</span>
                  <motion.div animate={{ rotate: isModelDropdownOpen ? 180 : 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                  </motion.div>
                </div>
                <AnimatePresence>
                  {isModelDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsModelDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl z-50 overflow-hidden"
                      >
                        {AVAILABLE_MODELS.map(m => (
                          <div 
                            key={m} 
                            onClick={() => { setModel(m); setIsModelDropdownOpen(false); }}
                            className={cn(
                              "px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-colors flex items-center justify-between",
                              m === model ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            {m}
                            {m === model && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                提取数量
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(num => (
                  <LiquidButton 
                    key={num}
                    variant={imagesNum === num ? 'primary' : 'secondary'}
                    onClick={() => setImagesNum(num)}
                    className="flex-1 py-2.5 px-0 rounded-xl text-sm"
                  >
                    {num}张
                  </LiquidButton>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Ratio size={16} className="text-purple-500" />
                生成尺寸
              </label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map(ratio => (
                  <LiquidButton 
                    key={ratio.value}
                    variant={aspectRatio === ratio.value ? 'primary' : 'secondary'}
                    onClick={() => setAspectRatio(ratio.value)}
                    className="flex-1 py-2.5 px-0 rounded-xl text-sm min-w-[60px]"
                  >
                    {ratio.label}
                  </LiquidButton>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-500" />
                  参考影像
                </label>
                {referenceImage && (
                  <button 
                    onClick={() => setReferenceImage(null)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    移除参考图
                  </button>
                )}
              </div>
              
              {!referenceImage ? (
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploading(true);
                        const url = await api.uploadImage(file);
                        setIsUploading(false);
                        if (url) {
                          setReferenceImage(url);
                        } else {
                          alert("图片上传失败，请重试");
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-full h-24 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/20 dark:bg-black/10 group-hover:bg-white/40 dark:group-hover:bg-black/20 group-hover:border-blue-500/30 transition-all">
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin text-blue-500" size={24} />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">正在上传...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">点击或拖拽上传参考图</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 group">
                  <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white text-xs font-medium transition-colors cursor-pointer"
                      onClick={() => setIsEditorOpen(true)}
                    >
                      修白/打灰
                    </button>
                    <label className="px-3 py-1.5 bg-blue-500/80 hover:bg-blue-600 backdrop-blur-md rounded-lg text-white text-xs font-medium transition-colors cursor-pointer">
                      {isUploading ? <><Loader2 size={12} className="animate-spin inline mr-1" /> 上传中</> : '重新上传'}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            const url = await api.uploadImage(file);
                            setIsUploading(false);
                            if (url) {
                              setReferenceImage(url);
                            } else {
                              alert("图片上传失败，请重试");
                            }
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                咒语序列
              </label>
              <LiquidInput 
                as="textarea"
                rows={6}
                placeholder="在此输入画面特征... (例如右侧是哭泣少女...)"
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                 <button type="button" onClick={() => setIsAnalysisMode(!isAnalysisMode)} className="flex items-center gap-2.5 cursor-pointer group outline-none shrink-0">
                   <div className={cn(
                     "w-10 h-5.5 rounded-full transition-all duration-300 flex items-center px-1 border border-black/5 dark:border-white/5",
                     isAnalysisMode ? "bg-blue-500 shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)]" : "bg-black/10 dark:bg-white/10"
                   )}>
                     <motion.div 
                       className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                       animate={{ x: isAnalysisMode ? 18 : 0 }}
                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
                     />
                   </div>
                   <span className={cn(
                     "text-[12px] font-bold transition-colors flex items-center gap-1.5",
                     isAnalysisMode ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                   )}>
                     <Wand2 size={13} className={isAnalysisMode ? "animate-pulse" : ""} />
                     风格反推模式
                   </span>
                 </button>
                 <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">按 Cmd/Ctrl + Enter 快速部署</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 lg:p-8 pt-0 mt-auto shrink-0">
          <LiquidButton 
            variant="primary"
            className="w-full py-4 text-[15px] shadow-xl shadow-blue-600/20 active:shadow-inner"
            onClick={handleGenerate}
            disabled={isLoading || !globalPrompt.trim()}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isLoading ? '解析高维数据中...' : '开始显化'}
          </LiquidButton>
        </div>
      </LiquidPanel>

      {/* Main Output View */}
      <LiquidPanel className="flex-1 min-h-[600px] lg:min-h-0 flex flex-col h-full lg:overflow-hidden shrink-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between z-10 shrink-0 bg-white/10 dark:bg-black/10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10">
              <ImageIcon size={18} />
            </span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">观测域输出</h3>
          </div>
        </div>
        
        <div className="flex-1 p-5 md:p-6 lg:p-8 flex flex-col relative lg:overflow-y-auto custom-scrollbar">
          
          {/* Empty state */}
          {!isLoading && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 text-slate-500 pointer-events-none p-6 text-center">
               <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                 <Sparkles size={56} className="mx-auto mb-6 opacity-30 text-blue-500" strokeWidth={1} />
               </motion.div>
               <p className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-200">世界线的空白待您书写</p>
               <p className="text-sm mt-3 opacity-80 max-w-[280px] leading-relaxed">注入相关词汇设定，系统将从高维信道提取适配的视觉画面响应。</p>
            </div>
          )}

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md p-8"
               >
                 <div className="flex flex-col items-center justify-center w-full max-w-2xl gap-8">
                   <motion.div 
                     className="relative w-full overflow-hidden rounded-[2rem] bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 shadow-2xl backdrop-blur-xl"
                     style={{ 
                       maxWidth: aspectRatio === '1024x1792' || aspectRatio === '1024x1365' ? '400px' : '600px',
                       aspectRatio: aspectRatio.split('x').join(' / ') 
                     }}
                   >
                     {/* Glass/Mirror effect background */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/5 dark:from-white/10 dark:to-transparent" />
                     
                     {/* Scanning light beams */}
                     <motion.div 
                       className="absolute -inset-[100%] opacity-50 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.8)_50%,transparent_75%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)]"
                       animate={{ 
                         x: ['-100%', '100%'],
                         y: ['-100%', '100%']
                       }}
                       transition={{ 
                         repeat: Infinity, 
                         duration: 2.5, 
                         ease: "easeInOut" 
                       }}
                     />

                     <motion.div 
                       className="absolute inset-0"
                       animate={{ 
                         background: [
                           'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                           'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
                           'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
                         ]
                       }}
                       transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                     />
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <Loader2 size={32} className="text-blue-500 animate-spin mb-4 drop-shadow-md" />
                     </div>
                   </motion.div>
                   
                   <div className="flex flex-col items-center gap-2">
                     <span className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-wider flex items-center gap-2">
                       <Sparkles size={16} className="text-blue-500 animate-pulse" />
                       镜像空间投影中...
                     </span>
                     <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">当前设定尺寸: {ASPECT_RATIOS.find(r => r.value === aspectRatio)?.label || '1:1'} | 预计需要 10 - 20 秒</span>
                   </div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full z-10">
            {/* AI Text Response / Error Response */}
            {result?.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-6 md:p-8 rounded-[2rem] border backdrop-blur-xl shadow-lg relative overflow-hidden",
                  isError 
                    ? "bg-red-500/5 dark:bg-red-950/20 border-red-500/20 text-red-800 dark:text-red-200" 
                    : "bg-white/80 dark:bg-white/5 border-white dark:border-white/10 text-slate-800 dark:text-slate-100"
                )}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-xl shrink-0 mt-1 shadow-sm",
                    isError ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {isError ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div className="whitespace-pre-wrap text-[15px] md:text-[16px] leading-relaxed font-medium">
                    {result.text}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rendered Images Grid */}
            <AnimatePresence mode="popLayout">
              {result?.images && result.images.length > 0 && (
                <div className={cn(
                  result.images.length === 1 
                    ? "grid grid-cols-1 w-full" 
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full"
                )}>
                  {result.images.map((url, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} 
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                      transition={{ type: "spring", damping: 25, delay: idx * 0.1 }}
                      className="group relative w-full rounded-[2rem] overflow-hidden bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-xl dark:shadow-2xl flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={url} 
                        alt="AI Generation" 
                        className={cn(
                          "w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]",
                          result.images.length === 1 ? "max-h-[80vh] object-contain rounded-[2rem]" : "aspect-square object-cover"
                        )} 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5">
                        <div className="flex gap-2 w-full">
                          <LiquidButton 
                             variant="primary"
                             onClick={() => { 
                               setReferenceImage(url); 
                               // Scroll left panel back to top
                               document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
                             }}
                             className="flex-1 py-2 px-2 text-[13px] bg-blue-600/80 hover:bg-blue-600 border-none shadow-sm"
                          >
                            <ImageIcon size={14} /> 作为参考图
                          </LiquidButton>
                          <LiquidButton 
                             variant="secondary"
                             onClick={() => window.open(url, '_blank')}
                             className="py-2 px-3 shrink-0 text-[13px] bg-white/20 hover:bg-white/30 backdrop-blur-md"
                          >
                            <Download size={14} /> 保存
                          </LiquidButton>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </LiquidPanel>

      <AnimatePresence>
        {isEditorOpen && referenceImage && (
          <ImageEditorModal
            imageUrl={referenceImage}
            onClose={() => setIsEditorOpen(false)}
            onSave={async (file) => {
              setIsLoading(true);
              const url = await api.uploadImage(file);
              setIsLoading(false);
              if (url) {
                setReferenceImage(url);
                setIsEditorOpen(false);
              } else {
                alert("图片保存失败，请重试");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
