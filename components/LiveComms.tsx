
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Radio, Loader2, Activity, Info, MessageSquare } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

const LiveComms: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);

  const startSession = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionRef.current = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live connected');
            setIsActive(true);
            setLoading(false);
            const source = audioCtxRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptNode = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptNode.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionRef.current?.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
              });
            };
            source.connect(scriptNode);
            scriptNode.connect(audioCtxRef.current!.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
              playAudio(base64);
            }
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-15), { role: 'model', text: msg.serverContent!.outputTranscription!.text }]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-15), { role: 'user', text: msg.serverContent!.inputTranscription!.text }]);
            }
          },
          onerror: (e) => console.error(e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "You are a professional F1 Race Engineer. Provide concise, tactical advice in real-time. Stay in character. Use radio terminology like 'copy', 'affirmative', 'box box'."
        }
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioCtxRef.current) return;
    const bytes = decode(base64);
    const buffer = await decodeAudioData(bytes, audioCtxRef.current, 24000, 1);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    const startTime = Math.max(audioCtxRef.current.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsActive(false);
  };

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function decode(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
      <div className="relative">
        <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)] scale-110' : 'border-zinc-800 grayscale'}`}>
          <div className={`w-40 h-40 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center ${isActive ? 'animate-pulse' : ''}`}>
             {isActive ? <Activity className="text-red-600" size={64} /> : <Radio className="text-zinc-700" size={64} />}
          </div>
          {isActive && (
            <div className="absolute -top-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-bounce">
              On Air
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Live Pit-Wall Frequency</h2>
        <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto">
          Secure encrypted line to Race Engineer. Real-time transcription and tactical analysis active.
        </p>
      </div>

      <div className="flex gap-4">
        {!isActive ? (
          <button 
            onClick={startSession}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl shadow-red-900/30"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
            {loading ? "Establishing Link..." : "Open Channel"}
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-red-500 rounded-2xl font-bold uppercase tracking-widest transition-all border border-zinc-700"
          >
            <MicOff size={20} /> Close Frequency
          </button>
        )}
      </div>

      <div className="w-full max-w-2xl bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
         <div className="flex items-center gap-2 mb-4 text-zinc-500 border-b border-zinc-800 pb-3 justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} />
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest">Real-time Transcription Log</span>
            </div>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
         </div>
         <div className="space-y-3 h-48 overflow-y-auto font-mono text-[11px] custom-scrollbar flex flex-col">
            {transcript.map((t, i) => (
              <div key={i} className={`p-2 rounded-lg border max-w-[90%] ${t.role === 'user' ? 'bg-zinc-800 border-zinc-700 self-end text-zinc-300' : 'bg-red-900/10 border-red-900/20 self-start text-zinc-200'}`}>
                <span className={`font-bold mr-2 uppercase ${t.role === 'user' ? 'text-zinc-500' : 'text-red-500'}`}>{t.role === 'user' ? 'Driver' : 'Engineer'}:</span> {t.text}
              </div>
            ))}
            {transcript.length === 0 && (
              <p className="text-zinc-700 italic text-center py-8">Waiting for radio traffic...</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default LiveComms;
