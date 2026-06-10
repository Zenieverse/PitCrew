
import React, { useState, useEffect, useCallback, useRef, Component, ReactNode } from 'react';
import { 
  LayoutDashboard, MessageSquareCode, FileText, Zap, Brain, Layers, 
  Mic, ShieldCheck, Terminal, Bell, AlertCircle, BookOpen, Settings
} from 'lucide-react';
import RaceDashboard from './components/RaceDashboard.js';
import PitAdvice from './components/PitAdvice.js';
import RaceDebrief from './components/RaceDebrief.js';
import MediaLab from './components/MediaLab.js';
import LiveComms from './components/LiveComms.js';
import StrategyChat from './components/StrategyChat.js';
import TechnicalHQ from './components/TechnicalHQ.js';
import MissionControl from './components/MissionControl.js';
import ConfluenceInsights from './components/ConfluenceInsights.js';
import { MOCK_SPRINT } from './constants.js';
import { SprintStats } from './types.js';

// Define explicit interfaces for ErrorBoundary props and state
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fix: Explicitly extend React.Component and ensure state is correctly initialized to resolve TypeScript property errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  render() {
    // Correctly accessing state inherited from React.Component
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0b] text-white p-8">
          <AlertCircle size={48} className="text-red-600 mb-4" />
          <h1 className="text-2xl font-black italic uppercase">System Crash</h1>
          <p className="text-zinc-500 text-sm mt-2">The neural link experienced a critical fault.</p>
          <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 px-6 py-2 rounded-lg font-bold uppercase text-xs">Reload Telemetry</button>
        </div>
      );
    }
    // Correctly accessing props inherited from Component
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advice' | 'debrief' | 'medialab' | 'live' | 'strategy' | 'tech-hq' | 'mission-control' | 'kb-insights'>('dashboard');
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [sprint, setSprint] = useState<SprintStats>(MOCK_SPRINT);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'info' | 'success' | 'alert' }[]>([]);
  const [platform, setPlatform] = useState<'jira' | 'confluence'>('jira');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const isConfluence = window.location.href.includes('confluence') || document.title.includes('Confluence');
    setPlatform(isConfluence ? 'confluence' : 'jira');

    const checkKey = async () => {
      try {
        if (window.aistudio?.hasSelectedApiKey) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          // If in an environment without aistudio helper, check process.env
          setHasKey(!!process.env.API_KEY);
        }
      } catch (e) {
        console.warn("Key check failed, proceeding to dash", e);
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (isRaceActive) {
      timerRef.current = window.setInterval(() => setSessionTime(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRaceActive]);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const notify = useCallback((message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Date.now();
    setNotifications(p => [...p, { id, message, type }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 6000);
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Racing condition mitigation: assume success
      setHasKey(true);
      notify("Neural Core Link Verified.", "success");
    }
  };

  if (hasKey === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0b] text-white">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-red-600/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black italic tracking-widest uppercase">Initializing Race Control</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2 animate-pulse">Establishing Telemetry Link...</p>
        </div>
      </div>
    );
  }

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0b] text-white p-8">
        <div className="bg-[#111114] border border-zinc-800 p-10 rounded-[2.5rem] max-w-md w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg- gradient-to-r from-red-600 via-zinc-800 to-red-600" />
          <div className="p-4 bg-zinc-900 rounded-full inline-block border border-zinc-800">
            <ShieldCheck className="text-red-600" size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">Telemetry Locked</h1>
            <p className="text-zinc-400 text-sm leading-relaxed px-4">PitCrew AI requires an authenticated API key to access racing telemetry and strategic neural networks.</p>
          </div>
          <button onClick={handleOpenKey} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 text-white">Authenticate Link</button>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
            Consult <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-red-500 transition-colors">Billing Documentation</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#0a0a0b] text-zinc-300 font-sans overflow-hidden">
        <aside className="w-16 md:w-64 bg-[#111114] border-r border-zinc-800 flex flex-col transition-all duration-300 shadow-2xl z-30">
          <div className="p-6 flex items-center gap-3 overflow-hidden border-b border-zinc-800/50">
            <div className={`p-2 rounded-lg ${isRaceActive ? 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-zinc-800'}`}><Zap className="text-white" size={20} /></div>
            <div className="hidden md:block">
              <span className="font-black text-xl italic tracking-tighter text-white">PITCREW <span className="text-red-500">AI</span></span>
              <p className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest font-black">{platform.toUpperCase()} RACE CONTROL</p>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
            <NavItem icon={<LayoutDashboard size={20}/>} label="Race Control" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            {platform === 'confluence' && <NavItem icon={<BookOpen size={20}/>} label="KB Insights" active={activeTab === 'kb-insights'} onClick={() => setActiveTab('kb-insights')} />}
            <NavItem icon={<Terminal size={20}/>} label="Technical HQ" active={activeTab === 'tech-hq'} onClick={() => setActiveTab('tech-hq')} />
            <NavItem icon={<MessageSquareCode size={20}/>} label="Pit Advice" active={activeTab === 'advice'} onClick={() => setActiveTab('advice')} />
            <NavItem icon={<Brain size={20}/>} label="Strategy Wall" active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
            <NavItem icon={<Layers size={20}/>} label="Media Lab" active={activeTab === 'medialab'} onClick={() => setActiveTab('medialab')} />
            <NavItem icon={<Mic size={20}/>} label="Live Comms" active={activeTab === 'live'} onClick={() => setActiveTab('live')} />
            <NavItem icon={<FileText size={20}/>} label="Race Debrief" active={activeTab === 'debrief'} onClick={() => setActiveTab('debrief')} />
          </nav>
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/30">
            <button onClick={() => setActiveTab('mission-control')} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${activeTab === 'mission-control' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800'}`}>
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${activeTab === 'mission-control' ? 'bg-red-600 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-zinc-800 border-zinc-700'}`}><ShieldCheck size={16}/></div>
              <div className="hidden md:block text-left"><p className="text-[10px] font-bold uppercase tracking-widest text-white">Mission Core</p></div>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto carbon-bg relative scroll-smooth custom-scrollbar">
          <header className="sticky top-0 z-20 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-zinc-800 p-4 px-8 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-6">
              <div className="flex flex-col"><span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">Node Identity</span><span className="text-lg font-black uppercase italic text-white tracking-tighter">Racing.atlassian.net</span></div>
              <div className="h-10 w-px bg-zinc-800" />
              <div className="flex flex-col"><span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">Session Clock</span><span className={`text-lg font-black font-mono ${isRaceActive ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`}>{formatTime(sessionTime)}</span></div>
            </div>
            <div className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all ${isRaceActive ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-zinc-900/50 border-zinc-800'}`}>
              <div className={`w-2 h-2 rounded-full ${isRaceActive ? 'bg-red-600 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-zinc-700'}`} />
              <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isRaceActive ? 'text-red-500' : 'text-zinc-600'}`}>{isRaceActive ? 'TELEMETRY LIVE' : 'PIT-WALL STANDBY'}</span>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto pb-24">
            {activeTab === 'dashboard' && <RaceDashboard sprint={sprint} onLaunch={() => setIsRaceActive(true)} isRaceActive={isRaceActive} />}
            {activeTab === 'tech-hq' && <TechnicalHQ />}
            {activeTab === 'advice' && <PitAdvice sprint={sprint} onUpdateIssue={() => {}} notify={notify} />}
            {activeTab === 'strategy' && <StrategyChat />}
            {activeTab === 'medialab' && <MediaLab />}
            {activeTab === 'live' && <LiveComms />}
            {activeTab === 'debrief' && <RaceDebrief sprint={sprint} />}
            {activeTab === 'mission-control' && <MissionControl />}
            {activeTab === 'kb-insights' && <ConfluenceInsights />}
          </div>

          <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right duration-500 flex items-center gap-4 min-w-[320px] backdrop-blur-md pointer-events-auto ${n.type === 'success' ? 'bg-green-950/40 border-green-500/50 text-green-400' : n.type === 'alert' ? 'bg-red-950/40 border-red-500/50 text-red-400 font-bold' : 'bg-zinc-900/90 border-zinc-700 text-zinc-300'}`}>
                {n.type === 'alert' ? <AlertCircle size={18} className="animate-pulse" /> : <Bell size={18} />}
                <div className="flex-1"><span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">{n.message}</span></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${active ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xl' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
    <div className={`transition-all duration-300 ${active ? 'scale-110 text-red-500' : 'group-hover:scale-110'}`}>{icon}</div>
    <span className={`hidden md:block text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;
