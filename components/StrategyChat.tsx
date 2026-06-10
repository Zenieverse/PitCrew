import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MapPin, Brain, Loader2, Globe, ExternalLink, Bot } from 'lucide-react';
import { strategyChat } from '../geminiService.js';
import { ChatMessage } from '../types.js';

const StrategyChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (useMaps && !location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied", err)
      );
    }
  }, [useMaps]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setMessages(p => [...p, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    try {
      const res = await strategyChat(currentInput, useSearch, useMaps, useThinking, location);
      setMessages(p => [...p, { role: 'model', text: res.text || "Radio signal lost.", sources: res.sources, isThinking: useThinking }]);
    } catch (e) { setMessages(p => [...p, { role: 'model', text: "Critical telemetry failure during strategy synthesis." }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-[#111114] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="p-4 border-b border-zinc-800 flex flex-wrap justify-between items-center bg-zinc-900/50 gap-4">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-red-500"/>
          <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Strategy Wall</h3>
        </div>
        <div className="flex gap-2">
          <ChatToggle icon={<Search size={14}/>} active={useSearch} onClick={() => setUseSearch(!useSearch)} label="Search" />
          <ChatToggle icon={<MapPin size={14}/>} active={useMaps} onClick={() => setUseMaps(!useMaps)} label="Maps" />
          <ChatToggle icon={<Brain size={14}/>} active={useThinking} onClick={() => setUseThinking(!useThinking)} label="Thinking" />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
            <Brain size={64} strokeWidth={1} />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Awaiting Strategic Query</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}`}>
              {m.isThinking && <div className="flex items-center gap-2 mb-2 text-blue-400 font-mono text-[10px] font-black"><Brain size={12}/> DEEP REASONING ENGAGED</div>}
              <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-2">
                  {m.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 rounded-lg text-[10px] text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all">
                      <Globe size={10}/> {s.title} <ExternalLink size={8}/>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={16}/>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Synthesizing Strategy...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex gap-4 items-center bg-[#0a0a0b] p-2 rounded-2xl border border-zinc-800 focus-within:border-red-600/50 transition-all">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()} 
            placeholder="Consult the Race Strategist..." 
            className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none text-white placeholder-zinc-800" 
          />
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            className="p-3 bg-red-600 rounded-xl text-white hover:bg-red-700 disabled:opacity-50 shadow-xl transition-all active:scale-95"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatToggle = ({ icon, active, onClick, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${active ? 'bg-red-600 text-white border-red-500 shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
    {icon} 
    <span className="text-[10px] font-black uppercase hidden sm:inline tracking-widest">{label}</span>
  </button>
);

export default StrategyChat;