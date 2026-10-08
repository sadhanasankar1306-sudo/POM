import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { LiveMiningModal } from './components/LiveMiningModal';
import { TamperAlertModal } from './components/TamperAlertModal';
import { QRVerificationModal } from './components/QRVerificationModal';

import { DashboardView } from './views/DashboardView';
import { EquipmentView } from './views/EquipmentView';
import { AIPredictionsView } from './views/AIPredictionsView';
import { RequestsView } from './views/RequestsView';
import { TechnicianPortalView } from './views/TechnicianPortalView';
import { VerificationView } from './views/VerificationView';
import { BlockchainView } from './views/BlockchainView';
import { CertificatesView } from './views/CertificatesView';
import { ReportsView } from './views/ReportsView';
import { AuditTrailView } from './views/AuditTrailView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  const { chainIntegrity } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState<boolean>(false);

  // Check URL query parameters for direct QR verification links (e.g. ?verify=PM-M103-...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify');
    if (verifyId) {
      setSelectedMaintenanceId(verifyId);
      setActiveTab('certificates');
    }
  }, []);

  // Show tamper alert if chain is ever compromised and user hasn't explicitly dismissed it yet
  useEffect(() => {
    if (!chainIntegrity.isValid) {
      setIsTamperModalOpen(true);
    }
  }, [chainIntegrity.isValid]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenTamperAlert={() => setIsTamperModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQR={() => setIsQRModalOpen(true)}
          isOpenMobile={isMobileMenuOpen}
          setIsOpenMobile={setIsMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile menu open trigger */}
          <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-800">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-300 flex items-center gap-2"
            >
              <span>☰ Menu</span>
            </button>
            <span className="text-xs font-mono text-slate-400 capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
            />
          )}

          {activeTab === 'ai-predictions' && (
            <AIPredictionsView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
            />
          )}

          {activeTab === 'technician' && (
            <TechnicianPortalView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
              selectedMaintenanceId={selectedMaintenanceId}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
              selectedMaintenanceId={selectedMaintenanceId}
            />
          )}

          {activeTab === 'blockchain' && (
            <BlockchainView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesView
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMaintenance={(id) => setSelectedMaintenanceId(id)}
              selectedMaintenanceId={selectedMaintenanceId}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'audit-trail' && <AuditTrailView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Proof-of-Work Live Mining Overlay Modal */}
      <LiveMiningModal />

      {/* Security Alert: Blockchain Integrity Compromised Modal */}
      <TamperAlertModal
        isOpen={isTamperModalOpen}
        onClose={() => setIsTamperModalOpen(false)}
      />

      {/* Cryptographic QR Verification Modal */}
      <QRVerificationModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetMaintenanceId={selectedMaintenanceId}
        onSelectMaintenanceId={(id) => {
          setSelectedMaintenanceId(id);
          setActiveTab('certificates');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
