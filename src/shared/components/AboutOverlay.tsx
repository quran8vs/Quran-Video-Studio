import { useState, useEffect } from 'react';
import { Info, Download, Settings, Github, Globe, Youtube, Facebook, Instagram, Send, FolderOpen, FileText, CheckCircle2 } from 'lucide-react';
import appInfo from '../../config/app-info.json';
import { getAppDefaultPath, pickDirectory, isTauri } from '../utils/tauri-fs';
import Tooltip from './Tooltip';

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutOverlay({ isOpen, onClose }: AboutOverlayProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'download' | 'settings'>('info');
  const [isTauriApp] = useState(() => isTauri());
  const [exportPath, setExportPath] = useState<string>(() => {
    if (isTauri()) {
        return localStorage.getItem('exportPath') || '';
    }
    return '';
  });
  const [skipDialog, setSkipDialog] = useState<boolean>(() => {
      return localStorage.getItem('skipDialog') === 'true';
  });

  useEffect(() => {
    if (isTauriApp && !exportPath) {
        // Default to Downloads if not set
        getAppDefaultPath('Download').then(path => {
            if (path) {
                // Path already includes 'Quran_Video_Studio' from Rust backend
                setExportPath(path);
                localStorage.setItem('exportPath', path);
            }
        });
    }
  }, [isTauriApp, exportPath]);

  const handleBrowse = async () => {
    const path = await pickDirectory();
    if (path) {
      setExportPath(path);
      localStorage.setItem('exportPath', path);
    }
  };

  const handleSetDefault = async (base: 'Download' | 'Documents') => {
    const path = await getAppDefaultPath(base);
    if (path) {
      // Path already includes 'Quran_Video_Studio' from Rust backend
      setExportPath(path);
      localStorage.setItem('exportPath', path);
    }
  };

  const toggleSkipDialog = () => {
      const newValue = !skipDialog;
      setSkipDialog(newValue);
      localStorage.setItem('skipDialog', String(newValue));
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Logo Container with Glow */}
            <div className="relative group cursor-default mt-4">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl ring-1 ring-white/5 group-hover:scale-105 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)">
                <img 
                  src="/icon/favicon.svg" 
                  alt="Logo" 
                  className="w-16 h-16 opacity-100 drop-shadow-[0_0_25px_rgba(52,211,153,0.4)] invert brightness-0"
                />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 w-full">
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                  {appInfo.appName}
                </span>
              </h3>
              
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-medium tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  {appInfo.version}
                </span>
              </div>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                {appInfo.description}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full px-4">
              {appInfo.socialLinks.map((link) => {
                // Helper to get icon component
                const getIcon = (platform: string) => {
                    if (platform.includes('github')) return <Github size={18} />;
                    if (platform.includes('youtube')) return <Youtube size={18} />;
                    if (platform.includes('facebook')) return <Facebook size={18} />;
                    if (platform.includes('instagram')) return <Instagram size={18} />;
                    if (platform.includes('telegram')) return <Send size={18} />;
                    return <Globe size={18} />;
                };

                return (
                    <Tooltip key={link.platform} content={link.platform} position="top">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 text-zinc-400 hover:text-white block"
                      >
                        {getIcon(link.platform)}
                        {/* Tooltip-ish Glow */}
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all"></div>
                      </a>
                    </Tooltip>
                );
              })}
            </div>
          </div>
        );
      case 'download':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300 w-full">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Download className="w-8 h-8 text-zinc-500" />
             </div>
             
             <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium text-white">Download Settings</h3>
                <p className="text-zinc-500 text-sm">Configure your default export location.</p>
             </div>

             {isTauriApp ? (
                 <div className="w-full space-y-4">
                    <div className="flex gap-2 justify-center">
                        <button 
                            onClick={() => handleSetDefault('Download')}
                            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-2"
                        >
                            <Download size={14} />
                            Downloads
                        </button>
                        <button 
                            onClick={() => handleSetDefault('Documents')}
                            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-2"
                        >
                            <FileText size={14} />
                            Documents
                        </button>
                    </div>

                    <div className="relative group">
                        <input 
                            type="text" 
                            value={exportPath}
                            readOnly
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            placeholder="Select export folder..."
                        />
                        <button 
                            onClick={handleBrowse}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Browse Folder"
                        >
                            <FolderOpen size={14} />
                        </button>
                    </div>
                    
                    <button 
                        onClick={toggleSkipDialog}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between group ${skipDialog ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                        <div className="text-left">
                            <span className={`text-xs font-medium block ${skipDialog ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                Quick Export
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                                Save directly without showing dialog
                            </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${skipDialog ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                            {skipDialog && <CheckCircle2 size={12} className="text-black" />}
                        </div>
                    </button>

                    <p className="text-[10px] text-zinc-600">
                        Videos will be saved to a 'Quran_Video_Studio' folder in this location.
                    </p>
                 </div>
             ) : (
                 <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 w-full text-xs text-yellow-200/80">
                    You are using the web version. Downloads will be saved to your browser's default download folder.
                 </div>
             )}

             <div className="p-4 rounded-xl bg-white/5 border border-white/5 w-full text-xs text-zinc-400 text-left space-y-1">
                <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="text-white">MP4 (H.264)</span>
                </div>
                <div className="flex justify-between">
                    <span>Quality:</span>
                    <span className="text-white">High (1080p)</span>
                </div>
                <div className="flex justify-between">
                    <span>Audio:</span>
                    <span className="text-white">AAC (128kbps)</span>
                </div>
             </div>
          </div>
        );
      case 'settings':
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <Settings className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-white">General Settings</h3>
                <p className="text-zinc-500 text-sm">Application preferences.</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 w-full text-xs text-zinc-400">
                    Theme: Dark<br/>
                    Language: English / Arabic
                </div>
            </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Card Container */}
      <div className="relative w-full max-w-md bg-zinc-950/90 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Header / Tabs */}
        <div className="flex items-center justify-between p-2 m-2 bg-white/5 rounded-[1.5rem] border border-white/5 relative z-10">
            <div className="flex items-center gap-1 w-full">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'info' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                >
                    <Info size={16} />
                    <span>Info</span>
                </button>
                <button 
                    onClick={() => setActiveTab('download')}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'download' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                >
                    <Download size={16} />
                    <span>Export</span>
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                >
                    <Settings size={16} />
                    <span>Settings</span>
                </button>
            </div>
        </div>

        {/* Close Button (Absolute Top Right) */}
        {/* <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition-colors z-20"
        >
            <X size={20} />
        </button> */}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto min-h-[300px] relative z-10">
            {renderContent()}
        </div>

        {/* Footer - Developer Info */}
        <div className="p-4 border-t border-white/5 bg-black/20 text-center relative z-10">
            <p className="text-xs text-zinc-500 font-medium tracking-wide">
                Developed by <a href="https://t.me/oussamadev" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors">@oussamadev</a>
            </p>
        </div>

      </div>
    </div>
  );
}
