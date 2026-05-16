"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass';

interface ImageEditorModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
}

export default function ImageEditorModal({ imageUrl, onClose, onSave }: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [isSaving, setIsSaving] = useState(false);

  const [history, setHistory] = useState<ImageData[]>([]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, state]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.6;
      
      if (width > maxWidth) {
        height = (maxWidth * height) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight * width) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.drawImage(img, 0, 0, width, height);
      saveState();
    };
    img.onerror = (e) => {
      console.error("Failed to load image into canvas:", e);
    };
    
    // Proxy the image to avoid canvas HTTP/HTTPS CORS tainting
    img.src = `/api/image?url=${encodeURIComponent(imageUrl)}`;
  }, [imageUrl]);

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); 
    const previousState = newHistory[newHistory.length - 1];
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.putImageData(previousState, 0, 0);
    }
    setHistory(newHistory);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize * scaleX; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsSaving(true);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "edited-image.png", { type: "image/png" });
        onSave(file).finally(() => setIsSaving(false));
      } else {
        setIsSaving(false);
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 w-full max-w-5xl max-h-full flex flex-col"
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">图像涂抹与编辑</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-wrap gap-4 items-center bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">画笔颜色:</label>
            <input 
              type="color" 
              value={brushColor} 
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <div className="flex gap-1 ml-2">
              {['#ffffff', '#808080', '#000000', '#ef4444', '#3b82f6'].map(color => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-6 h-6 rounded-full border border-black/20 ${brushColor === color ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:ml-4">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">画笔大小:</label>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 md:w-32"
            />
            <span className="text-xs text-slate-500 w-6">{brushSize}px</span>
          </div>

          <div className="ml-auto flex gap-2">
            <LiquidButton 
              variant="secondary" 
              onClick={undo}
              disabled={history.length <= 1}
              className="py-1.5 px-3 text-sm"
            >
              <RotateCcw size={14} className="mr-1 inline-block" /> 撤销
            </LiquidButton>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 overflow-auto bg-slate-200 dark:bg-black/40 flex items-center justify-center p-4 md:p-8 touch-none min-h-[40vh]">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            onTouchMove={draw}
            className="cursor-crosshair shadow-lg bg-white/5 max-w-full"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="p-4 md:p-6 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-white/50 dark:bg-black/20">
          <LiquidButton variant="secondary" onClick={onClose} disabled={isSaving} className="py-2.5 px-6">取消</LiquidButton>
          <LiquidButton variant="primary" onClick={handleSave} disabled={isSaving} className="py-2.5 px-6">
            {isSaving ? "处理中..." : "保存涂抹结果"}
          </LiquidButton>
        </div>
      </motion.div>
    </div>
  );
}
