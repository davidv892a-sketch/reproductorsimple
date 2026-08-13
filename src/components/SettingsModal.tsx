import React from 'react';
import { ThemeMode } from '../types';
import { X, Smartphone, Palette, Sliders, Volume2, Sparkles, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  theme: ThemeMode;
  showAndroidFrame: boolean;
  crossfadeDuration: number;
  onSelectTheme: (mode: ThemeMode) => void;
  onToggleAndroidFrame: () => void;
  onChangeCrossfade: (seconds: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  showAndroidFrame,
  crossfadeDuration,
  onSelectTheme,
  onToggleAndroidFrame,
  onChangeCrossfade,
  onClose,
}) => {
  const themes: { id: ThemeMode; name: string; desc: string; icon: string }[] = [
    {
      id: 'amoled',
      name: 'Pure AMOLED Dark',
      desc: 'Negro puro #000000 para ahorro extremo de batería en pantallas OLED',
      icon: '🖤',
    },
    {
      id: 'material-you',
      name: 'Material You Dynamic',
      desc: 'Inspirado en Android 14/15 con acentos de color dinámicos',
      icon: '🎨',
    },
    {
      id: 'glassmorphism',
      name: 'Glassmorphism Cyberpunk',
      desc: 'Efectos traslúcidos con bordes de neón y fondo difuminado',
      icon: '✨',
    },
    {
      id: 'midnight',
      name: 'Midnight Deep Blue',
      desc: 'Azul nocturno profundo para reproducción en penumbra',
      icon: '🌌',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold">Ajustes & Personalización</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Frame Option */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold">Marco de Smartphone Android</h4>
              <p className="text-[10px] text-slate-400">
                Muestra la barra de estado con 5G, reloj y barra de gestos
              </p>
            </div>
          </div>
          <button
            onClick={onToggleAndroidFrame}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              showAndroidFrame ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                showAndroidFrame ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Theme Mode Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 mb-2 block">
            Tema Visual de la Aplicación:
          </label>
          <div className="space-y-2">
            {themes.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  theme === t.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-white font-semibold shadow-md'
                    : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold">{t.name}</h5>
                  <p className="text-[10px] text-slate-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crossfade Duration */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-200">Fundido Cruzado (Crossfade)</label>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {crossfadeDuration} Seg.
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={crossfadeDuration}
            onChange={(e) => onChangeCrossfade(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
        </div>

        {/* App Meta Info */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 text-center text-[10px] text-slate-500 font-mono space-y-1">
          <p className="font-bold text-slate-400">SoundWave MP3 Pro v4.8 PlayStore Edition</p>
          <p>Soporta Web Audio API • 10-Band EQ DSP • Sincronización LRC</p>
        </div>
      </div>
    </div>
  );
};
