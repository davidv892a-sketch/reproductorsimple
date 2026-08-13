import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Sliders,
  Car,
  Search,
  Settings,
  FolderPlus,
  Music2,
  Sparkles,
} from 'lucide-react';

interface AndroidHeaderProps {
  showAndroidFrame: boolean;
  activeView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenEqualizer: () => void;
  onOpenSettings: () => void;
  onToggleCarMode: () => void;
  onImportFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCarMode: boolean;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  showAndroidFrame,
  activeView,
  searchQuery,
  onSearchChange,
  onOpenEqualizer,
  onOpenSettings,
  onToggleCarMode,
  onImportFiles,
  isCarMode,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full shrink-0 select-none bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-20">
      {/* Android Status Bar */}
      {showAndroidFrame && (
        <div className="flex items-center justify-between px-4 py-1 text-xs text-slate-400 font-mono border-b border-white/5">
          <div className="flex items-center space-x-2">
            <span>{currentTime || '12:00'}</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1 rounded font-semibold">5G</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center space-x-1">
              <span>94%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        {/* App Title / Logo */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Music2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white tracking-tight truncate leading-tight flex items-center gap-1.5">
              <span>SoundWave MP3</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              Hi-Res Audio • 10-Band EQ
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* File Import Button */}
          <label
            title="Importar archivos MP3"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer transition-all active:scale-95 border border-white/10 flex items-center justify-center"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={onImportFiles}
              className="hidden"
            />
          </label>

          {/* Equalizer Shortcut */}
          <button
            onClick={onOpenEqualizer}
            title="Ecualizador de 10 bandas"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-white/10 flex items-center justify-center relative group"
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {/* Car Mode Toggle */}
          <button
            onClick={onToggleCarMode}
            title={isCarMode ? 'Salir de Modo Auto' : 'Modo Auto (Car Mode)'}
            className={`p-2 rounded-xl transition-all active:scale-95 border flex items-center justify-center ${
              isCarMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-white/10'
            }`}
          >
            <Car className="w-4 h-4" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            title="Ajustes y Temas"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 border border-white/10 flex items-center justify-center"
          >
            <Settings className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar canción, artista, álbum o género..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
