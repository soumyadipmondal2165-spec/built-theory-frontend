
import React, { useRef } from 'react';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../constants';
import { LayoutGrid, ShieldCheck, Zap, Globe } from 'lucide-react';

export const Home: React.FC = () => {
  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 pt-24 pb-32 border-b">
        <div className="max-w-5xl mx-auto px-4 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-red-100">
            <Zap size={14} /> NEW: Gemini AI Searchable OCR Unlocked
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter uppercase">
            Every tool you need to work with PDFs <span className="text-red-600">in one place</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Fast, secure, and 100% online. Merge, split, compress, convert, and sign your documents with Built-Theory's enterprise-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button 
              onClick={scrollToTools}
              className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-[0_20px_50px_-15px_rgba(227,59,47,0.3)] hover:-translate-y-1 uppercase tracking-widest"
            >
              Get Started Now
            </button>
            <button 
              onClick={scrollToTools}
              className="px-12 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all hover:border-red-600 uppercase tracking-widest"
            >
              Explore All Tools
            </button>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section ref={toolsRef} className="max-w-7xl mx-auto px-4 py-32 scroll-mt-20">
        <div className="flex items-center justify-between mb-16">
           <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Most Popular Tools</h2>
           <div className="flex gap-2">
              <div className="w-10 h-1 bg-red-600 rounded-full"></div>
              <div className="w-4 h-1 bg-gray-100 rounded-full"></div>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-gray-900 py-32 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({length: 48}).map((_, i) => (
                <div key={i} className="border border-white/20 aspect-square"></div>
              ))}
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">The PDF software trusted by engineers</h2>
          <p className="text-gray-400 mb-20 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
            Built-Theory PDF is the world's most secure web app for editing PDFs. Every document you process is encrypted and auto-deleted from our temporary cache.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            <div className="p-10 bg-gray-800/50 backdrop-blur rounded-[40px] border border-white/5 transition-transform hover:scale-105">
              <div className="text-5xl font-black text-red-500 mb-2 tabular-nums">1.2M+</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Monthly Users</div>
            </div>
            <div className="p-10 bg-gray-800/50 backdrop-blur rounded-[40px] border border-white/5 transition-transform hover:scale-105">
              <div className="text-5xl font-black text-red-500 mb-2 tabular-nums">27+</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Pro Grade Tools</div>
            </div>
            <div className="p-10 bg-gray-800/50 backdrop-blur rounded-[40px] border border-white/5 transition-transform hover:scale-105">
              <div className="text-5xl font-black text-red-500 mb-2 tabular-nums">100%</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Privacy Secured</div>
            </div>
            <div className="p-10 bg-gray-800/50 backdrop-blur rounded-[40px] border border-white/5 transition-transform hover:scale-105">
              <div className="text-5xl font-black text-red-500 mb-2 tabular-nums">99.9%</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Uptime Record</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
