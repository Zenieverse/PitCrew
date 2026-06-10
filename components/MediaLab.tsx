import React, { useState } from 'react';
import { Image, Video, Wand2, Play, Download, Loader2, Sparkles, Layout } from 'lucide-react';
// Fixed: Removed 'editImage' import as it's not exported from geminiService and not used here.
import { generateImage, generateVideo } from '../geminiService';
import { ImageSize, AspectRatio } from '../types';

const MediaLab: React.FC = () => {
  const [mode, setMode] = useState<'gen-img' | 'gen-vid'>('gen-img');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const res = mode === 'gen-img' ? await generateImage(prompt, '1K', '16:9') : await generateVideo(prompt, '16:9');
      setResult(res);
    } catch (e) { alert("Render failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-xl border-t-4 border-t-red-600">
          <h2 className="text-lg font-bold text-white mb-8 uppercase italic flex items-center gap-2"><Sparkles className="text-red-500" size={20}/> Media Lab</h2>
          <div className="grid grid-cols-2 gap-2 mb-8">
            <button onClick={() => setMode('gen-img')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${mode === 'gen-img' ? 'bg-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}><Image size={18}/> <span className="text-[10px] font-black uppercase">Image</span></button>
            <button onClick={() => setMode('gen-vid')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${mode === 'gen-vid' ? 'bg-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}><Video size={18}/> <span className="text-[10px] font-black uppercase">Video</span></button>
          </div>
          <div className="space-y-4">
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your vision..." className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl p-4 text-xs min-h-[120px] focus:outline-none text-white" />
            <button onClick={handleProcess} disabled={loading || !prompt.trim()} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">{loading ? <Loader2 className="animate-spin" size={18}/> : <Play size={18}/>} INITIATE RENDER</button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-3xl h-full min-h-[500px] flex items-center justify-center relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4"><div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"/><p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black animate-pulse">Rendering...</p></div>
        ) : result ? (
          mode === 'gen-img' ? <img src={result} className="max-w-full max-h-[400px] rounded-2xl shadow-2xl border-4 border-zinc-800" /> : <video src={result} controls autoPlay loop className="max-w-full max-h-[400px] rounded-2xl shadow-2xl border-4 border-zinc-800" />
        ) : (
          <div className="text-center opacity-20"><Layout size={100} strokeWidth={1} /><p className="text-[10px] font-mono uppercase tracking-[0.5em] mt-4">Waiting for directive</p></div>
        )}
      </div>
    </div>
  );
};

export default MediaLab;