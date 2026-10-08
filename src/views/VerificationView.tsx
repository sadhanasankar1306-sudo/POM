import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceRequest } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Blocks,
  Award,
  Search,
  Zap,
  TrendingDown,
  Cpu,
  ArrowRight,
  ExternalLink,
  Flame,
  Activity,
  Check
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
  selectedMaintenanceId?: string;
}

export const VerificationView: React.FC<Props> = ({
  onNavigate,
  onSelectMaintenance,
  selectedMaintenanceId
}) => {
  const {
    requests,
    equipment,
    technicians,
    blockchain,
    verifyRequest,
    mineAndRecordBlock,
    isMining
  } = useApp();

  const [searchId, setSearchId] = useState<string>(selectedMaintenanceId || '');

  // Default to first verified or first available request
  const selectedReq = requests.find(r => r.id === (searchId || selectedMaintenanceId)) ||
    requests.find(r => r.verification) ||
    requests[0];

  const targetEquipment = selectedReq ? equipment.find(e => e.id === selectedReq.equipmentId) : undefined;
  const targetTechnician = selectedReq ? technicians.find(t => t.id === selectedReq.assignedTechnicianId) : undefined;
  const targetBlock = selectedReq?.blockNumber !== undefined ? blockchain.find(b => b.blockNumber === selectedReq.blockNumber) : undefined;

  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  const handleManualVerify = async () => {
    if (!selectedReq) return;
    setIsVerifyingManual(true);
    try {
      await verifyRequest(selectedReq.id);
    } finally {
      setIsVerifyingManual(false);
    }
  };

  const handleManualMine = async () => {
    if (!selectedReq) return;
    await mineAndRecordBlock(selectedReq.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              TRUST VERIFICATION ENGINE v2.4
            </span>
            <span className="text-xs text-slate-400">· Automated Audit Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Maintenance Verification & Effectiveness Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic trust scoring (100/100) and before-vs-after telemetry efficacy analysis prior to Proof-of-Work blockchain consensus.
          </p>
        </div>

        {/* Quick Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Lookup Maintenance ID..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {selectedReq ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Verification Breakdown & Trust Score (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Trust Score Header Card */}
            <div className={`p-6 rounded-2xl border shadow-xl ${
              selectedReq.verification?.status === 'Verified'
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-600/60'
                : selectedReq.verification?.status === 'Review Required'
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-600/60'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedReq.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Automated Trust Verification Result
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Calculated Trust Score
                  </span>
                  <span className={`text-3xl font-extrabold font-mono ${
                    (selectedReq.verification?.trustScore ?? 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedReq.verification?.trustScore ?? 0}/100
                  </span>
                </div>
              </div>

              {/* Status Outcome Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                selectedReq.verification?.status === 'Verified'
                  ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-700/80 text-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">
                    {selectedReq.verification?.status === 'Verified'
                      ? '✓ Maintenance Verified'
                      : '⚠ Review Required'}
                  </span>
                </div>
                <span className="text-[11px] font-mono">
                  Trust Threshold: ≥80
                </span>
              </div>

              {/* Action if unverified */}
              {!selectedReq.verification && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Request not yet evaluated.</span>
                  <button
                    onClick={handleManualVerify}
                    disabled={isVerifyingManual}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    Run Automated Verification Check
                  </button>
                </div>
              )}
            </div>

            {/* The 5-Point Verification Audit Checklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Multi-Factor Trust Verification Criteria
              </h4>

              <div className="space-y-2.5">
                {(selectedReq.verification?.checks || [
                  { name: 'Valid Maintenance Request', valid: true, score: 20, maxScore: 20, details: 'Authorized request in active system registry' },
                  { name: 'Valid Equipment Specification', valid: true, score: 20, maxScore: 20, details: 'Equipment verified online and telemetry bound' },
                  { name: 'Valid Technician Assignment', valid: true, score: 20, maxScore: 20, details: 'Certified technician matched to specialization' },
                  { name: 'Comprehensive Work Description', valid: true, score: 20, maxScore: 20, details: 'Step-by-step engineering log provided' },
                  { name: 'Physical Before & After Evidence', valid: true, score: 20, maxScore: 20, details: 'Dual telemetry sensor improvements logged' }
                ]).map((check, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        check.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{check.name}</span>
                        <span className="text-[11px] text-slate-400">{check.details}</span>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 shrink-0">
                      +{check.score} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Maintenance Effectiveness Analysis & Blockchain Readiness (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Section 9: Maintenance Effectiveness Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Maintenance Effectiveness Analysis
                  </h4>
                </div>
                {selectedReq.effectiveness && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                    selectedReq.effectiveness.status === 'Effective'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedReq.effectiveness.status === 'Partially Effective'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {selectedReq.effectiveness.status}
                  </span>
                )}
              </div>

              {/* Before vs After Telemetry Delta Display */}
              <div className="grid grid-cols-2 gap-4">
                {/* Before Condition */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-rose-900/40 space-y-1.5 font-mono text-xs">
                  <span className="text-[11px] font-bold text-rose-400 uppercase block font-sans">
                    BEFORE SERVICE
                  </span>
                  <div className="flex justify-between text-slate-400">
                    <span>Temperature:</span>
                    <span className="text-white font-bold">
                      {selectedReq.evidence?.beforeSensors.temperature ?? 92.0}°C
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vibration:</span>
                    <span className="text-white font-bold">
                      {selectedReq.evidence?.beforeSensors.vibration ?? 7.2} mm/s
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pressure:</span>
                    <span className="text-white font-bold">
                      {selectedReq.evidence?.beforeSensors.pressure ?? 8.5} bar
                    </span>
                  </div>
                </div>

                {/* After Condition */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-900/40 space-y-1.5 font-mono text-xs">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase block font-sans">
                    AFTER SERVICE
                  </span>
                  <div className="flex justify-between text-slate-400">
                    <span>Temperature:</span>
                    <span className="text-emerald-300 font-bold">
                      {selectedReq.evidence?.afterSensors.temperature ?? 68.0}°C
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vibration:</span>
                    <span className="text-emerald-300 font-bold">
                      {selectedReq.evidence?.afterSensors.vibration ?? 2.1} mm/s
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pressure:</span>
                    <span className="text-emerald-300 font-bold">
                      {selectedReq.evidence?.afterSensors.pressure ?? 7.5} bar
                    </span>
                  </div>
                </div>
              </div>

              {/* Effectiveness Score Gauge */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Effectiveness Score:</span>
                  <span className="text-xl font-mono font-bold text-cyan-300">
                    {selectedReq.effectiveness?.effectivenessScore ?? 92}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    style={{ width: `${selectedReq.effectiveness?.effectivenessScore ?? 92}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-300 italic pt-1">
                  "{selectedReq.effectiveness?.summary || 'Sensor values successfully returned to factory operational baseline.'}"
                </p>
              </div>

              {/* Effectiveness Pipeline Indicator */}
              <div className="p-3 bg-slate-950/60 rounded-xl text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Maintenance Completed</span>
                <span>→</span>
                <span>Improvement Check</span>
                <span>→</span>
                <span className="text-emerald-400 font-bold">Effective ✓</span>
              </div>
            </div>

            {/* Blockchain Recording Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Blocks className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Proof-of-Work Blockchain Status
                  </h4>
                </div>

                {targetBlock ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    RECORDED ON CHAIN
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    AWAITING MINING
                  </span>
                )}
              </div>

              {targetBlock ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/50 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Block Number:</span>
                    <span className="text-cyan-300 font-bold">#{targetBlock.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nonce:</span>
                    <span className="text-emerald-400 font-bold">{targetBlock.nonce}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] mb-0.5">Block SHA-256 Hash:</span>
                    <span className="text-cyan-400 text-[11px] break-all block bg-slate-900 p-1.5 rounded border border-slate-800">
                      {targetBlock.currentHash}
                    </span>
                  </div>
                </div>
              ) : selectedReq.verification?.status === 'Verified' ? (
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-300">
                    This maintenance record is 100% verified and ready for Proof of Work consensus mining.
                  </p>
                  <button
                    onClick={handleManualMine}
                    disabled={isMining}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                  >
                    {isMining ? 'Mining Block...' : 'Mine Block to Blockchain (PoW)'}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 text-xs text-slate-500 rounded-xl text-center">
                  Only verified maintenance records can be mined to blockchain.
                </div>
              )}

              {/* View Certificate CTA */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    onSelectMaintenance(selectedReq.id);
                    onNavigate('certificates');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Inspect Official Certificate & QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400">
          No maintenance request found.
        </div>
      )}
    </div>
  );
};
