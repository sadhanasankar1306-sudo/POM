import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Blocks,
  ArrowRight
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.result.toLowerCase().includes(term) ||
      log.user.toLowerCase().includes(term) ||
      (log.equipmentId && log.equipmentId.toLowerCase().includes(term)) ||
      (log.maintenanceId && log.maintenanceId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              IMMUTABLE CHRONOLOGY
            </span>
            <span className="text-xs text-slate-400">· Cryptographic System Audit</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            System Audit Trail & Event Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential timestamped log of all telemetry anomalies, automated AI dispatches, technician completions, verification checks, and Proof-of-Work mining blocks.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search logs by action, ID, or user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">User / Actor</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Equipment</th>
                <th className="pb-3 px-3">Maintenance ID</th>
                <th className="pb-3 px-3">Result / Cryptographic Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-medium text-white">
                    {log.user}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-cyan-300">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {log.equipmentId || '—'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {log.maintenanceId || '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-300 block">{log.result}</span>
                    {log.hash && (
                      <span className="text-[10px] font-mono text-emerald-400 break-all block mt-0.5">
                        Hash: {log.hash.slice(0, 24)}...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
