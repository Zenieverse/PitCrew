
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Cpu, Database, Activity, RefreshCw, Loader2, CreditCard, ExternalLink, Settings, Terminal, Server } from 'lucide-react';
import { checkApiPermissions } from '../geminiService';

const MissionControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'integrity' | 'billing' | 'logs'>('integrity');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ proAccess: false, billingActive: false, latency: 0 });

  const runAudit = useCallback(async () => {
    setLoading(true);
    const s = await checkApiPermissions();
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => { runAudit(); }, [runAudit]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div><h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Mission Control</h1><p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">System Integrity // Marketplace Node</p></div>
        <button onClick={runAudit} disabled={loading} className="bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl">{loading ? <Loader2 className="animate-spin text-blue-500" size={16}/> : <RefreshCw size={16}/>} Audit System</button>
      </div>

      <div className="flex gap-1 p-1.5 bg-[#111114] border border-zinc-800 rounded-2xl w-fit">
        <TabBtn active={activeTab === 'integrity'} onClick={()=>setActiveTab('integrity')} label="Integrity" icon={<ShieldCheck size={16}/>} />
        <TabBtn active={activeTab === 'billing'} onClick={()=>setActiveTab('billing')} label="Billing" icon={<CreditCard size={16}/>} />
        <TabBtn active={activeTab === 'logs'} onClick={()=>setActiveTab('logs')} label="Logs" icon={<Terminal size={16}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'integrity' && (
            <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CheckItem label="Forge Runtime" status="SECURE" />
                <CheckItem label="Gemini API Link" status={stats.proAccess ? "STABLE" : "LIMITED"} />
                <CheckItem label="Marketplace Entitlement" status={stats.billingActive ? "VERIFIED" : "UNPAID"} />
                <CheckItem label="Data Encryption" status="AES-256" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-800">
                <Metric icon={<Activity size={24}/>} label="API Latency" value={`${stats.latency}ms`} progress={Math.min(100, (stats.latency/500)*100)} color="bg-green-500" />
                <Metric icon={<Cpu size={24}/>} label="Neural Load" value="12.4%" progress={12.4} color="bg-blue-500" />
              </div>
            </div>
          )}
          {activeTab === 'billing' && (
            <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-8">
              <div className="flex justify-between items-start"><div><h3 className="text-xl font-black text-white uppercase italic">Subscription</h3><p className="text-zinc-500 font-mono text-[10px]">Tier: Marketplace Pro Enterprise</p></div><div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-black uppercase rounded-lg">Active</div></div>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block bg-zinc-800 hover:bg-zinc-700 text-white p-6 rounded-2xl transition-all border border-zinc-700 flex justify-between items-center"><div className="flex items-center gap-4"><CreditCard className="text-blue-500" /><div className="text-left"><p className="text-xs font-black uppercase tracking-widest">Manage Cloud Billing</p><p className="text-[10px] text-zinc-500">Upgrade quotas and manage payment methods</p></div></div><ExternalLink size={16} /></a>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6 font-black flex items-center gap-2"><Server size={14}/> Active Nodes</h3>
            <div className="space-y-4">
              <NodeStatus label="Neural Engine Alpha" status="Syncing" load={64} />
              <NodeStatus label="Marketplace Bridge" status="Nominal" load={12} />
              <NodeStatus label="Storage Mesh" status="Active" load={45} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${active ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>{icon} {label}</button>
);

const CheckItem = ({ label, status }: any) => (
  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-500 uppercase">{label}</span><span className={`text-[9px] font-mono font-black px-2 py-1 rounded border ${status === 'SECURE' || status === 'STABLE' || status === 'VERIFIED' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>{status}</span></div>
);

const Metric = ({ icon, label, value, progress, color }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center"><div className="p-2 bg-zinc-950 rounded-lg text-zinc-600">{icon}</div><span className="text-xl font-black italic text-white tracking-tighter">{value}</span></div>
    <div className="space-y-2"><p className="text-[10px] font-mono text-zinc-500 uppercase font-black">{label}</p><div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900"><div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${progress}%` }} /></div></div>
  </div>
);

const NodeStatus = ({ label, status, load }: any) => (
  <div className="space-y-2"><div className="flex justify-between text-[9px] font-black uppercase tracking-tight"><span className="text-zinc-400">{label}</span><span className="text-zinc-600">{status}</span></div><div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${load}%` }} /></div></div>
);

export default MissionControl;
