
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { SprintStats, IssueStatus } from '../types';
import { Zap, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface Props {
  sprint: SprintStats;
}

const COLORS = {
  [IssueStatus.TODO]: '#3f3f46',
  [IssueStatus.IN_PROGRESS]: '#3b82f6',
  [IssueStatus.REVIEW]: '#a855f7',
  [IssueStatus.DONE]: '#22c55e',
  [IssueStatus.BLOCKED]: '#ef4444',
};

const RaceDashboard: React.FC<Props> = ({ sprint }) => {
  const statusCounts = sprint.issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const workloadData = sprint.issues.reduce((acc, issue) => {
    const existing = acc.find(item => item.name === issue.assignee);
    if (existing) {
      existing.points += issue.storyPoints;
    } else {
      acc.push({ name: issue.assignee, points: issue.storyPoints });
    }
    return acc;
  }, [] as { name: string, points: number }[]);

  const completionPercent = (sprint.completedPoints / sprint.totalPoints) * 100;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111114] border border-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-zinc-500 text-xs font-mono uppercase">Race Progress</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">{completionPercent.toFixed(1)}%</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-1000" 
              style={{ width: `${completionPercent}%` }} 
            />
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-zinc-500 text-xs font-mono uppercase">Engine Load (Points)</span>
            <Zap size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">{sprint.completedPoints} / {sprint.totalPoints}</div>
          <div className="text-xs text-zinc-400 mt-2 font-mono">STORY POINTS CONSUMED</div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-zinc-500 text-xs font-mono uppercase">Yellow Flags</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {sprint.issues.filter(i => i.status === IssueStatus.BLOCKED || i.flagged).length}
          </div>
          <div className="text-xs text-zinc-400 mt-2 font-mono">BLOCKERS & FLAGS</div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-zinc-500 text-xs font-mono uppercase">Driver Lineup</span>
            <Users size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">{workloadData.length}</div>
          <div className="text-xs text-zinc-400 mt-2 font-mono">ACTIVE ASSIGNEES</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Position (Status Distribution) */}
        <div className="lg:col-span-1 bg-[#111114] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-mono text-zinc-500 uppercase mb-6 flex items-center gap-2">
            <div className="w-1.5 h-3 bg-red-600 rounded-full" />
            Track Position Distribution
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as IssueStatus] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111114', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.keys(COLORS).map(status => (
              <div key={status} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[status as IssueStatus] }} />
                <span className="text-zinc-400">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pit Stop Telemetry (Workload) */}
        <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-mono text-zinc-500 uppercase mb-6 flex items-center gap-2">
            <div className="w-1.5 h-3 bg-blue-600 rounded-full" />
            Driver Workload (Points)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#111114', border: '1px solid #27272a', borderRadius: '8px' }}
                />
                <Bar dataKey="points" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Monitor (Recent Issues) */}
      <div className="bg-[#111114] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#16161a]">
          <h3 className="text-sm font-mono text-zinc-500 uppercase">Live Grid Monitor</h3>
          <span className="text-[10px] text-zinc-500 font-mono">UPDATED: JUST NOW</span>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase font-mono text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-3">Pos</th>
              <th className="px-6 py-3">Issue Key</th>
              <th className="px-6 py-3">Driver</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Story Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sprint.issues.map((issue, idx) => (
              <tr key={issue.id} className="hover:bg-zinc-800/50 transition-colors group">
                <td className="px-6 py-4 font-mono text-zinc-600 group-hover:text-red-500 transition-colors">{String(idx + 1).padStart(2, '0')}</td>
                <td className="px-6 py-4 font-bold text-white">{issue.key}</td>
                <td className="px-6 py-4 text-zinc-400">{issue.assignee}</td>
                <td className="px-6 py-4">
                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                    style={{ 
                      backgroundColor: `${COLORS[issue.status]}20`, 
                      borderColor: `${COLORS[issue.status]}40`,
                      color: COLORS[issue.status]
                    }}
                  >
                    {issue.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-xs font-bold uppercase ${issue.priority === 'Critical' ? 'text-red-500' : 'text-zinc-500'}`}>
                    {issue.priority}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-zinc-400">{issue.storyPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RaceDashboard;
