import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

export const LiquidPanel = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl bg-white/50 dark:bg-black/40 backdrop-blur-[40px] border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent dark:from-white/10 dark:via-transparent dark:to-black/30 pointer-events-none" />
        <div className="absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/40 dark:border-white/5 pointer-events-none" />
        <div className="relative z-10 w-full h-full flex flex-col flex-1 min-h-0 overflow-hidden">
          {children as React.ReactNode}
        </div>
      </motion.div>
    );
  }
);
LiquidPanel.displayName = "LiquidPanel";

export const LiquidButton = React.forwardRef<HTMLButtonElement, HTMLMotionProps<"button"> & { variant?: 'primary' | 'secondary' | 'ghost' }>(
  ({ className, variant = 'primary', children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600/90 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-white/20",
      secondary: "bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-100",
      ghost: "bg-transparent hover:bg-slate-500/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 border-transparent",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl border transition-colors font-medium select-none",
          variants[variant],
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);
LiquidButton.displayName = "LiquidButton";

type LiquidInputProps = React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as?: 'input' | 'textarea' };

export const LiquidInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, LiquidInputProps>(
  ({ className, as = 'input', ...props }, ref) => {
    const defaultClass = cn(
      "w-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 focus:bg-white/70 dark:focus:bg-black/40 focus:border-blue-400/50 outline-none rounded-2xl px-5 py-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner",
      className
    );
    
    if (as === 'textarea') {
      return <textarea ref={ref as any} className={cn(defaultClass, "resize-none")} {...props as any} />;
    }
    return <input ref={ref as any} className={defaultClass} {...props as any} />;
  }
);
LiquidInput.displayName = "LiquidInput";
