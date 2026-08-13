import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { parseLrc, formatTime } from '../utils/lrcParser';
import { X, Mic2, Edit2, Check, Copy } from 'lucide-react';

interface LyricsViewProps {
  currentSong: Song | null;
  currentTime: number;
  onSeek: (time: number) => void;
  onSaveLyrics: (songId: string, lyrics: string) => void;
  onClose: () => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  currentSong,
  currentTime,
  onSeek,
  onSaveLyrics,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState('');
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSong) {
      setEditedLyrics(currentSong.lyrics || '');
    }
  }, [currentSong]);

  if (!currentSong) return null;

  const parsedLyrics = parseLrc(currentSong.lyrics || '');

  // Determine current active lyric index based on audio time
  let activeIndex = -1;
  for (let i = 0; i < parsedLyrics.length; i++) {
    if (currentTime >= parsedLyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth scroll to active lyric line
  useEffect(() => {
    if (activeLineRef.current && !isEditing) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isEditing]);

  const handleSave = () => {
    onSaveLyrics(currentSong.id, editedLyrics);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between text-white select-none animate-in fade-in duration-300">
      {/* Background Cover Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15 filter blur-3xl">
        {currentSong.coverUrl && (
          <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Mic2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{currentSong.title}</h3>
            <p className="text-xs text-slate-400 truncate">{currentSong.artist} • Letras Sincronizadas</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10 flex items-center gap-1.5 text-xs font-medium"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/30"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-start text-center">
        {isEditing ? (
          <div className="w-full max-w-xl h-full flex flex-col space-y-3 my-auto">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Formato LRC recomendado: [00:12.34] Texto de la letra</span>
              <span className="font-mono text-[11px] text-cyan-400">Pega tu letra LRC aquí</span>
            </div>
            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              placeholder="Escribe o pega las letras sincronizadas en formato LRC aquí..."
              className="w-full flex-1 p-4 rounded-2xl bg-slate-900 border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>
        ) : parsedLyrics.length > 0 ? (
          <div className="w-full max-w-lg my-auto py-12 space-y-6">
            {parsedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`cursor-pointer transition-all duration-300 py-1.5 px-4 rounded-2xl ${
                    isActive
                      ? 'text-lg sm:text-2xl font-black text-cyan-300 scale-105 bg-cyan-500/10 border border-cyan-500/20 shadow-xl shadow-cyan-500/10'
                      : isPast
                      ? 'text-xs sm:text-sm text-slate-500 font-medium'
                      : 'text-sm sm:text-base text-slate-300 font-medium hover:text-white'
                  }`}
                >
                  <p className="leading-snug">{line.text}</p>
                  {isActive && (
                    <span className="text-[10px] font-mono text-cyan-400/80 block mt-1 font-normal">
                      ▶ {formatTime(line.time)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
              <Mic2 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Sin letras disponibles</h4>
              <p className="text-xs text-slate-400 mt-1">
                Añade letras sincronizadas (.lrc) o texto plano haciendo clic en el botón Editar.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              + Agregar Letra
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 px-6 py-3 border-t border-white/10 text-center text-xs text-slate-500 font-mono shrink-0">
        Haz clic en cualquier verso para saltar a ese momento de la canción
      </div>
    </div>
  );
};
