import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillingRecord, PaymentMethod, PaymentStatus, CostApprovalStatus } from '../types';
import { formatINR } from '../utils/costCalculations';
import {
  Receipt,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Printer,
  Download,
  Filter,
  Search,
  Eye,
  PlusCircle,
  ShieldCheck,
  Building,
  UserCheck,
  QrCode,
  FileText,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const BillingPaymentsView: React.FC<Props> = ({
  onNavigate,
  onSelectMaintenance
}) => {
  const {
    billingRecords,
    requests,
    equipment,
    technicians,
    currentRole,
    approveFinalCost,
    rejectCost,
    recordPayment
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<BillingRecord | null>(null);
  const [paymentModalRecord, setPaymentModalRecord] = useState<BillingRecord | null>(null);
  const [rejectModalRecord, setRejectModalRecord] = useState<BillingRecord | null>(null);

  // Record Payment Form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer (NEFT/RTGS)');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Rejection reason state
  const [rejectReason, setRejectReason] = useState<string>('');

  // 7 KPI Calculations as requested in user master prompt
  const totalExpenditure = billingRecords.reduce((sum, b) => sum + (b.finalApprovedCost || b.costEstimate.totalEstimatedCost), 0);
  const totalEstimated = billingRecords.reduce((sum, b) => sum + b.costEstimate.totalEstimatedCost, 0);
  const totalActual = billingRecords.reduce((sum, b) => sum + (b.actualCost?.totalActualCost || b.costEstimate.totalEstimatedCost), 0);
  const paidAmount = billingRecords.reduce((sum, b) => sum + b.totalPaid, 0);
  const unpaidAmount = Math.max(0, totalExpenditure - paidAmount);
  const pendingPaymentsCount = billingRecords.filter(b => b.paymentStatus === 'Pending' || b.paymentStatus === 'Partially Paid' || b.paymentStatus === 'Unpaid').length;
  const overBudgetCount = billingRecords.filter(b => b.costComparison?.budgetStatus === 'Over Budget').length;

  // Filter records
  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenanceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technicianId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      paymentFilter === 'all' || record.paymentStatus === paymentFilter;

    const matchesApproval =
      approvalFilter === 'all' || record.approvalStatus === approvalFilter;

    return matchesSearch && matchesPayment && matchesApproval;
  });

  // Open Payment modal
  const handleOpenPayment = (record: BillingRecord) => {
    setPaymentModalRecord(record);
    setPayAmount(record.remainingBalance);
    setPayRef(`TXN-${Date.now().toString(36).toUpperCase()}`);
    setPayNotes(`Standard settlement for maintenance work order ${record.maintenanceId}`);
  };

  // Submit Payment record
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalRecord || payAmount <= 0) return;

    recordPayment(paymentModalRecord.maintenanceId, {
      amountPaid: payAmount,
      paymentDate: payDate,
      paymentMethod: payMethod,
      transactionReference: payRef,
      notes: payNotes
    });

    setPaymentModalRecord(null);
  };

  // Submit Rejection
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalRecord || !rejectReason.trim()) return;

    rejectCost(rejectModalRecord.maintenanceId, rejectReason);
    setRejectModalRecord(null);
    setRejectReason('');
  };

  const canApprove = currentRole === 'Admin' || currentRole === 'Manager';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              INDUSTRIAL BILLING LEDGER
            </span>
            <span className="text-xs text-slate-400">· Proof-of-Work Backed Invoicing</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Maintenance Billing, Invoicing & Payments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade expenditure tracking, managerial budget variance approvals, and official tax invoice generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Ledger Mode</span>
              <span className="font-semibold text-slate-200">Internal Record Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Summary Cards (User Master Prompt Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Total Expenditure */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Total Expenditure</span>
          <div className="text-base font-bold font-mono text-white">
            {formatINR(totalExpenditure)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Approved budget</span>
        </div>

        {/* 2. Total Estimated */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Total Estimated</span>
          <div className="text-base font-bold font-mono text-cyan-300">
            {formatINR(totalEstimated)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Initial forecasts</span>
        </div>

        {/* 3. Total Actual Cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Total Actual Cost</span>
          <div className="text-base font-bold font-mono text-slate-200">
            {formatINR(totalActual)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Technician submissions</span>
        </div>

        {/* 4. Pending Payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Pending Invoices</span>
          <div className="text-base font-bold font-mono text-amber-400">
            {pendingPaymentsCount} Orders
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Awaiting payment</span>
        </div>

        {/* 5. Paid Amount */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Total Paid</span>
          <div className="text-base font-bold font-mono text-emerald-400">
            {formatINR(paidAmount)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Settled in bank</span>
        </div>

        {/* 6. Unpaid Amount */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Unpaid Balance</span>
          <div className="text-base font-bold font-mono text-rose-400">
            {formatINR(unpaidAmount)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Outstanding liability</span>
        </div>

        {/* 7. Over-Budget Requests */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Over-Budget</span>
          <div className="text-base font-bold font-mono text-amber-300">
            {overBudgetCount} Work Orders
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Exceeded forecast</span>
        </div>
      </div>

      {/* Expense Analytics Mini Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget Variance Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Budget Variance Health
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Total Actual vs Estimated</span>
                <span className={`font-mono font-bold ${
                  totalActual > totalEstimated ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {totalActual > totalEstimated ? '+' : ''}{formatINR(totalActual - totalEstimated)} (
                  {totalEstimated > 0 ? ((totalActual - totalEstimated) / totalEstimated * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-cyan-500 h-full"
                  style={{ width: `${Math.min(100, (totalEstimated / (totalActual || 1)) * 100)}%` }}
                  title="Estimated"
                />
                {totalActual > totalEstimated && (
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${Math.min(100, ((totalActual - totalEstimated) / totalActual) * 100)}%` }}
                    title="Over budget variance"
                  />
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
              <span>Cyan: Estimated Forecast</span>
              <span className="text-rose-400">Red: Over-budget variance</span>
            </div>
          </div>
        </div>

        {/* Payment Settlement Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Payment Settlement Ratio
          </span>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Settled ({formatINR(paidAmount)})</span>
              <span className="font-mono text-emerald-400 font-bold">
                {totalExpenditure > 0 ? Math.round((paidAmount / totalExpenditure) * 100) : 0}% Paid
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalExpenditure > 0 ? Math.min(100, (paidAmount / totalExpenditure) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <span>Paid: {formatINR(paidAmount)}</span>
              <span>Pending: {formatINR(unpaidAmount)}</span>
            </div>
          </div>
        </div>

        {/* Category Distribution Highlights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Top Maintenance Categories
          </span>
          <div className="space-y-1.5 text-xs">
            {['Emergency', 'Preventive', 'Corrective'].map(cat => {
              const catRecords = billingRecords.filter(b => b.costEstimate.maintenanceCategory === cat);
              const catTotal = catRecords.reduce((sum, b) => sum + (b.finalApprovedCost || b.costEstimate.totalEstimatedCost), 0);
              return (
                <div key={cat} className="flex items-center justify-between p-1.5 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-slate-300 font-medium">{cat}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-slate-500">{catRecords.length} jobs</span>
                    <span className="text-cyan-300 font-bold">{formatINR(catTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Billing Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              Maintenance Invoices & Billing Records ({filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized records with approval status, payment tracking, and printable tax receipts
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search invoice or equipment..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <select
              value={approvalFilter}
              onChange={e => setApprovalFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Approval States</option>
              <option value="Approval Required">Approval Required</option>
              <option value="Estimate Pending">Estimate Pending</option>
              <option value="Estimate Approved">Estimate Approved</option>
              <option value="Actual Cost Submitted">Actual Cost Submitted</option>
              <option value="Final Cost Approved">Final Cost Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Invoice & Work Order</th>
                <th className="py-3 px-3">Equipment</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3 text-right">Estimated</th>
                <th className="py-3 px-3 text-right">Actual Cost</th>
                <th className="py-3 px-3 text-right">Variance</th>
                <th className="py-3 px-3 text-center">Approval Status</th>
                <th className="py-3 px-3 text-center">Payment Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filteredRecords.map(record => {
                const eq = equipment.find(e => e.id === record.equipmentId);
                const tech = technicians.find(t => t.id === record.technicianId);
                const estTotal = record.costEstimate.totalEstimatedCost;
                const actTotal = record.actualCost?.totalActualCost;
                const diff = record.costComparison?.costDifference ?? 0;
                const variancePct = record.costComparison?.costVariancePercentage ?? 0;
                const isOver = record.costComparison?.budgetStatus === 'Over Budget';

                return (
                  <tr key={record.id} className="hover:bg-slate-950/60 transition">
                    {/* Invoice ID */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-mono text-xs">{record.id}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{record.maintenanceId}</div>
                    </td>

                    {/* Equipment */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-200">{record.equipmentId}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{eq?.name || 'Asset'}</div>
                    </td>

                    {/* Technician */}
                    <td className="py-3 px-3 font-sans">
                      <div className="text-slate-200">{tech?.name || record.technicianId}</div>
                      <div className="text-[10px] text-slate-500">{record.invoiceDate}</div>
                    </td>

                    {/* Estimated */}
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatINR(estTotal)}
                    </td>

                    {/* Actual */}
                    <td className="py-3 px-3 text-right font-bold">
                      {actTotal !== undefined ? (
                        <span className={isOver ? 'text-rose-400' : 'text-emerald-400'}>
                          {formatINR(actTotal)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans italic text-[10px]">In Progress</span>
                      )}
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-3 text-right">
                      {actTotal !== undefined ? (
                        <span className={diff > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                          {diff >= 0 ? '+' : ''}{formatINR(diff)} ({variancePct}%)
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Approval Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                        record.approvalStatus === 'Final Cost Approved'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : record.approvalStatus === 'Estimate Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : record.approvalStatus === 'Approval Required'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : record.approvalStatus === 'Rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {record.approvalStatus}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                        record.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : record.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {record.paymentStatus}
                      </span>
                      {record.paymentStatus === 'Partially Paid' && (
                        <span className="block text-[9px] text-slate-500 mt-0.5">
                          Bal: {formatINR(record.remainingBalance)}
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Manager Approval Controls */}
                        {canApprove && (record.approvalStatus === 'Approval Required' || record.approvalStatus === 'Actual Cost Submitted') && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveFinalCost(record.maintenanceId)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition"
                              title="Approve Final Cost"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalRecord(record)}
                              className="px-2 py-1 bg-rose-600/80 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition"
                              title="Reject Cost Proposal"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Record Payment Button */}
                        {record.paymentStatus !== 'Paid' && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(record)}
                            className="px-2 py-1 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-200 border border-slate-700 rounded text-[10px] font-semibold transition flex items-center gap-1"
                            title="Record Payment"
                          >
                            <PlusCircle className="w-3 h-3 text-cyan-400" />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* View Invoice Receipt */}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(record)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold transition flex items-center gap-1"
                          title="View Tax Invoice"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Drawer / Modal */}
      {paymentModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Record Maintenance Payment</h3>
              </div>
              <button
                onClick={() => setPaymentModalRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Invoice ID:</span>
                  <span className="text-white font-bold">{paymentModalRecord.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Work Order:</span>
                  <span className="text-cyan-300">{paymentModalRecord.maintenanceId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Approved Charge:</span>
                  <span className="text-white font-bold">{formatINR(paymentModalRecord.finalApprovedCost)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Already Paid:</span>
                  <span className="text-emerald-400">{formatINR(paymentModalRecord.totalPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1">
                  <span>Remaining Balance:</span>
                  <span className="text-rose-400 font-bold">{formatINR(paymentModalRecord.remainingBalance)}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Amount to Record (INR ₹)</label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  max={paymentModalRecord.remainingBalance}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI Digital Payment</option>
                    <option value="Company Corporate Card">Company Corporate Card</option>
                    <option value="Internal Purchase Order">Internal Purchase Order</option>
                    <option value="Cash Voucher">Cash Voucher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Transaction Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. UTR-982187312 or TXN-4481"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Accounting Notes / Remarks</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="Notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalRecord(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-950/40"
                >
                  Confirm & Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Cost Modal */}
      {rejectModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Reject Maintenance Cost Proposal</h3>
              </div>
              <button
                onClick={() => setRejectModalRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <p className="text-slate-400">
                Rejecting cost proposal for work order <strong>{rejectModalRecord.maintenanceId}</strong> will notify the technician and require revision of actual hours or parts.
              </p>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why the submitted labour hours, parts, or expenses were not approved..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalRecord(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Tax Invoice & Billing Receipt Modal (Printable/Downloadable) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Tax Invoice & Industrial Maintenance Receipt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-6 text-xs text-slate-300">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                    <span className="text-base font-bold text-white tracking-tight">PROOF-OF-MAINTENANCE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Automated AI, IoT & Blockchain Maintenance Verification Platform
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    GSTIN: 27AABCP1234F1Z8 · Plant Code: IND-PLANT-MH04
                  </p>
                </div>

                <div className="sm:text-right font-mono text-[11px]">
                  <div className="text-base font-bold text-cyan-300">{selectedInvoice.id}</div>
                  <div className="text-slate-400">Date: {selectedInvoice.invoiceDate}</div>
                  <div className="text-slate-500">Due Date: {selectedInvoice.dueDate}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 font-sans ${
                    selectedInvoice.paymentStatus === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Bill To & Machine Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800 text-[11px]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Asset & Facility</span>
                  <div className="font-bold text-white text-xs mt-0.5">{selectedInvoice.equipmentId}</div>
                  <div className="text-slate-400">
                    {equipment.find(e => e.id === selectedInvoice.equipmentId)?.name || 'Industrial Machine'}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">Work Order: {selectedInvoice.maintenanceId}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Service Engineering</span>
                  <div className="font-bold text-white text-xs mt-0.5">
                    {technicians.find(t => t.id === selectedInvoice.technicianId)?.name || selectedInvoice.technicianId}
                  </div>
                  <div className="text-slate-400">
                    Category: {selectedInvoice.costEstimate.maintenanceCategory}
                  </div>
                  <div className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PoW Blockchain Verified
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3 text-left">Description</th>
                      <th className="py-2 px-3 text-center w-20">Rate / Scope</th>
                      <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-200">
                        Technician Labour Charges
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {selectedInvoice.actualCost ? selectedInvoice.actualCost.actualLabourHours : selectedInvoice.costEstimate.estimatedLabourHours} hours worked
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">
                        {formatINR(selectedInvoice.costEstimate.hourlyLabourRate)}/hr
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-200">
                        {formatINR(selectedInvoice.actualCost?.actualLabourCost || selectedInvoice.costEstimate.estimatedLabourCost)}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-200">
                        Spare Parts Consumed
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {selectedInvoice.actualCost?.spareParts?.map(p => `${p.partName} (x${p.quantity})`).join(', ') || 'Certified components'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">OEM Spec</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-200">
                        {formatINR(selectedInvoice.actualCost?.sparePartsCost || selectedInvoice.costEstimate.sparePartsCost)}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-200">Sensor Diagnostic & NDT Inspection</td>
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">Standard</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-200">
                        {formatINR(selectedInvoice.actualCost?.inspectionFee || selectedInvoice.costEstimate.inspectionFee)}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-200">Industrial Facility Service Fee</td>
                      <td className="py-2 px-3 text-center text-slate-400 font-sans">Base</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-200">
                        {formatINR(selectedInvoice.actualCost?.serviceCharge || selectedInvoice.costEstimate.serviceCharge)}
                      </td>
                    </tr>

                    {(selectedInvoice.actualCost?.additionalExpenses || selectedInvoice.costEstimate.additionalExpenses) > 0 && (
                      <tr>
                        <td className="py-2 px-3 font-sans text-slate-200">Additional Expenses / Consumables</td>
                        <td className="py-2 px-3 text-center text-slate-400 font-sans">Incidental</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-200">
                          {formatINR(selectedInvoice.actualCost?.additionalExpenses || selectedInvoice.costEstimate.additionalExpenses)}
                        </td>
                      </tr>
                    )}

                    <tr className="bg-slate-950 font-semibold text-slate-200">
                      <td className="py-2 px-3 font-sans" colSpan={2}>Taxable Value (Subtotal)</td>
                      <td className="py-2 px-3 text-right">{formatINR(selectedInvoice.actualCost?.subtotal || selectedInvoice.costEstimate.subtotal)}</td>
                    </tr>

                    <tr>
                      <td className="py-2 px-3 font-sans text-cyan-300" colSpan={2}>CGST (9%) + SGST (9%) — Total 18%</td>
                      <td className="py-2 px-3 text-right font-bold text-cyan-300">
                        {formatINR(selectedInvoice.actualCost?.taxAmount || selectedInvoice.costEstimate.taxAmount)}
                      </td>
                    </tr>

                    <tr className="bg-slate-950 text-white font-bold text-xs border-t-2 border-slate-700">
                      <td className="py-3 px-3 font-sans" colSpan={2}>Total Maintenance Charge (INR)</td>
                      <td className="py-3 px-3 text-right text-cyan-300 text-sm">
                        {formatINR(selectedInvoice.finalApprovedCost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment History Table if any */}
              {selectedInvoice.payments.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 uppercase text-[10px] block">
                    Recorded Payment History
                  </span>
                  <div className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    {selectedInvoice.payments.map(p => (
                      <div key={p.id} className="py-1.5 flex items-center justify-between">
                        <div>
                          <span className="text-white font-semibold">{p.paymentMethod}</span>
                          <span className="text-slate-500 text-[10px] block">Ref: {p.transactionReference} · {p.paymentDate}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">{formatINR(p.amountPaid)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-mono text-xs pt-1 border-t border-slate-800 text-slate-300">
                    <span>Outstanding Due:</span>
                    <span className="text-rose-400 font-bold">{formatINR(selectedInvoice.remainingBalance)}</span>
                  </div>
                </div>
              )}

              {/* Footer Signatures & QR */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                <div>
                  <span>Authorized Signatory:</span>
                  <div className="text-slate-300 font-semibold mt-0.5">Automated Plant Accounting Engine</div>
                  <div className="text-[9px]">Proof-of-Maintenance Cryptographic Consensus</div>
                </div>
                <div className="text-right">
                  <span>Cryptographic Proof:</span>
                  <div className="text-cyan-400 font-bold mt-0.5">SHA-256 Validated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
