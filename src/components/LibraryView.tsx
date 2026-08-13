import React from 'react';
import { Song, ViewTab } from '../types';
import {
  Play,
  Heart,
  MoreVertical,
  Music,
  Disc3,
  User,
  Radio,
  Folder,
  Clock,
  Plus,
  Sparkles,
  Edit3,
  Trash2,
  ListPlus,
} from 'lucide-react';
import { formatTime } from '../utils/lrcParser';

interface LibraryViewProps {
  activeTab: ViewTab;
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  searchQuery: string;
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onOpenTagEditor: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  onAddToPlaylist: (song: Song) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  activeTab,
  songs,
  currentSong,
  isPlaying,
  searchQuery,
  onPlaySong,
  onToggleFavorite,
  onOpenTagEditor,
  onDeleteSong,
  onAddToPlaylist,
}) => {
  const [activeMenuSongId, setActiveMenuSongId] = React.useState<string | null>(null);

  // Filter songs based on search query
  const filteredSongs = songs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
    );
  });

  // Groupings
  const albumsMap = new Map<string, Song[]>();
  const artistsMap = new Map<string, Song[]>();
  const genresMap = new Map<string, Song[]>();

  songs.forEach((s) => {
    const alb = s.album || 'Álbum Desconocido';
    if (!albumsMap.has(alb)) albumsMap.set(alb, []);
    albumsMap.get(alb)!.push(s);

    const art = s.artist || 'Artista Desconocido';
    if (!artistsMap.has(art)) artistsMap.set(art, []);
    artistsMap.get(art)!.push(s);

    const g = s.genre || 'Varios';
    if (!genresMap.has(g)) genresMap.set(g, []);
    genresMap.get(g)!.push(s);
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 select-none">
      {/* 1. CANCIONES (TRACKS LIST) */}
      {(activeTab === 'tracks' || activeTab === 'favorites') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs text-slate-400">
            <span>
              {activeTab === 'favorites' ? 'Canciones Favoritas' : 'Todas las Canciones'}{' '}
              ({activeTab === 'favorites' ? songs.filter((s) => s.isFavorite).length : filteredSongs.length})
            </span>
            <span className="font-mono">Título / Artista</span>
          </div>

          {(activeTab === 'favorites'
            ? filteredSongs.filter((s) => s.isFavorite)
            : filteredSongs
          ).map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition-all group relative border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/5'
                }`}
              >
                {/* Track Left Info */}
                <div
                  onClick={() => onPlaySong(song)}
                  className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                >
                  <span className="text-xs font-mono text-slate-500 w-5 text-center shrink-0">
                    {isCurrent && isPlaying ? (
                      <span className="text-cyan-400 font-bold animate-pulse">▶</span>
                    ) : (
                      idx + 1
                    )}
                  </span>

                  {/* Album Cover Thumbnail */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm">
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                        MP3
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-cyan-300' : 'text-slate-100'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {song.artist} • <span className="text-slate-500">{song.album}</span>
                    </p>
                  </div>
                </div>

                {/* Track Right Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                    {formatTime(song.duration)}
                  </span>

                  {/* Favorite Button */}
                  <button
                    onClick={() => onToggleFavorite(song.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        song.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>

                  {/* Options Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuSongId(
                          activeMenuSongId === song.id ? null : song.id
                        )
                      }
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuSongId === song.id && (
                      <div className="absolute right-0 top-8 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl z-30 min-w-[160px] space-y-1">
                        <button
                          onClick={() => {
                            onAddToPlaylist(song);
                            setActiveMenuSongId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                        >
                          <ListPlus className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Añadir a Playlist</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenTagEditor(song);
                            setActiveMenuSongId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Editar ID3 Tags</span>
                        </button>

                        {!song.isDemo && (
                          <button
                            onClick={() => {
                              onDeleteSong(song.id);
                              setActiveMenuSongId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/20 rounded-xl flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. ÁLBUMES (ALBUMS GRID) */}
      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from(albumsMap.entries()).map(([albumName, albumSongs]) => {
            const firstSong = albumSongs[0];
            return (
              <div
                key={albumName}
                onClick={() => onPlaySong(firstSong)}
                className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 border border-white/10">
                  {firstSong.coverUrl ? (
                    <img
                      src={firstSong.coverUrl}
                      alt={albumName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <Disc3 className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                    {albumName}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {firstSong.artist} • {albumSongs.length} canción(es)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. ARTISTAS (ARTISTS GRID) */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from(artistsMap.entries()).map(([artistName, artistSongs]) => {
            const firstSong = artistSongs[0];
            return (
              <div
                key={artistName}
                onClick={() => onPlaySong(firstSong)}
                className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-cyan-500/30 shadow-lg">
                  {firstSong.coverUrl ? (
                    <img
                      src={firstSong.coverUrl}
                      alt={artistName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white truncate w-full group-hover:text-cyan-300">
                  {artistName}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {artistSongs.length} canción(es)
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. GÉNEROS (GENRES GRID) */}
      {activeTab === 'genres' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from(genresMap.entries()).map(([genreName, genreSongs], idx) => {
            const gradients = [
              'from-cyan-600 to-blue-800',
              'from-purple-600 to-pink-800',
              'from-amber-600 to-red-800',
              'from-emerald-600 to-teal-800',
            ];
            const bgGrad = gradients[idx % gradients.length];

            return (
              <div
                key={genreName}
                onClick={() => onPlaySong(genreSongs[0])}
                className={`p-4 rounded-2xl bg-gradient-to-br ${bgGrad} border border-white/10 cursor-pointer hover:scale-105 transition-all shadow-lg flex flex-col justify-between h-28 relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/80">
                    Género Musical
                  </span>
                  <h4 className="text-sm font-black text-white mt-1">{genreName}</h4>
                </div>

                <p className="text-[11px] text-white/90 font-medium relative z-10">
                  {genreSongs.length} pistas
                </p>

                <Radio className="w-16 h-16 absolute -bottom-3 -right-3 text-white/10 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}

      {/* 5. CARPETAS (FOLDERS EXPLORER) */}
      {activeTab === 'folders' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Folder className="w-6 h-6 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Almacenamiento Interno / Music</h4>
                <p className="text-[11px] text-slate-400">
                  {songs.length} archivo(s) de audio detectados
                </p>
              </div>
            </div>
          </div>

          {songs.map((song) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song)}
              className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Music className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{song.title}.mp3</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {song.fileSize || '1.9 MB'} • {song.format || 'MP3 Audio'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatTime(song.duration)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
