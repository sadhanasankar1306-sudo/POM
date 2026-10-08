import { BlockchainBlock, BlockData } from '../types';

/**
 * Calculates SHA-256 hash of a string using Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous lightweight SHA-256 fallback / fast implementation for rapid nonce exploration
 * or when async batching is needed.
 */
function createSyncSha256(message: string): string {
  // Standard pure JS SHA-256 implementation to enable synchronous batch iterations in UI without blocking microtasks
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const asciiBitLength = message.length * 8;
  let i = 0, j = 0;
  let result = '';
  const words: number[] = [];
  
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < message.length; i++) {
    j = message.charCodeAt(i);
    if (j >> 8) return ''; // ASCII only for hashes
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[i >> 2] |= 0x80 << ((3 - i % 4) * 8);
  words[(((i + 8) >> 6) << 4) + 15] = asciiBitLength;

  const w: number[] = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    let [a, b, c, d, e, f, g, h] = hash;
    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[j + i] | 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (j * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

export function computeBlockHash(
  blockNumber: number,
  timestamp: string,
  maintenanceId: string,
  equipmentId: string,
  technicianId: string,
  data: BlockData | null,
  previousHash: string,
  nonce: number
): string {
  const payload = `${blockNumber}|${timestamp}|${maintenanceId}|${equipmentId}|${technicianId}|${JSON.stringify(data || {})}|${previousHash}|${nonce}`;
  return createSyncSha256(payload);
}

export interface MiningProgress {
  currentNonce: number;
  currentHash: string;
  hashesPerSecond: number;
  progressPercent: number;
}

/**
 * Mines a block by finding a nonce such that computeBlockHash starts with `difficultyPrefix` (default '0000').
 * Uses asynchronous chunks to not freeze the browser UI and to emit live feedback.
 */
export async function mineBlockPoW(
  blockNumber: number,
  timestamp: string,
  maintenanceId: string,
  equipmentId: string,
  technicianId: string,
  data: BlockData,
  previousHash: string,
  difficultyPrefix: string = '0000',
  onProgress?: (progress: MiningProgress) => void
): Promise<{ nonce: number; hash: string; durationMs: number }> {
  const startTime = Date.now();
  let nonce = 0;
  const batchSize = 1500;
  let lastReport = Date.now();

  while (true) {
    for (let i = 0; i < batchSize; i++) {
      const hash = computeBlockHash(
        blockNumber,
        timestamp,
        maintenanceId,
        equipmentId,
        technicianId,
        data,
        previousHash,
        nonce
      );

      if (hash.startsWith(difficultyPrefix)) {
        const durationMs = Date.now() - startTime;
        if (onProgress) {
          onProgress({
            currentNonce: nonce,
            currentHash: hash,
            hashesPerSecond: Math.round((nonce / Math.max(durationMs, 1)) * 1000),
            progressPercent: 100
          });
        }
        return { nonce, hash, durationMs };
      }
      nonce++;
    }

    const now = Date.now();
    if (now - lastReport > 80) { // report to UI at ~12fps
      const sampleHash = computeBlockHash(
        blockNumber,
        timestamp,
        maintenanceId,
        equipmentId,
        technicianId,
        data,
        previousHash,
        nonce
      );
      if (onProgress) {
        onProgress({
          currentNonce: nonce,
          currentHash: sampleHash,
          hashesPerSecond: Math.round((nonce / Math.max(now - startTime, 1)) * 1000),
          progressPercent: Math.min(99, Math.floor((nonce % 60000) / 600))
        });
      }
      lastReport = now;
      // Yield thread to UI
      await new Promise(resolve => setTimeout(resolve, 8));
    }
  }
}

export interface ChainValidationResult {
  isValid: boolean;
  tamperedBlockNumber?: number;
  errorReason?: string;
  expectedHash?: string;
  actualHash?: string;
  checkedBlocksCount: number;
}

/**
 * Validates the entire blockchain from Genesis block to latest.
 */
export function validateBlockchainIntegrity(
  chain: BlockchainBlock[],
  difficultyPrefix: string = '0000'
): ChainValidationResult {
  if (!chain || chain.length === 0) {
    return { isValid: false, errorReason: 'Blockchain is empty', checkedBlocksCount: 0 };
  }

  // Genesis block check
  const genesis = chain[0];
  const genesisExpectedHash = computeBlockHash(
    genesis.blockNumber,
    genesis.timestamp,
    genesis.maintenanceId,
    genesis.equipmentId,
    genesis.technicianId,
    genesis.data,
    genesis.previousHash,
    genesis.nonce
  );

  if (genesis.currentHash !== genesisExpectedHash) {
    return {
      isValid: false,
      tamperedBlockNumber: 0,
      errorReason: 'Genesis block hash does not match computed hash',
      expectedHash: genesisExpectedHash,
      actualHash: genesis.currentHash,
      checkedBlocksCount: 1
    };
  }

  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];

    // Check link to previous block
    if (current.previousHash !== prev.currentHash) {
      return {
        isValid: false,
        tamperedBlockNumber: current.blockNumber,
        errorReason: `Previous hash pointer mismatch at block #${current.blockNumber}. Points to ${current.previousHash.slice(0, 10)}... but previous block is ${prev.currentHash.slice(0, 10)}...`,
        expectedHash: prev.currentHash,
        actualHash: current.previousHash,
        checkedBlocksCount: i + 1
      };
    }

    // Check recalculation of current block
    const calculatedHash = computeBlockHash(
      current.blockNumber,
      current.timestamp,
      current.maintenanceId,
      current.equipmentId,
      current.technicianId,
      current.data,
      current.previousHash,
      current.nonce
    );

    if (current.currentHash !== calculatedHash) {
      return {
        isValid: false,
        tamperedBlockNumber: current.blockNumber,
        errorReason: `Data tampering detected in Block #${current.blockNumber}. Data payload does not yield stored block hash.`,
        expectedHash: calculatedHash,
        actualHash: current.currentHash,
        checkedBlocksCount: i + 1
      };
    }

    // Check Proof of Work requirement
    if (!current.currentHash.startsWith(difficultyPrefix)) {
      return {
        isValid: false,
        tamperedBlockNumber: current.blockNumber,
        errorReason: `Block #${current.blockNumber} fails Proof-of-Work requirement (does not start with '${difficultyPrefix}')`,
        expectedHash: `${difficultyPrefix}...`,
        actualHash: current.currentHash,
        checkedBlocksCount: i + 1
      };
    }
  }

  return {
    isValid: true,
    checkedBlocksCount: chain.length
  };
}
