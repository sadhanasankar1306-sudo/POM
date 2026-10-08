import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlockchainBlock } from '../types';
import {
  Blocks,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Hash,
  Clock,
  ArrowDown,
  Lock,
  Cpu,
  FileCode,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Search
} from 'lucide-react';

interface Props {
  onNavigate: (tab: any) => void;
  onSelectMaintenance: (id: string) => void;
}

export const BlockchainView: React.FC<Props> = ({ onNavigate, onSelectMaintenance }) => {
  const {
    blockchain,
    chainIntegrity,
    recheckIntegrity,
    tamperBlock,
    restoreBlockchain,
    difficultyPrefix
  } = useApp();

  const [selectedBlockNum, setSelectedBlockNum] = useState<number>(1);
  const [showJsonRaw, setShowJsonRaw] = useState<boolean>(false);
  const [tamperTargetNum, setTamperTargetNum] = useState<number>(1);
  const [tamperText, setTamperText] = useState<string>('Unapproved unauthorized motor rotor swap performed');

  const selectedBlock = blockchain.find(b => b.blockNumber === selectedBlockNum) || blockchain[0];

  const handleValidateNow = () => {
    recheckIntegrity();
  };

  const handleApplyTamper = () => {
    tamperBlock(tamperTargetNum, 'workPerformed', tamperText);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Validate Button and Integrity Status */}
      <div className={`border rounded-2xl p-5 sm:p-6 shadow-xl transition ${
        chainIntegrity.isValid
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border-cyan-800/60'
          : 'bg-gradient-to-r from-slate-900 via-rose-950/80 to-slate-900 border-rose-600 animate-pulse'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                DISTRIBUTED PROOF-OF-WORK LEDGER
              </span>
              <span className="text-xs text-slate-400">· Consensus Target '{difficultyPrefix}'</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Blockchain Explorer & Cryptographic Audit
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Immutable chain of custody for all verified industrial maintenance operations. Every block is sealed by Proof of Work (SHA-256) and verified through strict cryptographic parent-hash linkages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleValidateNow}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 shadow-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Validate Blockchain</span>
            </button>

            {!chainIntegrity.isValid && (
              <button
                onClick={restoreBlockchain}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950/60 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Valid Consensus</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Validation Result Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {chainIntegrity.isValid ? (
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Blockchain Valid — All {blockchain.length} Blocks Verified with Difficulty '{difficultyPrefix}'</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>✗ Tampering Detected in Block #{chainIntegrity.tamperedBlockNumber}! Chain Integrity Compromised.</span>
              </div>
            )}
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            Total Ledger Blocks: <strong className="text-white">{blockchain.length}</strong>
          </div>
        </div>
      </div>

      {/* Tamper Simulation Demonstration Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Tamper Detection Simulation Tool
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Educational Security Verification
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Simulate a malicious database alteration on an existing block. The SHA-256 verification engine will instantly recalculate the block hash, detect the mathematical mismatch, and flag the tamper state across the entire application.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Target:</span>
            <select
              value={tamperTargetNum}
              onChange={e => setTamperTargetNum(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
            >
              {blockchain.filter(b => b.blockNumber > 0).map(b => (
                <option key={b.blockNumber} value={b.blockNumber}>
                  Block #{b.blockNumber} ({b.maintenanceId})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={tamperText}
            onChange={e => setTamperText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
            placeholder="Altered work performed text..."
          />

          <button
            onClick={handleApplyTamper}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Inject Tamper Data</span>
          </button>
        </div>
      </div>

      {/* Visual Chain & Block Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Chain Lineage (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Blocks className="w-4 h-4 text-cyan-400" />
            Visual Block Sequence (Chain of Custody)
          </h3>

          <div className="space-y-3 relative">
            {blockchain.map((block, idx) => {
              const isSelected = block.blockNumber === selectedBlock.blockNumber;
              const isGenesis = block.blockNumber === 0;
              const isCompromised = block.isTampered || (!chainIntegrity.isValid && chainIntegrity.tamperedBlockNumber === block.blockNumber);

              return (
                <div key={block.blockNumber} className="relative">
                  {/* Connector arrow */}
                  {idx > 0 && (
                    <div className="flex items-center justify-center my-1 text-slate-600">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedBlockNum(block.blockNumber)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      isCompromised
                        ? 'bg-rose-950/30 border-rose-600 ring-2 ring-rose-600/50'
                        : isSelected
                        ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isGenesis
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {isGenesis ? 'Block #0 (Genesis)' : `Block #${block.blockNumber}`}
                        </span>
                        <span className="font-mono text-xs text-slate-300 font-semibold truncate max-w-[140px]">
                          {block.maintenanceId}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        isCompromised
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {isCompromised ? 'TAMPERED ✗' : 'PoW VALID ✓'}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Nonce:</span>
                        <span className="text-white font-bold">{block.nonce}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-500">Hash: </span>
                        <span className="text-cyan-400 font-bold">{block.currentHash.slice(0, 18)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Block Payload Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                  Block #{selectedBlock.blockNumber}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Timestamp: {selectedBlock.timestamp}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Cryptographic Block Header & Payload
              </h3>
            </div>

            <button
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showJsonRaw ? 'Formatted View' : 'Raw JSON'}</span>
            </button>
          </div>

          {showJsonRaw ? (
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
              {JSON.stringify(selectedBlock, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              {/* Header Hashes */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                    Previous Block Hash (Linkage)
                  </span>
                  <div className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800 text-[11px]">
                    {selectedBlock.previousHash}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                    Current Block SHA-256 Hash
                  </span>
                  <div className="text-cyan-400 font-bold break-all bg-slate-900 p-2 rounded border border-cyan-900/60 text-[11px]">
                    {selectedBlock.currentHash}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Cryptographic Nonce</span>
                    <span className="text-white font-bold text-sm">{selectedBlock.nonce}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PoW Target Condition</span>
                    <span className="text-emerald-400 font-bold">Starts with '{difficultyPrefix}'</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Data Payload */}
              {selectedBlock.data ? (
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3 font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Immutable Maintenance Payload
                    </span>
                    <span className="font-mono text-xs text-cyan-300 font-bold">
                      {selectedBlock.data.maintenanceId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Equipment ID:</span>
                      <span className="font-semibold text-white">{selectedBlock.data.equipmentId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Certified Technician:</span>
                      <span className="font-semibold text-white">{selectedBlock.data.technicianId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Trust Score:</span>
                      <span className="font-bold text-emerald-400">{selectedBlock.data.trustScore}/100 ✓</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Effectiveness Score:</span>
                      <span className="font-bold text-cyan-400">{selectedBlock.data.effectivenessScore}%</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] mb-0.5">Work Performed:</span>
                    <p className="text-slate-200 text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      {selectedBlock.data.workPerformed}
                    </p>
                  </div>

                  {selectedBlock.data.partsReplaced && selectedBlock.data.partsReplaced.length > 0 && (
                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">Components Logged:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlock.data.partsReplaced.map((part, pIdx) => (
                          <span
                            key={pIdx}
                            className="bg-slate-900 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800"
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                  Genesis Root Block — Contains initial zero state seed and network genesis consensus.
                </div>
              )}

              {/* Certificate CTA */}
              {selectedBlock.data && (
                <div className="pt-2 flex justify-end font-sans">
                  <button
                    onClick={() => {
                      onSelectMaintenance(selectedBlock.data!.maintenanceId);
                      onNavigate('certificates');
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    View Official Certificate for Block #{selectedBlock.blockNumber}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
