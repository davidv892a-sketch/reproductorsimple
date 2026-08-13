export interface ExtractedMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  coverUrl?: string;
}

/**
 * Basic browser-side ID3v2 tag parser for MP3 files
 */
export async function extractMp3Metadata(file: File): Promise<ExtractedMetadata> {
  return new Promise((resolve) => {
    const metadata: ExtractedMetadata = {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Artista Desconocido',
      album: 'Álbum Desconocido',
      genre: 'MP3 Audio',
    };

    const reader = new FileReader();
    // Read first 128KB which usually contains ID3v2 headers
    const slice = file.slice(0, 128 * 1024);

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength < 10) {
          resolve(metadata);
          return;
        }

        const view = new DataView(buffer);

        // Check for 'ID3' magic bytes
        if (
          view.getUint8(0) === 0x49 &&
          view.getUint8(1) === 0x44 &&
          view.getUint8(2) === 0x33
        ) {
          const majorVersion = view.getUint8(3);
          const flags = view.getUint8(5);
          // Synchsafe integer size
          const size =
            (view.getUint8(6) & 0x7f) << 21 |
            (view.getUint8(7) & 0x7f) << 14 |
            (view.getUint8(8) & 0x7f) << 7 |
            (view.getUint8(9) & 0x7f);

          let offset = 10;
          if ((flags & 0x40) !== 0) {
            // Extended header present
            const extSize =
              (view.getUint8(10) & 0x7f) << 21 |
              (view.getUint8(11) & 0x7f) << 14 |
              (view.getUint8(12) & 0x7f) << 7 |
              (view.getUint8(13) & 0x7f);
            offset += extSize;
          }

          const limit = Math.min(buffer.byteLength, offset + size);

          while (offset < limit - 10) {
            let frameID = '';
            for (let i = 0; i < 4; i++) {
              frameID += String.fromCharCode(view.getUint8(offset + i));
            }

            if (!frameID.match(/^[A-Z0-9]{4}$/)) break;

            let frameSize = 0;
            if (majorVersion === 4) {
              frameSize =
                (view.getUint8(offset + 4) & 0x7f) << 21 |
                (view.getUint8(offset + 5) & 0x7f) << 14 |
                (view.getUint8(offset + 6) & 0x7f) << 7 |
                (view.getUint8(offset + 7) & 0x7f);
            } else {
              frameSize = view.getUint32(offset + 4, false);
            }

            if (frameSize <= 0 || offset + 10 + frameSize > limit) break;

            const frameDataOffset = offset + 10;

            // Extract text frame
            if (frameID === 'TIT2') {
              metadata.title = decodeTextFrame(view, frameDataOffset, frameSize);
            } else if (frameID === 'TPE1') {
              metadata.artist = decodeTextFrame(view, frameDataOffset, frameSize);
            } else if (frameID === 'TALB') {
              metadata.album = decodeTextFrame(view, frameDataOffset, frameSize);
            } else if (frameID === 'TCON') {
              metadata.genre = decodeTextFrame(view, frameDataOffset, frameSize);
            } else if (frameID === 'TYER' || frameID === 'TDRC') {
              const yr = parseInt(decodeTextFrame(view, frameDataOffset, frameSize), 10);
              if (!isNaN(yr)) metadata.year = yr;
            } else if (frameID === 'APIC') {
              // Attached Picture / Cover Art
              try {
                const coverBlobUrl = extractApicPicture(buffer, frameDataOffset, frameSize);
                if (coverBlobUrl) {
                  metadata.coverUrl = coverBlobUrl;
                }
              } catch (err) {
                console.warn('Cover extraction error', err);
              }
            }

            offset += 10 + frameSize;
          }
        }
      } catch (err) {
        console.warn('Error reading ID3 tags:', err);
      }
      resolve(metadata);
    };

    reader.onerror = () => resolve(metadata);
    reader.readAsArrayBuffer(slice);
  });
}

function decodeTextFrame(view: DataView, offset: number, length: number): string {
  if (length <= 1) return '';
  const encoding = view.getUint8(offset);
  const bytes = new Uint8Array(view.buffer, offset + 1, length - 1);

  if (encoding === 0) {
    // ISO-8859-1
    return String.fromCharCode.apply(null, Array.from(bytes)).replace(/\0/g, '').trim();
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16
    const decoder = new TextDecoder('utf-16');
    return decoder.decode(bytes).replace(/\0/g, '').trim();
  } else if (encoding === 3) {
    // UTF-8
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes).replace(/\0/g, '').trim();
  }

  return String.fromCharCode.apply(null, Array.from(bytes)).replace(/\0/g, '').trim();
}

function extractApicPicture(buffer: ArrayBuffer, offset: number, length: number): string | null {
  const view = new DataView(buffer, offset, length);
  const encoding = view.getUint8(0);
  let pos = 1;

  // Find MIME type string
  let mimeType = '';
  while (pos < length && view.getUint8(pos) !== 0) {
    mimeType += String.fromCharCode(view.getUint8(pos));
    pos++;
  }
  pos++; // skip null byte

  if (!mimeType || mimeType === 'image/') mimeType = 'image/jpeg';

  // Skip picture type byte
  pos++;

  // Skip description string
  if (encoding === 1 || encoding === 2) {
    while (pos < length - 1 && !(view.getUint8(pos) === 0 && view.getUint8(pos + 1) === 0)) {
      pos += 2;
    }
    pos += 2;
  } else {
    while (pos < length && view.getUint8(pos) !== 0) {
      pos++;
    }
    pos++;
  }

  if (pos >= length) return null;

  const imgData = new Uint8Array(buffer, offset + pos, length - pos);
  const blob = new Blob([imgData], { type: mimeType });
  return URL.createObjectURL(blob);
}
