import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Loader2, Activity, Info, Volume2 } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

// Decoding raw PCM data as required by the native audio stream rules
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const LiveComms: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setLoading(true);
    setTranscript([]);
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Fixed: Strictly use process.env.API_KEY as per initialization rules.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setLoading(false);
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const scriptNode = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptNode.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i=0; i<input.length; i++) int16[i] = input[i] * 32768;
              const pcm = encode(new Uint8Array(int16.buffer));
              
              sessionPromiseRef.current?.then(s => {
                s.sendRealtimeInput({ media: { data: pcm, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(scriptNode);
            scriptNode.connect(audioCtxRef.current!.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              playAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
            }
            if (msg.serverContent?.outputTranscription) {
              setTranscript(p => [...p.slice(-20), { role: 'model', text: msg.serverContent!.outputTranscription!.text }]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscript(p => [...p.slice(-20), { role: 'user', text: msg.serverContent!.inputTranscription!.text }]);
            }
            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(src => { try { src.stop(); } catch(e){} });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => stopSession(),
          onclose: () => {
            setIsActive(false);
            setLoading(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are a professional F1 Race Engineer named Alpha. Be brief, tactical, and use racing terminology. Focus on software sprint execution as if it were a high-stakes Grand Prix."
        }
      });
    } catch (e) { 
      setLoading(false); 
      alert("Microphone access is required for the Radio Link.");
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioCtxRef.current) return;
    const audioBuffer = await decodeAudioData(
      decode(base64),
      audioCtxRef.current,
      24000,
      1,
    );
    
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);
    
    source.onended = () => {
      activeSourcesRef.current.delete(source);
    };
    
    activeSourcesRef.current.add(source);
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
  };

  const stopSession = () => {
    sessionPromiseRef.current?.then(s => s.close());
    streamRef.current?.getTracks().forEach(t => t.stop());
    activeSourcesRef.current.forEach(src => { try { src.stop(); } catch(e){} });
    activeSourcesRef.current.clear();
    setIsActive(false);
    setLoading(false);
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Radio Transmission</h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">Sector 4 Pit-Wall Loop</p>
      </div>

      <div className={`relative group transition-all duration-700 ${isActive ? 'scale-110' : 'scale-100'}`}>
        <div className={`absolute -inset-4 rounded-full border-2 border-dashed transition-all duration-1000 ${isActive ? 'border-red-600 animate-spin-slow opacity-100' : 'border-zinc-800 opacity-20'}`} />
        <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.3)]' : 'border-zinc-800 shadow-2xl bg-zinc-900/50'}`}>
          <button 
            onClick={isActive ? stopSession : startSession} 
            disabled={loading} 
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 shadow-inner ${isActive ? 'bg-red-600 text-white animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'bg-zinc-800 text-red-500 hover:bg-zinc-700 border border-zinc-700'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={48}/> : isActive ? <Mic size={48}/> : <MicOff size={48}/>}
            <span className="text-[10px] font-black uppercase tracking-widest mt-4">
              {loading ? 'Establishing Link' : isActive ? 'Telemetry Live' : 'Start Transmission'}
            </span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-[#111114] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Radio size={14} className={isActive ? 'text-red-500 animate-pulse' : 'text-zinc-600'}/>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Radio Transcript</span>
          </div>
          <div className="flex gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-zinc-800'}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-zinc-800'}`} />
          </div>
        </div>
        <div className="h-64 overflow-y-auto p-6 space-y-3 font-mono text-[11px] custom-scrollbar bg-zinc-950/20">
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
              <Activity size={48} strokeWidth={1} />
              <p className="uppercase tracking-[0.3em] font-black text-[9px]">Awaiting signal synchronization...</p>
            </div>
          ) : (
            transcript.map((t, i) => (
              <div key={i} className={`flex gap-3 leading-relaxed animate-in slide-in-from-left-2 duration-300 ${t.role === 'model' ? 'text-zinc-300' : 'text-red-500 font-bold'}`}>
                <span className="shrink-0">[{t.role.toUpperCase()}]</span>
                <span>{t.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveComms;