import React from 'react';
import { Song } from '../types';
import { Play, Pause, SkipForward, Heart, Maximize2, Mic2 } from 'lucide-react';
import { formatTime } from '../utils/lrcParser';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpenFullPlayer: () => void;
  onToggleFavorite: (songId: string) => void;
  onToggleLyrics: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onOpenFullPlayer,
  onToggleFavorite,
  onToggleLyrics,
}) => {
  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full shrink-0 select-none bg-slate-900/95 backdrop-blur-xl border-t border-cyan-500/20 z-20 shadow-2xl relative group">
      {/* Top Seek Progress Bar */}
      <div className="w-full h-1 bg-slate-800 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Track Thumbnail & Info (Clickable to Expand) */}
        <div
          onClick={onOpenFullPlayer}
          className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer group/info"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-md">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isPlaying ? 'scale-105' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                MP3
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="flex items-end space-x-0.5 h-4">
                  <span className="w-1 bg-cyan-400 rounded-t animate-[bounce_0.8s_infinite_100ms] h-full" />
                  <span className="w-1 bg-cyan-400 rounded-t animate-[bounce_0.8s_infinite_300ms] h-full" />
                  <span className="w-1 bg-cyan-400 rounded-t animate-[bounce_0.8s_infinite_200ms] h-full" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate group-hover/info:text-cyan-300 transition-colors">
              {currentSong.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentSong.artist} • <span className="font-mono text-[10px] text-cyan-400/80">{formatTime(currentTime)}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
            title={currentSong.isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
          >
            <Heart
              className={`w-4 h-4 ${
                currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          {/* Lyrics View */}
          <button
            onClick={onToggleLyrics}
            className="p-2 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Ver Letras (Lyrics)"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Skip Next */}
          <button
            onClick={onNext}
            className="p-2 text-slate-300 hover:text-white transition-colors active:scale-95"
            title="Siguiente canción"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Expand Full Player */}
          <button
            onClick={onOpenFullPlayer}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Expandir Reproductor Completo"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
