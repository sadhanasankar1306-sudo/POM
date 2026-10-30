import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceEvidence, MaintenanceRequest } from '../types';
import { formatINR } from '../utils/costCalculations';
import {
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Camera,
  FileText,
  ShieldCheck,
  ArrowRight,
  Plus,
  Trash2,
  Lock,
  IndianRupee,
  Layers,
  AlertCircle
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
  selectedMaintenanceId?: string;
}

export const TechnicianPortalView: React.FC<Props> = ({
  onNavigate,
  onSelectMaintenance,
  selectedMaintenanceId
}) => {
  const {
    technicians,
    selectedTechnicianId,
    setSelectedTechnicianId,
    requests,
    equipment,
    submitTechnicianWork
  } = useApp();

  const currentTechnician = technicians.find(t => t.id === selectedTechnicianId) || technicians[0];

  // Tasks assigned to this technician
  const assignedTasks = requests.filter(r =>
    r.assignedTechnicianId === currentTechnician.id &&
    (r.status === 'Assigned' || r.status === 'In Progress')
  );

  const completedTasks = requests.filter(r =>
    r.assignedTechnicianId === currentTechnician.id &&
    (r.status === 'Completed' || r.status === 'Verified' || r.status === 'Blockchain Recorded')
  );

  // Active task to work on
  const [activeTaskRequestId, setActiveTaskRequestId] = useState<string>(() => {
    if (selectedMaintenanceId && assignedTasks.some(t => t.id === selectedMaintenanceId)) {
      return selectedMaintenanceId;
    }
    return assignedTasks[0]?.id || '';
  });

  const activeTask = requests.find(r => r.id === activeTaskRequestId);
  const activeEquipment = activeTask ? equipment.find(e => e.id === activeTask.equipmentId) : undefined;

  // Completion Form State
  const [workDescription, setWorkDescription] = useState<string>(
    'Replaced high-speed rotary bearings, flushed contaminated lubricant, dynamically re-balanced rotor assembly and recalibrated pressure release valve.'
  );
  const [beforeCondition, setBeforeCondition] = useState<string>(
    'Severe bearing noise with localized heat buildup (92°C) and harmonic vibration exceeding safety threshold.'
  );
  const [afterCondition, setAfterCondition] = useState<string>(
    'Smooth vibration signature (2.1 mm/s), operating temperature stabilized at 68°C with zero friction whine.'
  );
  const [technicianNotes, setTechnicianNotes] = useState<string>(
    'Inspected shaft runout: 0.02mm (within ISO tolerances). Bearing cage replaced with ceramic hybrid model for extended operational life.'
  );

  // Structured Spare Parts with quantity & price
  const [sparePartsList, setSparePartsList] = useState<Array<{ partName: string; quantity: number; unitPrice: number; totalPrice: number }>>([
    { partName: 'SKF Explorer Deep Groove Ball Bearing (6309-2Z/C3)', quantity: 2, unitPrice: 1100, totalPrice: 2200 },
    { partName: 'High-Temperature Synthetic Lithium Grease 400g', quantity: 1, unitPrice: 450, totalPrice: 450 },
    { partName: 'Nitrile Shaft Oil Seal (45x72x8mm)', quantity: 1, unitPrice: 350, totalPrice: 350 }
  ]);
  const [newPartName, setNewPartName] = useState<string>('');
  const [newPartQty, setNewPartQty] = useState<number>(1);
  const [newPartPrice, setNewPartPrice] = useState<number>(500);

  // Labour & Additional Costs
  const [actualLabourHours, setActualLabourHours] = useState<number>(3);
  const [additionalExpenses, setAdditionalExpenses] = useState<number>(200);
  const [additionalExpensesNotes, setAdditionalExpensesNotes] = useState<string>('Solvent degreaser & ultrasonic cleaning bath');

  // Sensors Before / After
  const [beforeTemp, setBeforeTemp] = useState<number>(activeEquipment?.temperature || 92.5);
  const [beforeVib, setBeforeVib] = useState<number>(activeEquipment?.vibration || 7.2);
  const [beforePres, setBeforePres] = useState<number>(activeEquipment?.pressure || 8.8);

  const [afterTemp, setAfterTemp] = useState<number>(68.0);
  const [afterVib, setAfterVib] = useState<number>(2.1);
  const [afterPres, setAfterPres] = useState<number>(7.5);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pricing constants derived from request estimate or standard config
  const hourlyRate = activeTask?.costEstimate?.hourlyLabourRate || 500;
  const inspectionFee = activeTask?.costEstimate?.inspectionFee || 500;
  const serviceCharge = activeTask?.costEstimate?.serviceCharge || 300;
  const taxRate = activeTask?.costEstimate?.taxRate || 18;

  const calculatedLabourCost = actualLabourHours * hourlyRate;
  const calculatedPartsCost = sparePartsList.reduce((acc, p) => acc + p.totalPrice, 0);
  const calculatedSubtotal = calculatedLabourCost + calculatedPartsCost + inspectionFee + serviceCharge + additionalExpenses;
  const calculatedTax = Math.round(calculatedSubtotal * (taxRate / 100));
  const calculatedTotalActualCost = calculatedSubtotal + calculatedTax;

  const estimatedTotal = activeTask?.costEstimate?.totalEstimatedCost || 0;
  const costDifference = calculatedTotalActualCost - estimatedTotal;
  const costVariancePercent = estimatedTotal > 0 ? Math.round((costDifference / estimatedTotal) * 100 * 10) / 10 : 0;
  const isOverBudget = costDifference > 0;
  const isOverVarianceThreshold = costVariancePercent > 10;

  const handleAddSparePart = () => {
    if (newPartName.trim() && newPartQty > 0 && newPartPrice >= 0) {
      const totalPrice = newPartQty * newPartPrice;
      setSparePartsList([...sparePartsList, {
        partName: newPartName.trim(),
        quantity: newPartQty,
        unitPrice: newPartPrice,
        totalPrice
      }]);
      setNewPartName('');
      setNewPartQty(1);
      setNewPartPrice(500);
    }
  };

  const handleRemoveSparePart = (index: number) => {
    setSparePartsList(sparePartsList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    setIsSubmitting(true);

    const evidence: MaintenanceEvidence = {
      workDescription,
      beforeCondition,
      afterCondition,
      partsReplaced: sparePartsList.map(p => `${p.partName} (x${p.quantity})`),
      technicianNotes,
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      beforeSensors: {
        temperature: beforeTemp,
        vibration: beforeVib,
        pressure: beforePres
      },
      afterSensors: {
        temperature: afterTemp,
        vibration: afterVib,
        pressure: afterPres
      }
    };

    const actualCostInput = {
      actualLabourHours,
      hourlyLabourRate: hourlyRate,
      spareParts: sparePartsList,
      inspectionFee,
      serviceCharge,
      additionalExpenses,
      additionalExpensesNotes,
      taxRate,
      workDescription
    };

    try {
      await submitTechnicianWork(activeTask.id, evidence, actualCostInput);
      onSelectMaintenance(activeTask.id);
      // Automatically navigate to verification engine
      setTimeout(() => {
        onNavigate('verification');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              FIELD ENGINEERING WORKBENCH
            </span>
            <span className="text-xs text-slate-400">· Digital Maintenance Evidence Collector</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Technician Execution & Submission Portal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Document diagnostic before/after states, physical replacement parts, and dual IoT sensor proofs for automatic verification.
          </p>
        </div>

        {/* Technician Profile Selector */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold">
            {currentTechnician.id}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white">{currentTechnician.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                currentTechnician.availability === 'Available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {currentTechnician.availability}
              </span>
            </div>
            <select
              value={selectedTechnicianId}
              onChange={e => setSelectedTechnicianId(e.target.value)}
              className="bg-transparent text-[11px] text-slate-400 focus:outline-none cursor-pointer mt-0.5"
            >
              {technicians.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                  Switch: {t.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tasks Queue, Right Maintenance Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Tasks List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Active Assigned Tasks ({assignedTasks.length})
              </span>
            </h3>

            {assignedTasks.length > 0 ? (
              <div className="space-y-2.5">
                {assignedTasks.map(task => {
                  const isSelected = task.id === activeTaskRequestId;
                  const eq = equipment.find(e => e.id === task.equipmentId);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setActiveTaskRequestId(task.id);
                        if (eq) {
                          setBeforeTemp(eq.temperature);
                          setBeforeVib(eq.vibration);
                          setBeforePres(eq.pressure);
                        }
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/40 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          {task.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          task.priority === 'High' || task.priority === 'Emergency'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white mb-1">
                        {task.equipmentId} · {eq?.name}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {task.reason}
                      </p>

                      <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center">
                        <span>Assigned: {task.createdDate.slice(0, 16)}</span>
                        <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                          Work on this task →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl p-4">
                No active tasks assigned to {currentTechnician.name}.
                <div className="text-[11px] text-slate-500 mt-1">
                  Check other technicians or create a new request from the Requests view.
                </div>
              </div>
            )}
          </div>

          {/* Completed History by this tech */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Completed History ({completedTasks.length})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {completedTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectMaintenance(t.id);
                    onNavigate('certificates');
                  }}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs hover:border-slate-700 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-cyan-300 font-bold">{t.id}</span>
                    <span className="text-emerald-400 font-bold">{t.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate mt-0.5">
                    {t.equipmentId} · {t.evidence?.workDescription || t.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance Completion Form (8 cols) */}
        <div className="lg:col-span-8">
          {activeTask ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    MAINTENANCE COMPLETION REPORT
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {activeTask.id} · {activeTask.equipmentId}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Reason: {activeTask.reason}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[11px]">Assigned Tech:</span>
                  <span className="font-bold text-white">{currentTechnician.name}</span>
                </div>
              </div>

              {activeTask.actualCost || (activeTask.status !== 'Assigned' && activeTask.status !== 'In Progress') ? (
                /* READ-ONLY LOCKED STATE FOR COMPLETED MAINTENANCE */
                <div className="space-y-5 text-xs">
                  <div className="flex items-center gap-2 p-3 bg-slate-950 border border-cyan-500/40 rounded-xl text-slate-300">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-white">Maintenance Completed & Ledger Locked</span>
                      <p className="text-[11px] text-slate-400">
                        Actual cost report submitted. Under industrial accounting policy, billing records cannot be modified by technicians after submission.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {activeTask.approvalStatus || 'Actual Cost Submitted'}
                    </span>
                  </div>

                  {/* Summary Cost Comparison Card */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Approved / Submitted Cost</span>
                        <div className="text-lg font-bold text-white font-mono mt-0.5">
                          {formatINR(activeTask.actualCost?.totalActualCost || activeTask.costEstimate?.totalEstimatedCost || 0)}
                        </div>
                      </div>

                      {activeTask.costComparison && (
                        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase">Estimated</span>
                            <span className="font-mono text-slate-300">{formatINR(activeTask.costComparison.estimatedCost)}</span>
                          </div>
                          <div className="h-6 w-px bg-slate-800" />
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase">Variance</span>
                            <span className={`font-mono font-bold ${
                              activeTask.costComparison.costDifference > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {activeTask.costComparison.costDifference >= 0 ? '+' : ''}{formatINR(activeTask.costComparison.costDifference)} ({activeTask.costComparison.costVariancePercentage}%)
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            activeTask.costComparison.budgetStatus === 'Over Budget'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {activeTask.costComparison.budgetStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown pills */}
                    {activeTask.actualCost && (
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono">
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">Labour ({activeTask.actualCost.actualLabourHours}h)</span>
                          <span className="text-slate-200">{formatINR(activeTask.actualCost.actualLabourCost)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">Parts</span>
                          <span className="text-slate-200">{formatINR(activeTask.actualCost.sparePartsCost)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">Inspection</span>
                          <span className="text-slate-200">{formatINR(activeTask.actualCost.inspectionFee)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">Service Fee</span>
                          <span className="text-slate-200">{formatINR(activeTask.actualCost.serviceCharge)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">Additional</span>
                          <span className="text-slate-200">{formatINR(activeTask.actualCost.additionalExpenses)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">GST (18%)</span>
                          <span className="text-cyan-300">{formatINR(activeTask.actualCost.taxAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Work Performed Evidence */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                      Submitted Engineering Work Log
                    </span>
                    <p className="text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                      {activeTask.evidence?.workDescription || activeTask.reason}
                    </p>
                  </div>

                  {/* Parts used */}
                  {activeTask.actualCost?.spareParts && activeTask.actualCost.spareParts.length > 0 && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                        Installed Replacement Components
                      </span>
                      <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg overflow-hidden font-mono text-[11px]">
                        {activeTask.actualCost.spareParts.map((sp, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900/60">
                            <span className="font-sans text-slate-200">{sp.partName} (x{sp.quantity})</span>
                            <span className="text-cyan-300 font-bold">{formatINR(sp.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMaintenance(activeTask.id);
                        onNavigate('certificates');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> View Blockchain Certificate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMaintenance(activeTask.id);
                        onNavigate('billing');
                      }}
                      className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <IndianRupee className="w-3.5 h-3.5" /> View in Billing & Payments
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* 1. Work Description */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Engineering Work Description (Required for Verification)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={workDescription}
                    onChange={e => setWorkDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                    placeholder="Describe specific mechanical procedures, disassembly steps, cleaning, and adjustments made..."
                  />
                </div>

                {/* 2. Before & After Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 text-rose-300">
                      Before Condition Evidence
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={beforeCondition}
                      onChange={e => setBeforeCondition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                      placeholder="State of machine prior to service..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 text-emerald-300">
                      After Condition Evidence
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={afterCondition}
                      onChange={e => setAfterCondition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                      placeholder="State of machine following service..."
                    />
                  </div>
                </div>

                {/* 3. Before vs After Sensor Telemetry Comparison */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                      IoT Sensor Calibration Proofs (For Effectiveness Score)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-semibold">Dual Telemetry Verification</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before sensors */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-900/50 space-y-2">
                      <span className="text-[11px] font-bold text-rose-400 block">BEFORE MAINTENANCE SENSORS</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Temp (°C)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={beforeTemp}
                            onChange={e => setBeforeTemp(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Vib (mm/s)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={beforeVib}
                            onChange={e => setBeforeVib(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Pressure (bar)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={beforePres}
                            onChange={e => setBeforePres(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* After sensors */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/50 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-400 block">AFTER MAINTENANCE SENSORS</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Temp (°C)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={afterTemp}
                            onChange={e => setAfterTemp(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Vib (mm/s)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={afterVib}
                            onChange={e => setAfterVib(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Pressure (bar)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={afterPres}
                            onChange={e => setAfterPres(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-300 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Spare Parts Used (Structured Table) */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Spare Parts Consumed & Unit Pricing
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Log OEM components, quantities, and unit rates for transparent invoicing
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-cyan-300">
                      Subtotal: {formatINR(calculatedPartsCost)}
                    </span>
                  </div>

                  {/* Parts Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Part Name / Specification</th>
                          <th className="py-2 px-3 w-16 text-center">Qty</th>
                          <th className="py-2 px-3 w-28 text-right">Unit Price (₹)</th>
                          <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                          <th className="py-2 px-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {sparePartsList.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-sans text-slate-200 font-medium">{p.partName}</td>
                            <td className="py-2 px-3 text-center text-slate-300">{p.quantity}</td>
                            <td className="py-2 px-3 text-right text-slate-400">{formatINR(p.unitPrice)}</td>
                            <td className="py-2 px-3 text-right text-cyan-300 font-bold">{formatINR(p.totalPrice)}</td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSparePart(idx)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded"
                                title="Remove part"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Part Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <input
                      type="text"
                      value={newPartName}
                      onChange={e => setNewPartName(e.target.value)}
                      placeholder="Part name or component spec..."
                      className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="sm:col-span-2 flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={newPartQty}
                        onChange={e => setNewPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                        placeholder="Qty"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 text-xs text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={newPartPrice}
                        onChange={e => setNewPartPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="₹ Unit"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 text-xs text-right focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSparePart}
                      className="sm:col-span-2 bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 hover:border-cyan-700/60 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition py-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Part
                    </button>
                  </div>
                </div>

                {/* 5. Labour Hours & Additional Expenses */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
                    Actual Labour Hours & Additional Expenses
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-semibold text-[11px]">Actual Labour Hours</label>
                        <span className="text-[10px] text-slate-400 font-mono">Rate: {formatINR(hourlyRate)}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="48"
                          value={actualLabourHours}
                          onChange={e => setActualLabourHours(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                          className="w-24 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-cyan-300 font-mono font-bold text-sm"
                        />
                        <span className="text-slate-400 text-xs">hours =</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{formatINR(calculatedLabourCost)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-semibold text-[11px]">Additional Expenses</label>
                        <span className="text-[10px] text-slate-400">Degreaser, rentals, transport</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={additionalExpenses}
                          onChange={e => setAdditionalExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono font-semibold text-sm"
                        />
                        <input
                          type="text"
                          value={additionalExpensesNotes}
                          onChange={e => setAdditionalExpensesNotes(e.target.value)}
                          placeholder="Reason / Notes..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Live Actual Cost Summary & Variance Card */}
                <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                        Live Maintenance Billing Calculator
                      </span>
                      <div className="text-base font-bold text-white mt-0.5">
                        Total Actual Cost: <span className="text-cyan-300 font-mono">{formatINR(calculatedTotalActualCost)}</span>
                      </div>
                    </div>

                    {/* Variance vs Estimate Indicator */}
                    <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Estimated Budget</span>
                        <span className="font-mono text-slate-300 font-semibold">{formatINR(estimatedTotal)}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-800 mx-1" />
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Variance</span>
                        <span className={`font-mono font-bold ${
                          costDifference > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {costDifference >= 0 ? '+' : ''}{formatINR(costDifference)} ({costVariancePercent}%)
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ml-1 ${
                        costDifference > 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {costDifference > 0 ? 'Over Budget' : 'Within Budget'}
                      </span>
                    </div>
                  </div>

                  {/* Cost breakdown item pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] font-mono">
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Labour</span>
                      <span className="text-slate-200 font-semibold">{formatINR(calculatedLabourCost)}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Parts ({sparePartsList.length})</span>
                      <span className="text-slate-200 font-semibold">{formatINR(calculatedPartsCost)}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Inspection</span>
                      <span className="text-slate-200 font-semibold">{formatINR(inspectionFee)}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Service Fee</span>
                      <span className="text-slate-200 font-semibold">{formatINR(serviceCharge)}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Additional</span>
                      <span className="text-slate-200 font-semibold">{formatINR(additionalExpenses)}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">GST (18%)</span>
                      <span className="text-cyan-300 font-semibold">{formatINR(calculatedTax)}</span>
                    </div>
                  </div>

                  {/* Over threshold alert warning */}
                  {isOverVarianceThreshold && (
                    <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        <strong>Budget Variance Notice:</strong> Actual cost exceeds estimate by +{costVariancePercent}% (threshold: 10%). Upon submission, this request will be automatically routed for <strong>Manager Approval</strong> before billing finalization.
                      </span>
                    </div>
                  )}
                </div>

                {/* 7. Technician Calibration Notes */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Technician Calibration Notes & Field Remarks
                  </label>
                  <input
                    type="text"
                    value={technicianNotes}
                    onChange={e => setTechnicianNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Submitting records actual billing to ledger and triggers PoW Mining</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying & Mining...' : 'Complete Maintenance & Submit Billing'}</span>
                  </button>
                </div>
              </form>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Select a task from the left to start work</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once selected, fill out the physical inspection evidence, before/after sensor improvements, and submit for automated blockchain recording.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
