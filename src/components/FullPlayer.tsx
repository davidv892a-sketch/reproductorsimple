import React, { useState } from 'react';
import { Song, VisualizerMode } from '../types';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Sliders,
  Mic2,
  Clock,
  Gauge,
  Edit3,
  Eye,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatTime } from '../utils/lrcParser';
import { VisualizerCanvas } from './VisualizerCanvas';

interface FullPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playbackSpeed: number;
  analyser: AnalyserNode | null;
  visualizerMode: VisualizerMode;
  sleepTimerMinutes: number | null;
  volume: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenEqualizer: () => void;
  onOpenLyrics: () => void;
  onOpenSleepTimer: () => void;
  onOpenTagEditor: (song: Song) => void;
  onChangeSpeed: (speed: number) => void;
  onChangeVisualizerMode: (mode: VisualizerMode) => void;
  onChangeVolume: (vol: number) => void;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  playbackSpeed,
  analyser,
  visualizerMode,
  sleepTimerMinutes,
  volume,
  onClose,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onChangeVolume,
  onOpenEqualizer,
  onOpenLyrics,
  onOpenSleepTimer,
  onOpenTagEditor,
  onChangeSpeed,
  onChangeVisualizerMode,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentSong) return null;

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const visualizerModes: { id: VisualizerMode; label: string }[] = [
    { id: 'bars', label: 'Espectro 10B' },
    { id: 'waveform', label: 'Onda Fluid' },
    { id: 'circular', label: 'Anillo Radial' },
    { id: 'particles', label: 'Partículas' },
    { id: 'matrix', label: 'Matriz Grid' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto select-none backdrop-blur-2xl transition-all animate-in fade-in duration-300">
      {/* Background Ambient Blur from Album Art */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 filter blur-3xl scale-125">
        {currentSong.coverUrl ? (
          <img
            src={currentSong.coverUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-600 via-blue-900 to-slate-950" />
        )}
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 active:scale-95 transition-all"
          title="Minimizar reproductor"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
            Reproduciendo
          </p>
          <p className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
            {currentSong.album || 'Álbum Desconocido'}
          </p>
        </div>

        {/* Tag Editor Shortcut */}
        <button
          onClick={() => onOpenTagEditor(currentSong)}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 active:scale-95 transition-all"
          title="Editar ID3 Tags"
        >
          <Edit3 className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Center Section: Cover Art + Visualizer */}
      <div className="relative z-10 my-auto px-6 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Album Cover with Vinyl Glow */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group my-4">
          {currentSong.coverUrl ? (
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-100' : 'scale-95 grayscale-[30%]'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-cyan-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-2">🎵</span>
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                SoundWave Audio
              </span>
            </div>
          )}

          {/* Format Badge Overlay */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
            {currentSong.bitrate || '320 kbps'}
          </div>
        </div>

        {/* Visualizer Mode Selector & Canvas */}
        <div className="w-full h-24 mt-2 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 p-2 relative overflow-hidden flex flex-col justify-between">
          <VisualizerCanvas
            analyser={analyser}
            mode={visualizerMode}
            isPlaying={isPlaying}
          />

          <div className="absolute bottom-1.5 right-2 flex items-center space-x-1 z-10 bg-black/70 px-2 py-0.5 rounded-lg border border-white/10">
            <Eye className="w-3 h-3 text-cyan-400 mr-1" />
            {visualizerModes.map((v) => (
              <button
                key={v.id}
                onClick={() => onChangeVisualizerMode(v.id)}
                className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${
                  visualizerMode === v.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track Details */}
        <div className="w-full mt-4 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-white truncate tracking-tight">
            {currentSong.title}
          </h2>
          <p className="text-sm text-cyan-400/90 font-medium truncate mt-0.5">
            {currentSong.artist}
          </p>
          <div className="flex items-center justify-center space-x-2 mt-1 text-[11px] text-slate-400">
            <span>{currentSong.genre || 'MP3 Audio'}</span>
            <span>•</span>
            <span>{currentSong.year || '2025'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Seeker, Controls, Quick Tools */}
      <div className="relative z-10 px-6 pb-6 pt-2 max-w-md mx-auto w-full shrink-0">
        {/* Progress Seeker Slider */}
        <div className="w-full space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Playback Control Buttons */}
        <div className="flex items-center justify-between my-4">
          {/* Shuffle Toggle */}
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-full transition-all ${
              isShuffle
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Modo Aleatorio (Shuffle)"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            className="p-3 text-slate-200 hover:text-white active:scale-90 transition-all"
            title="Canción Anterior"
          >
            <SkipBack className="w-7 h-7 fill-slate-200" />
          </button>

          {/* Play / Pause Main Button */}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-3 text-slate-200 hover:text-white active:scale-90 transition-all"
            title="Siguiente Canción"
          >
            <SkipForward className="w-7 h-7 fill-slate-200" />
          </button>

          {/* Repeat Mode Toggle */}
          <button
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-full transition-all ${
              repeatMode !== 'off'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title={`Modo Repetir: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Secondary Utility Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-slate-400">
          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            className="p-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-rose-400 transition-colors"
            title="Favorito"
          >
            <Heart
              className={`w-5 h-5 ${
                currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          {/* Equalizer */}
          <button
            onClick={onOpenEqualizer}
            className="p-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-blue-400 transition-colors"
            title="Ecualizador"
          >
            <Sliders className="w-5 h-5" />
          </button>

          {/* Lyrics */}
          <button
            onClick={onOpenLyrics}
            className="p-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Letras (Lyrics)"
          >
            <Mic2 className="w-5 h-5" />
          </button>

          {/* Playback Speed Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-purple-400 transition-colors flex items-center space-x-1"
              title="Velocidad de reproducción"
            >
              <Gauge className="w-5 h-5" />
              <span className="text-[10px] font-mono font-bold">{playbackSpeed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-xl p-2 shadow-xl z-30 flex flex-col space-y-1 min-w-[90px]">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onChangeSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`text-xs py-1 px-2 rounded hover:bg-slate-800 text-center ${
                      playbackSpeed === s ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <button
            onClick={onOpenSleepTimer}
            className={`p-2 rounded-xl hover:bg-slate-900 transition-colors relative ${
              sleepTimerMinutes !== null
                ? 'text-amber-400 font-bold'
                : 'text-slate-300 hover:text-amber-300'
            }`}
            title="Temporizador de sueño"
          >
            <Clock className="w-5 h-5" />
            {sleepTimerMinutes !== null && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Volume control slider */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-emerald-400 transition-colors"
              title="Volumen"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {showVolumeSlider && (
              <div className="absolute bottom-12 right-0 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-xl z-30 flex items-center space-x-2 min-w-[140px]">
                <VolumeX className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
