export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // in seconds
  url: string; // Blob URL or audio link
  coverUrl?: string;
  lyrics?: string; // LRC formatted string or plain text
  format?: string;
  bitrate?: string;
  fileSize?: string;
  year?: number;
  playCount: number;
  isFavorite: boolean;
  addedAt: number;
  isDemo?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songIds: string[];
  createdAt: number;
}

export type VisualizerMode = 'bars' | 'waveform' | 'circular' | 'particles' | 'matrix';

export type ThemeMode = 'amoled' | 'material-you' | 'glassmorphism' | 'midnight';

export type ViewTab = 'tracks' | 'albums' | 'artists' | 'genres' | 'playlists' | 'folders' | 'favorites';

export interface EqualizerState {
  enabled: boolean;
  preset: string;
  // 10 bands gains in dB (-12 to +12)
  // Frequencies: 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000
  bands: number[];
  preamp: number; // dB (-12 to +12)
  bassBoost: number; // 0 to 100%
  virtualizer: number; // 0 to 100% (Stereo 3D width)
  volumeBooster: number; // 100% to 200%
  reverbMode: 'off' | 'room' | 'hall' | 'club' | 'studio';
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface AudioStats {
  sampleRate: number;
  channels: number;
  bitrate: string;
  format: string;
}
