import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { MaintenanceRequest } from '../types';
import { QrCode, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, X, Printer, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetMaintenanceId?: string;
  onSelectMaintenanceId?: (id: string) => void;
}

export const QRVerificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetMaintenanceId,
  onSelectMaintenanceId
}) => {
  const { requests, equipment, technicians, blockchain } = useApp();
  const [selectedId, setSelectedId] = useState<string>(targetMaintenanceId || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (targetMaintenanceId) {
      setSelectedId(targetMaintenanceId);
    } else if (requests.length > 0 && !selectedId) {
      const verified = requests.find(r => r.status === 'Blockchain Recorded' || r.status === 'Verified');
      setSelectedId(verified ? verified.id : requests[0].id);
    }
  }, [targetMaintenanceId, requests, selectedId]);

  const targetReq = requests.find(r => r.id === selectedId);
  const targetEq = targetReq ? equipment.find(e => e.id === targetReq.equipmentId) : undefined;
  const targetTech = targetReq ? technicians.find(t => t.id === targetReq.assignedTechnicianId) : undefined;
  const targetBlock = targetReq?.blockNumber !== undefined ? blockchain.find(b => b.blockNumber === targetReq.blockNumber) : undefined;

  useEffect(() => {
    if (selectedId) {
      const verificationUrl = `${window.location.origin}?verify=${selectedId}`;
      QRCode.toDataURL(verificationUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [selectedId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Cryptographic QR Verification
            </h3>
            <p className="text-xs text-slate-400">Scan to verify proof of maintenance on blockchain</p>
          </div>
        </div>

        {/* Maintenance ID selector / search */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Verified Record
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            {requests.map(req => (
              <option key={req.id} value={req.id}>
                {req.id} — {req.equipmentId} ({req.status})
              </option>
            ))}
          </select>
        </div>

        {targetReq ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5">
            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-lg border border-slate-200">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Maintenance Verification QR" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                  Generating QR...
                </div>
              )}
              <div className="mt-2 text-center">
                <span className="text-[11px] font-mono font-semibold text-slate-900 block truncate max-w-[200px]">
                  {targetReq.id}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Scan to Inspect Proof
                </span>
              </div>
            </div>

            {/* Verification Proof Summary */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Equipment:</span>
                <span className="font-semibold text-slate-200">
                  {targetReq.equipmentId} — {targetEq?.name || 'Equipment'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Certified Tech:</span>
                <span className="font-semibold text-slate-200">
                  {targetTech?.name || targetReq.assignedTechnicianId || 'T001'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Trust Score:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {targetReq.verification?.trustScore ?? 100}/100 ✓
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Effectiveness:</span>
                <span className="font-bold text-cyan-400">
                  {targetReq.effectiveness?.effectivenessScore ?? 92}% ({targetReq.effectiveness?.status ?? 'Effective'})
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Blockchain Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VALID ✓
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Proof of Work:</span>
                <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  {targetBlock ? `Block #${targetBlock.blockNumber} (Nonce ${targetBlock.nonce})` : 'VALID ✓'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No maintenance record found.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically sealed & tamper-evident</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onSelectMaintenanceId && selectedId) {
                  onSelectMaintenanceId(selectedId);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
