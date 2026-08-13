import { LyricLine } from '../types';

/**
 * Parses LRC lyrics format string into sorted LyricLine array
 * Example format:
 * [00:12.34] Verse line text
 * [01:05.10] Chorus line text
 */
export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Reset regex index
    timeRegex.lastIndex = 0;
    const matches = Array.from(trimmed.matchAll(timeRegex));

    if (matches.length > 0) {
      // Remove time tags to extract clean text
      const cleanText = trimmed.replace(timeRegex, '').trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const msStr = match[3];
        const milliseconds = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);

        const totalTimeSeconds = minutes * 60 + seconds + milliseconds / 1000;

        result.push({
          time: totalTimeSeconds,
          text: cleanText || '♪',
        });
      }
    } else if (trimmed && !trimmed.startsWith('[')) {
      // Plain text lyric without timestamps
      result.push({
        time: 0,
        text: trimmed,
      });
    }
  }

  // Sort chronologically by time
  result.sort((a, b) => a.time - b.time);

  return result;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
