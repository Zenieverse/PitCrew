
import React, { useState } from 'react';
import { Terminal, Bug, FlaskConical, Gauge, Loader2, Sparkles, Code2, ChevronRight, Activity, Zap, ShieldAlert } from 'lucide-react';
import { getTechnicalDirectorInsight, generateCodeTests } from '../geminiService';

const TechnicalHQ: React.FC = () => {
  const [codeInput, setCodeInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<'diagnose' | 'test'>('diagnose');

  const handleAction = async () => {
    if (!codeInput.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      if (activeTask === 'diagnose') {
        const result = await getTechnicalDirectorInsight(codeInput);
        setOutput(result);
      } else {
        const result = await generateCodeTests(codeInput);
        setOutput(result);
      }
    } catch (e) {
      setOutput("Engine failure. Telemetry lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      {/* Left Column: Tech Telemetry */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
          <h2 className="text-lg font-bold text-white mb-6 uppercase flex items-center gap-2 tracking-tight">
            <Gauge className="text-red-500" size={20} /> System Telemetry
          </h2>
          
          <div className="space-y-6">
            <MetricItem label="Aerodynamic Drag" value="12.4%" sub="Technical Debt" color="text-yellow-500" progress={45} />
            <MetricItem label="Reliability Rating" value="94.2%" sub="Logic Integrity" color="text-green-500" progress={94} />
            <MetricItem label="Engine Temp" value="Stable" sub="Compute Load" color="text-blue-500" progress={65} />
            <MetricItem label="Tire Wear" value="Optimal" sub="Sprint Pacing" color="text-green-500" progress={22} />
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4 font-bold tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-yellow-500" /> Rovo Dev Status
          </h3>
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Agent: Tech-Director-V2.1</span>
          </div>
          <p className="mt-4 text-[11px] text-zinc-500 leading-relaxed italic">
            "We're seeing minor vibration in the backend sector. Engaging Rovo Dev logic analysis to ensure we don't lose time in the final corners."
          </p>
        </div>
      </div>

      {/* Right Column: AI Dev Actions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col h-full border-t-4 border-t-red-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTask('diagnose')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${activeTask === 'diagnose' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
              >
                Diagnose Failure
              </button>
              <button 
                onClick={() => setActiveTask('test')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${activeTask === 'test' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
              >
                Generate Circuit
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <Terminal size={12} className="text-red-500" />
              MISSION CONTROL // DEV_UNIT
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="relative group">
              <textarea 
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={activeTask === 'diagnose' ? "Paste engine logs, stack traces, or failing code..." : "Paste the source code to generate a test circuit..."}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-5 text-sm font-mono min-h-[300px] focus:ring-1 focus:ring-red-500 focus:outline-none text-zinc-300 placeholder-zinc-700 selection:bg-red-600/30"
              />
              <div className="absolute top-5 right-5 text-zinc-800 opacity-20 group-focus-within:opacity-40 transition-opacity">
                {activeTask === 'diagnose' ? <Bug size={48} /> : <FlaskConical size={48} />}
              </div>
            </div>

            <button 
              onClick={handleAction}
              disabled={loading || !codeInput}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-red-900/30 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Activity size={20} />}
              {loading ? "Optimizing Thinking Engine..." : `Request ${activeTask === 'diagnose' ? 'Failure Diagnosis' : 'Test Blueprint'}`}
            </button>

            {output && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-yellow-500/20 rounded">
                    <Sparkles size={14} className="text-yellow-500" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-[0.2em]">Technical Director's Report</span>
                </div>
                <div className="bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                    <Zap size={120} className="text-red-500" />
                  </div>
                  <pre className="text-sm text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed relative z-10 font-medium">
                    {output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricItem = ({ label, value, sub, color, progress }: any) => (
  <div className="space-y-2 group">
    <div className="flex justify-between items-end">
      <div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">{label}</span>
        <span className={`text-xl font-bold ${color} tracking-tight`}>{value}</span>
      </div>
      <span className="text-[10px] font-mono text-zinc-600 uppercase mb-1 font-bold">{sub}</span>
    </div>
    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden shadow-inner border border-zinc-800/50">
      <div 
        className={`h-full transition-all duration-1000 ${color.replace('text-', 'bg-')} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} 
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export default TechnicalHQ;
