import React, { useState } from 'react';
import { Song } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Car,
  X,
  Mic,
  Volume2,
  Heart,
  Sliders,
} from 'lucide-react';

interface CarModeViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFavorite: (songId: string) => void;
  onExitCarMode: () => void;
}

export const CarModeView: React.FC<CarModeViewProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleFavorite,
  onExitCarMode,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  if (!currentSong) return null;

  const handleVoiceCommand = () => {
    setIsListening(true);
    setVoiceFeedback('Escuchando comando de voz...');
    setTimeout(() => {
      setVoiceFeedback('Comando detectado: "Siguiente Canción"');
      onNext();
      setTimeout(() => {
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 select-none border-4 border-amber-500/40">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-400 uppercase tracking-wide">
              Modo Auto (Car Mode)
            </h2>
            <p className="text-xs text-slate-400 font-medium">Interfaz táctil de alta seguridad</p>
          </div>
        </div>

        <button
          onClick={onExitCarMode}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border-2 border-white/10 flex items-center gap-2 active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
          <span>Salir</span>
        </button>
      </div>

      {/* Center Track Info */}
      <div className="my-auto text-center flex flex-col items-center">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-amber-500/30 shadow-2xl mb-6">
          {currentSong.coverUrl ? (
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-4xl">
              🚗
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white truncate max-w-md">
          {currentSong.title}
        </h1>
        <p className="text-base font-bold text-amber-400 mt-1 truncate max-w-md">
          {currentSong.artist}
        </p>

        {voiceFeedback && (
          <div className="mt-4 px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 animate-pulse">
            {voiceFeedback}
          </div>
        )}
      </div>

      {/* Extra Large Driving Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Large Previous */}
          <button
            onClick={onPrevious}
            className="h-20 rounded-3xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center active:scale-95 transition-all shadow-xl"
          >
            <SkipBack className="w-10 h-10 fill-white" />
          </button>

          {/* Huge Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="h-24 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/30 active:scale-95 transition-all border-2 border-amber-300"
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 fill-slate-950" />
            ) : (
              <Play className="w-12 h-12 fill-slate-950 ml-1" />
            )}
          </button>

          {/* Large Next */}
          <button
            onClick={onNext}
            className="h-20 rounded-3xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center active:scale-95 transition-all shadow-xl"
          >
            <SkipForward className="w-10 h-10 fill-white" />
          </button>
        </div>

        {/* Bottom Auxiliary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleVoiceCommand}
            className={`py-4 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-bounce'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <Mic className="w-5 h-5 text-amber-400" />
            <span>Comando de Voz</span>
          </button>

          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            className="py-4 rounded-2xl bg-slate-900 border-2 border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Heart
              className={`w-5 h-5 ${
                currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>Favorito</span>
          </button>
        </div>
      </div>
    </div>
  );
};
