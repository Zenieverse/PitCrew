
import React, { useState, useEffect } from 'react';
import { SprintStats, EngineerInsight, JiraIssue, RovoActionType } from '../types.js';
import { getRaceEngineerInsight, speakInsight, executeRovoAction } from '../geminiService.js';
import { 
  AlertCircle, CheckCircle2, Volume2, User, Flag, ListFilter, 
  ArrowRightLeft, TrendingUp, AlertOctagon, FileText, Loader2, Sparkles,
  Zap, Info, Gauge
} from 'lucide-react';

const PitAdvice: React.FC<{ sprint: SprintStats; onUpdateIssue: any; notify: any }> = ({ sprint, notify }) => {
  const [insight, setInsight] = useState<EngineerInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getRaceEngineerInsight(sprint);
      setInsight(data);
      setLoading(false);
    })();
  }, [sprint]);

  const handleSpeak = () => {
    if (insight?.summary) {
      speakInsight(insight.summary);
      notify("Radio check. Receiving engineer briefing...", "info");
    }
  };

  const runRovoAction = async (type: RovoActionType, params: any) => {
    setActionLoading(type);
    try {
      const msg = await executeRovoAction(type, params);
      notify(msg, "success");
    } catch (e) {
      notify("Telemtry failure. Action aborted.", "alert");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* LEFT: RACE ENGINEER PANEL */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border border-red-600/30 bg-zinc-900 flex items-center justify-center relative shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
                <User size={32} className="text-red-500 relative z-10" />
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#111114]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">race-engineer</h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Gauge size={12} className="text-red-500" /> Active Rovo Intelligence
                </p>
              </div>
            </div>
            <button 
              onClick={handleSpeak} 
              className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20 active:scale-95 flex items-center gap-3"
            >
              <Volume2 size={16} /> Radio Briefing
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-6 py-4">
              <div className="h-20 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
                <div className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 italic text-zinc-300 leading-relaxed shadow-inner border-l-4 border-l-red-600">
                <p className="text-sm">"{insight?.summary}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-600" /> Track Hazards
                  </h4>
                  <div className="space-y-2">
                    {insight?.risks.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-[11px] text-zinc-400 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex gap-4 items-center group hover:bg-zinc-900 transition-all">
                        <span className="text-red-600 font-mono font-black italic">RISK_{i+1}</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <Zap size={14} className="text-green-500" /> Strategic Adjustments
                  </h4>
                  <div className="space-y-2">
                    {insight?.recommendations.map((r, i) => (
                      <div key={i} className="text-[11px] text-zinc-400 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex gap-4 items-center group hover:bg-zinc-900 transition-all">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ISSUE CONTEXT ACTION PANEL */}
        {selectedIssue ? (
          <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">{selectedIssue.key} Telemetry</span>
                   <div className="h-px w-12 bg-zinc-800" />
                   <span className="text-[10px] font-mono text-red-500 uppercase font-black">{selectedIssue.priority}</span>
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tight">{selectedIssue.summary}</h3>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)} 
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-all"
              >
                CLOSE_PANEL
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionButton 
                icon={<ArrowRightLeft size={18}/>} 
                label="pit_reassign_issue" 
                loading={actionLoading === 'pit_reassign_issue'}
                onClick={() => runRovoAction('pit_reassign_issue', { issueId: selectedIssue.id, assignee: 'Optimal' })}
                color="hover:border-blue-600/50 hover:bg-blue-600/5"
              />
              <ActionButton 
                icon={<TrendingUp size={18}/>} 
                label="adjust_priority" 
                loading={actionLoading === 'adjust_priority'}
                onClick={() => runRovoAction('adjust_priority', { issueId: selectedIssue.id, priority: 'Critical' })}
                color="hover:border-red-600/50 hover:bg-red-600/5"
              />
              <ActionButton 
                icon={<AlertOctagon size={18}/>} 
                label="create_escalation_ticket" 
                loading={actionLoading === 'create_escalation_ticket'}
                onClick={() => runRovoAction('create_escalation_ticket', { parentId: selectedIssue.id })}
                color="hover:border-yellow-600/50 hover:bg-yellow-600/5"
              />
              <ActionButton 
                icon={<FileText size={18}/>} 
                label="update_race_log" 
                loading={actionLoading === 'update_race_log'}
                onClick={() => runRovoAction('update_race_log', { issueId: selectedIssue.id, summary: selectedIssue.summary })}
                color="hover:border-green-600/50 hover:bg-green-600/5"
              />
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-4 opacity-40">
            <Info size={40} className="text-zinc-700" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] font-black">Select an issue from Radio Traffic for Pit Advice</p>
          </div>
        )}
      </div>

      {/* RIGHT: RADIO TRAFFIC (ISSUE LIST) */}
      <div className="space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6 shadow-xl h-[700px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
              <ListFilter size={14} className="text-red-600" /> Radio Traffic
            </h3>
            <span className="text-[10px] font-mono text-zinc-600">{sprint.issues.length} Issues</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-950/20">
            {sprint.issues.map(issue => (
              <div 
                key={issue.id} 
                onClick={() => setSelectedIssue(issue)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${selectedIssue?.id === issue.id ? 'bg-red-600/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'}`}
              >
                {selectedIssue?.id === issue.id && <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-white transition-colors uppercase font-black">{issue.key}</span>
                  {issue.flagged && <Flag size={12} className="text-red-600 animate-pulse" />}
                </div>
                <p className={`text-sm font-bold mb-4 leading-tight transition-colors ${selectedIssue?.id === issue.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {issue.summary}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <User size={12} className="text-zinc-500" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">{issue.assignee}</span>
                  </div>
                  <div className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                    issue.status === 'Done' ? 'text-green-500 border-green-500/20' : 
                    issue.status === 'Blocked' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                    'text-zinc-500 border-zinc-500/20'
                  }`}>
                    {issue.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, loading, color }: any) => (
  <button 
    onClick={onClick} 
    disabled={loading}
    className={`flex flex-col items-center gap-3 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl transition-all active:scale-95 disabled:opacity-50 group ${color}`}
  >
    <div className={`text-zinc-500 group-hover:text-white transition-all ${loading ? 'animate-spin' : 'group-hover:scale-110'}`}>
      {loading ? <Loader2 size={18}/> : icon}
    </div>
    <span className="text-[8px] font-mono font-black uppercase tracking-tighter text-zinc-600 group-hover:text-white text-center">{label}</span>
  </button>
);

export default PitAdvice;
