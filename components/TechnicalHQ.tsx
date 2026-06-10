import React, { useState } from 'react';
import { Terminal, Bug, FlaskConical, Loader2, Play, Copy, Check, Shield, Cpu, Activity } from 'lucide-react';
import { getTechnicalDirectorInsight, generateCodeTests } from '../geminiService.js';

const TechnicalHQ: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<'diagnose' | 'test'>('diagnose');
  const [copied, setCopied] = useState(false);

  const handleAction = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = task === 'diagnose' ? await getTechnicalDirectorInsight(input) : await generateCodeTests(input);
      setOutput(res);
    } catch (e: any) { setOutput(`[ENGINE_FAILURE] >> ${e.message}`); }
    finally { setLoading(false); }
  };

  const copyResult = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700 min-h-[600px]">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/10 rounded-lg"><Cpu className="text-red-600" size={20} /></div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Technical Director</h2>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => setTask('diagnose')} 
                className={`w-full py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${task === 'diagnose' ? 'bg-red-600 text-white shadow-xl' : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'}`}
              >
                <Bug size={16}/> Diagnose Failure
              </button>
              <button 
                onClick={() => setTask('test')} 
                className={`w-full py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${task === 'test' ? 'bg-blue-600 text-white shadow-xl' : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'}`}
              >
                <FlaskConical size={16}/> Build Test Circuit
              </button>
            </div>

            <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Neural Director Active</span>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono italic leading-relaxed">
                Logic circuits are being analyzed using Gemini 3 Pro high-reasoning neural networks.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={handleAction} 
              disabled={loading || !input.trim()} 
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Activity size={18}/>}
              ENGAGE NEURAL CORE
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-zinc-800">
          <div className="flex flex-col">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center backdrop-blur-md">
              <span className="text-[9px] font-mono text-zinc-500 uppercase font-black tracking-widest">Input Telemetry</span>
              <Terminal size={12} className="text-zinc-600" />
            </div>
            <textarea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Paste crashing logs, broken circuits, or logic blocks..." 
              className="flex-1 w-full bg-transparent p-6 text-xs font-mono text-zinc-300 focus:outline-none resize-none placeholder-zinc-800 custom-scrollbar" 
            />
          </div>
          <div className="flex flex-col bg-zinc-950/30">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center backdrop-blur-md">
              <span className="text-[9px] font-mono text-zinc-500 uppercase font-black tracking-widest">Director Analysis</span>
              {output && (
                <button 
                  onClick={copyResult} 
                  className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="text-zinc-600"/>}
                </button>
              )}
            </div>
            <div className="flex-1 p-8 relative overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="absolute inset-0 bg-[#0a0a0b]/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 z-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu size={24} className="text-red-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-[0.5em] animate-pulse">Analyzing Circuitry</p>
                    <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">Applying Thinking Budget: 32768 tokens</p>
                  </div>
                </div>
              ) : output ? (
                <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-800 text-center opacity-40 select-none pointer-events-none">
                  <Shield size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.4em] font-black">System Ready</p>
                  <p className="text-[8px] font-mono uppercase tracking-widest mt-2">Engage Neural Core to start analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalHQ;