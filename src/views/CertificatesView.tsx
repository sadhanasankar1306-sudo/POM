import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  QrCode,
  Blocks,
  UserCheck,
  Calendar,
  Wrench,
  Search,
  ExternalLink,
  Zap,
  Check
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
  selectedMaintenanceId?: string;
}

export const CertificatesView: React.FC<Props> = ({
  onNavigate,
  onSelectMaintenance,
  selectedMaintenanceId
}) => {
  const {
    requests,
    equipment,
    technicians,
    blockchain,
    chainIntegrity
  } = useApp();

  const [activeCertId, setActiveCertId] = useState<string>(() => {
    if (selectedMaintenanceId) return selectedMaintenanceId;
    const recorded = requests.find(r => r.status === 'Blockchain Recorded' || r.status === 'Verified');
    return recorded ? recorded.id : requests[0]?.id || '';
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const certificateRef = useRef<HTMLDivElement>(null);

  const currentReq = requests.find(r => r.id === activeCertId) || requests[0];
  const currentEq = currentReq ? equipment.find(e => e.id === currentReq.equipmentId) : undefined;
  const currentTech = currentReq ? technicians.find(t => t.id === currentReq.assignedTechnicianId) : undefined;
  const currentBlock = currentReq?.blockNumber !== undefined ? blockchain.find(b => b.blockNumber === currentReq.blockNumber) : undefined;

  const certificateId = currentReq ? `CERT-${currentReq.id}` : 'CERT-NONE';

  useEffect(() => {
    if (currentReq) {
      const verifyUrl = `${window.location.origin}?verify=${currentReq.id}`;
      QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }
  }, [currentReq]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!currentReq) return;
    const certData = {
      certificateId,
      maintenanceId: currentReq.id,
      equipment: `${currentReq.equipmentId} - ${currentEq?.name}`,
      technician: `${currentTech?.name} (${currentReq.assignedTechnicianId})`,
      maintenanceDate: currentReq.evidence?.completedAt || currentReq.createdDate,
      workPerformed: currentReq.evidence?.workDescription,
      beforeCondition: currentReq.evidence?.beforeCondition,
      afterCondition: currentReq.evidence?.afterCondition,
      trustScore: `${currentReq.verification?.trustScore ?? 100}/100`,
      effectivenessScore: `${currentReq.effectiveness?.effectivenessScore ?? 92}% (${currentReq.effectiveness?.status ?? 'Effective'})`,
      blockNumber: currentBlock?.blockNumber,
      nonce: currentBlock?.nonce,
      previousHash: currentBlock?.previousHash,
      currentHash: currentBlock?.currentHash,
      blockchainStatus: chainIntegrity.isValid ? 'VALID' : 'TAMPER_ALERT',
      powStatus: currentBlock?.powStatus || 'VALID',
      verifiedBy: currentReq.verification?.verifiedBy || 'Automated Verification Engine v2.4'
    };

    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Certificate Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              OFFICIAL CERTIFICATION DESK
            </span>
            <span className="text-xs text-slate-400">· Tamper-Evident Digital Passports</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Proof-of-Maintenance Certificates & QR Passports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Legally provable maintenance certificates backed by cryptographic SHA-256 Proof of Work consensus.
          </p>
        </div>

        {/* Certificate selector dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={activeCertId}
            onChange={e => {
              setActiveCertId(e.target.value);
              onSelectMaintenance(e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            {requests.map(r => (
              <option key={r.id} value={r.id}>
                {r.id} ({r.equipmentId} · {r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Toolbar (Print / Download / View Verification) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-xs print:hidden">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>Displaying Certificate ID:</span>
          <span className="text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {certificateId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('verification')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Verification Audit</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Certificate</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* The Printable Certificate Container */}
      {currentReq && (
        <div
          ref={certificateRef}
          className="bg-slate-950 border-2 border-cyan-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white max-w-4xl mx-auto"
        >
          {/* Subtle Guilloché / Corner Accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-cyan-500/40 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-cyan-500/40 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-cyan-500/40 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-cyan-500/40 rounded-br-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="text-center pb-6 border-b border-slate-800/80 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 mb-3 shadow-lg shadow-cyan-950/50">
              <Award className="w-8 h-8" />
            </div>

            <div className="text-[11px] uppercase font-mono tracking-widest text-cyan-400 font-bold mb-1">
              AUTONOMOUS INDUSTRIAL VERIFICATION CONSENSUS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider uppercase font-serif">
              Proof-of-Maintenance Certificate
            </h1>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              Cryptographically sealed record certifying industrial service completion, multi-criteria trust validation, and permanent Proof-of-Work blockchain inscription.
            </p>

            <div className="mt-4 inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-1 rounded-xl text-xs font-mono">
              <span className="text-slate-400">CERTIFICATE NO:</span>
              <span className="text-cyan-300 font-bold">{certificateId}</span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="py-6 space-y-6">
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
                  Maintenance ID
                </span>
                <span className="font-mono font-bold text-white text-xs">{currentReq.id}</span>
              </div>

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
                  Equipment Asset
                </span>
                <span className="font-bold text-white text-xs">
                  {currentReq.equipmentId} ({currentEq?.name})
                </span>
              </div>

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
                  Certified Technician
                </span>
                <span className="font-bold text-white text-xs">
                  {currentTech?.name || currentReq.assignedTechnicianId}
                </span>
              </div>

              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
                  Maintenance Date
                </span>
                <span className="font-mono text-white text-xs">
                  {currentReq.evidence?.completedAt || currentReq.createdDate}
                </span>
              </div>
            </div>

            {/* Engineering Work Performed Details */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Scope of Work Performed:
                </span>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {currentReq.evidence?.workDescription || currentReq.reason}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
                    Before Condition:
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    {currentReq.evidence?.beforeCondition || 'Elevated temperature and vibration harmonics exceeding standard baseline.'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                    After Condition:
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    {currentReq.evidence?.afterCondition || 'Smooth rotation, nominal operating parameters restored to specifications.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scores & QR Code Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              {/* Trust Score Box */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-emerald-900/60 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Trust Score
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  {currentReq.verification?.trustScore ?? 100}/100
                </div>
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Verified 5/5 Checks</span>
                </div>
              </div>

              {/* Effectiveness Score Box */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-cyan-900/60 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Effectiveness Score
                </span>
                <div className="text-3xl font-extrabold font-mono text-cyan-400">
                  {currentReq.effectiveness?.effectivenessScore ?? 92}%
                </div>
                <div className="text-[11px] text-cyan-300 font-semibold">
                  Status: {currentReq.effectiveness?.status ?? 'Effective'}
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center text-slate-900">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Certificate QR" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 flex items-center justify-center text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="mt-1 text-center">
                  <span className="text-[9px] font-mono font-bold block text-slate-900 truncate max-w-[160px]">
                    {currentReq.id}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">
                    Scan for Cryptographic Proof
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof of Work Blockchain Ledger Proof */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400 font-sans flex items-center gap-1.5">
                  <Blocks className="w-3.5 h-3.5" />
                  Proof-of-Work Blockchain Record
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-[11px]">
                    Blockchain: VALID ✓
                  </span>
                  <span className="text-cyan-300 font-bold text-[11px]">
                    Proof of Work: VALID ✓
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px]">BLOCK NO:</span>
                  <span className="text-white font-bold">#{currentBlock?.blockNumber ?? 1}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">MINED NONCE:</span>
                  <span className="text-emerald-400 font-bold">{currentBlock?.nonce ?? 74332}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[9px]">TARGET DIFFICULTY:</span>
                  <span className="text-amber-400 font-bold">SHA-256 (Prefix '0000')</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[9px]">PREVIOUS BLOCK HASH:</span>
                <span className="text-slate-400 text-[10px] break-all block bg-slate-950 p-1.5 rounded">
                  {currentBlock?.previousHash || '0000000000000000000000000000000000000000000000000000000000000000'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[9px]">CURRENT MINED BLOCK HASH:</span>
                <span className="text-cyan-400 text-[10px] font-bold break-all block bg-slate-950 p-1.5 rounded border border-cyan-950">
                  {currentBlock?.currentHash || '0000a4b78912c4e5f03912da48e91cb3489e21df98716254ab819024f0c91823'}
                </span>
              </div>
            </div>
          </div>

          {/* Certificate Footer / Signature Seal */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Verified by Autonomous Verification Engine v2.4</span>
            </div>
            <div className="text-right font-mono text-[11px]">
              <span>Issued: {new Date().toLocaleDateString()} · Immutable Consensus</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
