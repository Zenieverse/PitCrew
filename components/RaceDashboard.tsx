
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SprintStats, IssueStatus } from '../types.js';
// Added Loader2 to the lucide-react icons list to fix the "Cannot find name 'Loader2'" error
import { Zap, AlertTriangle, TrendingUp, Clock, Target, Rocket, Activity, ChevronRight, Radio, Flag, Loader2 } from 'lucide-react';
import { getLaunchBriefing, speakInsight } from '../geminiService.js';
import { GoogleGenAI } from "@google/genai";

const RaceDashboard: React.FC<{ sprint: SprintStats; onLaunch: () => void; isRaceActive: boolean }> = ({ sprint, onLaunch, isRaceActive }) => {
  const [lightsCount, setLightsCount] = useState(0);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveLog, setLiveLog] = useState<{id: number, text: string, type: 'info' | 'warn' | 'success'}[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [liveLog]);

  useEffect(() => {
    if (!isRaceActive) return;
    const interval = setInterval(async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "As an F1 race engineer, provide a 1-sentence tactical update on sprint execution health. Use monospaced data-driven tone."
        });
        setLiveLog(p => [...p.slice(-15), { id: Date.now(), text: `[RADIO] ENGINEER: ${res.text}`, type: 'info' }]);
      } catch (e) {}
    }, 12000);
    return () => clearInterval(interval);
  }, [isRaceActive]);

  const handleLaunch = async () => {
    setLoading(true);
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 600));
      setLightsCount(i);
    }
    await new Promise(r => setTimeout(r, 1000));
    setLightsCount(-1);
    onLaunch();
    try {
      const b = await getLaunchBriefing(sprint);
      setBriefing(b);
      speakInsight(b);
    } finally { setLoading(false); }
  };

  const statusData = [
    { name: 'To Do', value: sprint.issues.filter(i => i.status === IssueStatus.TODO).length, color: '#3f3f46' },
    { name: 'Doing', value: sprint.issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Review', value: sprint.issues.filter(i => i.status === IssueStatus.REVIEW).length, color: '#a855f7' },
    { name: 'Done', value: sprint.issues.filter(i => i.status === IssueStatus.DONE).length, color: '#22c55e' },
    { name: 'Blocked', value: sprint.issues.filter(i => i.status === IssueStatus.BLOCKED).length, color: '#ef4444' },
  ];

  const totalPoints = sprint.totalPoints;
  const progressPercent = ((sprint.completedPoints / totalPoints) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER: RACE STATUS HERO */}
      <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Flag size={200} strokeWidth={1} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.5em] font-black">Race Status Panel</h3>
            </div>
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
              {sprint.name} <br/>
              <span className="text-red-600 text-3xl">Grand Prix Session</span>
            </h2>
            <div className="flex gap-6 justify-center md:justify-start pt-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase font-black">Session Duration</span>
                  <span className="text-lg font-bold text-zinc-300">14 DAYS</span>
               </div>
               <div className="w-px h-10 bg-zinc-800" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase font-black">Laps Remaining</span>
                  <span className="text-lg font-bold text-red-500">{sprint.remainingDays} LAPS</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 bg-zinc-950/40 p-10 rounded-[2rem] border border-zinc-800 shadow-inner">
            <div className="flex gap-4 p-4 bg-zinc-900/80 rounded-2xl border border-zinc-700">
              {[1, 2, 3, 4, 5].map(id => (
                <div key={id} className={`w-8 h-12 rounded-lg border-2 transition-all duration-300 ${lightsCount >= id ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : (lightsCount === -1 || isRaceActive) ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-950 border-zinc-900'}`} />
              ))}
            </div>
            {!isRaceActive ? (
              <button 
                onClick={handleLaunch} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-14 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95 flex items-center gap-4 group"
              >
                {/* Fixed the missing Loader2 component */}
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} className="group-hover:translate-x-1 transition-transform" />}
                Initiate Grid Sequence
              </button>
            ) : (
              <div className="px-10 py-5 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-500 font-black uppercase text-xs tracking-widest flex items-center gap-3">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                 Green Flag: Session Active
              </div>
            )}
          </div>
        </div>

        {briefing && (
          <div className="mt-8 p-6 bg-zinc-950/60 border border-zinc-800/50 rounded-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-3 text-[10px] font-mono text-zinc-500 uppercase font-black tracking-widest border-b border-zinc-800/50 pb-2">
              <Radio size={14} className="text-red-500 animate-pulse" /> Command Radio Channel Alpha
            </div>
            <p className="text-zinc-200 font-mono text-sm leading-relaxed italic opacity-90">>> {briefing}</p>
          </div>
        )}
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Track Position" value={`${progressPercent.toFixed(1)}%`} progress={progressPercent} icon={<TrendingUp size={20} className="text-green-500" />} />
        <StatCard label="Fuel Consumed" value={`${sprint.completedPoints} Pts`} icon={<Zap size={20} className="text-blue-500" />} />
        <StatCard label="Yellow Flags" value={sprint.issues.filter(i => i.flagged).length.toString()} icon={<AlertTriangle size={20} className="text-red-500" />} />
        <StatCard label="Pit Window" value={`${sprint.remainingDays}d`} icon={<Clock size={20} className="text-yellow-500" />} />
      </div>

      {/* GRAPHS AND LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-3xl p-8 h-[450px] shadow-xl relative">
          <div className="absolute top-0 right-0 p-4"><Target size={120} className="text-white/5" /></div>
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-10 font-black flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Target size={16} className="text-red-600" /> Sector Telemetry Distribution
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#18181b' }}
                contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px', color: '#fff' }} 
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="lg:col-span-1 bg-[#0a0a0b] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[450px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
            <h3 className="text-xs font-mono text-zinc-500 uppercase font-black flex items-center gap-3">
              <Activity size={16} className="text-red-600 animate-pulse" /> Radio Traffic
            </h3>
            <span className="text-[9px] font-mono text-zinc-600 uppercase">Live_v4.2</span>
          </div>
          <div ref={logRef} className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-[10px] custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            {liveLog.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
                <Activity size={40} strokeWidth={1} />
                <p className="uppercase tracking-[0.4em] font-black text-[9px]">Awaiting Signal Sync...</p>
              </div>
            )}
            {liveLog.map(l => (
              <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-400 animate-in slide-in-from-right-2 duration-300">
                <ChevronRight size={14} className="shrink-0 mt-0.5 text-red-600" />
                <span className="leading-relaxed">{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, progress }: any) => (
  <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-zinc-600 group">
    <div className="flex justify-between items-start mb-6">
      <span className="text-zinc-500 text-[10px] font-mono uppercase font-black tracking-widest">{label}</span>
      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <div className="text-4xl font-black text-white tracking-tighter italic mb-4">{value}</div>
    {progress !== undefined && (
      <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-900">
        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
    )}
  </div>
);

export default RaceDashboard;
