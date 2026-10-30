import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceRequest, PriorityLevel, RequestStatus } from '../types';
import {
  Wrench,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Blocks,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  IndianRupee
} from 'lucide-react';
import { formatINR } from '../utils/costCalculations';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const RequestsView: React.FC<Props> = ({ onNavigate, onSelectMaintenance }) => {
  const {
    requests,
    equipment,
    technicians,
    createMaintenanceRequest,
    assignTechnician,
    setSelectedTechnicianId,
    currentRole
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form state
  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || 'M101');
  const [reasonInput, setReasonInput] = useState<string>('');
  const [priorityInput, setPriorityInput] = useState<PriorityLevel>('High');

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'all' && req.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (filterPriority !== 'all' && req.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    return true;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonInput) return;

    createMaintenanceRequest(
      selectedEqId,
      reasonInput,
      priorityInput,
      'Manual Inspection'
    );

    setShowCreateModal(false);
    setReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              WORK ORDER ORCHESTRATION
            </span>
            <span className="text-xs text-slate-400">· Automated Dispatch Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Maintenance Requests & Dispatch Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Requests generated autonomously from IoT threshold alerts, AI predictions, and running hour intervals with automatic technician skills matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Maintenance Request</span>
          </button>
        </div>
      </div>

      {/* Filter and Status Counter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1 font-semibold pl-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Status:
          </span>
          {['all', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Verified', 'Blockchain Recorded'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filterStatus.toLowerCase() === st.toLowerCase()
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Priority:</span>
          {['all', 'Emergency', 'High', 'Medium', 'Low'].map(pr => (
            <button
              key={pr}
              onClick={() => setFilterPriority(pr)}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition ${
                filterPriority.toLowerCase() === pr.toLowerCase()
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="space-y-3">
        {filteredRequests.map(req => {
          const eq = equipment.find(e => e.id === req.equipmentId);
          const tech = technicians.find(t => t.id === req.assignedTechnicianId);

          return (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: ID, Priority, Reason */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
                    {req.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      req.priority === 'Emergency'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : req.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : req.priority === 'Medium'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    Priority: {req.priority}
                  </span>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Triggered by: <strong className="text-slate-200">{req.source}</strong>
                  </span>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {req.createdDate}
                  </span>
                </div>

                <div className="text-sm font-semibold text-white">
                  {req.reason}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>
                    Asset: <strong className="text-slate-200">{req.equipmentId} ({eq?.name || 'Equipment'})</strong>
                  </span>
                  <span>
                    Location: <strong className="text-slate-300">{eq?.location}</strong>
                  </span>
                  {req.costEstimate && (
                    <span className="flex items-center gap-1.5 font-mono text-cyan-300">
                      <IndianRupee className="w-3 h-3 text-cyan-400" />
                      <span>{formatINR(req.actualCost?.totalActualCost || req.costEstimate.totalEstimatedCost)}</span>
                      <span className="text-slate-500 text-[10px]">({req.actualCost ? 'Actual' : 'Est'})</span>
                    </span>
                  )}
                  {req.costComparison && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      req.costComparison.budgetStatus === 'Over Budget'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {req.costComparison.budgetStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Center / Right Column: Technician, Status & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
                {/* Technician Assignment Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-w-[200px] text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[10px] uppercase font-semibold">Assigned Technician</span>
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  {tech ? (
                    <div>
                      <div className="font-bold text-white">{tech.name}</div>
                      <div className="text-[11px] text-cyan-300/90">{tech.specialization}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Status: {tech.availability} (Load: {tech.currentWorkload})</div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-slate-500 italic block">No technician assigned</span>
                      <button
                        onClick={() => assignTechnician(req.id)}
                        className="w-full py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[11px] font-semibold rounded-lg transition"
                      >
                        Auto-Assign Technician
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Badge & Workflow Trigger */}
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${
                      req.status === 'Blockchain Recorded'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : req.status === 'Verified'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : req.status === 'Completed'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : req.status === 'Assigned' || req.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {req.status}
                  </span>

                  {/* Contextual Action Button */}
                  {req.status === 'Assigned' || req.status === 'In Progress' ? (
                    <button
                      onClick={() => {
                        if (req.assignedTechnicianId) {
                          setSelectedTechnicianId(req.assignedTechnicianId);
                        }
                        onSelectMaintenance(req.id);
                        onNavigate('technician');
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Execute Work in Portal</span>
                    </button>
                  ) : req.status === 'Completed' ? (
                    <button
                      onClick={() => {
                        onSelectMaintenance(req.id);
                        onNavigate('verification');
                      }}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Review Verification</span>
                    </button>
                  ) : req.status === 'Blockchain Recorded' || req.status === 'Verified' ? (
                    <button
                      onClick={() => {
                        onSelectMaintenance(req.id);
                        onNavigate('certificates');
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
                    >
                      <Blocks className="w-3.5 h-3.5" />
                      <span>View Certificate & Proof</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Create Maintenance Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Industrial Equipment</label>
                <select
                  value={selectedEqId}
                  onChange={e => setSelectedEqId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.id} - {eq.name} ({eq.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason / Problem Statement</label>
                <textarea
                  rows={3}
                  required
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  placeholder="e.g. Unusual harmonic vibration during load surge. Drive bearing inspection required."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority Classification</label>
                <select
                  value={priorityInput}
                  onChange={e => setPriorityInput(e.target.value as PriorityLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Low">Low - Routine Scheduled Service</option>
                  <option value="Medium">Medium - Preventive Repair</option>
                  <option value="High">High - Threshold Anomaly Detected</option>
                  <option value="Emergency">Emergency - Imminent Failure Risk</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl text-white"
                >
                  Submit & Auto-Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
