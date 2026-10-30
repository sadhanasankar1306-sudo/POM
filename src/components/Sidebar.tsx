import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Activity,
  BrainCircuit,
  Wrench,
  UserCheck,
  CheckCircle2,
  Blocks,
  Award,
  BarChart3,
  Sliders,
  History,
  Shield,
  QrCode,
  Calculator,
  Receipt
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'equipment'
  | 'ai-predictions'
  | 'requests'
  | 'cost-estimation'
  | 'technician'
  | 'verification'
  | 'billing'
  | 'blockchain'
  | 'certificates'
  | 'reports'
  | 'audit-trail'
  | 'settings';

interface Props {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenQR: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenQR,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const {
    equipment,
    requests,
    technicians,
    blockchain,
    billingRecords,
    selectedTechnicianId,
    currentRole,
    chainIntegrity
  } = useApp();

  const criticalEquipCount = equipment.filter(e => e.status === 'Critical').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'Pending' || r.status === 'Assigned' || r.status === 'In Progress').length;
  const techTasksCount = requests.filter(r => r.assignedTechnicianId === selectedTechnicianId && r.status === 'Assigned').length;
  const verifiedCount = requests.filter(r => r.status === 'Verified' || r.status === 'Blockchain Recorded').length;
  const pendingApprovalsCount = requests.filter(r => r.approvalStatus === 'Approval Required' || r.approvalStatus === 'Estimate Pending').length;
  const pendingPaymentsCount = billingRecords?.filter(b => b.paymentStatus === 'Pending' || b.paymentStatus === 'Partially Paid' || b.paymentStatus === 'Unpaid').length || 0;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'equipment' as NavTab,
      label: 'Equipment Monitoring',
      icon: Activity,
      badge: criticalEquipCount > 0 ? { text: `${criticalEquipCount} Crit`, color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' } : null
    },
    {
      id: 'ai-predictions' as NavTab,
      label: 'AI Predictions',
      icon: BrainCircuit,
      badge: { text: 'AI Active', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' }
    },
    {
      id: 'requests' as NavTab,
      label: 'Maintenance Requests',
      icon: Wrench,
      badge: pendingRequestsCount > 0 ? { text: `${pendingRequestsCount}`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' } : null
    },
    {
      id: 'cost-estimation' as NavTab,
      label: 'Smart Cost Estimation',
      icon: Calculator,
      badge: pendingApprovalsCount > 0 ? { text: `${pendingApprovalsCount} Rev`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' } : null
    },
    {
      id: 'technician' as NavTab,
      label: 'Technician Portal',
      icon: UserCheck,
      badge: techTasksCount > 0 ? { text: `${techTasksCount} Task`, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' } : null
    },
    {
      id: 'verification' as NavTab,
      label: 'Verification & Effectiveness',
      icon: CheckCircle2,
      badge: { text: `${verifiedCount} Ver`, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
    },
    {
      id: 'billing' as NavTab,
      label: 'Billing & Payments',
      icon: Receipt,
      badge: pendingPaymentsCount > 0 ? { text: `${pendingPaymentsCount} Due`, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' } : null
    },
    {
      id: 'blockchain' as NavTab,
      label: 'Blockchain Explorer',
      icon: Blocks,
      badge: { text: `#${blockchain.length}`, color: chainIntegrity.isValid ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-rose-500/30 text-rose-300 border-rose-500' }
    },
    {
      id: 'certificates' as NavTab,
      label: 'Maintenance Certificates',
      icon: Award,
      badge: null
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'audit-trail' as NavTab,
      label: 'Audit Trail',
      icon: History,
      badge: null
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand header for mobile */}
        <div className="p-4 border-b border-slate-800 lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-sm">Proof-of-Maintenance</span>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono font-medium ${item.badge.color}`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Fast Action: QR Scan & Role pill */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
          <button
            onClick={onOpenQR}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 text-xs font-semibold shadow-sm transition mb-2"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Cryptographic QR Verification</span>
          </button>

          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Logged Role</span>
              <span className="font-semibold text-slate-200">{currentRole}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">PoW Consensus</span>
              <span className="font-mono text-cyan-400 font-bold">SHA-256</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
