import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  Radio,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Bell,
  User,
  Zap,
  Flame,
  Check,
  ChevronDown
} from 'lucide-react';

interface Props {
  onOpenQR: () => void;
  onOpenTamperAlert: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenQR, onOpenTamperAlert }) => {
  const {
    currentRole,
    setCurrentRole,
    selectedTechnicianId,
    setSelectedTechnicianId,
    technicians,
    simulationActive,
    setSimulationActive,
    lastSimUpdate,
    chainIntegrity,
    difficultyPrefix,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    injectFault
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFaultMenu, setShowFaultMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-slate-900 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Proof-of-Maintenance
              </h1>
              <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PoW Consensus
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Automated AI, IoT & Blockchain Industrial Verification
            </p>
          </div>
        </div>

        {/* Center Live Badges */}
        <div className="hidden xl:flex items-center gap-2.5">
          {/* Live Sensor Badge */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="relative flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              {simulationActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <span className="font-semibold text-slate-200">LIVE SENSOR SIMULATION</span>
            <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
              {lastSimUpdate}
            </span>
            <button
              onClick={() => setSimulationActive(!simulationActive)}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition ${
                simulationActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {simulationActive ? 'Active' : 'Paused'}
            </button>
          </div>

          {/* Proof of Work Status */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">PoW Rule:</span>
            <span className="font-mono font-bold text-amber-300">
              Target '{difficultyPrefix}'
            </span>
          </div>

          {/* Blockchain Integrity Badge */}
          {chainIntegrity.isValid ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">BLOCKCHAIN: VALID ✓</span>
            </div>
          ) : (
            <button
              onClick={onOpenTamperAlert}
              className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-600 px-3 py-1.5 rounded-xl text-xs text-rose-300 animate-pulse font-bold hover:bg-rose-900 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>SECURITY ALERT: TAMPER DETECTED ⚠</span>
            </button>
          )}
        </div>

        {/* Right Tools & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulate Fault Quick Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowFaultMenu(!showFaultMenu)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/50 hover:to-rose-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Test end-to-end automation by injecting simulated machine fault"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Simulate Fault</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showFaultMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Inject Industrial Anomaly
                </div>
                <button
                  onClick={() => {
                    injectFault('M103', 'temperature');
                    setShowFaultMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition"
                >
                  <span>M103: Overheating Spike (94.8°C)</span>
                  <span className="text-rose-400 font-bold">Critical</span>
                </button>
                <button
                  onClick={() => {
                    injectFault('M102', 'vibration');
                    setShowFaultMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition"
                >
                  <span>M102: Severe Vibration (7.8 mm/s)</span>
                  <span className="text-amber-400 font-bold">Critical</span>
                </button>
                <button
                  onClick={() => {
                    injectFault('M106', 'hours');
                    setShowFaultMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition"
                >
                  <span>M106: Interval Exceeded (&gt;5000h)</span>
                  <span className="text-amber-400 font-bold">Warning</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Notifications</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {notifications.length}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80 my-2">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`py-2.5 px-2 rounded-lg cursor-pointer transition ${
                        notif.read ? 'opacity-70 hover:opacity-100' : 'bg-slate-800/40 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${
                          notif.type === 'security' ? 'text-rose-400' :
                          notif.type === 'blockchain' ? 'text-emerald-400' :
                          notif.type === 'ai' ? 'text-amber-400' : 'text-cyan-400'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {notif.timestamp.slice(11, 16)}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                {(['Admin', 'Technician', 'Manager'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                      currentRole === role ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}

                {currentRole === 'Technician' && (
                  <div className="border-t border-slate-800 pt-2 mt-1">
                    <span className="block px-3 py-1 text-[10px] uppercase font-semibold text-slate-400">
                      Switch Tech Profile
                    </span>
                    {technicians.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTechnicianId(t.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-[11px] truncate ${
                          selectedTechnicianId === t.id ? 'text-cyan-400 font-semibold bg-slate-800' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.name} ({t.id})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
