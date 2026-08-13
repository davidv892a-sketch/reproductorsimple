import React, { useState } from 'react';
import { X, Clock, Check, Power } from 'lucide-react';

interface SleepTimerModalProps {
  currentMinutes: number | null;
  onSetTimer: (minutes: number | null) => void;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  currentMinutes,
  onSetTimer,
  onClose,
}) => {
  const [customVal, setCustomVal] = useState('20');

  const presets = [15, 30, 45, 60, 90];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-white shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Temporizador de Sueño</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Detiene la música automáticamente cuando expire el tiempo para ahorrar batería mientras duermes.
        </p>

        {/* Preset Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {presets.map((mins) => (
            <button
              key={mins}
              onClick={() => {
                onSetTimer(mins);
                onClose();
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                currentMinutes === mins
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-white/10 hover:bg-slate-800'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="pt-2">
          <label className="text-xs text-slate-400 font-semibold mb-1 block">
            Minutos Personalizados:
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              min={1}
              max={300}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => {
                const num = parseInt(customVal, 10);
                if (num > 0) {
                  onSetTimer(num);
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Activar
            </button>
          </div>
        </div>

        {/* Turn Off Timer */}
        {currentMinutes !== null && (
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onSetTimer(null);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/30"
            >
              <Power className="w-4 h-4" />
              <span>Desactivar Temporizador</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
