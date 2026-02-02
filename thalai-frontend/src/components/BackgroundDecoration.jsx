import React from 'react';
import { Droplets, Activity } from 'lucide-react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Top Left Blob - More Intense */}
      <div className="bg-blob w-[1000px] h-[1000px] bg-sky-500/40 -top-64 -left-64" style={{ animationDelay: '0s', filter: 'blur(120px)' }} />
      
      {/* Bottom Right Blob - More Intense */}
      <div className="bg-blob w-[1100px] h-[1100px] bg-indigo-500/30 -bottom-64 -right-64" style={{ animationDelay: '-2s', filter: 'blur(120px)' }} />
      
      {/* Moving Center Accents */}
      <div className="bg-blob w-[700px] h-[700px] bg-rose-500/20 top-1/2 left-1/4 -translate-y-1/2" style={{ animationDelay: '-5s', animationDuration: '30s', filter: 'blur(100px)' }} />
      <div className="bg-blob w-[600px] h-[600px] bg-sky-400/20 bottom-1/4 right-1/3" style={{ animationDelay: '-7s', animationDuration: '25s', filter: 'blur(100px)' }} />
      
      {/* Bio-Theme Floating Icons */}
      <div className="absolute top-[25%] left-[8%] opacity-[0.06] animate-float" style={{ animationDuration: '16s' }}>
        <Droplets className="w-[400px] h-[400px] text-sky-500 -rotate-12" strokeWidth={0.4} />
      </div>

      <div className="absolute bottom-[15%] right-[12%] opacity-[0.05] animate-float" style={{ animationDuration: '20s', animationDelay: '-6s' }}>
        <Activity className="w-[450px] h-[450px] text-rose-500 rotate-6" strokeWidth={0.4} />
      </div>

      {/* Extra floating subtle glass circle */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-white/20 rounded-full glass opacity-20 animate-float" style={{ animationDuration: '12s' }} />
      
      {/* Subtle Grid Dot Pattern overlay - Increased contrast slightly */}
      <div className="absolute inset-0 bg-dots opacity-[0.05]" />
    </div>
  );
};

export default BackgroundDecoration;
