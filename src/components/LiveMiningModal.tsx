import React from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, ShieldCheck, Hash, Zap } from 'lucide-react';

export const LiveMiningModal: React.FC = () => {
  const { isMining, miningProgress, miningTarget, difficultyPrefix } = useApp();

  if (!isMining || !miningTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-cyan-900/30 text-white animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Mining Block on Blockchain
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            </h3>
            <p className="text-xs text-slate-400">Proof-of-Work Consensus Engine (SHA-256)</p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-5 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Target Maintenance ID:</span>
            <span className="text-cyan-300 font-semibold">{miningTarget.id}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Target Equipment:</span>
            <span className="text-slate-200 font-semibold">{miningTarget.equipmentId}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Difficulty Target:</span>
            <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Prefix '{difficultyPrefix}'
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Hash Rate:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {miningProgress ? `${miningProgress.hashesPerSecond.toLocaleString()} H/s` : 'Initializing...'}
            </span>
          </div>
        </div>

        {/* Live Nonce Counter */}
        <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-4 mb-5 text-center relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            Nonce Exploration
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-cyan-400 tracking-wider my-2">
            {miningProgress ? miningProgress.currentNonce.toLocaleString() : '0'}
          </div>
          <div className="text-[11px] font-mono text-slate-400 truncate bg-slate-900/90 py-1.5 px-3 rounded border border-slate-800 text-left">
            <span className="text-slate-500">Hash: </span>
            <span className={miningProgress?.currentHash.startsWith(difficultyPrefix) ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {miningProgress ? miningProgress.currentHash : 'Calculating genesis seed...'}
            </span>
          </div>

          {/* Animated scanline */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400/60 blur-[1px] animate-pulse" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Searching cryptographic nonce satisfying Proof of Work rule...</span>
        </div>
      </div>
    </div>
  );
};
