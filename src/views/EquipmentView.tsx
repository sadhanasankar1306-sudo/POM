import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Equipment } from '../types';
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Radio,
  Flame,
  Wrench,
  Clock,
  Gauge,
  Thermometer,
  Zap,
  RotateCcw,
  Sliders,
  ChevronRight,
  Blocks,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const EquipmentView: React.FC<Props> = ({ onNavigate, onSelectMaintenance }) => {
  const {
    equipment,
    lastSimUpdate,
    simulationActive,
    setSimulationActive,
    injectFault,
    normalizeEquipment,
    predictions,
    requests,
    blockchain,
    createMaintenanceRequest,
    currentRole,
    addEquipment
  } = useApp();

  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || 'M101');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Equipment state
  const [newEqName, setNewEqName] = useState('');
  const [newEqType, setNewEqType] = useState('Electric Motor');
  const [newEqLocation, setNewEqLocation] = useState('Plant Wing B');

  const selectedEquipment = equipment.find(e => e.id === selectedEqId) || equipment[0];
  const selectedPrediction = selectedEquipment ? predictions[selectedEquipment.id] : undefined;
  const equipmentRequests = requests.filter(r => r.equipmentId === selectedEquipment?.id);
  const equipmentBlocks = blockchain.filter(b => b.equipmentId === selectedEquipment?.id);

  const filteredList = equipment.filter(e => {
    if (filterStatus === 'all') return true;
    return e.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleCreateNewEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName) return;

    const newId = `M${100 + equipment.length + 1}`;
    addEquipment({
      id: newId,
      name: newEqName,
      type: newEqType,
      location: newEqLocation,
      model: `${newEqName} Pro X`,
      serialNumber: `SN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      installedDate: new Date().toISOString().slice(0, 10),
      temperature: 65.0,
      vibration: 2.0,
      pressure: 2.0,
      runningHours: 120,
      maintenanceIntervalHours: 4000,
      lastMaintenance: new Date().toISOString().slice(0, 10),
      nextMaintenance: '2026-12-15',
      status: 'Healthy',
      specs: {
        maxTemp: 85,
        maxVibration: 5.0,
        nominalPressure: 2.0,
        powerRating: '30 kW Industrial'
      }
    });

    setShowAddModal(false);
    setNewEqName('');
    setSelectedEqId(newId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Sensor Simulation Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              TELEMETRY BUS
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-semibold text-white">LIVE SENSOR SIMULATION</span>
              <span className="font-mono text-slate-400 text-xs">({lastSimUpdate})</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Industrial Equipment Fleet Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sensory inputs for temperature, vibration harmonics, pressure, and operational duty cycles.
          </p>
        </div>

        {/* Filter & Add controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex text-xs">
            {['all', 'Healthy', 'Warning', 'Critical'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterStatus.toLowerCase() === st.toLowerCase()
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All Assets' : st}
              </button>
            ))}
          </div>

          {currentRole === 'Admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Equipment Cards, Right Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Equipment Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredList.map(item => {
            const isSelected = item.id === selectedEquipment?.id;
            const isCrit = item.status === 'Critical';
            const isWarn = item.status === 'Warning';

            // Threshold status
            const tempNormal = item.temperature < 75;
            const tempWarn = item.temperature >= 75 && item.temperature < 90;
            const tempCrit = item.temperature >= 90;

            const vibNormal = item.vibration < 4.0;
            const vibWarn = item.vibration >= 4.0 && item.vibration < 7.0;
            const vibCrit = item.vibration >= 7.0;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedEqId(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {item.id}
                    </span>
                    <span className="font-semibold text-white text-sm">{item.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                  <span>Type: <strong className="text-slate-300">{item.type}</strong></span>
                  <span className="text-[11px] font-mono text-slate-500">Hours: {item.runningHours}h</span>
                </div>

                {/* 3 Telemetry Pill gauges */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {/* Temp */}
                  <div className={`p-2 rounded-xl border ${
                    tempCrit ? 'bg-rose-950/40 border-rose-800/80' : tempWarn ? 'bg-amber-950/40 border-amber-800/80' : 'bg-slate-950/70 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 block font-sans">Temp</span>
                    <span className={`font-bold ${
                      tempCrit ? 'text-rose-400' : tempWarn ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.temperature.toFixed(1)}°C
                    </span>
                  </div>

                  {/* Vibration */}
                  <div className={`p-2 rounded-xl border ${
                    vibCrit ? 'bg-rose-950/40 border-rose-800/80' : vibWarn ? 'bg-amber-950/40 border-amber-800/80' : 'bg-slate-950/70 border-slate-800'
                  }`}>
                    <span className="text-[10px] text-slate-400 block font-sans">Vibration</span>
                    <span className={`font-bold ${
                      vibCrit ? 'text-rose-400' : vibWarn ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.vibration.toFixed(1)} mm/s
                    </span>
                  </div>

                  {/* Pressure */}
                  <div className="p-2 rounded-xl border bg-slate-950/70 border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Pressure</span>
                    <span className="text-cyan-300 font-bold">
                      {item.pressure.toFixed(1)} bar
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Last Service: {item.lastMaintenance}</span>
                  <span className="text-cyan-400 flex items-center gap-1 font-medium">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detailed Inspector (7 cols) */}
        {selectedEquipment && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Header with quick anomaly controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedEquipment.id}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedEquipment.name}</h3>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedEquipment.model} · {selectedEquipment.location}
                </p>
              </div>

              {/* Action Buttons: Inject Fault / Normalize / Request */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => injectFault(selectedEquipment.id, 'temperature')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/80 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Inject sudden overheat spike"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Fault (Temp)</span>
                </button>
                <button
                  onClick={() => injectFault(selectedEquipment.id, 'vibration')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/80 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Inject sudden vibration harmonics"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fault (Vib)</span>
                </button>
                <button
                  onClick={() => normalizeEquipment(selectedEquipment.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                  title="Restore nominal sensors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Normalize</span>
                </button>
              </div>
            </div>

            {/* Threshold Guide */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-semibold text-slate-300 block mb-1">Temperature Thresholds</span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-emerald-400">&lt; 75°C Normal</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400">75–89°C Warning</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-rose-400">≥ 90°C Critical</span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-300 block mb-1">Vibration Thresholds</span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-emerald-400">&lt; 4.0 Normal</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400">4.0–6.9 Warning</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-rose-400">≥ 7.0 Critical</span>
                </div>
              </div>
            </div>

            {/* Sensor Telemetry Graphs (Temperature & Vibration history) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Sensor Telemetry Graph (Temperature & Vibration)
              </h4>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                      Temperature (°C): {selectedEquipment.temperature.toFixed(1)}°C
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      Vibration (mm/s): {selectedEquipment.vibration.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Interval: {selectedEquipment.runningHours}h / {selectedEquipment.maintenanceIntervalHours}h
                  </span>
                </div>

                {/* SVG Line / Bar chart simulation */}
                <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-l border-slate-800">
                  {selectedEquipment.history.map((reading, i) => {
                    const tempHeight = Math.min(100, Math.max(10, ((reading.temperature - 40) / 60) * 100));
                    const vibHeight = Math.min(100, Math.max(10, (reading.vibration / 10) * 100));

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 bg-slate-900 border border-slate-700 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          <div>Temp: {reading.temperature}°C</div>
                          <div>Vib: {reading.vibration} mm/s</div>
                        </div>

                        <div className="w-full flex items-end justify-center gap-1 h-32">
                          <div
                            className={`w-1/2 rounded-t transition-all duration-300 ${
                              reading.temperature >= 90 ? 'bg-rose-500' : reading.temperature >= 75 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ height: `${tempHeight}%` }}
                          />
                          <div
                            className={`w-1/2 rounded-t transition-all duration-300 ${
                              reading.vibration >= 7.0 ? 'bg-rose-400' : reading.vibration >= 4.0 ? 'bg-amber-400' : 'bg-indigo-400'
                            }`}
                            style={{ height: `${vibHeight}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {reading.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Prediction Status Card */}
            {selectedPrediction && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    AI Predictive Assessment
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    Failure Probability: <span className="text-cyan-400">{selectedPrediction.failureProbability}%</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mb-2">
                  {selectedPrediction.recommendation}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Suspected Component: <strong className="text-slate-200">{selectedPrediction.predictedFailureComponent}</strong></span>
                  <span>Est. Time to Failure: <strong className="text-cyan-300 font-mono">{selectedPrediction.estimatedTimeToFailureHours}h</strong></span>
                </div>
              </div>
            )}

            {/* Related Blockchain Records */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                <Blocks className="w-4 h-4 text-cyan-400" />
                Proof-of-Work Blockchain History for {selectedEquipment.id}
              </h4>

              {equipmentBlocks.length > 0 ? (
                <div className="space-y-2">
                  {equipmentBlocks.map(block => (
                    <div
                      key={block.blockNumber}
                      onClick={() => onNavigate('blockchain')}
                      className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-cyan-500/50 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-300">
                            Block #{block.blockNumber}
                          </span>
                          <span className="font-mono text-slate-300">
                            {block.maintenanceId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                          {block.data?.workPerformed || 'Genesis Block'}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          PoW VALID ✓
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Nonce: {block.nonce}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 rounded-xl text-center text-xs text-slate-500 border border-slate-800/60">
                  No previous maintenance blocks recorded on blockchain for this asset yet.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  createMaintenanceRequest(
                    selectedEquipment.id,
                    `Manual Preventive Service Scheduled by ${currentRole}`,
                    'Medium',
                    'Manual Inspection'
                  );
                  onNavigate('requests');
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Create Maintenance Request</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Register New Industrial Equipment</h3>
            <form onSubmit={handleCreateNewEquipment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  value={newEqName}
                  onChange={e => setNewEqName(e.target.value)}
                  placeholder="e.g. High Pressure Feed Pump"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Type</label>
                <select
                  value={newEqType}
                  onChange={e => setNewEqType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Electric Motor">Electric Motor</option>
                  <option value="Fluid Pump">Fluid Pump</option>
                  <option value="Compressor">Compressor</option>
                  <option value="Generator">Generator</option>
                  <option value="Conveyor System">Conveyor System</option>
                  <option value="Hydraulic Press">Hydraulic Press</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Factory Location / Bay</label>
                <input
                  type="text"
                  value={newEqLocation}
                  onChange={e => setNewEqLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl text-white"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
