import React from 'react';
import { EqualizerState } from '../types';
import { DEFAULT_EQ_BANDS, EQ_PRESETS } from '../utils/audioEngine';
import { X, Sliders, Volume2, Sparkles, Disc, Radio } from 'lucide-react';

interface EqualizerModalProps {
  eqState: EqualizerState;
  onUpdateState: (newState: EqualizerState) => void;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  eqState,
  onUpdateState,
  onClose,
}) => {
  const handleToggleEnabled = () => {
    onUpdateState({ ...eqState, enabled: !eqState.enabled });
  };

  const handleSelectPreset = (presetName: string) => {
    if (EQ_PRESETS[presetName]) {
      onUpdateState({
        ...eqState,
        preset: presetName,
        bands: [...EQ_PRESETS[presetName]],
      });
    }
  };

  const handleBandChange = (index: number, val: number) => {
    const updatedBands = [...eqState.bands];
    updatedBands[index] = val;
    onUpdateState({
      ...eqState,
      preset: 'Custom',
      bands: updatedBands,
    });
  };

  const handleBassBoostChange = (val: number) => {
    onUpdateState({ ...eqState, bassBoost: val });
  };

  const handleVirtualizerChange = (val: number) => {
    onUpdateState({ ...eqState, virtualizer: val });
  };

  const handleVolumeBoosterChange = (val: number) => {
    onUpdateState({ ...eqState, volumeBooster: val });
  };

  const handlePreampChange = (val: number) => {
    onUpdateState({ ...eqState, preamp: val });
  };

  const handleReverbChange = (reverbMode: EqualizerState['reverbMode']) => {
    onUpdateState({ ...eqState, reverbMode });
  };

  const formatFreq = (hz: number) => {
    return hz >= 1000 ? `${hz / 1000}k` : `${hz}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Ecualizador de 10 Bandas
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                  DSP PRO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste fino de frecuencias, Bass Boost y efectos 3D
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* On/Off Switch */}
            <button
              onClick={handleToggleEnabled}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                eqState.enabled
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {eqState.enabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Horizontal Selector */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 mb-2 block">
            Presets de Ecualizador:
          </label>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {Object.keys(EQ_PRESETS).map((pName) => {
              const isSelected = eqState.preset === pName;
              return (
                <button
                  key={pName}
                  onClick={() => handleSelectPreset(pName)}
                  disabled={!eqState.enabled}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-700'
                  } ${!eqState.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {pName}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10 Band Freq Sliders Grid */}
        <div
          className={`mt-6 bg-slate-950/80 p-4 rounded-2xl border border-white/10 transition-opacity ${
            !eqState.enabled ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-mono text-slate-400">+12 dB</span>
            <span className="text-xs font-bold text-cyan-400">Preamplificador: {eqState.preamp > 0 ? `+${eqState.preamp}` : eqState.preamp} dB</span>
            <span className="text-[11px] font-mono text-slate-400">-12 dB</span>
          </div>

          {/* Preamp slider */}
          <div className="mb-6 px-2">
            <input
              type="range"
              min={-12}
              max={12}
              step={0.5}
              value={eqState.preamp}
              onChange={(e) => handlePreampChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 h-48 items-end pt-4 pb-2">
            {DEFAULT_EQ_BANDS.map((freq, idx) => {
              const bandVal = eqState.bands[idx] || 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between">
                  <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                    {bandVal > 0 ? `+${bandVal}` : bandVal}
                  </span>

                  <div className="relative h-32 flex items-center justify-center">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={bandVal}
                      onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                      className="h-32 -rotate-90 appearance-none bg-slate-800 rounded-lg w-1.5 cursor-pointer accent-cyan-400 focus:outline-none"
                      style={{
                        WebkitAppearance: 'slider-vertical',
                      }}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 font-bold mt-2">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DSP Sound Effects: Bass Boost, Virtualizer, Volume Booster */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 transition-opacity ${
            !eqState.enabled ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          {/* Bass Boost Knob */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-between text-center">
            <div className="flex items-center space-x-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Bass Boost</span>
            </div>
            <span className="text-lg font-extrabold text-cyan-400 font-mono my-1">
              {eqState.bassBoost}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={eqState.bassBoost}
              onChange={(e) => handleBassBoostChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Virtualizer 3D Surround */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-between text-center">
            <div className="flex items-center space-x-1.5 mb-2">
              <Radio className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200">3D Surround</span>
            </div>
            <span className="text-lg font-extrabold text-purple-400 font-mono my-1">
              {eqState.virtualizer}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={eqState.virtualizer}
              onChange={(e) => handleVirtualizerChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Volume Booster */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-between text-center">
            <div className="flex items-center space-x-1.5 mb-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Volume Boost</span>
            </div>
            <span className="text-lg font-extrabold text-emerald-400 font-mono my-1">
              {eqState.volumeBooster}%
            </span>
            <input
              type="range"
              min={100}
              max={200}
              value={eqState.volumeBooster}
              onChange={(e) => handleVolumeBoosterChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Reverb Modes */}
        <div
          className={`mt-4 bg-slate-950/80 p-4 rounded-2xl border border-white/10 transition-opacity ${
            !eqState.enabled ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          <label className="text-xs font-semibold text-slate-300 mb-2.5 block flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-cyan-400" />
            Efecto de Reverberación (Reverb Preset):
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'off', label: 'Sin Reverb' },
              { id: 'room', label: 'Cuarto' },
              { id: 'hall', label: 'Concierto' },
              { id: 'club', label: 'Club' },
              { id: 'studio', label: 'Estudio' },
            ].map((rm) => (
              <button
                key={rm.id}
                onClick={() => handleReverbChange(rm.id as EqualizerState['reverbMode'])}
                className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                  eqState.reverbMode === rm.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 font-bold'
                    : 'bg-slate-800/60 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {rm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Guardar & Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
