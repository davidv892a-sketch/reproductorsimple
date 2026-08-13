import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types';

interface VisualizerCanvasProps {
  analyser: AnalyserNode | null;
  mode: VisualizerMode;
  isPlaying: boolean;
  className?: string;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  analyser,
  mode,
  isPlaying,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas properly
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 300;
      canvas.height = rect.height * window.devicePixelRatio || 150;
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    // Particle state for 'particles' mode
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * (canvas.width / (window.devicePixelRatio || 1)),
      y: Math.random() * (canvas.height / (window.devicePixelRatio || 1)),
      radius: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      hue: Math.random() * 360,
    }));

    // Peak dots for 'bars'
    const peakHeights = new Float32Array(64).fill(0);

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        if (mode === 'waveform') {
          analyser.getByteTimeDomainData(dataArray);
        } else {
          analyser.getByteFrequencyData(dataArray);
        }
      } else {
        // Subtle ambient movement when paused
        const time = Date.now() * 0.002;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(10, Math.sin(time + i * 0.2) * 20 + 20);
        }
      }

      if (mode === 'bars') {
        const barCount = 36;
        const barWidth = width / barCount - 3;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i] || 0;
          const barHeight = (val / 255) * (height - 10);

          if (barHeight > peakHeights[i]) {
            peakHeights[i] = barHeight;
          } else {
            peakHeights[i] = Math.max(0, peakHeights[i] - 1.5);
          }

          const x = i * (barWidth + 3);
          const y = height - barHeight;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#06b6d4'); // Cyan
          grad.addColorStop(0.5, '#3b82f6'); // Blue
          grad.addColorStop(1, '#a855f7'); // Purple

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Peak dot
          const peakY = height - peakHeights[i] - 4;
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x, Math.max(0, peakY), barWidth, 2);
        }

      } else if (mode === 'waveform') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#06b6d4';

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0; // 0..2
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06b6d4';
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else if (mode === 'circular') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.28;

        ctx.save();
        ctx.translate(centerX, centerY);

        const count = 48;
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
          const val = dataArray[i] || 0;
          const barLen = (val / 255) * 45;
          const angle = i * angleStep;

          const x1 = Math.cos(angle) * radius;
          const y1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle) * (radius + barLen);
          const y2 = Math.sin(angle) * (radius + barLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = `hsl(${(i * 7) % 360}, 90%, 60%)`;
          ctx.stroke();
        }

        // Pulse inner ring
        const avgVal = dataArray.reduce((acc, v) => acc + v, 0) / (dataArray.length || 1);
        const pulseRadius = radius + (avgVal / 255) * 12;

        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

      } else if (mode === 'particles') {
        const avgVal = dataArray.reduce((acc, v) => acc + v, 0) / (dataArray.length || 1);
        const energy = avgVal / 255;

        particles.forEach((p, idx) => {
          const freqVal = dataArray[idx % dataArray.length] || 10;
          const speedMultiplier = 1 + (freqVal / 255) * 3;

          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentRadius = p.radius + energy * 4;

          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 85%, 60%, ${0.5 + energy * 0.5})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `hsl(${p.hue}, 85%, 60%)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

      } else if (mode === 'matrix') {
        const cols = 24;
        const rows = 12;
        const colWidth = width / cols;
        const rowHeight = height / rows;

        for (let c = 0; c < cols; c++) {
          const val = dataArray[c] || 0;
          const activeRows = Math.floor((val / 255) * rows);

          for (let r = 0; r < rows; r++) {
            const x = c * colWidth + 2;
            const y = height - (r + 1) * rowHeight + 2;
            const isLit = r < activeRows;

            ctx.fillStyle = isLit
              ? r > rows - 3
                ? '#ef4444' // Red warning top
                : r > rows - 6
                ? '#f59e0b' // Yellow
                : '#10b981' // Green
              : 'rgba(255, 255, 255, 0.05)';

            ctx.fillRect(x, y, colWidth - 4, rowHeight - 4);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [analyser, mode, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
    />
  );
};
