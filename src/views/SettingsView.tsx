import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sliders,
  Shield,
  User,
  Cpu,
  RefreshCw,
  Radio,
  CheckCircle2,
  Trash2,
  Lock,
  Layers
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    simulationActive,
    setSimulationActive,
    difficultyPrefix,
    setDifficultyPrefix,
    resetAllData
  } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            CONFIGURATION & ACCESS CONTROL
          </span>
          <span className="text-xs text-slate-400">· System Parameters</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Platform Settings & Role-Based Access Control
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure authentication roles, IoT telemetry update frequencies, and Proof-of-Work blockchain consensus parameters.
        </p>
      </div>

      {/* Role-Based Access Selection (Admin / Technician / Manager) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          Active User Role & Access Profile
        </h3>
        <p className="text-xs text-slate-400">
          Switch user session between Admin, Field Technician, or Plant Maintenance Manager to test permissions and contextual dashboard views.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {([
            {
              role: 'Admin' as UserRole,
              title: 'Administrator',
              desc: 'Full system privileges: Register equipment, manage technicians, validate blockchain, inject anomalies, and inspect complete audit history.'
            },
            {
              role: 'Technician' as UserRole,
              title: 'Field Technician',
              desc: 'Specialized workbench: Accept assigned maintenance tickets, document work procedures, log parts, and submit dual-sensor evidence.'
            },
            {
              role: 'Manager' as UserRole,
              title: 'Maintenance Manager',
              desc: 'Operations oversight: Review equipment health, monitor AI failure predictions, audit effectiveness reports, and sign off certificates.'
            }
          ]).map(item => {
            const isSelected = currentRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => setCurrentRole(item.role)}
                className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{item.title}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof-of-Work Blockchain Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Proof-of-Work Consensus Difficulty Setting
        </h3>
        <p className="text-xs text-slate-400">
          The Proof-of-Work rule dictates the number of leading zero characters required in the block's SHA-256 hash.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div
            onClick={() => setDifficultyPrefix('0000')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              difficultyPrefix === '0000'
                ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs text-white">Standard Industrial Security</span>
              <span className="text-amber-400 font-mono text-xs font-bold">'0000' (4 zeros)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Target requirement: Hash starts with four zeros. Average nonce search ~30,000 to 80,000 iterations (1-2 seconds).
            </p>
          </div>

          <div
            onClick={() => setDifficultyPrefix('000')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              difficultyPrefix === '000'
                ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs text-white">Ultra Fast Demonstration Mode</span>
              <span className="text-cyan-400 font-mono text-xs font-bold">'000' (3 zeros)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Target requirement: Hash starts with three zeros. Nonce search completes in ~200-500ms for instantaneous testing.
            </p>
          </div>
        </div>
      </div>

      {/* IoT Telemetry Simulation Switch */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Simulated IoT Sensor Telemetry Stream
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Periodically applies micro-jitter drift to all industrial machine sensors (Temperature, Vibration, Pressure) to emulate live industrial telemetry.
          </p>
        </div>

        <button
          onClick={() => setSimulationActive(!simulationActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            simulationActive
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {simulationActive ? 'Simulation Active' : 'Simulation Paused'}
        </button>
      </div>

      {/* Reset Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Reset Prototype Demo Data
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Restores all equipment telemetry, technicians, maintenance requests, and Proof-of-Work blockchain blocks back to the authentic seed state.
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-300 text-xs font-bold rounded-xl transition"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
};
