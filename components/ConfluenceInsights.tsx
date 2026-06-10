
import React, { useState } from 'react';
import { BookOpen, Search, Zap, Loader2, Sparkles, FileText, Share2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ConfluenceInsights: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleScan = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this documentation into an F1-style Strategy Memo: "${query}"`
      });
      setAnalysis(res.text || "No insights found.");
    } catch (e) { setAnalysis("Scan failed. Signal interference."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div><h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Space Intelligence</h1><p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Knowledge Base Analysis // Sector KB-01</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6 font-black flex items-center gap-2"><Search size={14} className="text-blue-500"/> KB Directive</h3>
            <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Paste doc content or tech specs here..." className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl p-4 text-sm min-h-[200px] focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-zinc-800" />
            <button onClick={handleScan} disabled={loading || !query.trim()} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl">{loading ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16}/>} Generate Strategy</button>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-[#111114] border border-zinc-800 rounded-3xl h-full flex flex-col shadow-2xl min-h-[500px]">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center"><h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2"><FileText size={14}/> Report Output</h3>{analysis && <button className="text-[10px] font-black text-zinc-400 hover:text-white flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700"><Share2 size={12}/> Share</button>}</div>
            <div className="flex-1 p-8 overflow-y-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4"><Loader2 size={48} className="text-blue-500 animate-spin"/><p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Parsing Knowledge Nodes...</p></div>
              ) : analysis ? (
                <div className="prose prose-invert max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 text-blue-500 border-b border-blue-500/20 pb-4"><Sparkles size={20}/><span className="text-lg font-black italic uppercase tracking-tighter">AI Strategy Briefing</span></div>
                  <pre className="whitespace-pre-wrap text-zinc-300 font-sans leading-relaxed text-sm">{analysis}</pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 text-center"><BookOpen size={100} strokeWidth={1}/><p className="text-sm font-mono uppercase tracking-[0.4em] font-black">Awaiting Data Ingestion</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfluenceInsights;
