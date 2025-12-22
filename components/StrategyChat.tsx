
import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MapPin, Brain, Loader2, Globe, ExternalLink, Bot } from 'lucide-react';
import { strategyChat } from '../geminiService';
import { ChatMessage } from '../types';

const StrategyChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { text, sources } = await strategyChat(input, useSearch, useMaps, useThinking);
      setMessages(prev => [...prev, { role: 'model', text, sources, isThinking: useThinking }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Race Strategy Chat</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Pro-Preview Engine Active</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Toggle icon={<Search size={14}/>} active={useSearch} onClick={() => setUseSearch(!useSearch)} label="Search" />
          <Toggle icon={<MapPin size={14}/>} active={useMaps} onClick={() => setUseMaps(!useMaps)} label="Maps" />
          <Toggle icon={<Brain size={14}/>} active={useThinking} onClick={() => setUseThinking(!useThinking)} label="Thinking" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 grayscale">
            <Bot size={48} className="text-zinc-700 mb-4" />
            <p className="text-sm font-mono uppercase tracking-widest text-zinc-500">Stand by for strategy briefing...</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}`}>
              {m.isThinking && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Brain size={12} className="text-blue-400" />
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-bold tracking-widest">Advanced Reasoning Used</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <Globe size={10} /> Sources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors text-[10px] text-zinc-400 border border-zinc-700">
                        {s.title} <ExternalLink size={8} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="animate-spin text-red-500" size={16} />
              <span className="text-xs font-mono text-zinc-500 uppercase">Engineer is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about current grid events..."
            className="flex-1 bg-[#111114] border border-zinc-800 rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all text-white"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="p-3 bg-red-600 rounded-xl text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-900/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ icon, active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${active ? 'bg-red-600/10 border-red-500/40 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase hidden sm:inline">{label}</span>
  </button>
);

export default StrategyChat;
