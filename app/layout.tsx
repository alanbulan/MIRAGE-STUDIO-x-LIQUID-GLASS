import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '幻境制造机 | Mirage Studio',
  description: '多重模型AI绘画矩阵，液态玻璃美学',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] overflow-x-hidden selection:bg-blue-500/30">
        {/* Soft Liquid Glass Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none flex items-center justify-center">
          <div className="absolute top-[20%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-300/30 dark:bg-blue-500/15 blur-[120px] animate-float mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute top-[40%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-purple-300/30 dark:bg-purple-600/15 blur-[120px] animate-float-delayed mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-200/30 dark:bg-cyan-600/15 blur-[100px] animate-float mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
