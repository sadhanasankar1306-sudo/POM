import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceCategory, MaintenanceCostEstimate, SparePartItem } from '../types';
import { formatINR, calculateEstimatedCost } from '../utils/costCalculations';
import {
  Calculator,
  IndianRupee,
  Layers,
  Wrench,
  CheckCircle2,
  Clock,
  Shield,
  Sliders,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const SmartCostEstimationView: React.FC<Props> = ({
  onNavigate,
  onSelectMaintenance
}) => {
  const {
    requests,
    equipment,
    technicians,
    billingConfig,
    updateBillingConfig,
    createOrUpdateCostEstimate,
    approveEstimate,
    currentRole
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected request for breakdown / editing
  const [selectedReqId, setSelectedReqId] = useState<string>(() => requests[0]?.id || '');
  const [isEditingEstimate, setIsEditingEstimate] = useState<boolean>(false);

  // Edit form state
  const activeReq = requests.find(r => r.id === selectedReqId) || requests[0];
  const activeEquip = activeReq ? equipment.find(e => e.id === activeReq.equipmentId) : undefined;
  const activeTech = activeReq ? technicians.find(t => t.id === activeReq.assignedTechnicianId) : undefined;

  // Editable Estimate Fields
  const [editCategory, setEditCategory] = useState<MaintenanceCategory>(
    activeReq?.costEstimate?.maintenanceCategory || 'Preventive'
  );
  const [editHours, setEditHours] = useState<number>(
    activeReq?.costEstimate?.estimatedLabourHours || 3
  );
  const [editHourlyRate, setEditHourlyRate] = useState<number>(
    activeReq?.costEstimate?.hourlyLabourRate || billingConfig.defaultHourlyRate
  );
  const [editParts, setEditParts] = useState<SparePartItem[]>(
    activeReq?.costEstimate?.spareParts || []
  );
  const [editInspectionFee, setEditInspectionFee] = useState<number>(
    activeReq?.costEstimate?.inspectionFee ?? billingConfig.defaultInspectionFee
  );
  const [editServiceCharge, setEditServiceCharge] = useState<number>(
    activeReq?.costEstimate?.serviceCharge ?? billingConfig.defaultServiceCharge
  );
  const [editAdditional, setEditAdditional] = useState<number>(
    activeReq?.costEstimate?.additionalExpenses || 0
  );
  const [editTaxRate, setEditTaxRate] = useState<number>(
    activeReq?.costEstimate?.taxRate || billingConfig.defaultTaxRate
  );

  // New spare part input
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartUnitPrice, setNewPartUnitPrice] = useState(500);

  // Default Rate Configuration Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cfgRate, setCfgRate] = useState(billingConfig.defaultHourlyRate);
  const [cfgInspection, setCfgInspection] = useState(billingConfig.defaultInspectionFee);
  const [cfgService, setCfgService] = useState(billingConfig.defaultServiceCharge);
  const [cfgTax, setCfgTax] = useState(billingConfig.defaultTaxRate);
  const [cfgVariance, setCfgVariance] = useState(billingConfig.budgetVarianceThresholdPercent);

  // Interactive Live Scratchpad Calculator State (User can test any combination)
  const [calcHours, setCalcHours] = useState<number>(3);
  const [calcRate, setCalcRate] = useState<number>(billingConfig.defaultHourlyRate);
  const [calcPartsCost, setCalcPartsCost] = useState<number>(2500);
  const [calcInspection, setCalcInspection] = useState<number>(billingConfig.defaultInspectionFee);
  const [calcService, setCalcService] = useState<number>(billingConfig.defaultServiceCharge);
  const [calcAdditional, setCalcAdditional] = useState<number>(0);
  const [calcTaxRate, setCalcTaxRate] = useState<number>(billingConfig.defaultTaxRate);

  // Interactive Calculator Computed Values
  const scratchLabourCost = calcHours * calcRate;
  const scratchSubtotal = scratchLabourCost + calcPartsCost + calcInspection + calcService + calcAdditional;
  const scratchTaxAmount = Math.round(scratchSubtotal * (calcTaxRate / 100));
  const scratchTotal = scratchSubtotal + scratchTaxAmount;

  // Editing Computed Values
  const currentEditCalc = calculateEstimatedCost({
    labourHours: editHours,
    hourlyRate: editHourlyRate,
    spareParts: editParts,
    inspectionFee: editInspectionFee,
    serviceCharge: editServiceCharge,
    additionalExpenses: editAdditional,
    taxRate: editTaxRate
  });

  // Switch active request selection
  const handleSelectRequest = (reqId: string) => {
    setSelectedReqId(reqId);
    setIsEditingEstimate(false);
    const target = requests.find(r => r.id === reqId);
    if (target?.costEstimate) {
      const est = target.costEstimate;
      setEditCategory(est.maintenanceCategory);
      setEditHours(est.estimatedLabourHours);
      setEditHourlyRate(est.hourlyLabourRate);
      setEditParts(est.spareParts || []);
      setEditInspectionFee(est.inspectionFee);
      setEditServiceCharge(est.serviceCharge);
      setEditAdditional(est.additionalExpenses);
      setEditTaxRate(est.taxRate);
    }
  };

  const handleAddPartToEdit = () => {
    if (newPartName.trim() && newPartQty > 0 && newPartUnitPrice >= 0) {
      const totalPrice = newPartQty * newPartUnitPrice;
      setEditParts([
        ...editParts,
        {
          partName: newPartName.trim(),
          quantity: newPartQty,
          unitPrice: newPartUnitPrice,
          totalPrice
        }
      ]);
      setNewPartName('');
      setNewPartQty(1);
      setNewPartUnitPrice(500);
    }
  };

  const handleRemovePartFromEdit = (index: number) => {
    setEditParts(editParts.filter((_, idx) => idx !== index));
  };

  const handleSaveEstimate = () => {
    if (!activeReq) return;
    createOrUpdateCostEstimate(activeReq.id, {
      maintenanceCategory: editCategory,
      estimatedLabourHours: editHours,
      hourlyLabourRate: editHourlyRate,
      spareParts: editParts,
      inspectionFee: editInspectionFee,
      serviceCharge: editServiceCharge,
      additionalExpenses: editAdditional,
      taxRate: editTaxRate
    });
    setIsEditingEstimate(false);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBillingConfig({
      defaultHourlyRate: cfgRate,
      defaultInspectionFee: cfgInspection,
      defaultServiceCharge: cfgService,
      defaultTaxRate: cfgTax,
      budgetVarianceThresholdPercent: cfgVariance
    });
    setShowConfigModal(false);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || req.costEstimate?.maintenanceCategory === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && req.approvalStatus === 'Estimate Pending') ||
      (statusFilter === 'approved' && (req.approvalStatus === 'Estimate Approved' || req.approvalStatus === 'Final Cost Approved')) ||
      (statusFilter === 'over_budget' && req.costComparison?.budgetStatus === 'Over Budget');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const canApprove = currentRole === 'Admin' || currentRole === 'Manager';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              SMART COST & BILLING MODULE
            </span>
            <span className="text-xs text-slate-400">· Real-Time Indian Rupee (₹) Estimator</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Smart Maintenance Cost Estimation & Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic algorithm factoring equipment class, labour hours, OEM spare parts, service fees, and 18% GST.
          </p>
        </div>

        {/* Global Rates & Config Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Standard Rate</span>
              <span className="font-mono text-cyan-300 font-bold">{formatINR(billingConfig.defaultHourlyRate)}/hr</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Base GST</span>
              <span className="font-mono text-slate-300 font-bold">{billingConfig.defaultTaxRate}%</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Variance Cap</span>
              <span className="font-mono text-amber-400 font-bold">±{billingConfig.budgetVarianceThresholdPercent}%</span>
            </div>
          </div>

          {canApprove && (
            <button
              onClick={() => {
                setCfgRate(billingConfig.defaultHourlyRate);
                setCfgInspection(billingConfig.defaultInspectionFee);
                setCfgService(billingConfig.defaultServiceCharge);
                setCfgTax(billingConfig.defaultTaxRate);
                setCfgVariance(billingConfig.budgetVarianceThresholdPercent);
                setShowConfigModal(true);
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Configure Default Rates (Admin / Manager)"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Rates</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Interactive Cost Calculator Sandbox (Prompt Requirement 2) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Dynamic Cost Estimation Calculator
              </h3>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                Interactive Formula Sandbox
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Formula: Total Estimated Cost = Labour Cost + Spare Parts + Inspection Fee + Service Charge + Additional Expenses + Tax
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Estimated Charge</span>
            <span className="text-xl font-bold font-mono text-cyan-300">
              {formatINR(scratchTotal)}
            </span>
          </div>
        </div>

        {/* Live Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* Labour Hours */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">Labour Hours</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={calcHours}
              onChange={e => setCalcHours(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              = {formatINR(scratchLabourCost)}
            </span>
          </div>

          {/* Hourly Rate */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">Hourly Rate (₹)</label>
            <input
              type="number"
              step="50"
              min="100"
              value={calcRate}
              onChange={e => setCalcRate(Math.max(100, parseFloat(e.target.value) || 100))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">per technician-hour</span>
          </div>

          {/* Spare Parts */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">Spare Parts (₹)</label>
            <input
              type="number"
              step="100"
              min="0"
              value={calcPartsCost}
              onChange={e => setCalcPartsCost(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">OEM replacements</span>
          </div>

          {/* Inspection Fee */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">Inspection Fee (₹)</label>
            <input
              type="number"
              step="50"
              min="0"
              value={calcInspection}
              onChange={e => setCalcInspection(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Diagnostics / NDT</span>
          </div>

          {/* Service Charge */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">Service Fee (₹)</label>
            <input
              type="number"
              step="50"
              min="0"
              value={calcService}
              onChange={e => setCalcService(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Base handling</span>
          </div>

          {/* Additional Expenses */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">Additional (₹)</label>
            <input
              type="number"
              step="50"
              min="0"
              value={calcAdditional}
              onChange={e => setCalcAdditional(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Freight / Solvent</span>
          </div>

          {/* Tax % */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <label className="text-slate-400 text-[10px] block mb-1">GST Tax ({calcTaxRate}%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="28"
              value={calcTaxRate}
              onChange={e => setCalcTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono font-bold"
            />
            <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
              = {formatINR(scratchTaxAmount)}
            </span>
          </div>
        </div>

        {/* Live Summary Table Example from User Master Prompt */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Itemized Estimate Breakdown Example</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead className="text-slate-500 text-[9px] uppercase border-b border-slate-800">
                <tr>
                  <th className="text-left py-1">Cost Component</th>
                  <th className="text-right py-1">Calculation</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                <tr>
                  <td className="py-1 font-sans">Technician Labour</td>
                  <td className="text-right text-slate-400 font-sans">{calcHours} hours × {formatINR(calcRate)}</td>
                  <td className="text-right font-bold text-slate-200">{formatINR(scratchLabourCost)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-sans">Spare Parts & Components</td>
                  <td className="text-right text-slate-400 font-sans">OEM certified replacements</td>
                  <td className="text-right font-bold text-slate-200">{formatINR(calcPartsCost)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-sans">Inspection Fee</td>
                  <td className="text-right text-slate-400 font-sans">NDT, calibration & safety check</td>
                  <td className="text-right font-bold text-slate-200">{formatINR(calcInspection)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-sans">Service Charge</td>
                  <td className="text-right text-slate-400 font-sans">Plant facility overhead</td>
                  <td className="text-right font-bold text-slate-200">{formatINR(calcService)}</td>
                </tr>
                {calcAdditional > 0 && (
                  <tr>
                    <td className="py-1 font-sans">Additional Expenses</td>
                    <td className="text-right text-slate-400 font-sans">Specialized tooling & consumables</td>
                    <td className="text-right font-bold text-slate-200">{formatINR(calcAdditional)}</td>
                  </tr>
                )}
                <tr className="bg-slate-900/60 font-semibold text-slate-200">
                  <td className="py-1 font-sans">Subtotal</td>
                  <td className="text-right font-sans text-slate-400">Sum of direct charges</td>
                  <td className="text-right">{formatINR(scratchSubtotal)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-sans text-cyan-300">Tax (GST {calcTaxRate}%)</td>
                  <td className="text-right text-slate-400 font-sans">{calcTaxRate}% on {formatINR(scratchSubtotal)}</td>
                  <td className="text-right font-bold text-cyan-300">{formatINR(scratchTaxAmount)}</td>
                </tr>
                <tr className="bg-cyan-950/40 text-white font-bold text-xs">
                  <td className="py-1.5 font-sans">Total Estimated Cost</td>
                  <td className="text-right font-sans text-cyan-300">Total payable estimate</td>
                  <td className="text-right text-cyan-300 font-mono text-sm">{formatINR(scratchTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Request Estimates List (5 cols), Right Detailed Estimate Breakdown & Editor (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Order Estimates */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Work Order Cost Estimates ({filteredRequests.length})
              </h3>
            </div>

            {/* Search & Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Request ID, Machine, Description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Predictive">Predictive</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Overhaul">Overhaul</option>
                  <option value="Inspection">Inspection</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Estimate Pending</option>
                  <option value="approved">Approved</option>
                  <option value="over_budget">Over Budget</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredRequests.map(req => {
                const isSelected = req.id === selectedReqId;
                const eq = equipment.find(e => e.id === req.equipmentId);
                const estTotal = req.costEstimate?.totalEstimatedCost || 0;
                const actualTotal = req.actualCost?.totalActualCost;

                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/40 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-300">{req.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({req.equipmentId})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.approvalStatus === 'Estimate Approved' || req.approvalStatus === 'Final Cost Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : req.approvalStatus === 'Approval Required'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.approvalStatus || 'Estimate Pending'}
                      </span>
                    </div>

                    <div className="text-xs text-white font-medium truncate mb-1">
                      {eq?.name || req.equipmentId} · {req.costEstimate?.maintenanceCategory || 'General Service'}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Estimated</span>
                        <span className="text-cyan-300 font-bold">{formatINR(estTotal)}</span>
                      </div>

                      {actualTotal !== undefined ? (
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Actual</span>
                          <span className={`font-bold ${
                            req.costComparison?.budgetStatus === 'Over Budget' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {formatINR(actualTotal)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Priority</span>
                          <span className={`text-[10px] font-semibold ${
                            req.priority === 'High' || req.priority === 'Emergency' ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {req.priority}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance Cost Breakdown & Editor (7 cols) */}
        <div className="lg:col-span-7">
          {activeReq ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      COST BREAKDOWN & AUDIT
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeReq.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {activeEquip?.name || activeReq.equipmentId} ({activeReq.equipmentId})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Category: <span className="text-cyan-300 font-semibold">{activeReq.costEstimate?.maintenanceCategory || 'Preventive'}</span> · Assigned: <span className="text-slate-200">{activeTech?.name || 'Unassigned'}</span>
                  </p>
                </div>

                {/* Edit & Approval Controls */}
                <div className="flex items-center gap-2">
                  {!isEditingEstimate ? (
                    <>
                      {canApprove && (
                        <button
                          type="button"
                          onClick={() => setIsEditingEstimate(true)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit Estimate</span>
                        </button>
                      )}

                      {canApprove && (activeReq.approvalStatus === 'Estimate Pending' || !activeReq.approvalStatus) && (
                        <button
                          type="button"
                          onClick={() => approveEstimate(activeReq.id, 'Estimate reviewed and authorized by manager')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Estimate</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingEstimate(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEstimate}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-950"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View / Edit Mode */}
              {!isEditingEstimate ? (
                /* READ-ONLY DETAILED BREAKDOWN */
                <div className="space-y-5 text-xs">
                  {/* Top Cost Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Estimated Labour</span>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {formatINR(activeReq.costEstimate?.estimatedLabourCost || 0)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeReq.costEstimate?.estimatedLabourHours || 0} hrs @ {formatINR(activeReq.costEstimate?.hourlyLabourRate || billingConfig.defaultHourlyRate)}/hr
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Spare Parts & Components</span>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {formatINR(activeReq.costEstimate?.sparePartsCost || 0)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {activeReq.costEstimate?.spareParts?.length || 0} line items specified
                      </span>
                    </div>

                    <div className="p-3 bg-gradient-to-br from-cyan-950/60 to-slate-950 rounded-xl border border-cyan-500/30">
                      <span className="text-[10px] uppercase text-cyan-400 font-bold block">Total Estimated Charge</span>
                      <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                        {formatINR(activeReq.costEstimate?.totalEstimatedCost || 0)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Includes 18% GST ({formatINR(activeReq.costEstimate?.taxAmount || 0)})
                      </span>
                    </div>
                  </div>

                  {/* Detailed Itemized Table */}
                  <div className="bg-slate-950/70 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-3 bg-slate-900/60 border-b border-slate-800 font-bold text-slate-200 text-xs flex items-center justify-between">
                      <span>Itemized Cost Schedule (INR)</span>
                      <span className="text-[10px] font-mono text-cyan-400">Verified Industrial Rates</span>
                    </div>
                    <table className="w-full text-[11px] font-mono">
                      <thead className="bg-slate-900/40 text-slate-400 text-[9px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3 text-left">Cost Component</th>
                          <th className="py-2 px-3 text-left">Details / Scope</th>
                          <th className="py-2 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">Technician Labour</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">
                            {activeReq.costEstimate?.estimatedLabourHours || 0} hrs × {formatINR(activeReq.costEstimate?.hourlyLabourRate || billingConfig.defaultHourlyRate)}/hr
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                            {formatINR(activeReq.costEstimate?.estimatedLabourCost || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">Spare Parts Allocation</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">
                            {activeReq.costEstimate?.spareParts && activeReq.costEstimate.spareParts.length > 0 ? (
                              activeReq.costEstimate.spareParts.map(p => `${p.partName} (x${p.quantity})`).join(', ')
                            ) : (
                              'Standard service consumables & lubricants'
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                            {formatINR(activeReq.costEstimate?.sparePartsCost || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">Inspection & NDT Diagnostic</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">Vibration analyzer & infrared thermography baseline</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                            {formatINR(activeReq.costEstimate?.inspectionFee || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">Plant Service Charge</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">Tooling depreciation & shop supplies</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                            {formatINR(activeReq.costEstimate?.serviceCharge || 0)}
                          </td>
                        </tr>
                        {(activeReq.costEstimate?.additionalExpenses || 0) > 0 && (
                          <tr>
                            <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">Additional Expenses</td>
                            <td className="py-2.5 px-3 font-sans text-slate-400">Disposal fees & specialized equipment rental</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                              {formatINR(activeReq.costEstimate?.additionalExpenses || 0)}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-slate-900/60 font-semibold text-slate-200">
                          <td className="py-2.5 px-3 font-sans">Pre-Tax Subtotal</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">Base industrial charges</td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            {formatINR(activeReq.costEstimate?.subtotal || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-cyan-300">GST ({activeReq.costEstimate?.taxRate || 18}%)</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">Tax applied to pre-tax subtotal</td>
                          <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                            {formatINR(activeReq.costEstimate?.taxAmount || 0)}
                          </td>
                        </tr>
                        <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
                          <td className="py-3 px-3 font-sans">Total Estimated Cost</td>
                          <td className="py-3 px-3 font-sans text-cyan-400 text-[10px]">
                            Auto-locked upon managerial approval
                          </td>
                          <td className="py-3 px-3 text-right text-cyan-300 font-mono text-sm">
                            {formatINR(activeReq.costEstimate?.totalEstimatedCost || 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Variance Comparison Box if actual cost exists */}
                  {activeReq.costComparison && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                          Variance Analysis (Estimated vs Actual)
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          activeReq.costComparison.budgetStatus === 'Over Budget'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {activeReq.costComparison.budgetStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
                        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Estimated</span>
                          <span className="text-slate-200 font-bold">{formatINR(activeReq.costComparison.estimatedCost)}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Actual</span>
                          <span className="text-cyan-300 font-bold">{formatINR(activeReq.costComparison.actualCost)}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Difference & Variance</span>
                          <span className={`font-bold ${
                            activeReq.costComparison.costDifference > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {activeReq.costComparison.costDifference >= 0 ? '+' : ''}{formatINR(activeReq.costComparison.costDifference)} ({activeReq.costComparison.costVariancePercentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMaintenance(activeReq.id);
                        onNavigate('billing');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Billing Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMaintenance(activeReq.id);
                        onNavigate('technician');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Technician Portal</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT ESTIMATE FORM FOR ADMIN / MANAGER */
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-xl text-cyan-300 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Editing cost estimate for request <strong>{activeReq.id}</strong>. Totals update dynamically.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Maintenance Category</label>
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value as MaintenanceCategory)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Preventive">Preventive Maintenance</option>
                        <option value="Corrective">Corrective Repair</option>
                        <option value="Predictive">Predictive (AI Triggered)</option>
                        <option value="Emergency">Emergency Breakdown</option>
                        <option value="Inspection">Safety & Sensor Calibration</option>
                        <option value="Overhaul">Comprehensive Overhaul</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Estimated Labour Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={editHours}
                        onChange={e => setEditHours(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Hourly Labour Rate (₹)</label>
                      <input
                        type="number"
                        step="50"
                        min="100"
                        value={editHourlyRate}
                        onChange={e => setEditHourlyRate(Math.max(100, parseFloat(e.target.value) || 100))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Inspection Fee (₹)</label>
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={editInspectionFee}
                        onChange={e => setEditInspectionFee(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Plant Service Charge (₹)</label>
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={editServiceCharge}
                        onChange={e => setEditServiceCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Additional Expenses (₹)</label>
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={editAdditional}
                        onChange={e => setEditAdditional(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Spare parts items table */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 uppercase text-[10px] block">
                      Spare Parts Line Items ({editParts.length})
                    </span>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {editParts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                          <span className="font-sans text-slate-200">{p.partName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px]">x{p.quantity} @ {formatINR(p.unitPrice)}</span>
                            <span className="text-cyan-300 font-bold">{formatINR(p.totalPrice)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePartFromEdit(idx)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add part mini form */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Part name..."
                        value={newPartName}
                        onChange={e => setNewPartName(e.target.value)}
                        className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={newPartQty}
                        onChange={e => setNewPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-center"
                      />
                      <input
                        type="number"
                        placeholder="Unit ₹"
                        min="0"
                        step="50"
                        value={newPartUnitPrice}
                        onChange={e => setNewPartUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddPartToEdit}
                        className="sm:col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Live Recalculated Total Preview */}
                  <div className="p-3 bg-gradient-to-r from-slate-950 to-cyan-950/40 rounded-xl border border-cyan-500/30 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-sans">New Total Calculation Preview</span>
                      <span className="text-xs text-slate-300">
                        Subtotal: {formatINR(currentEditCalc.subtotal)} + Tax ({editTaxRate}%): {formatINR(currentEditCalc.taxAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-cyan-300">
                        {formatINR(currentEditCalc.totalEstimatedCost)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Select a work order from the left to inspect and configure cost estimates.
            </div>
          )}
        </div>
      </div>

      {/* Default Rates Configuration Modal (Admin & Manager) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Default Industrial Rates Configuration</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <p className="text-slate-400 text-[11px]">
                Authorized role (<strong>{currentRole}</strong>): Setting default rates updates new maintenance requests automatically.
              </p>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Default Technician Labour Rate (₹/hr)</label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  required
                  value={cfgRate}
                  onChange={e => setCfgRate(Math.max(100, parseFloat(e.target.value) || 100))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Standard Diagnostic Inspection Fee (₹)</label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  required
                  value={cfgInspection}
                  onChange={e => setCfgInspection(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Plant Base Service Fee (₹)</label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  required
                  value={cfgService}
                  onChange={e => setCfgService(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Default GST Tax (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="28"
                    required
                    value={cfgTax}
                    onChange={e => setCfgTax(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Budget Variance Cap (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="50"
                    required
                    value={cfgVariance}
                    onChange={e => setCfgVariance(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-950/40"
                >
                  Save Global Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
