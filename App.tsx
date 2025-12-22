
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  FileText, 
  Zap,
  Timer,
  Brain,
  Layers,
  Mic,
  Key,
  ShieldCheck,
  Cpu,
  Terminal
} from 'lucide-react';
import RaceDashboard from './components/RaceDashboard';
import PitAdvice from './components/PitAdvice';
import RaceDebrief from './components/RaceDebrief';
import MediaLab from './components/MediaLab';
import LiveComms from './components/LiveComms';
import StrategyChat from './components/StrategyChat';
import TechnicalHQ from './components/TechnicalHQ';
import { MOCK_SPRINT } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advice' | 'debrief' | 'medialab' | 'live' | 'strategy' | 'tech-hq'>('dashboard');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0b] text-white p-8">
        <div className="bg-[#111114] border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="bg-red-600/20 p-4 rounded-2xl w-fit mx-auto">
            <Key className="text-red-500" size={48} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Mission Control Lock</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Veo and Pro-Image generation modules require a verified billing project.
          </p>
          <button onClick={handleOpenKey} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs">
            Authenticate Frequency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-gray-200 overflow-hidden font-sans">
      <aside className="w-16 md:w-64 bg-[#111114] border-r border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <Zap className="text-white fill-current" size={20} />
          </div>
          <span className="hidden md:block font-bold tracking-tighter text-xl text-white">
            PITCREW <span className="text-red-500 underline decoration-2 underline-offset-4">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Race Status" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Terminal size={20}/>} label="Technical HQ" active={activeTab === 'tech-hq'} onClick={() => setActiveTab('tech-hq')} />
          <NavItem icon={<MessageSquareCode size={20}/>} label="Pit Advice" active={activeTab === 'advice'} onClick={() => setActiveTab('advice')} />
          <NavItem icon={<Brain size={20}/>} label="Strategy Wall" active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
          <NavItem icon={<Layers size={20}/>} label="Media Lab" active={activeTab === 'medialab'} onClick={() => setActiveTab('medialab')} />
          <NavItem icon={<Mic size={20}/>} label="Live Comms" active={activeTab === 'live'} onClick={() => setActiveTab('live')} />
          <NavItem icon={<FileText size={20}/>} label="Race Debrief" active={activeTab === 'debrief'} onClick={() => setActiveTab('debrief')} />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-900 rounded-lg p-3 hidden md:block border border-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                <ShieldCheck size={10} className="text-blue-500" /> FORGE READY
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            </div>
            <div className="flex items-center gap-2 mb-1">
               <Cpu size={12} className="text-zinc-500" />
               <span className="text-[10px] text-zinc-400 font-mono uppercase">ROVO DEV ACTIVE</span>
            </div>
            <p className="text-[9px] text-zinc-500 font-mono leading-tight">PITCREW-TECH-DIR-V2</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <header className="sticky top-0 z-20 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-zinc-800 p-4 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Circuit</h1>
              <span className="text-lg font-bold text-white uppercase tracking-tight">{MOCK_SPRINT.name}</span>
            </div>
            <div className="h-10 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <Timer className="text-red-500" size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Days Remaining</span>
                <span className="text-lg font-bold text-white">{MOCK_SPRINT.remainingDays}d</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-950/20 px-3 py-1.5 rounded-full border border-red-900/30">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 tracking-[0.2em] uppercase">Tech HQ Live</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <RaceDashboard sprint={MOCK_SPRINT} />}
          {activeTab === 'tech-hq' && <TechnicalHQ />}
          {activeTab === 'advice' && <PitAdvice issues={MOCK_SPRINT.issues} />}
          {activeTab === 'strategy' && <StrategyChat />}
          {activeTab === 'medialab' && <MediaLab />}
          {activeTab === 'live' && <LiveComms />}
          {activeTab === 'debrief' && <RaceDebrief sprint={MOCK_SPRINT} />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${active ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'hover:bg-zinc-800 text-zinc-400'}`}
  >
    <div className={`${active ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
      {icon}
    </div>
    <span className="hidden md:block font-semibold text-sm tracking-tight">{label}</span>
  </button>
);

export default App;
