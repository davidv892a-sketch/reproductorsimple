import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Song, Playlist, EqualizerState, VisualizerMode, ThemeMode, ViewTab } from './types';
import { DEMO_TRACKS } from './data/demoTracks';
import { audioEngine, DEFAULT_EQ_BANDS } from './utils/audioEngine';
import { extractMp3Metadata } from './utils/id3Parser';

import { AndroidHeader } from './components/AndroidHeader';
import { AndroidNavBar } from './components/AndroidNavBar';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { LyricsView } from './components/LyricsView';
import { LibraryView } from './components/LibraryView';
import { PlaylistView } from './components/PlaylistView';
import { CarModeView } from './components/CarModeView';
import { TagEditorModal } from './components/TagEditorModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Songs & Playlists State
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('soundwave_mp3_songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved songs:', e);
      }
    }
    return DEMO_TRACKS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('soundwave_mp3_playlists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved playlists:', e);
      }
    }
    return [
      {
        id: 'pl-1',
        name: 'Mis Favoritos De Siempre',
        description: 'Pistas seleccionadas en alta fidelidad',
        songIds: ['demo-1', 'demo-3', 'demo-4'],
        createdAt: Date.now(),
      },
      {
        id: 'pl-2',
        name: 'Chill & Relax Night',
        description: 'Música para concentrarse y descansar',
        songIds: ['demo-2'],
        createdAt: Date.now() - 3600000,
      },
    ];
  });

  // Active Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(DEMO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Song[]>(DEMO_TRACKS);

  // Equalizer State
  const [eqState, setEqState] = useState<EqualizerState>(() => {
    const saved = localStorage.getItem('soundwave_mp3_eq');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      enabled: true,
      preset: 'Flat',
      bands: [...DEFAULT_EQ_BANDS.map(() => 0)],
      preamp: 0,
      bassBoost: 35,
      virtualizer: 20,
      volumeBooster: 100,
      reverbMode: 'off',
    };
  });

  // UI Views & Modals State
  const [activeTab, setActiveTab] = useState<ViewTab>('tracks');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFullPlayer, setShowFullPlayer] = useState<boolean>(false);
  const [showEqualizer, setShowEqualizer] = useState<boolean>(false);
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [showSleepTimer, setShowSleepTimer] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isCarMode, setIsCarMode] = useState<boolean>(false);

  // Appearance Settings
  const [theme, setTheme] = useState<ThemeMode>('amoled');
  const [showAndroidFrame, setShowAndroidFrame] = useState<boolean>(true);
  const [crossfadeDuration, setCrossfadeDuration] = useState<number>(0);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');

  // Sleep Timer Countdown
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // Audio HTML Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save songs & playlists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('soundwave_mp3_playlists', JSON.stringify(playlists));
    } catch (e) {}
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('soundwave_mp3_eq', JSON.stringify(eqState));
    } catch (e) {}
  }, [eqState]);

  // Audio Event Listeners Setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audioEngine.init(audio);

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => handleTrackEnd();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentSong, repeatMode, queue, isShuffle]);

  // Sync EQ updates to Audio Engine
  useEffect(() => {
    audioEngine.updateEqualizer(eqState);
  }, [eqState]);

  // Sync Volume & Playback Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [volume, playbackSpeed]);

  // Sleep Timer Countdown Effect
  useEffect(() => {
    if (sleepTimerMinutes === null) return;

    const interval = setInterval(() => {
      setSleepTimerMinutes((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handlePause();
          return null;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Handle Play Song
  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          audioEngine.ensureContextRunning();
        })
        .catch((err) => console.warn('Audio play error:', err));
    }

    // Increment play count
    setSongs((prev) =>
      prev.map((s) => (s.id === song.id ? { ...s, playCount: s.playCount + 1 } : s))
    );
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    audioEngine.ensureContextRunning();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src && currentSong) {
        audioRef.current.src = currentSong.url;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Audio play error:', err));
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (queue.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      handlePlaySong(queue[randomIndex]);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    handlePlaySong(queue[nextIndex]);
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    handlePlaySong(queue[prevIndex]);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one' && currentSong) {
      handlePlaySong(currentSong);
    } else {
      handleNext();
    }
  };

  const handleSeek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleToggleFavorite = (songId: string) => {
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id === songId) {
          const updated = { ...s, isFavorite: !s.isFavorite };
          if (updated.isFavorite) {
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
          }
          return updated;
        }
        return s;
      })
    );
    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Import User Local MP3 Files
  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImportedSongs: Song[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
        continue;
      }

      const blobUrl = URL.createObjectURL(file);
      const meta = await extractMp3Metadata(file);

      const song: Song = {
        id: `user-${Date.now()}-${i}`,
        title: meta.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: meta.artist || 'Artista Desconocido',
        album: meta.album || 'Música Importada',
        genre: meta.genre || 'MP3 Audio',
        duration: 180, // Updated when audio metadata loads
        url: blobUrl,
        coverUrl: meta.coverUrl,
        year: meta.year || 2025,
        playCount: 0,
        isFavorite: false,
        addedAt: Date.now(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        format: 'MP3 Audio',
        bitrate: '320 kbps',
      };

      newImportedSongs.push(song);
    }

    if (newImportedSongs.length > 0) {
      setSongs((prev) => [...newImportedSongs, ...prev]);
      setQueue((prev) => [...newImportedSongs, ...prev]);
      handlePlaySong(newImportedSongs[0]);

      confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
    }
  };

  // Create Playlist
  const handleCreatePlaylist = (name: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      songIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [newPl, ...prev]);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    const plSongs = songs.filter((s) => playlist.songIds.includes(s.id));
    if (plSongs.length > 0) {
      setQueue(plSongs);
      handlePlaySong(plSongs[0]);
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    if (playlists.length === 0) {
      handleCreatePlaylist('Mi Playlist #1');
    }
    const targetPl = playlists[0];
    if (!targetPl.songIds.includes(song.id)) {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === targetPl.id ? { ...p, songIds: [...p.songIds, song.id] } : p
        )
      );
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleSaveTags = (updated: Song) => {
    setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (currentSong?.id === updated.id) {
      setCurrentSong(updated);
    }
  };

  const handleSaveLyrics = (songId: string, lyricsText: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, lyrics: lyricsText } : s))
    );
    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, lyrics: lyricsText } : null));
    }
  };

  const handleDeleteSong = (songId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    setQueue((prev) => prev.filter((s) => s.id !== songId));
  };

  const favoritesCount = songs.filter((s) => s.isFavorite).length;

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center p-0 sm:p-4 font-sans transition-colors duration-300 ${
        theme === 'amoled'
          ? 'bg-black text-white'
          : theme === 'midnight'
          ? 'bg-slate-950 text-white'
          : theme === 'glassmorphism'
          ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white'
          : 'bg-slate-900 text-white'
      }`}
    >
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />

      {/* Main Container / Smartphone Shell Frame */}
      <div
        className={`w-full max-w-md h-full sm:h-[840px] flex flex-col justify-between overflow-hidden relative shadow-2xl transition-all ${
          showAndroidFrame
            ? 'sm:rounded-[40px] border-0 sm:border-[8px] border-slate-800 ring-1 ring-white/10'
            : 'rounded-none border-0'
        } ${
          theme === 'amoled'
            ? 'bg-black'
            : theme === 'midnight'
            ? 'bg-slate-950'
            : 'bg-slate-900/95 backdrop-blur-xl'
        }`}
      >
        {/* Android Top Header */}
        <AndroidHeader
          showAndroidFrame={showAndroidFrame}
          activeView={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenEqualizer={() => setShowEqualizer(true)}
          onOpenSettings={() => setShowSettings(true)}
          onToggleCarMode={() => setIsCarMode(!isCarMode)}
          onImportFiles={handleImportFiles}
          isCarMode={isCarMode}
        />

        {/* Dynamic Main View Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'playlists' ? (
            <PlaylistView
              playlists={playlists}
              queue={queue}
              allSongs={songs}
              currentSong={currentSong}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onPlayPlaylist={handlePlayPlaylist}
              onRemoveFromQueue={(idx) =>
                setQueue((prev) => prev.filter((_, i) => i !== idx))
              }
              onReorderQueue={(from, to) => {
                const updated = [...queue];
                const [moved] = updated.splice(from, 1);
                updated.splice(to, 0, moved);
                setQueue(updated);
              }}
              onPlaySong={handlePlaySong}
            />
          ) : (
            <LibraryView
              activeTab={activeTab}
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              searchQuery={searchQuery}
              onPlaySong={handlePlaySong}
              onToggleFavorite={handleToggleFavorite}
              onOpenTagEditor={(s) => setEditingSong(s)}
              onDeleteSong={handleDeleteSong}
              onAddToPlaylist={handleAddToPlaylist}
            />
          )}
        </main>

        {/* Persistent Mini Player */}
        <MiniPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onOpenFullPlayer={() => setShowFullPlayer(true)}
          onToggleFavorite={handleToggleFavorite}
          onToggleLyrics={() => setShowLyrics(true)}
        />

        {/* Android Navigation Tabs */}
        <AndroidNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          showAndroidFrame={showAndroidFrame}
          favoritesCount={favoritesCount}
        />
      </div>

      {/* MODALS & OVERLAYS */}
      {/* 1. Full Player View Overlay */}
      {showFullPlayer && (
        <FullPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          playbackSpeed={playbackSpeed}
          analyser={audioEngine.getAnalyser()}
          visualizerMode={visualizerMode}
          sleepTimerMinutes={sleepTimerMinutes}
          volume={volume}
          onClose={() => setShowFullPlayer(false)}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSeek={handleSeek}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          onToggleRepeat={() =>
            setRepeatMode(
              repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'
            )
          }
          onToggleFavorite={handleToggleFavorite}
          onChangeVolume={setVolume}
          onOpenEqualizer={() => setShowEqualizer(true)}
          onOpenLyrics={() => setShowLyrics(true)}
          onOpenSleepTimer={() => setShowSleepTimer(true)}
          onOpenTagEditor={(s) => setEditingSong(s)}
          onChangeSpeed={setPlaybackSpeed}
          onChangeVisualizerMode={setVisualizerMode}
        />
      )}

      {/* 2. 10-Band Equalizer Modal */}
      {showEqualizer && (
        <EqualizerModal
          eqState={eqState}
          onUpdateState={setEqState}
          onClose={() => setShowEqualizer(false)}
        />
      )}

      {/* 3. Lyrics View Modal */}
      {showLyrics && (
        <LyricsView
          currentSong={currentSong}
          currentTime={currentTime}
          onSeek={handleSeek}
          onSaveLyrics={handleSaveLyrics}
          onClose={() => setShowLyrics(false)}
        />
      )}

      {/* 4. Car Mode View */}
      {isCarMode && (
        <CarModeView
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onToggleFavorite={handleToggleFavorite}
          onExitCarMode={() => setIsCarMode(false)}
        />
      )}

      {/* 5. ID3 Tag Editor Modal */}
      {editingSong && (
        <TagEditorModal
          song={editingSong}
          onSaveTags={handleSaveTags}
          onClose={() => setEditingSong(null)}
        />
      )}

      {/* 6. Sleep Timer Modal */}
      {showSleepTimer && (
        <SleepTimerModal
          currentMinutes={sleepTimerMinutes}
          onSetTimer={setSleepTimerMinutes}
          onClose={() => setShowSleepTimer(false)}
        />
      )}

      {/* 7. Settings Modal */}
      {showSettings && (
        <SettingsModal
          theme={theme}
          showAndroidFrame={showAndroidFrame}
          crossfadeDuration={crossfadeDuration}
          onSelectTheme={setTheme}
          onToggleAndroidFrame={() => setShowAndroidFrame(!showAndroidFrame)}
          onChangeCrossfade={setCrossfadeDuration}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
