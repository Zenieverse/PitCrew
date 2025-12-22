
import React, { useState, useEffect } from 'react';
import { JiraIssue, EngineerInsight } from '../types';
import { getRaceEngineerInsight, speakInsight } from '../geminiService';
import { MOCK_SPRINT } from '../constants';
import { MessageCircle, AlertCircle, CheckCircle2, ArrowRight, UserPlus, Flag, ExternalLink, Zap, FileText, Volume2 } from 'lucide-react';

interface Props {
  issues: JiraIssue[];
}

const PitAdvice: React.FC<Props> = ({ issues }) => {
  const [insight, setInsight] = useState<EngineerInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      const data = await getRaceEngineerInsight(MOCK_SPRINT);
      setInsight(data);
      setLoading(false);
    };
    fetchInsight();
  }, []);

  const handleSpeech = () => {
    if (insight?.summary) {
      speakInsight(insight.summary);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: AI Engineer Messages */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
            <MessageCircle size={160} />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1552072092-b5cd28d12813?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Race Engineer" 
                  className="w-16 h-16 rounded-full border-2 border-red-600 grayscale brightness-75 object-cover"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#111114] rounded-full shadow-[0_0_8px_#22c55e]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Race Engineer Alpha</h2>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Sector 3 Telemetry Analysis</p>
              </div>
            </div>
            <button 
              onClick={handleSpeech}
              className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700"
              title="Play Voice Briefing"
            >
              <Volume2 size={20} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 italic text-zinc-200 leading-relaxed relative z-10">
                <div className="absolute -top-2 left-4 px-2 bg-red-600 text-[8px] font-bold text-white rounded uppercase tracking-[0.2em]">Live Comms</div>
                "{insight?.summary}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
                  <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 font-bold">
                    <AlertCircle size={14} className="text-red-500" />
                    Grid Risks
                  </h4>
                  <ul className="space-y-4">
                    {insight?.risks.map((risk, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300 group">
                        <span className="text-red-500 font-mono font-bold bg-red-500/10 px-1.5 rounded">0{i+1}</span>
                        <span className="group-hover:text-white transition-colors">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
                  <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 font-bold">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Tactical Ops
                  </h4>
                  <ul className="space-y-4">
                    {insight?.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300 group">
                        <ArrowRight size={14} className="text-zinc-600 mt-0.5 shrink-0 group-hover:text-red-500 transition-colors" />
                        <span className="group-hover:text-white transition-colors">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4 tracking-[0.3em] font-bold">Actionable Telemetry</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PitActionBtn icon={<UserPlus className="text-blue-500" size={24}/>} label="Pit Crew Swap" sub="Reassign Issue" />
            <PitActionBtn icon={<Zap className="text-yellow-500" size={24}/>} label="Fuel Load" sub="Adjust Priority" />
            <PitActionBtn icon={<Flag className="text-red-500" size={24}/>} label="Black Flag" sub="Escalate Ticket" />
            <PitActionBtn icon={<FileText className="text-green-500" size={24}/>} label="Radio Log" sub="Update Debrief" />
          </div>
        </div>
      </div>

      {/* Right Column: Grid Context */}
      <div className="space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">Critical Radio Traffic</h3>
          </div>
          <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {issues.filter(i => i.flagged || i.priority === 'Critical').map(issue => (
              <div key={issue.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/30 hover:bg-zinc-800/50 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-bold text-red-500 bg-red-500/10 px-2 rounded">{issue.key}</span>
                  <AlertCircle size={14} className="text-red-500 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-300 font-semibold group-hover:text-white transition-colors mb-3">{issue.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Driver: <span className="text-zinc-300">{issue.assignee}</span></span>
                  <ExternalLink size={10} className="text-zinc-600 group-hover:text-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4 tracking-widest font-bold">Pit-Wall Efficiency</h3>
          <div className="space-y-6">
            {['Strategy', 'Backend', 'Frontend'].map((sector, idx) => (
              <div key={sector} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-zinc-500 uppercase tracking-widest">{sector} Sector</span>
                  <span className={`${idx === 1 ? 'text-red-500' : 'text-green-500'} font-mono uppercase`}>{idx === 1 ? 'Thermal Load High' : 'Nominal'}</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ${idx === 1 ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} 
                    style={{ width: idx === 1 ? '88%' : (idx === 0 ? '42%' : '65%') }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PitActionBtn = ({ icon, label, sub }: any) => (
  <button className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all text-center group shadow-md">
    <div className="p-2 bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <span className="text-[10px] font-bold uppercase tracking-tight text-white block">{label}</span>
      <span className="text-[8px] font-mono text-zinc-500 uppercase">{sub}</span>
    </div>
  </button>
);

export default PitAdvice;
