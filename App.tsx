
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  FileText, 
  Settings, 
  ChevronRight, 
  AlertCircle, 
  Zap,
  Flag,
  Timer
} from 'lucide-react';
import RaceDashboard from './components/RaceDashboard';
import PitAdvice from './components/PitAdvice';
import RaceDebrief from './components/RaceDebrief';
import { MOCK_SPRINT } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advice' | 'debrief'>('dashboard');

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-64 bg-[#111114] border-r border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <Zap className="text-white fill-current" size={20} />
          </div>
          <span className="hidden md:block font-bold tracking-tighter text-xl text-white">
            PITCREW <span className="text-red-500">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden md:block font-medium">Race Status</span>
          </button>
          <button 
            onClick={() => setActiveTab('advice')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'advice' ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <MessageSquareCode size={20} />
            <span className="hidden md:block font-medium">Pit Advice</span>
          </button>
          <button 
            onClick={() => setActiveTab('debrief')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'debrief' ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <FileText size={20} />
            <span className="hidden md:block font-medium">Race Debrief</span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-4">
          <div className="bg-zinc-900 rounded-lg p-3 hidden md:block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-zinc-500">ENGINEER STATUS</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400">Monitoring Sector 3 workload...</p>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800">
            <Settings size={20} />
            <span className="hidden md:block font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-800 p-4 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Active Circuit</h1>
              <span className="text-lg font-bold text-white uppercase">{MOCK_SPRINT.name}</span>
            </div>
            <div className="h-10 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <Timer className="text-red-500" size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-500">LAP TIMER (DAYS REMAINING)</span>
                <span className="text-lg font-bold text-white">{MOCK_SPRINT.remainingDays}d</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">LIVE TELEMETRY</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <RaceDashboard sprint={MOCK_SPRINT} />}
          {activeTab === 'advice' && <PitAdvice issues={MOCK_SPRINT.issues} />}
          {activeTab === 'debrief' && <RaceDebrief sprint={MOCK_SPRINT} />}
        </div>
      </main>
    </div>
  );
};

export default App;
