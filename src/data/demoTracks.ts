import { Song } from '../types';

/**
 * Creates synthetic WAV Data URI for demo music tracks
 * Produces clean, rich electronic melodic chiptune / synth soundscapes
 */
function generateSynthAudioDataUri(type: 'cyberpunk' | 'chillwave' | 'acoustic' | 'edm'): string {
  const sampleRate = 22050;
  const durationSec = 45;
  const totalSamples = sampleRate * durationSec;
  const buffer = new Int16Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (type === 'cyberpunk') {
      // Bass synth + arpeggio
      const bassFreq = 55 * (1 + Math.floor(t * 2) % 4 === 3 ? 1.25 : 1);
      const arpFreqs = [220, 277.18, 329.63, 440, 554.37, 659.25];
      const arpFreq = arpFreqs[Math.floor(t * 8) % arpFreqs.length];

      const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.4;
      const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.25;
      const beat = (Math.floor(t * 4) % 2 === 0) ? Math.exp(-15 * (t % 0.25)) * 0.3 : 0;
      sample = (bass + arp + beat) * 0.8;

    } else if (type === 'chillwave') {
      // Warm chords + ambient pad
      const chord1 = Math.sin(2 * Math.PI * 261.63 * t) + Math.sin(2 * Math.PI * 329.63 * t) + Math.sin(2 * Math.PI * 392.00 * t);
      const chord2 = Math.sin(2 * Math.PI * 220.00 * t) + Math.sin(2 * Math.PI * 261.63 * t) + Math.sin(2 * Math.PI * 329.63 * t);
      const activeChord = (Math.floor(t / 2) % 2 === 0) ? chord1 : chord2;
      const pulse = Math.sin(2 * Math.PI * 0.5 * t) * 0.5 + 0.5;
      sample = (activeChord * 0.15 * pulse);

    } else if (type === 'acoustic') {
      // Plucked string acoustic feel
      const noteFreqs = [196, 246.94, 293.66, 392, 440];
      const note = noteFreqs[Math.floor(t * 3) % noteFreqs.length];
      const decay = Math.exp(-5 * (t % 0.333));
      sample = Math.sin(2 * Math.PI * note * t) * decay * 0.35;

    } else {
      // EDM beat
      const kick = Math.sin(2 * Math.PI * (120 * Math.exp(-20 * (t % 0.5))) * t) * (t % 0.5 < 0.2 ? 1 : 0) * 0.5;
      const hihat = (Math.random() * 2 - 1) * Math.exp(-30 * ((t + 0.25) % 0.5)) * 0.15;
      const synth = Math.sin(2 * Math.PI * (440 * (1 + (Math.floor(t * 4) % 3) * 0.25)) * t) * 0.2;
      sample = kick + hihat + synth;
    }

    // Clamp
    sample = Math.max(-1, Math.min(1, sample));
    buffer[i] = Math.floor(sample * 32767);
  }

  // Build WAV header
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + buffer.byteLength, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint32(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, buffer.byteLength, true);

  const blob = new Blob([wavHeader, buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Generate cover SVG Data URIs
function generateCoverSvg(bg1: string, bg2: string, iconText: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#g)"/>
    <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
    <circle cx="150" cy="150" r="50" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4"/>
    <text x="150" y="160" font-family="sans-serif" font-size="42" font-weight="bold" fill="#ffffff" text-anchor="middle">${iconText}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_TRACKS: Song[] = [
  {
    id: 'demo-1',
    title: 'Neon Horizon (Cyberpunk Remix)',
    artist: 'Synthwave Pro',
    album: 'Future City Nights',
    genre: 'Synthwave / Cyberpunk',
    duration: 45,
    url: generateSynthAudioDataUri('cyberpunk'),
    coverUrl: generateCoverSvg('#111827', '#06b6d4', '⚡'),
    lyrics: `[00:00.00] ♪ (Intro de Sintetizador Neón) ♪
[00:04.00] Luces de neón parpadean en la ciudad
[00:08.50] La autopista nocturna brilla sin parar
[00:13.00] Ritmo cibernético en la frecuencia
[00:17.50] Siente los bajos resonar en la distancia
[00:22.00] (Sintetizador Arpegiado Pro)
[00:26.50] Viajando a través del horizonte digital
[00:31.00] Ecualizador a máxima potencia
[00:35.50] Reproductor MP3 en control total
[00:40.00] El futuro del sonido ha llegado hoy`,
    format: 'WAV 16-bit',
    bitrate: '320 kbps',
    fileSize: '1.9 MB',
    year: 2025,
    playCount: 142,
    isFavorite: true,
    addedAt: Date.now() - 86400000 * 5,
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'Midnight Chillout (Lo-Fi Beats)',
    artist: 'Acoustic Dreams',
    album: 'Sunset Serenade',
    genre: 'Lo-Fi / Chill',
    duration: 45,
    url: generateSynthAudioDataUri('chillwave'),
    coverUrl: generateCoverSvg('#4c1d95', '#ec4899', '🌙'),
    lyrics: `[00:00.00] ♪ (Sonido de vinilo y acordes suaves) ♪
[00:05.00] Noche serena contemplando la luna
[00:10.00] La brisa nocturna trae la calma
[00:15.00] Melodía suave que alimenta el alma
[00:20.00] Un momento de paz en la penumbra
[00:25.00] ♪ (Solo de piano y ambiente) ♪
[00:32.00] Descansa tus sentidos con el mejor sonido
[00:38.00] Reforzador de bajos en armonía pura`,
    format: 'WAV 16-bit',
    bitrate: '320 kbps',
    fileSize: '1.9 MB',
    year: 2025,
    playCount: 98,
    isFavorite: false,
    addedAt: Date.now() - 86400000 * 3,
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'Acoustic Sunset Walk',
    artist: 'Luna & The Strings',
    album: 'Unplugged Sessions',
    genre: 'Acoustic / Folk',
    duration: 45,
    url: generateSynthAudioDataUri('acoustic'),
    coverUrl: generateCoverSvg('#78350f', '#f59e0b', '🎸'),
    lyrics: `[00:00.00] ♪ (Punteo de guitarra acústica) ♪
[00:06.00] Caminando por el sendero dorado
[00:12.00] Acordes de madera y aire fresco
[00:18.00] Cada nota resuena en alta fidelidad
[00:24.00] Simplicidad y pureza acústica
[00:30.00] ♪ (Arpegios suaves) ♪
[00:38.00] El atardecer pinta el cielo de oro`,
    format: 'WAV 16-bit',
    bitrate: '320 kbps',
    fileSize: '1.9 MB',
    year: 2024,
    playCount: 215,
    isFavorite: true,
    addedAt: Date.now() - 86400000 * 10,
    isDemo: true,
  },
  {
    id: 'demo-4',
    title: 'Bass Drop Overdrive (EDM Mainstage)',
    artist: 'DJ Pulse X',
    album: 'Ultra Bass 2026',
    genre: 'Electronic / EDM',
    duration: 45,
    url: generateSynthAudioDataUri('edm'),
    coverUrl: generateCoverSvg('#064e3b', '#10b981', '🔥'),
    lyrics: `[00:00.00] 3... 2... 1... ¡Siente el Bass Drop!
[00:04.00] 💥 (Explosión de graves de 10 bandas) 💥
[00:09.00] Ecualizador ajustado al máximo
[00:14.00] La multitud salta sin parar
[00:19.00] Frecuencias ultra bajas resonando
[00:24.00] Modo Turbo Bass Boost Activado
[00:29.00] 🔊 ¡Poder de audio profesional! 🔊
[00:36.00] Luces de espectro parpadeando`,
    format: 'WAV 16-bit',
    bitrate: '320 kbps',
    fileSize: '1.9 MB',
    year: 2026,
    playCount: 310,
    isFavorite: true,
    addedAt: Date.now() - 86400000 * 2,
    isDemo: true,
  },
];
