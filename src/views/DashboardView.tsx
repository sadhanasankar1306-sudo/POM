import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  UserCheck,
  CheckCheck,
  ShieldCheck,
  Blocks,
  ArrowRight,
  TrendingUp,
  Flame,
  Zap,
  ExternalLink,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import { formatINR } from '../utils/costCalculations';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigate, onSelectMaintenance }) => {
  const {
    equipment,
    requests,
    predictions,
    blockchain,
    chainIntegrity,
    injectFault
  } = useApp();

  const totalEquipment = equipment.length;
  const healthyEquipment = equipment.filter(e => e.status === 'Healthy').length;
  const dueEquipment = equipment.filter(e => e.status === 'Warning').length;
  const criticalEquipment = equipment.filter(e => e.status === 'Critical').length;

  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const assignedRequests = requests.filter(r => r.status === 'Assigned' || r.status === 'In Progress').length;
  const completedMaintenance = requests.filter(r => r.status === 'Completed').length;
  const verifiedMaintenance = requests.filter(r => r.status === 'Verified' || r.status === 'Blockchain Recorded').length;
  const totalBlocks = blockchain.length;
  const latestBlock = blockchain[blockchain.length - 1];

  // Pick top AI predictions (sorted by failure probability descending)
  const sortedPredictions = Object.values(predictions).sort((a, b) => b.failureProbability - a.failureProbability);

  // Workflow steps
  const workflowSteps = [
    { title: 'Sensor Monitoring', desc: 'IoT Telemetry Stream', icon: Activity, active: true },
    { title: 'AI Prediction', desc: 'Failure Probability & Risk', icon: Zap, active: true },
    { title: 'Maintenance Request', desc: 'Automated Dispatch', icon: Clock, active: true },
    { title: 'Technician Assignment', desc: 'Skill & Workload Match', icon: UserCheck, active: true },
    { title: 'Maintenance Completed', desc: 'Evidence & Dual Telemetry', icon: CheckCheck, active: true },
    { title: 'Verification', desc: 'Trust Score & Effectiveness', icon: ShieldCheck, active: true },
    { title: 'Proof of Work', desc: 'SHA-256 Nonce Mining', icon: Blocks, active: true },
    { title: 'Blockchain', desc: 'Immutable Ledger Block', icon: CheckCircle2, active: true }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & System Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/80">
              INDUSTRIAL OPERATION DESK
            </span>
            <span className="text-xs text-slate-400">· Active Consensus Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Proof-of-Maintenance Autonomous System
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            End-to-end industrial lifecycle verification: Automated IoT telemetry, machine learning predictive triggers, cryptographically verified repairs, and Proof-of-Work blockchain recording.
          </p>
        </div>

        {/* Quick Demo Trigger Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            onClick={() => injectFault('M103', 'temperature')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition"
          >
            <Flame className="w-4 h-4" />
            <span>Test Pipeline: Simulate M103 Fault</span>
          </button>
        </div>
      </div>

      {/* 9 Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Equipment */}
        <div
          onClick={() => onNavigate('equipment')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Equipment</span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{totalEquipment}</div>
          <div className="text-[11px] text-slate-400 mt-1">Industrial Assets</div>
        </div>

        {/* Healthy Equipment */}
        <div
          onClick={() => onNavigate('equipment')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-900/40 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Healthy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight">{healthyEquipment}</div>
          <div className="text-[11px] text-slate-400 mt-1">Nominal Telemetry</div>
        </div>

        {/* Maintenance Due */}
        <div
          onClick={() => onNavigate('equipment')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-amber-900/40 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold">Maintenance Due</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">{dueEquipment}</div>
          <div className="text-[11px] text-slate-400 mt-1">Warning Thresholds</div>
        </div>

        {/* Critical Equipment */}
        <div
          onClick={() => onNavigate('equipment')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-rose-900/50 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold">Critical Equipment</span>
            <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{criticalEquipment}</div>
          <div className="text-[11px] text-rose-300/80 mt-1 font-semibold">Immediate Action</div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => onNavigate('requests')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{pendingRequests}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting Dispatch</div>
        </div>

        {/* Assigned Requests */}
        <div
          onClick={() => onNavigate('requests')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Assigned Tasks</span>
            <UserCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 tracking-tight">{assignedRequests}</div>
          <div className="text-[11px] text-slate-400 mt-1">Technicians Active</div>
        </div>

        {/* Completed Maintenance */}
        <div
          onClick={() => onNavigate('verification')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Completed Work</span>
            <CheckCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{completedMaintenance}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for Audit</div>
        </div>

        {/* Verified Maintenance */}
        <div
          onClick={() => onNavigate('verification')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-900/30 rounded-2xl p-4 cursor-pointer transition shadow-md group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Verified Records</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight">{verifiedMaintenance}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-semibold">Trust Score 80+</div>
        </div>

        {/* Blockchain Blocks */}
        <div
          onClick={() => onNavigate('blockchain')}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-900/50 rounded-2xl p-4 cursor-pointer transition shadow-md group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-semibold">Blockchain Blocks</span>
            <Blocks className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">#{totalBlocks}</div>
          <div className="text-[11px] text-slate-400 mt-1">PoW Mined Blocks</div>
        </div>
      </div>

      {/* Main Split: Left Column (Equipment Health + AI Overview), Right Column (Security Card + Workflow) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Health Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Equipment Health Overview
                </h3>
                <p className="text-xs text-slate-400">Live multi-sensor telemetry status across facility assets</p>
              </div>
              <button
                onClick={() => onNavigate('equipment')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {equipment.map(item => {
                const isCrit = item.status === 'Critical';
                const isWarn = item.status === 'Warning';

                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('equipment')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                      isCrit
                        ? 'bg-rose-950/20 border-rose-800/70 hover:border-rose-600'
                        : isWarn
                        ? 'bg-amber-950/20 border-amber-800/70 hover:border-amber-600'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{item.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isWarn
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-100 truncate mb-2">
                      {item.name}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">TEMP</span>
                        <span className={item.temperature >= 90 ? 'text-rose-400 font-bold' : item.temperature >= 75 ? 'text-amber-400' : 'text-slate-200'}>
                          {item.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">VIB</span>
                        <span className={item.vibration >= 7.0 ? 'text-rose-400 font-bold' : item.vibration >= 4.0 ? 'text-amber-400' : 'text-slate-200'}>
                          {item.vibration.toFixed(1)} mm/s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Prediction Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  AI Prediction Overview
                </h3>
                <p className="text-xs text-slate-400">Automated machine learning risk probability analysis</p>
              </div>
              <button
                onClick={() => onNavigate('ai-predictions')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Inspect AI Models <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {sortedPredictions.slice(0, 3).map(pred => {
                const eq = equipment.find(e => e.id === pred.equipmentId);
                const isHigh = pred.riskLevel === 'High Risk';
                const isMed = pred.riskLevel === 'Medium Risk';

                return (
                  <div
                    key={pred.equipmentId}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                      isHigh
                        ? 'bg-rose-950/20 border-rose-900/70'
                        : isMed
                        ? 'bg-amber-950/20 border-amber-900/70'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                          {pred.equipmentId}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {eq?.name || pred.equipmentId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isHigh
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isMed
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          Risk: {pred.riskLevel.replace(' Risk', '')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {pred.recommendation}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">
                          Failure Probability
                        </span>
                        <span
                          className={`text-xl font-bold font-mono ${
                            isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {pred.failureProbability}%
                        </span>
                      </div>

                      <div className="w-20 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pred.failureProbability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Blockchain Security Card & Workflow */}
        <div className="space-y-6">
          {/* Blockchain Security Card */}
          <div className={`border rounded-2xl p-5 shadow-xl ${
            chainIntegrity.isValid
              ? 'bg-gradient-to-br from-slate-900 to-cyan-950/40 border-cyan-800/60'
              : 'bg-gradient-to-br from-slate-900 to-rose-950/60 border-rose-600'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${chainIntegrity.isValid ? 'text-emerald-400' : 'text-rose-400'}`} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Blockchain Security Card
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                chainIntegrity.isValid
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse'
              }`}>
                {chainIntegrity.isValid ? 'INTEGRITY VERIFIED' : 'TAMPER ALERT'}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Blockchain Status:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  chainIntegrity.isValid ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {chainIntegrity.isValid ? 'VALID ✓' : 'TAMPERING DETECTED ✗'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Total Blocks:</span>
                <span className="text-white font-bold">{totalBlocks}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Latest Block:</span>
                <span className="text-cyan-300 font-bold">#{latestBlock?.blockNumber ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Proof of Work:</span>
                <span className="text-emerald-400 font-bold">VALID (0000 Prefix)</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block text-[10px] mb-1">Latest Mined Hash:</span>
                <span className="text-[11px] text-cyan-300 break-all bg-slate-950 p-2 rounded block border border-slate-800">
                  {latestBlock?.currentHash || '0000000...'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('blockchain')}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Inspect Explorer & Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* End-to-End Workflow Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Automated Maintenance Workflow
            </h3>

            <div className="space-y-2">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{step.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{step.desc}</div>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Maintenance Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Maintenance Records
            </h3>
            <p className="text-xs text-slate-400">Live ledger of industrial work orders and cryptographic certification</p>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All records <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 px-3">Maintenance ID</th>
                <th className="pb-3 px-3">Equipment</th>
                <th className="pb-3 px-3">Technician</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-right">Cost (₹)</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Effectiveness</th>
                <th className="pb-3 px-3">Blockchain Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {requests.slice(0, 6).map(req => {
                const eq = equipment.find(e => e.id === req.equipmentId);
                const hasBlock = req.blockNumber !== undefined;
                const costVal = req.actualCost?.totalActualCost || req.costEstimate?.totalEstimatedCost || 0;

                return (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {req.id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white">{req.equipmentId}</span>
                      <span className="text-slate-400 block text-[11px] truncate max-w-[140px]">{eq?.name}</span>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {req.assignedTechnicianId || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {req.createdDate.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="font-bold text-slate-200">{formatINR(costVal)}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {req.actualCost ? 'Actual' : 'Estimated'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        req.status === 'Blockchain Recorded'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : req.status === 'Verified'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : req.status === 'Completed'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : req.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {req.effectiveness ? (
                        <span className="font-bold text-emerald-400">
                          {req.effectiveness.effectivenessScore}% ({req.effectiveness.status})
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending Evaluation</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {hasBlock ? (
                        <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/80">
                          Block #{req.blockNumber} ✓
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unmined</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectMaintenance(req.id);
                          onNavigate('certificates');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                      >
                        Inspect Proof
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
