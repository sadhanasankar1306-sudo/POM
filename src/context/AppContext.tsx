import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Equipment,
  Technician,
  MaintenanceRequest,
  AIPrediction,
  BlockchainBlock,
  AuditLog,
  AppNotification,
  UserRole,
  MaintenanceEvidence,
  VerificationResult,
  EffectivenessResult,
  EquipmentStatus
} from '../types';
import {
  initialEquipment,
  initialTechnicians,
  initialPredictions,
  initialRequests,
  buildInitialBlockchain,
  initialAuditLogs
} from '../data/seedData';
import {
  mineBlockPoW,
  MiningProgress,
  validateBlockchainIntegrity,
  ChainValidationResult,
  computeBlockHash
} from '../crypto/blockchain';

interface AppContextType {
  // Data
  equipment: Equipment[];
  technicians: Technician[];
  requests: MaintenanceRequest[];
  predictions: Record<string, AIPrediction>;
  blockchain: BlockchainBlock[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  currentRole: UserRole;
  selectedTechnicianId: string;
  simulationActive: boolean;
  difficultyPrefix: string;
  chainIntegrity: ChainValidationResult;
  lastSimUpdate: string;

  // Mining state
  isMining: boolean;
  miningProgress: MiningProgress | null;
  miningTarget: MaintenanceRequest | null;

  // Actions
  setCurrentRole: (role: UserRole) => void;
  setSelectedTechnicianId: (id: string) => void;
  setSimulationActive: (active: boolean) => void;
  setDifficultyPrefix: (diff: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Automation / Workflow
  triggerAIPrediction: (equipmentId: string) => AIPrediction;
  createMaintenanceRequest: (
    equipmentId: string,
    reason: string,
    priority: MaintenanceRequest['priority'],
    source: MaintenanceRequest['source']
  ) => MaintenanceRequest;
  assignTechnician: (requestId: string, technicianId?: string) => void;
  submitTechnicianWork: (requestId: string, evidence: MaintenanceEvidence) => Promise<void>;
  verifyRequest: (requestId: string) => Promise<VerificationResult>;
  mineAndRecordBlock: (requestId: string) => Promise<BlockchainBlock>;
  injectFault: (equipmentId: string, type: 'temperature' | 'vibration' | 'pressure' | 'hours') => void;
  normalizeEquipment: (equipmentId: string) => void;
  addEquipment: (item: Omit<Equipment, 'history'>) => void;
  updateEquipment: (item: Equipment) => void;
  addTechnician: (tech: Technician) => void;
  tamperBlock: (blockNumber: number, field: string, newValue: string) => void;
  restoreBlockchain: () => void;
  recheckIntegrity: () => ChainValidationResult;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or seeds
  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('pom_equipment');
    return saved ? JSON.parse(saved) : initialEquipment;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('pom_technicians');
    return saved ? JSON.parse(saved) : initialTechnicians;
  });

  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem('pom_requests');
    return saved ? JSON.parse(saved) : initialRequests;
  });

  const [predictions, setPredictions] = useState<Record<string, AIPrediction>>(() => {
    const saved = localStorage.getItem('pom_predictions');
    return saved ? JSON.parse(saved) : initialPredictions;
  });

  const [blockchain, setBlockchain] = useState<BlockchainBlock[]>(() => {
    const saved = localStorage.getItem('pom_blockchain');
    return saved ? JSON.parse(saved) : buildInitialBlockchain();
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('pom_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'NOTIF-1',
      type: 'security',
      title: 'Blockchain Initialized',
      message: 'Proof of work verified. Genesis block and baseline chain verified.',
      timestamp: '2026-10-08 11:20:00',
      read: false
    },
    {
      id: 'NOTIF-2',
      type: 'ai',
      title: 'AI Alert: M103 High Risk',
      message: 'Failure probability for M103 reached 89%. Automated request created.',
      timestamp: '2026-10-08 11:15:21',
      read: false,
      referenceId: 'PM-M103-20261008-001'
    }
  ]);

  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('T003');
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [difficultyPrefix, setDifficultyPrefix] = useState<string>('0000');
  const [lastSimUpdate, setLastSimUpdate] = useState<string>(new Date().toLocaleTimeString());

  // Mining overlay state
  const [isMining, setIsMining] = useState<boolean>(false);
  const [miningProgress, setMiningProgress] = useState<MiningProgress | null>(null);
  const [miningTarget, setMiningTarget] = useState<MaintenanceRequest | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pom_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('pom_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('pom_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('pom_predictions', JSON.stringify(predictions));
  }, [predictions]);

  useEffect(() => {
    localStorage.setItem('pom_blockchain', JSON.stringify(blockchain));
  }, [blockchain]);

  useEffect(() => {
    localStorage.setItem('pom_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Chain integrity
  const chainIntegrity = useMemo(() => {
    return validateBlockchainIntegrity(blockchain, difficultyPrefix);
  }, [blockchain, difficultyPrefix]);

  const addAuditLog = useCallback((action: string, result: string, equipmentId?: string, maintenanceId?: string, hash?: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentRole === 'Admin' ? 'System Administrator' : currentRole === 'Technician' ? `Technician (${selectedTechnicianId})` : 'Plant Maintenance Manager',
      role: currentRole,
      action,
      result,
      equipmentId,
      maintenanceId,
      hash
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentRole, selectedTechnicianId]);

  const addNotification = useCallback((type: AppNotification['type'], title: string, message: string, referenceId?: string) => {
    const notif: AppNotification = {
      id: `NOTIF-${Date.now().toString(36)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      read: false,
      referenceId
    };
    setNotifications(prev => [notif, ...prev.slice(0, 29)]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Recalculate AI Prediction
  const triggerAIPrediction = useCallback((equipmentId: string): AIPrediction => {
    const eq = equipment.find(e => e.id === equipmentId);
    if (!eq) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    // AI Prediction Algorithm based on real sensor inputs:
    // Temperature: <75 (low), 75-89 (med), >=90 (critical)
    // Vibration: <4 (low), 4-6.9 (med), >=7 (critical)
    let tempScore = 0;
    if (eq.temperature >= 90) tempScore = 45;
    else if (eq.temperature >= 75) tempScore = 20 + ((eq.temperature - 75) / 15) * 20;
    else tempScore = Math.max(0, (eq.temperature / 75) * 15);

    let vibScore = 0;
    if (eq.vibration >= 7.0) vibScore = 45;
    else if (eq.vibration >= 4.0) vibScore = 20 + ((eq.vibration - 4.0) / 3.0) * 20;
    else vibScore = Math.max(0, (eq.vibration / 4.0) * 15);

    const hoursRatio = eq.runningHours / eq.maintenanceIntervalHours;
    const hoursScore = hoursRatio >= 1.0 ? 15 : Math.max(0, hoursRatio * 10);

    const rawProb = Math.min(99, Math.round(tempScore + vibScore + hoursScore));
    
    let riskLevel: AIPrediction['riskLevel'] = 'Low Risk';
    if (rawProb >= 71) riskLevel = 'High Risk';
    else if (rawProb >= 41) riskLevel = 'Medium Risk';

    let recommendation = 'Normal Operation: Equipment within safe operational parameters.';
    let component = 'Routine Mechanical Integrity';
    let timeToFailure = 2400;

    const factors: AIPrediction['contributingFactors'] = [];

    if (eq.temperature >= 85) {
      factors.push({
        factor: 'High Temperature Signature',
        impact: eq.temperature >= 90 ? 'High' : 'Medium',
        description: `Current ${eq.temperature.toFixed(1)}°C deviates from thermal equilibrium limit.`
      });
    }

    if (eq.vibration >= 5.0) {
      factors.push({
        factor: 'High Vibration Spectral Energy',
        impact: eq.vibration >= 7.0 ? 'High' : 'Medium',
        description: `Vibration ${eq.vibration.toFixed(1)} mm/s indicates dynamic imbalance or bearing wear.`
      });
    }

    if (hoursRatio >= 0.9) {
      factors.push({
        factor: 'Operational Interval Nearing',
        impact: hoursRatio >= 1.0 ? 'High' : 'Medium',
        description: `Running hours (${eq.runningHours} hrs) reached ${Math.round(hoursRatio * 100)}% of recommended interval.`
      });
    }

    if (riskLevel === 'High Risk') {
      recommendation = `Maintenance Recommended: Machine ${eq.id} has a high probability of failure (${rawProb}%). Schedule immediate mechanical overhaul.`;
      component = eq.type.includes('Compressor') ? 'Rotary Screw Bearing & Oil Separator' : eq.type.includes('Pump') ? 'Mechanical Shaft Seal & Impeller Ring' : 'Drive End Bearing Assembly';
      timeToFailure = Math.max(12, Math.round(120 * (1 - rawProb / 100)));
    } else if (riskLevel === 'Medium Risk') {
      recommendation = `Inspection Advised: Predictive model signals early acoustic and thermal degradation. Plan service within next shift.`;
      component = 'Lubrication System & Seal Packing';
      timeToFailure = Math.round(400 * (1 - rawProb / 100));
    }

    const prediction: AIPrediction = {
      equipmentId,
      failureProbability: rawProb,
      riskLevel,
      recommendation,
      contributingFactors: factors.length > 0 ? factors : [{ factor: 'Nominal Telemetry', impact: 'Low', description: 'All telemetry metrics stable' }],
      predictedFailureComponent: component,
      estimatedTimeToFailureHours: timeToFailure,
      lastCalculated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      autoRequestCreated: false
    };

    setPredictions(prev => ({ ...prev, [equipmentId]: prediction }));
    return prediction;
  }, [equipment]);

  // Create Maintenance Request
  const createMaintenanceRequest = useCallback((
    equipmentId: string,
    reason: string,
    priority: MaintenanceRequest['priority'],
    source: MaintenanceRequest['source']
  ): MaintenanceRequest => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = requests.filter(r => r.id.includes(dateStr)).length + 1;
    const reqId = `PM-${equipmentId}-${dateStr}-${countToday.toString().padStart(3, '0')}`;

    // Select suitable technician automatically
    const eq = equipment.find(e => e.id === equipmentId);
    let assignedTechId: string | undefined;

    if (eq) {
      // Find technician matching equipment type or lowest workload
      const matchingTechs = technicians.filter(t => t.specialization.toLowerCase().includes(eq.type.toLowerCase()) || eq.type.toLowerCase().includes(t.specialization.toLowerCase()));
      const candidateList = matchingTechs.length > 0 ? matchingTechs : technicians;
      const sortedByLoad = [...candidateList].sort((a, b) => a.currentWorkload - b.currentWorkload);
      if (sortedByLoad.length > 0) {
        assignedTechId = sortedByLoad[0].id;
      }
    }

    const newReq: MaintenanceRequest = {
      id: reqId,
      equipmentId,
      reason,
      priority,
      assignedTechnicianId: assignedTechId,
      createdDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: assignedTechId ? 'Assigned' : 'Pending',
      source
    };

    // Update technician workload
    if (assignedTechId) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === assignedTechId) {
          return {
            ...t,
            currentWorkload: t.currentWorkload + 1,
            availability: 'Busy'
          };
        }
        return t;
      }));

      const techObj = technicians.find(t => t.id === assignedTechId);
      addNotification(
        'assignment',
        `Maintenance Scheduled`,
        `Maintenance ${reqId} automatically assigned to ${techObj ? techObj.name : assignedTechId}.`,
        reqId
      );
      addAuditLog(
        'Automatic Technician Assignment',
        `Assigned ${reqId} to ${techObj?.name || assignedTechId} (Workload +1)`,
        equipmentId,
        reqId
      );
    }

    setRequests(prev => [newReq, ...prev]);

    addNotification(
      'maintenance',
      `Maintenance Alert`,
      `Machine ${equipmentId} requires maintenance: ${reason.slice(0, 50)}...`,
      reqId
    );
    addAuditLog(
      'Maintenance Request Created',
      `Created request ${reqId} via ${source}`,
      equipmentId,
      reqId
    );

    return newReq;
  }, [equipment, requests, technicians, addNotification, addAuditLog]);

  // Assign technician explicitly
  const assignTechnician = useCallback((requestId: string, technicianId?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      let techId = technicianId;
      if (!techId) {
        // Auto assign
        const eq = equipment.find(e => e.id === req.equipmentId);
        const sorted = [...technicians].sort((a, b) => a.currentWorkload - b.currentWorkload);
        techId = sorted[0]?.id;
      }

      if (techId) {
        setTechnicians(tList => tList.map(t => {
          if (t.id === techId) {
            return { ...t, currentWorkload: t.currentWorkload + 1, availability: 'Busy' };
          }
          return t;
        }));
      }

      return {
        ...req,
        assignedTechnicianId: techId,
        status: 'Assigned'
      };
    }));
  }, [equipment, technicians]);

  // Automatic Maintenance Verification Engine
  const verifyRequest = useCallback(async (requestId: string): Promise<VerificationResult> => {
    const req = requests.find(r => r.id === requestId);
    if (!req) throw new Error(`Request ${requestId} not found`);

    const eq = equipment.find(e => e.id === req.equipmentId);
    const tech = technicians.find(t => t.id === req.assignedTechnicianId);
    const evidence = req.evidence;

    // 7 check verification criteria
    const check1 = {
      name: 'Valid Maintenance Request',
      valid: !!req.id && req.id.startsWith('PM-'),
      score: 20,
      maxScore: 20,
      details: `Active authorized maintenance request ${req.id}`
    };

    const check2 = {
      name: 'Valid Equipment Specification',
      valid: !!eq,
      score: 20,
      maxScore: 20,
      details: eq ? `Equipment ${eq.id} (${eq.name}) verified in industrial plant registry` : 'Equipment not found'
    };

    const check3 = {
      name: 'Valid Technician Assignment',
      valid: !!tech,
      score: 20,
      maxScore: 20,
      details: tech ? `Certified technician ${tech.name} (${tech.id}) verified` : 'Technician not assigned'
    };

    const check4 = {
      name: 'Comprehensive Work Description',
      valid: !!(evidence && evidence.workDescription.length >= 20),
      score: 20,
      maxScore: 20,
      details: evidence && evidence.workDescription.length >= 20 ? 'Detailed engineering log provided' : 'Work description incomplete or missing'
    };

    const check5 = {
      name: 'Physical Before & After Evidence',
      valid: !!(evidence && evidence.beforeCondition && evidence.afterCondition),
      score: 20,
      maxScore: 20,
      details: evidence && evidence.beforeCondition && evidence.afterCondition ? 'Before & after operational state verified' : 'Physical condition reports missing'
    };

    const checks = [check1, check2, check3, check4, check5];
    const trustScore = checks.reduce((acc, c) => acc + (c.valid ? c.score : 0), 0);

    let status: VerificationResult['status'] = 'Verified';
    if (trustScore < 50) status = 'Rejected';
    else if (trustScore < 80) status = 'Review Required';

    const verificationResult: VerificationResult = {
      maintenanceId: requestId,
      trustScore,
      status,
      checks,
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      verifiedBy: 'Automated Verification Engine v2.4'
    };

    // Calculate Maintenance Effectiveness Analysis
    let effectivenessResult: EffectivenessResult | undefined;
    if (evidence) {
      const beforeT = evidence.beforeSensors.temperature;
      const afterT = evidence.afterSensors.temperature;
      const beforeV = evidence.beforeSensors.vibration;
      const afterV = evidence.afterSensors.vibration;

      const tDelta = afterT - beforeT;
      const vDelta = afterV - beforeV;

      // Effectiveness score: reward reductions in temp and vibration
      const tempImprovement = beforeT > 0 ? Math.max(0, (beforeT - afterT) / beforeT) : 0;
      const vibImprovement = beforeV > 0 ? Math.max(0, (beforeV - afterV) / beforeV) : 0;
      const rawEffectiveness = Math.min(100, Math.round((tempImprovement * 50) + (vibImprovement * 50) + 40));

      let effStatus: EffectivenessResult['status'] = 'Effective';
      let rework = false;
      let summary = `Operating temperature reduced by ${Math.abs(tDelta).toFixed(1)}°C and vibration reduced by ${Math.abs(vDelta).toFixed(1)} mm/s.`;

      if (rawEffectiveness >= 80) {
        effStatus = 'Effective';
        summary = `Highly Effective: ${summary} Machine telemetry restored to nominal specs.`;
      } else if (rawEffectiveness >= 50) {
        effStatus = 'Partially Effective';
        summary = `Partially Effective: Moderate improvement detected. Continued monitoring required.`;
      } else {
        effStatus = 'Not Effective';
        rework = true;
        summary = `Not Effective: Sensor values did not normalize after service. Automated rework request triggered.`;
      }

      effectivenessResult = {
        maintenanceId: requestId,
        effectivenessScore: rawEffectiveness,
        status: effStatus,
        temperatureDelta: tDelta,
        vibrationDelta: vDelta,
        pressureDelta: evidence.afterSensors.pressure - evidence.beforeSensors.pressure,
        summary,
        reworkRequired: rework,
        evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
    }

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: status === 'Verified' ? 'Verified' : 'Pending',
          verification: verificationResult,
          effectiveness: effectivenessResult
        };
      }
      return r;
    }));

    addNotification(
      'verification',
      status === 'Verified' ? 'Maintenance Verified ✓' : 'Verification Review Required ⚠',
      `Maintenance ${requestId} trust score calculated: ${trustScore}/100 (${status}).`,
      requestId
    );
    addAuditLog(
      'Automatic Maintenance Verification',
      `Trust score ${trustScore}/100. Result: ${status}. Effectiveness: ${effectivenessResult?.effectivenessScore || 0}%`,
      req.equipmentId,
      requestId
    );

    // If rework required, auto trigger a follow-up maintenance request
    if (effectivenessResult?.reworkRequired) {
      setTimeout(() => {
        createMaintenanceRequest(
          req.equipmentId,
          `Rework Required: Previous service (${requestId}) ineffective. Elevated telemetry persists.`,
          'High',
          'Rework Trigger'
        );
      }, 1000);
    }

    return verificationResult;
  }, [requests, equipment, technicians, addNotification, addAuditLog, createMaintenanceRequest]);

  // Mine Block and record on Blockchain
  const mineAndRecordBlock = useCallback(async (requestId: string): Promise<BlockchainBlock> => {
    const req = requests.find(r => r.id === requestId);
    if (!req) throw new Error(`Request ${requestId} not found`);

    if (!req.verification || req.verification.status !== 'Verified') {
      throw new Error(`Only verified maintenance records can be mined to blockchain.`);
    }

    // Check for duplicate blockchain record
    const duplicate = blockchain.find(b => b.maintenanceId === requestId);
    if (duplicate) {
      throw new Error(`Duplicate entry prevented: Maintenance ID ${requestId} already recorded in Block #${duplicate.blockNumber}`);
    }

    const prevBlock = blockchain[blockchain.length - 1];
    const newBlockNumber = blockchain.length;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const blockData = {
      maintenanceId: req.id,
      equipmentId: req.equipmentId,
      technicianId: req.assignedTechnicianId || 'T001',
      workPerformed: req.evidence?.workDescription || 'Maintenance executed',
      partsReplaced: req.evidence?.partsReplaced || [],
      beforeCondition: req.evidence?.beforeCondition || 'Pre-service condition',
      afterCondition: req.evidence?.afterCondition || 'Post-service condition',
      trustScore: req.verification.trustScore,
      effectivenessScore: req.effectiveness?.effectivenessScore || 90,
      verifiedAt: req.verification.verifiedAt,
      verificationHash: `VER-${req.id}-${req.verification.trustScore}`
    };

    setIsMining(true);
    setMiningTarget(req);

    try {
      // Execute real SHA-256 Proof of Work mining
      const mined = await mineBlockPoW(
        newBlockNumber,
        timestamp,
        req.id,
        req.equipmentId,
        req.assignedTechnicianId || 'T001',
        blockData,
        prevBlock.currentHash,
        difficultyPrefix,
        (progress) => {
          setMiningProgress(progress);
        }
      );

      const newBlock: BlockchainBlock = {
        blockNumber: newBlockNumber,
        timestamp,
        maintenanceId: req.id,
        equipmentId: req.equipmentId,
        technicianId: req.assignedTechnicianId || 'T001',
        data: blockData,
        previousHash: prevBlock.currentHash,
        currentHash: mined.hash,
        nonce: mined.nonce,
        powStatus: 'VALID',
        verificationStatus: 'VERIFIED',
        minedTimeMs: mined.durationMs
      };

      setBlockchain(prev => [...prev, newBlock]);

      setRequests(prev => prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'Blockchain Recorded',
            blockNumber: newBlockNumber,
            blockHash: mined.hash
          };
        }
        return r;
      }));

      addNotification(
        'blockchain',
        `Block #${newBlockNumber} Mined Successfully`,
        `Maintenance ${requestId} recorded on blockchain. Nonce: ${mined.nonce}, Hash: ${mined.hash.slice(0, 14)}...`,
        requestId
      );
      addAuditLog(
        'Proof-of-Work Block Mined',
        `Block #${newBlockNumber} mined (Nonce: ${mined.nonce}) using SHA-256 target ${difficultyPrefix}`,
        req.equipmentId,
        requestId,
        mined.hash
      );

      return newBlock;
    } finally {
      setIsMining(false);
      setMiningTarget(null);
      setMiningProgress(null);
    }
  }, [requests, blockchain, difficultyPrefix, addNotification, addAuditLog]);

  // Submit Technician Work
  const submitTechnicianWork = useCallback(async (requestId: string, evidence: MaintenanceEvidence) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // 1. Mark request as Completed
    const updatedReq: MaintenanceRequest = {
      ...req,
      evidence,
      status: 'Completed'
    };

    setRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));

    // 2. Make technician available
    if (req.assignedTechnicianId) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === req.assignedTechnicianId) {
          const newWorkload = Math.max(0, t.currentWorkload - 1);
          return {
            ...t,
            currentWorkload: newWorkload,
            availability: newWorkload === 0 ? 'Available' : 'Busy',
            completedJobsCount: t.completedJobsCount + 1
          };
        }
        return t;
      }));
    }

    // 3. Update equipment sensors to normalized after-maintenance values
    setEquipment(prev => prev.map(eq => {
      if (eq.id === req.equipmentId) {
        return {
          ...eq,
          temperature: evidence.afterSensors.temperature,
          vibration: evidence.afterSensors.vibration,
          pressure: evidence.afterSensors.pressure,
          status: 'Healthy',
          lastMaintenance: new Date().toISOString().slice(0, 10),
          history: [
            ...eq.history,
            {
              timestamp: new Date().toLocaleTimeString().slice(0, 5),
              temperature: evidence.afterSensors.temperature,
              vibration: evidence.afterSensors.vibration,
              pressure: evidence.afterSensors.pressure,
              runningHours: eq.runningHours
            }
          ]
        };
      }
      return eq;
    }));

    addAuditLog(
      'Technician Completed Maintenance',
      `Submitted work report and after-maintenance sensor evidence for ${requestId}`,
      req.equipmentId,
      requestId
    );

    // 4. Trigger Automatic Verification immediately
    setTimeout(async () => {
      const verRes = await verifyRequest(requestId);
      // 5. If verified, automatically trigger Proof of Work Mining!
      if (verRes.status === 'Verified') {
        setTimeout(async () => {
          await mineAndRecordBlock(requestId);
        }, 500);
      }
    }, 400);
  }, [requests, addAuditLog, verifyRequest, mineAndRecordBlock]);

  // Inject Fault into an equipment
  const injectFault = useCallback((equipmentId: string, type: 'temperature' | 'vibration' | 'pressure' | 'hours') => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id !== equipmentId) return eq;

      let newTemp = eq.temperature;
      let newVib = eq.vibration;
      let newPres = eq.pressure;
      let newHours = eq.runningHours;
      let newStatus: EquipmentStatus = eq.status;

      if (type === 'temperature') {
        newTemp = 94.8; // Critical temperature
        newStatus = 'Critical';
      } else if (type === 'vibration') {
        newVib = 7.8; // Critical vibration
        newStatus = 'Critical';
      } else if (type === 'pressure') {
        newPres = eq.specs.nominalPressure * 1.6;
        newStatus = 'Warning';
      } else if (type === 'hours') {
        newHours = eq.maintenanceIntervalHours + 50;
        newStatus = 'Warning';
      }

      const updated: Equipment = {
        ...eq,
        temperature: newTemp,
        vibration: newVib,
        pressure: newPres,
        runningHours: newHours,
        status: newStatus,
        history: [
          ...eq.history,
          {
            timestamp: new Date().toLocaleTimeString().slice(0, 5),
            temperature: newTemp,
            vibration: newVib,
            pressure: newPres,
            runningHours: newHours
          }
        ]
      };
      return updated;
    }));

    // Recalculate AI prediction immediately
    setTimeout(() => {
      const pred = triggerAIPrediction(equipmentId);
      if (pred.failureProbability >= 70) {
        // Auto create maintenance request
        const existingActive = requests.find(r => r.equipmentId === equipmentId && (r.status === 'Pending' || r.status === 'Assigned' || r.status === 'In Progress'));
        if (!existingActive) {
          createMaintenanceRequest(
            equipmentId,
            `AI Alert (${pred.failureProbability}%): Simulated critical fault on ${type.toUpperCase()}`,
            'Emergency',
            'AI Prediction'
          );
        }
      }
    }, 200);

    addNotification(
      'security',
      `Telemetry Anomaly Injected`,
      `Injected fault '${type}' on ${equipmentId}. Live sensors updated.`,
      equipmentId
    );
  }, [equipment, requests, triggerAIPrediction, createMaintenanceRequest, addNotification]);

  // Normalize Equipment back to healthy baseline
  const normalizeEquipment = useCallback((equipmentId: string) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id !== equipmentId) return eq;
      return {
        ...eq,
        temperature: 66.5,
        vibration: 2.1,
        status: 'Healthy'
      };
    }));
    setTimeout(() => {
      triggerAIPrediction(equipmentId);
    }, 100);
  }, [triggerAIPrediction]);

  // Tamper detection testing
  const tamperBlock = useCallback((blockNumber: number, field: string, newValue: string) => {
    setBlockchain(prev => prev.map(block => {
      if (block.blockNumber === blockNumber) {
        const alteredData = block.data ? {
          ...block.data,
          workPerformed: field === 'workPerformed' ? newValue : block.data.workPerformed,
          technicianId: field === 'technicianId' ? newValue : block.data.technicianId,
          trustScore: field === 'trustScore' ? parseInt(newValue) || block.data.trustScore : block.data.trustScore
        } : null;

        return {
          ...block,
          data: alteredData,
          isTampered: true,
          technicianId: field === 'technicianId' ? newValue : block.technicianId
        };
      }
      return block;
    }));

    addNotification(
      'security',
      `SECURITY ALERT: Blockchain Integrity Compromised`,
      `Block #${blockNumber} data modified! Recalculated hash no longer matches cryptographic proof.`,
      `BLOCK-${blockNumber}`
    );
    addAuditLog(
      'TAMPER SIMULATION TRIGGERED',
      `Block #${blockNumber} was artificially modified to test tamper detection engine`,
      undefined,
      undefined
    );
  }, [addNotification, addAuditLog]);

  // Restore blockchain
  const restoreBlockchain = useCallback(() => {
    setBlockchain(buildInitialBlockchain());
    addNotification('security', 'Blockchain Restored', 'Blockchain integrity restored to cryptographically verified state.');
    addAuditLog('Blockchain Restored', 'Reset blocks to authentic consensus state');
  }, [addNotification, addAuditLog]);

  // Recheck integrity manually
  const recheckIntegrity = useCallback(() => {
    return validateBlockchainIntegrity(blockchain, difficultyPrefix);
  }, [blockchain, difficultyPrefix]);

  // Add new equipment
  const addEquipment = useCallback((item: Omit<Equipment, 'history'>) => {
    const newEq: Equipment = {
      ...item,
      history: [
        {
          timestamp: new Date().toLocaleTimeString().slice(0, 5),
          temperature: item.temperature,
          vibration: item.vibration,
          pressure: item.pressure,
          runningHours: item.runningHours
        }
      ]
    };
    setEquipment(prev => [...prev, newEq]);
    addAuditLog('Equipment Registered', `Added new equipment ${item.id} (${item.name})`, item.id);
  }, [addAuditLog]);

  // Update equipment
  const updateEquipment = useCallback((item: Equipment) => {
    setEquipment(prev => prev.map(e => e.id === item.id ? item : e));
    addAuditLog('Equipment Updated', `Updated specifications for ${item.id}`, item.id);
  }, [addAuditLog]);

  // Add technician
  const addTechnician = useCallback((tech: Technician) => {
    setTechnicians(prev => [...prev, tech]);
    addAuditLog('Technician Onboarded', `Added technician ${tech.name} (${tech.specialization})`);
  }, [addAuditLog]);

  // Reset all data
  const resetAllData = useCallback(() => {
    localStorage.clear();
    setEquipment(initialEquipment);
    setTechnicians(initialTechnicians);
    setRequests(initialRequests);
    setPredictions(initialPredictions);
    setBlockchain(buildInitialBlockchain());
    setAuditLogs(initialAuditLogs);
    addNotification('security', 'System Reset', 'All telemetry, requests, and blockchain reseeded to initial prototype.');
  }, [addNotification]);

  // IoT Simulation Ticker
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setLastSimUpdate(new Date().toLocaleTimeString());

      setEquipment(prevEquipment => {
        return prevEquipment.map(eq => {
          // Add micro jitter to sensor readings
          const tempJitter = (Math.random() - 0.48) * 0.4;
          const vibJitter = (Math.random() - 0.48) * 0.1;
          const presJitter = (Math.random() - 0.48) * 0.05;

          const updatedTemp = Math.max(20, Math.round((eq.temperature + tempJitter) * 10) / 10);
          const updatedVib = Math.max(0.5, Math.round((eq.vibration + vibJitter) * 10) / 10);
          const updatedPres = Math.max(0.2, Math.round((eq.pressure + presJitter) * 10) / 10);
          const updatedHours = Math.round((eq.runningHours + 0.01) * 100) / 100;

          // Compute status
          let status: EquipmentStatus = 'Healthy';
          if (updatedTemp >= 90 || updatedVib >= 7.0) {
            status = 'Critical';
          } else if (updatedTemp >= 75 || updatedVib >= 4.0 || updatedHours >= eq.maintenanceIntervalHours) {
            status = 'Warning';
          }

          const newHistory = [
            ...eq.history.slice(-7),
            {
              timestamp: new Date().toLocaleTimeString().slice(0, 5),
              temperature: updatedTemp,
              vibration: updatedVib,
              pressure: updatedPres,
              runningHours: updatedHours
            }
          ];

          return {
            ...eq,
            temperature: updatedTemp,
            vibration: updatedVib,
            pressure: updatedPres,
            runningHours: updatedHours,
            status,
            history: newHistory
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [simulationActive]);

  return (
    <AppContext.Provider
      value={{
        equipment,
        technicians,
        requests,
        predictions,
        blockchain,
        auditLogs,
        notifications,
        currentRole,
        selectedTechnicianId,
        simulationActive,
        difficultyPrefix,
        chainIntegrity,
        lastSimUpdate,
        isMining,
        miningProgress,
        miningTarget,
        setCurrentRole,
        setSelectedTechnicianId,
        setSimulationActive,
        setDifficultyPrefix,
        markNotificationAsRead,
        markAllNotificationsRead,
        triggerAIPrediction,
        createMaintenanceRequest,
        assignTechnician,
        submitTechnicianWork,
        verifyRequest,
        mineAndRecordBlock,
        injectFault,
        normalizeEquipment,
        addEquipment,
        updateEquipment,
        addTechnician,
        tamperBlock,
        restoreBlockchain,
        recheckIntegrity,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
