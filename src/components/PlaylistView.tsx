import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  X,
  Shuffle,
  Music,
  Check,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { formatTime } from '../utils/lrcParser';

interface PlaylistViewProps {
  playlists: Playlist[];
  queue: Song[];
  allSongs: Song[];
  currentSong: Song | null;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onRemoveFromQueue: (index: number) => void;
  onReorderQueue: (fromIndex: number, toIndex: number) => void;
  onPlaySong: (song: Song) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlists,
  queue,
  allSongs,
  currentSong,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayPlaylist,
  onRemoveFromQueue,
  onReorderQueue,
  onPlaySong,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeTab, setActiveTab] = useState<'playlists' | 'queue'>('playlists');

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 select-none">
      {/* Sub-Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playlists'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mis Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'queue'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cola de Reproducción ({queue.length})
          </button>
        </div>

        {activeTab === 'playlists' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Playlist</span>
          </button>
        )}
      </div>

      {/* PLAYLISTS LIST */}
      {activeTab === 'playlists' && (
        <div className="space-y-3">
          {playlists.map((pl) => {
            const playlistSongs = allSongs.filter((s) => pl.songIds.includes(s.id));
            return (
              <div
                key={pl.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between hover:bg-slate-800/80 transition-all group"
              >
                <div
                  onClick={() => onPlayPlaylist(pl)}
                  className="flex items-center space-x-3.5 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-800 flex items-center justify-center text-white shrink-0 shadow-md">
                    <ListMusic className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      {pl.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {playlistSongs.length} canción(es)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPlayPlaylist(pl)}
                    className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:scale-105 active:scale-95 transition-all"
                    title="Reproducir Playlist"
                  >
                    <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                  </button>

                  <button
                    onClick={() => onDeletePlaylist(pl.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Eliminar Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUEUE MANAGER LIST */}
      {activeTab === 'queue' && (
        <div className="space-y-2">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs">La cola de reproducción está vacía.</p>
            </div>
          ) : (
            queue.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;

              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/15 border-cyan-500/30'
                      : 'bg-slate-900/40 border-white/5'
                  }`}
                >
                  <div
                    onClick={() => onPlaySong(song)}
                    className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-xs font-mono text-slate-500 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isCurrent ? 'text-cyan-300' : 'text-slate-100'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => onReorderQueue(idx, idx - 1)}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === queue.length - 1}
                      onClick={() => onReorderQueue(idx, idx + 1)}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveFromQueue(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-white shadow-2xl">
            <h3 className="text-base font-bold mb-3">Crear Nueva Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nombre de la playlist..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-cyan-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
