import React from 'react';
import { SprintStats } from '../types.js';
import { FileText, Download, Award, History, ClipboardCheck, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const RaceDebrief: React.FC<{ sprint: SprintStats }> = ({ sprint }) => {
  const completedIssues = sprint.issues.filter(i => i.status === 'Done');
  const blockedIssues = sprint.issues.filter(i => i.status === 'Blocked');
  const efficiency = ((sprint.completedPoints / sprint.totalPoints) * 100).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Race Debrief</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Sector 3 Log Archive // Post-Race Analysis</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-3 transition-all active:scale-95">
          <Download size={18}/> Export Telemetry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="text-[10px] font-mono text-zinc-500 uppercase font-black mb-2">Track Efficiency</div>
          <div className="text-3xl font-black text-white italic">{efficiency}%</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="text-[10px] font-mono text-zinc-500 uppercase font-black mb-2">Overtakes (Completed)</div>
          <div className="text-3xl font-black text-green-500 italic">{completedIssues.length}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
          <div className="text-[10px] font-mono text-zinc-500 uppercase font-black mb-2">Engine Faults (Blocked)</div>
          <div className="text-3xl font-black text-red-500 italic">{blockedIssues.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Award size={120} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-tight italic">
            <Award className="text-yellow-500" size={24}/> Podium Finishers
          </h2>
          <div className="space-y-4">
            {completedIssues.slice(0, 3).map((issue, idx) => (
              <div key={issue.id} className="flex items-center gap-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-black text-zinc-500 border border-zinc-800">P{idx+1}</div>
                <div className="flex-1">
                  <div className="text-xs font-mono text-zinc-500">{issue.key}</div>
                  <div className="text-sm font-bold text-white truncate">{issue.summary}</div>
                </div>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
            ))}
            {completedIssues.length === 0 && <p className="text-zinc-500 text-sm italic">No issues completed this session.</p>}
          </div>
        </section>

        <section className="bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-tight italic">
            <History size={24}/> Pit Wall Logs
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {sprint.issues.map(issue => (
              <div key={issue.id} className="p-4 bg-zinc-950/30 rounded-xl border border-zinc-800/30 flex justify-between items-center group hover:bg-zinc-900/50 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-600">{issue.key}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      issue.status === 'Done' ? 'text-green-500 border-green-500/20' : 
                      issue.status === 'Blocked' ? 'text-red-500 border-red-500/20' : 
                      'text-zinc-500 border-zinc-500/20'
                    }`}>{issue.status}</span>
                  </div>
                  <div className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{issue.summary}</div>
                </div>
                <div className="text-[10px] font-mono text-zinc-600 uppercase italic">{issue.assignee}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-tight italic">
          <ClipboardCheck size={24} className="text-blue-500"/> Technical Director's Summary
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-300 leading-relaxed italic">
            "The session was characterized by significant aerodynamic drag in the middle sectors. While the {completedIssues.length} overtakes provided a boost, the engine reliability on the {blockedIssues.length} blocked issues remains a concern for the upcoming Grand Prix. We need to recalibrate our tire strategy to account for the unexpected wear in the development loop."
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500"/> Key Strengths
              </h4>
              <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-4">
                <li>High completion rate on critical engine sensors</li>
                <li>Strategic pit stop execution in Sector 2</li>
                <li>Effective fuel management during In-Progress tasks</li>
              </ul>
            </div>
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500"/> Strategic Risks
              </h4>
              <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-4">
                <li>Thermal degradation on long-running tasks</li>
                <li>Under-utilization of the soft tire compound</li>
                <li>Telemetry dropouts in legacy sectors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RaceDebrief;