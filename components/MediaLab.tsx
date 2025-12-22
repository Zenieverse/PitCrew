
import React, { useState } from 'react';
import { Image, Video, Upload, Play, Sparkles, Wand2, ArrowRight, Loader2, Download, Scaling as AspectIcon, Maximize2, FileAudio } from 'lucide-react';
import { generateImage, generateVideo, editImage, analyzeMedia, transcribeAudio } from '../geminiService';
import { ImageSize, AspectRatio } from '../types';

const MediaLab: React.FC = () => {
  const [mode, setMode] = useState<'gen-img' | 'edit-img' | 'gen-vid' | 'analyze' | 'transcribe'>('gen-img');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    setLoading(true);
    setResult(null);
    try {
      if (mode === 'gen-img') {
        const url = await generateImage(prompt, size, ratio);
        setResult(url);
      } else if (mode === 'edit-img' && previewUrl) {
        const base64 = previewUrl.split(',')[1];
        const url = await editImage(base64, prompt);
        setResult(url);
      } else if (mode === 'gen-vid') {
        let base64;
        if (previewUrl && uploadedFile?.type.startsWith('image/')) base64 = previewUrl.split(',')[1];
        const url = await generateVideo(prompt, videoRatio, base64);
        setResult(url);
      } else if (mode === 'analyze' && uploadedFile) {
        const text = await analyzeMedia(uploadedFile, prompt || "Analyze this media and explain its relevance to race performance.");
        setResult(`Telemetry Analysis: \n\n${text}`);
      } else if (mode === 'transcribe' && uploadedFile) {
        const text = await transcribeAudio(uploadedFile);
        setResult(`Radio Transcription: \n\n${text}`);
      }
    } catch (e) {
      console.error(e);
      setResult("Error processing request. Check telemetry link.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(url);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 uppercase flex items-center gap-2 tracking-tight">
            <Sparkles className="text-red-500" size={20} /> Media Lab Console
          </h2>
          
          <div className="grid grid-cols-2 gap-2 mb-8">
            <ModeBtn active={mode === 'gen-img'} onClick={() => setMode('gen-img')} icon={<Image size={16}/>} label="Gen Image" />
            <ModeBtn active={mode === 'edit-img'} onClick={() => setMode('edit-img')} icon={<Wand2 size={16}/>} label="Edit Image" />
            <ModeBtn active={mode === 'gen-vid'} onClick={() => setMode('gen-vid')} icon={<Video size={16}/>} label="Gen Video" />
            <ModeBtn active={mode === 'analyze'} onClick={() => setMode('analyze')} icon={<Maximize2 size={16}/>} label="Analyze" />
            <ModeBtn active={mode === 'transcribe'} onClick={() => setMode('transcribe')} icon={<FileAudio size={16}/>} label="Transcribe" />
          </div>

          <div className="space-y-6">
            {(mode === 'edit-img' || mode === 'analyze' || mode === 'gen-vid' || mode === 'transcribe') && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Reference Asset (Image/Video/Audio)</label>
                <div className="relative group cursor-pointer border-2 border-dashed border-zinc-800 rounded-xl p-4 hover:border-red-500/50 transition-all bg-zinc-900/50">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {previewUrl && uploadedFile?.type.startsWith('image/') ? (
                    <img src={previewUrl} className="w-full h-32 object-cover rounded-lg" alt="Preview" />
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <FileAudio size={24} className="text-red-500" />
                      <span className="text-[10px] font-mono text-zinc-300 truncate max-w-full px-2">{uploadedFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Upload size={24} className="text-zinc-600" />
                      <span className="text-[10px] font-mono text-zinc-500">UPLOAD ASSET</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(mode !== 'transcribe') && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Instruction / Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'edit-img' ? "e.g. 'Add a retro filter'" : "Describe the output..."}
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-3 text-sm min-h-[100px] focus:ring-1 focus:ring-red-500 focus:outline-none text-white"
                />
              </div>
            )}

            {mode === 'gen-img' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <Maximize2 size={10} /> Resolution
                  </label>
                  <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg p-2 text-xs text-white">
                    <option>1K</option><option>2K</option><option>4K</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <AspectIcon size={10} /> Ratio
                  </label>
                  <select value={ratio} onChange={(e) => setRatio(e.target.value as any)} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg p-2 text-xs text-white">
                    <option>1:1</option><option>16:9</option><option>9:16</option><option>4:3</option><option>21:9</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'gen-vid' && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1">
                  <AspectIcon size={10} /> Video Format
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setVideoRatio('16:9')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${videoRatio === '16:9' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>16:9 Landscape</button>
                  <button onClick={() => setVideoRatio('9:16')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${videoRatio === '9:16' ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>9:16 Portrait</button>
                </div>
              </div>
            )}

            <button 
              onClick={handleProcess}
              disabled={loading || (mode !== 'analyze' && mode !== 'transcribe' && !prompt)}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
              {loading ? "Engaging AI Co-Processor..." : "Execute Command"}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl h-full flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600" /> Output Render Buffer
            </h3>
            {result && !loading && !mode.includes('analyze') && !mode.includes('transcribe') && (
              <button className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                <Download size={14} /> Download Asset
              </button>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            {loading ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <Loader2 size={48} className="text-red-600 animate-spin" />
                <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Rendering Sector Data...</p>
              </div>
            ) : result ? (
              mode === 'gen-vid' ? (
                <video src={result} controls autoPlay loop className="max-w-full max-h-[600px] rounded-xl shadow-2xl border border-zinc-800" />
              ) : (mode === 'analyze' || mode === 'transcribe') ? (
                <div className="w-full bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-inner overflow-y-auto max-h-[500px]">
                  <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
              ) : (
                <img src={result} className="max-w-full max-h-[600px] rounded-xl shadow-2xl border border-zinc-800 object-contain" alt="Result" />
              )
            ) : (
              <div className="text-center opacity-30">
                <Sparkles size={64} className="mx-auto text-zinc-700 mb-4" />
                <p className="text-sm font-mono text-zinc-600 uppercase tracking-widest">Awaiting Command from Mission Control</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModeBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${active ? 'bg-red-600/10 border-red-500/50 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700/50'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default MediaLab;
