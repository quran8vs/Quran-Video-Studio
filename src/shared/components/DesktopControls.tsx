import { useEffect, useState } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { isTauri } from '../utils/platform';

export default function DesktopControls() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    if (isTauri()) {
      console.log("Initializing DesktopControls for Tauri...");
      import('@tauri-apps/api/window').then((module) => {
        console.log("Tauri window module loaded");
        const win = module.getCurrentWindow();
        if (win) {
            console.log("Window handle obtained");
            setAppWindow(win);
            // Check initial state
            win.isMaximized().then(setIsMaximized).catch(e => console.error("Failed to check maximized state", e));
        } else {
            console.error("Failed to get current window handle");
        }
      }).catch(err => {
        console.error("Failed to load Tauri window module", err);
      });
    }
  }, []);

  if (!isTauri() || !appWindow) return null;

  const handleMinimize = () => appWindow?.minimize();
  
  const handleMaximize = async () => {
    if (!appWindow) return;
    try {
      const isMax = await appWindow.isMaximized();
      console.log("Current maximize state:", isMax);
      
      if (isMax) {
        console.log("Unmaximizing...");
        await appWindow.unmaximize();
      } else {
        console.log("Maximizing...");
        await appWindow.maximize();
      }
      
      // Update state immediately based on action
      setIsMaximized(!isMax);
      
      // Double check after a delay to ensure state is correct
      setTimeout(async () => {
        const newMax = await appWindow.isMaximized();
        console.log("New maximize state:", newMax);
        setIsMaximized(newMax);
      }, 100);
    } catch (e) {
      console.error("Maximize/Unmaximize failed", e);
    }
  };
  
  const handleClose = () => appWindow?.close();

  return (
    <div 
      className="fixed top-5 right-5 z-[100] flex items-center gap-3 p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:bg-black/80 hover:border-white/20 hover:scale-105 group"
    >
      <button
        onClick={handleMinimize}
        className="group/btn relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      
      <button
        onClick={handleMaximize}
        className="group/btn relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95"
      >
        {isMaximized ? (
          <Maximize2 size={16} strokeWidth={2.5} className="rotate-180" />
        ) : (
          <Square size={16} strokeWidth={2.5} />
        )}
      </button>
      
      <button
        onClick={handleClose}
        className="group/btn relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500 text-white/50 hover:text-white transition-all active:scale-95"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
