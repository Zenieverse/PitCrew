
import React, { useState } from 'react';
import { SprintStats } from '../types';
import { FileText, Download, Share2, ClipboardCheck, History, Award } from 'lucide-react';

interface Props {
  sprint: SprintStats;
}

const RaceDebrief: React.FC<Props> = ({ sprint }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Document Header */}
      <div className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tighter">Race Debrief Report</h1>
          <p className="text-zinc-500 font-mono text-sm uppercase">CONFLUENCE MACRO: update_race_log</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isExporting ? 'Processing...' : <><Download size={16} /> Export to Confluence</>}
          </button>
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg border border-zinc-700">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Executive Summary */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" size={20} />
              Executive Race Summary
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed">
              <p>
                The <strong>{sprint.name}</strong> has seen varied sector performance across the grid. Initial telemetry suggests a strong start in Sector 1 (Backend Services), while Sector 2 (UI/UX Refinement) experienced significant aerodynamic drag due to unexpected API latency.
              </p>
              <p className="mt-4">
                Current story point velocity is tracking at <strong>{((sprint.completedPoints / sprint.totalPoints) * 100).toFixed(1)}%</strong> completion rate. While the team remains in the points-scoring position, a strategic pit stop is required to address the high-priority leakage in the engine management service (PIT-104).
              </p>
            </div>
          </section>

          {/* Key Achievements */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardCheck className="text-green-500" size={20} />
              Podium Achievements (Done)
            </h2>
            <div className="space-y-4">
              {sprint.issues.filter(i => i.status === 'Done').map(issue => (
                <div key={issue.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                  <div className="bg-green-500/20 text-green-500 px-2 py-1 rounded font-mono text-[10px] font-bold">P1</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{issue.key}: {issue.summary}</h4>
                    <p className="text-xs text-zinc-500">Fastest lap completed by {issue.assignee}</p>
                  </div>
                </div>
              ))}
              {sprint.issues.filter(i => i.status === 'Done').length === 0 && (
                <p className="text-zinc-600 italic text-sm">No cars have crossed the finish line yet this session.</p>
              )}
            </div>
          </section>

          {/* Race Log */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History className="text-blue-500" size={20} />
              Race Log Details
            </h2>
            <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#16161a] border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-mono text-zinc-500 text-[10px] uppercase">Lap</th>
                    <th className="px-6 py-3 font-mono text-zinc-500 text-[10px] uppercase">Event</th>
                    <th className="px-6 py-3 font-mono text-zinc-500 text-[10px] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-400">
                  <tr>
                    <td className="px-6 py-4 font-mono">01</td>
                    <td className="px-6 py-4">Lights out and away we go. Sprint initialized.</td>
                    <td className="px-6 py-4 text-green-500 font-bold text-[10px]">OK</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono">03</td>
                    <td className="px-6 py-4">Yellow Flag Sector 2. PIT-105 reported engine trouble.</td>
                    <td className="px-6 py-4 text-red-500 font-bold text-[10px]">WARNING</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono">08</td>
                    <td className="px-6 py-4">Lewis H. completes Sector 1 optimizations.</td>
                    <td className="px-6 py-4 text-green-500 font-bold text-[10px]">SUCCESS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Sprint Telemetry</h3>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Total Points</span>
                <div className="text-3xl font-bold text-white">{sprint.totalPoints}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Projected Points</span>
                <div className="text-3xl font-bold text-blue-500">18.4</div>
                <p className="text-[10px] text-zinc-500 mt-1">BASED ON CURRENT VELOCITY</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Reliability Rating</span>
                <div className="text-3xl font-bold text-green-500">84%</div>
                <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[84%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Engineer Notes</h3>
            <p className="text-sm text-zinc-400 italic">
              "The car is handling well in high-speed corners (Backend), but we need to watch the tire temperatures in technical sectors (Front-end Review). Max is pushing hard, maybe too hard—let's keep an eye on his workload before he burns through his soft compounds."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceDebrief;
