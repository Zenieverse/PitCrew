
import React, { useState, useEffect } from 'react';
import { JiraIssue, EngineerInsight } from '../types';
import { getRaceEngineerInsight } from '../geminiService';
import { MOCK_SPRINT } from '../constants';
// Added missing Zap and FileText icon imports from lucide-react
import { MessageCircle, AlertCircle, CheckCircle2, ArrowRight, UserPlus, Flag, ExternalLink, Zap, FileText } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: AI Engineer Messages */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <MessageCircle size={120} />
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/engineer/200" 
                alt="Race Engineer" 
                className="w-16 h-16 rounded-full border-2 border-red-600 grayscale brightness-75"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#111114] rounded-full" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Race Engineer Alpha</h2>
              <p className="text-xs font-mono text-zinc-500">ROVO AGENT: race-engineer</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 italic text-zinc-300 leading-relaxed">
                "{insight?.summary}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-500" />
                    Critical Risks
                  </h4>
                  <ul className="space-y-3">
                    {insight?.risks.map((risk, i) => (
                      <li key={i} className="flex gap-2 text-sm text-zinc-400">
                        <span className="text-red-500 font-mono">[{i+1}]</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Pit Strategies
                  </h4>
                  <ul className="space-y-3">
                    {insight?.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm text-zinc-400">
                        <ArrowRight size={14} className="text-zinc-600 mt-1 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-mono text-zinc-500 uppercase mb-4 tracking-widest">Rovo Pit Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800 transition-all text-center">
              <UserPlus className="text-blue-500" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Reassign Driver</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800 transition-all text-center">
              <Zap className="text-purple-500" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Adjust Fuel (Priority)</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800 transition-all text-center">
              <Flag className="text-red-500" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Escalate Blocker</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-green-500/50 hover:bg-zinc-800 transition-all text-center">
              <FileText className="text-green-500" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Log Radio Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Grid Context */}
      <div className="space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-[#16161a]">
            <h3 className="text-sm font-mono text-zinc-500 uppercase">Radio Traffic (Flagged)</h3>
          </div>
          <div className="p-2 space-y-2">
            {issues.filter(i => i.flagged).map(issue => (
              <div key={issue.id} className="p-3 rounded-lg bg-red-900/10 border border-red-900/20 hover:bg-red-900/20 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-red-500">{issue.key}</span>
                  <AlertCircle size={14} className="text-red-500" />
                </div>
                <p className="text-sm text-zinc-300 line-clamp-2">{issue.summary}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Driver: {issue.assignee}</span>
                  <ExternalLink size={10} className="text-zinc-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-mono text-zinc-500 uppercase mb-4 tracking-widest">Tire Degradation (Workload)</h3>
          <div className="space-y-4">
            {['Lewis H.', 'Max V.', 'Charles L.'].map((driver, idx) => (
              <div key={driver} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{driver}</span>
                  <span className={`${idx === 1 ? 'text-red-500' : 'text-zinc-500'} font-mono`}>{idx === 1 ? 'CRITICAL' : 'OPTIONAL'}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${idx === 1 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: idx === 1 ? '92%' : '45%' }}
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

export default PitAdvice;
