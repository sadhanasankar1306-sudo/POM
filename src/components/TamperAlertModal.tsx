import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ShieldAlert, RefreshCw, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TamperAlertModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { chainIntegrity, restoreBlockchain } = useApp();

  if (!isOpen || chainIntegrity.isValid) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl shadow-rose-950/80 text-white animate-in zoom-in-95">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700">
                SECURITY ALERT
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Blockchain Integrity Compromised
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl mb-5 space-y-3">
          <p className="text-sm text-rose-200 leading-relaxed font-medium">
            Cryptographic SHA-256 verification failed during peer audit. An altered block was detected in the active chain ledger.
          </p>

          <div className="bg-slate-950/90 rounded-lg p-3 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex justify-between items-center text-slate-400">
              <span>Compromised Block:</span>
              <span className="text-rose-400 font-bold">
                Block #{chainIntegrity.tamperedBlockNumber ?? 'N/A'}
              </span>
            </div>
            <div className="text-slate-400">
              <span className="block text-slate-500 mb-0.5">Integrity Fault Reason:</span>
              <span className="text-rose-300 break-words">{chainIntegrity.errorReason}</span>
            </div>
            {chainIntegrity.expectedHash && (
              <div className="text-slate-400">
                <span className="block text-slate-500 mb-0.5">Calculated Hash (Current Payload):</span>
                <span className="text-amber-400 break-all text-[11px]">{chainIntegrity.expectedHash}</span>
              </div>
            )}
            {chainIntegrity.actualHash && (
              <div className="text-slate-400">
                <span className="block text-slate-500 mb-0.5">Stored Block Hash (Recorded in Header):</span>
                <span className="text-rose-400 break-all text-[11px]">{chainIntegrity.actualHash}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
          >
            Review Altered Block in Explorer
          </button>
          <button
            onClick={() => {
              restoreBlockchain();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-sm font-semibold shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Valid Consensus Chain
          </button>
        </div>
      </div>
    </div>
  );
};
