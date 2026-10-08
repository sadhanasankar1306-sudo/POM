import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  UserCheck,
  Blocks,
  ShieldCheck,
  Filter,
  Activity,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    equipment,
    technicians,
    requests,
    predictions,
    blockchain
  } = useApp();

  const [filterEquip, setFilterEquip] = useState<string>('all');
  const [filterTech, setFilterTech] = useState<string>('all');

  const filteredRequests = requests.filter(r => {
    if (filterEquip !== 'all' && r.equipmentId !== filterEquip) return false;
    if (filterTech !== 'all' && r.assignedTechnicianId !== filterTech) return false;
    return true;
  });

  // Calculate Metrics
  const totalVerified = requests.filter(r => r.status === 'Verified' || r.status === 'Blockchain Recorded').length;
  const totalRejected = requests.filter(r => r.status === 'Rejected').length;
  const avgEffectiveness = Math.round(
    requests
      .filter(r => r.effectiveness?.effectivenessScore)
      .reduce((acc, curr) => acc + (curr.effectiveness?.effectivenessScore || 0), 0) /
      Math.max(1, requests.filter(r => r.effectiveness?.effectivenessScore).length)
  );

  // Equipment frequency counts
  const equipFreq: Record<string, number> = {};
  requests.forEach(r => {
    equipFreq[r.equipmentId] = (equipFreq[r.equipmentId] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              EXECUTIVE ANALYTICS & AUDIT
            </span>
            <span className="text-xs text-slate-400">· Plant Maintenance Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Industrial Maintenance & Reliability Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational KPIs, AI predictive trends, technician capacity, and blockchain consensus verification efficacy.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterEquip}
            onChange={e => setFilterEquip(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Equipment Assets</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.id} ({eq.name})</option>
            ))}
          </select>

          <select
            value={filterTech}
            onChange={e => setFilterTech(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">All Technicians</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Average Effectiveness
          </span>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{avgEffectiveness}%</div>
          <span className="text-[11px] text-emerald-400 font-medium">Telemetry Restored</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Verified vs Rejected
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {totalVerified} : {totalRejected}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">100% Pass Ratio</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Total Mined Blocks
          </span>
          <div className="text-2xl font-bold text-amber-400 font-mono">#{blockchain.length}</div>
          <span className="text-[11px] text-cyan-400 font-medium">PoW SHA-256 Ledger</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Filtered Requests
          </span>
          <div className="text-2xl font-bold text-white font-mono">{filteredRequests.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">Active & Historical</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Maintenance Frequency by Equipment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Maintenance Frequency by Equipment
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Historical Work Orders</span>
          </div>

          <div className="space-y-3 pt-2">
            {equipment.map(eq => {
              const count = equipFreq[eq.id] || 0;
              const maxCount = Math.max(...Object.values(equipFreq), 5);
              const percentage = Math.min(100, Math.round((count / maxCount) * 100));

              return (
                <div key={eq.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-semibold">
                      {eq.id} — {eq.name}
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{count} orders</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: AI Risk Prediction Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              AI Failure Risk Distribution
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Live Predictive Scores</span>
          </div>

          <div className="space-y-3 pt-2">
            {equipment.map(eq => {
              const pred = predictions[eq.id];
              const prob = pred ? pred.failureProbability : 15;
              const isHigh = prob >= 71;
              const isMed = prob >= 41 && prob <= 70;

              return (
                <div key={eq.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-semibold">
                      {eq.id} ({pred?.riskLevel || 'Low Risk'})
                    </span>
                    <span className={`font-mono font-bold ${
                      isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {prob}% Failure Risk
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Technician Workload & Completed Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Technician Capacity & Completed Tasks
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Workload Balance</span>
          </div>

          <div className="space-y-3 pt-2">
            {technicians.map(tech => (
              <div key={tech.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{tech.name} ({tech.id})</span>
                  <span className="text-[11px] text-slate-400">{tech.specialization}</span>
                </div>

                <div className="flex items-center gap-4 text-right font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ACTIVE LOAD</span>
                    <span className="text-amber-400 font-bold">{tech.currentWorkload} jobs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">COMPLETED</span>
                    <span className="text-emerald-400 font-bold">{tech.completedJobsCount} verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Maintenance Effectiveness Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Maintenance Effectiveness Scores
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Pre vs Post Telemetry</span>
          </div>

          <div className="space-y-3 pt-2">
            {requests.filter(r => r.effectiveness).map(req => {
              const eff = req.effectiveness!;

              return (
                <div key={req.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-semibold font-mono">
                      {req.id} ({req.equipmentId})
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {eff.effectivenessScore}% ({eff.status})
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${eff.effectivenessScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
