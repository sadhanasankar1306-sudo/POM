import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BrainCircuit,
  Zap,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowRight,
  Flame,
  ShieldAlert,
  RotateCw,
  Clock,
  Sparkles
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const AIPredictionsView: React.FC<Props> = ({ onNavigate, onSelectMaintenance }) => {
  const {
    equipment,
    predictions,
    triggerAIPrediction,
    requests,
    createMaintenanceRequest,
    injectFault
  } = useApp();

  const [selectedEqId, setSelectedEqId] = useState<string>('M103');
  const selectedEquipment = equipment.find(e => e.id === selectedEqId) || equipment[0];
  const selectedPrediction = selectedEquipment ? predictions[selectedEquipment.id] : undefined;

  const handleRecalculateAll = () => {
    equipment.forEach(eq => {
      triggerAIPrediction(eq.id);
    });
  };

  const handleManualDispatch = () => {
    if (!selectedEquipment || !selectedPrediction) return;
    createMaintenanceRequest(
      selectedEquipment.id,
      `AI Predictive Dispatch (${selectedPrediction.failureProbability}%): ${selectedPrediction.predictedFailureComponent}`,
      selectedPrediction.riskLevel === 'High Risk' ? 'High' : 'Medium',
      'AI Prediction'
    );
    onNavigate('requests');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              AI PREDICTIVE INFERENCE
            </span>
            <span className="text-xs text-slate-400">· Random Forest / Gradient Boosting Model</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            AI Failure Prediction & Health Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomous anomaly prediction utilizing real-time temperature gradients, vibration harmonic amplitudes, pressure differentials, and machine duty cycles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRecalculateAll}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Recalculate All AI Models</span>
          </button>
        </div>
      </div>

      {/* Autonomous Threshold Rule Banner */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-cyan-950/40 border border-indigo-800/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">Autonomous Scheduling Rule Active</span>
            <span className="text-slate-300">
              When AI Failure Probability reaches <strong className="text-rose-400">≥ 70% (High Risk)</strong>, the system automatically schedules a priority maintenance request and dispatches a certified technician.
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] shrink-0">
          <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">0-40% Low</span>
          <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400">41-70% Med</span>
          <span className="px-2 py-1 rounded bg-slate-950 border border-rose-900/60 text-rose-400 font-bold">71-100% High (Auto-Trigger)</span>
        </div>
      </div>

      {/* Main Grid: Machine Selector & Risk Cards on Left, Detailed Inference on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: All Machines AI Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {equipment.map(item => {
            const pred = predictions[item.id];
            const isSelected = item.id === selectedEquipment?.id;
            const prob = pred ? pred.failureProbability : 15;
            const isHigh = prob >= 71;
            const isMed = prob >= 41 && prob <= 70;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedEqId(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {item.id}
                    </span>
                    <span className="font-bold text-white text-sm">{item.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isMed
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {pred?.riskLevel || 'Low Risk'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Failure Probability:</span>
                  <span className={`font-mono font-bold text-base ${
                    isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {prob}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${prob}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {pred?.recommendation || 'Operating normally.'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: In-depth Model Inspector (7 cols) */}
        {selectedEquipment && selectedPrediction && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedEquipment.id}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedEquipment.name}</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Model: Ensemble Tree Regressor · Inference: Live Telemetry
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => injectFault(selectedEquipment.id, 'temperature')}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/80 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Simulate 89% Spike</span>
                </button>
              </div>
            </div>

            {/* Probability Gauge & Recommendation Card */}
            <div className={`p-5 rounded-2xl border ${
              selectedPrediction.riskLevel === 'High Risk'
                ? 'bg-rose-950/20 border-rose-800/80'
                : selectedPrediction.riskLevel === 'Medium Risk'
                ? 'bg-amber-950/20 border-amber-800/80'
                : 'bg-emerald-950/20 border-emerald-800/80'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    AI Prediction:
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {selectedPrediction.riskLevel === 'High Risk'
                      ? `Machine ${selectedEquipment.id} has a high probability of failure.`
                      : selectedPrediction.riskLevel === 'Medium Risk'
                      ? `Machine ${selectedEquipment.id} shows moderate acoustic/thermal drift.`
                      : `Machine ${selectedEquipment.id} operational within normal parameters.`}
                  </h4>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Failure Probability
                  </span>
                  <span className={`text-3xl font-extrabold font-mono ${
                    selectedPrediction.riskLevel === 'High Risk'
                      ? 'text-rose-400'
                      : selectedPrediction.riskLevel === 'Medium Risk'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {selectedPrediction.failureProbability}%
                  </span>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 font-medium">
                <span className="text-cyan-400 font-bold block mb-1">Recommendation:</span>
                "{selectedPrediction.recommendation}"
              </div>
            </div>

            {/* 4 Sensor Inputs Feeding the Model */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Input Telemetry Variables Fed to Model
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">1. Temperature</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedEquipment.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Threshold: 90°C</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">2. Vibration</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedEquipment.vibration.toFixed(1)} mm/s
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Threshold: 7.0</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">3. Pressure</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedEquipment.pressure.toFixed(1)} bar
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Nominal: {selectedEquipment.specs.nominalPressure}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">4. Running Hours</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedEquipment.runningHours}h
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Interval: {selectedEquipment.maintenanceIntervalHours}h</span>
                </div>
              </div>
            </div>

            {/* Contributing Anomaly Factors Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Contributing Risk Factors
              </h4>

              <div className="space-y-2">
                {selectedPrediction.contributingFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{factor.factor}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{factor.description}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      factor.impact === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      factor.impact === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {factor.impact} Impact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Time to Failure & Dispatch CTA */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-400 block">Predicted Component to Fail:</span>
                <span className="font-bold text-cyan-300">{selectedPrediction.predictedFailureComponent}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Est. Window: ~{selectedPrediction.estimatedTimeToFailureHours} hours remaining
                </span>
              </div>

              <button
                onClick={handleManualDispatch}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition"
              >
                <span>Generate Maintenance Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
