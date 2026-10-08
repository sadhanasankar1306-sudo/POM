export type EquipmentStatus = 'Healthy' | 'Warning' | 'Critical';

export type RequestStatus = 
  | 'Pending' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Completed' 
  | 'Verified' 
  | 'Blockchain Recorded'
  | 'Rejected';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Emergency';

export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

export type EffectivenessStatus = 'Effective' | 'Partially Effective' | 'Not Effective';

export type UserRole = 'Admin' | 'Technician' | 'Manager';

export interface SensorReading {
  temperature: number; // in Celsius
  vibration: number;   // in mm/s or g-force
  pressure: number;    // in bar
  runningHours: number;
  timestamp: string;
}

export interface Equipment {
  id: string; // e.g. M101
  name: string;
  type: string;
  location: string;
  model: string;
  serialNumber: string;
  installedDate: string;
  temperature: number;
  vibration: number;
  pressure: number;
  runningHours: number;
  maintenanceIntervalHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  status: EquipmentStatus;
  history: SensorReading[];
  specs: {
    maxTemp: number;
    maxVibration: number;
    nominalPressure: number;
    powerRating: string;
  };
}

export interface Technician {
  id: string; // e.g. T001
  name: string;
  email: string;
  specialization: string; // e.g. 'Electrical Motors', 'Compressors'
  availability: 'Available' | 'Busy' | 'Off-duty';
  currentWorkload: number; // active jobs count
  completedJobsCount: number;
  avatarUrl?: string;
  phone: string;
}

export interface AIPrediction {
  equipmentId: string;
  failureProbability: number; // 0 to 100
  riskLevel: RiskLevel;
  recommendation: string;
  contributingFactors: {
    factor: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }[];
  predictedFailureComponent: string;
  estimatedTimeToFailureHours: number;
  lastCalculated: string;
  autoRequestCreated?: boolean;
}

export interface MaintenanceEvidence {
  workDescription: string;
  beforeCondition: string;
  afterCondition: string;
  partsReplaced: string[];
  technicianNotes: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  completedAt: string;
  beforeSensors: {
    temperature: number;
    vibration: number;
    pressure: number;
  };
  afterSensors: {
    temperature: number;
    vibration: number;
    pressure: number;
  };
}

export interface VerificationCheckItem {
  name: string;
  valid: boolean;
  score: number;
  maxScore: number;
  details: string;
}

export interface VerificationResult {
  maintenanceId: string;
  trustScore: number; // 0 to 100
  status: 'Verified' | 'Review Required' | 'Rejected';
  checks: VerificationCheckItem[];
  verifiedAt: string;
  verifiedBy: string; // 'Automated Verification Engine v2.4'
}

export interface EffectivenessResult {
  maintenanceId: string;
  effectivenessScore: number; // 0 to 100
  status: EffectivenessStatus;
  temperatureDelta: number;
  vibrationDelta: number;
  pressureDelta: number;
  summary: string;
  reworkRequired: boolean;
  evaluatedAt: string;
}

export interface MaintenanceRequest {
  id: string; // e.g. PM-M103-20261008-001
  equipmentId: string;
  reason: string;
  priority: PriorityLevel;
  assignedTechnicianId?: string;
  createdDate: string;
  status: RequestStatus;
  source: 'AI Prediction' | 'IoT Threshold Exceeded' | 'Hours Interval' | 'Manual Inspection' | 'Rework Trigger';
  evidence?: MaintenanceEvidence;
  verification?: VerificationResult;
  effectiveness?: EffectivenessResult;
  blockNumber?: number;
  blockHash?: string;
}

export interface BlockData {
  maintenanceId: string;
  equipmentId: string;
  technicianId: string;
  workPerformed: string;
  partsReplaced: string[];
  beforeCondition: string;
  afterCondition: string;
  trustScore: number;
  effectivenessScore: number;
  verifiedAt: string;
  verificationHash: string;
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  maintenanceId: string;
  equipmentId: string;
  technicianId: string;
  data: BlockData | null; // null for genesis block
  previousHash: string;
  currentHash: string;
  nonce: number;
  powStatus: 'VALID' | 'INVALID';
  verificationStatus: 'VERIFIED' | 'GENESIS';
  minedTimeMs?: number;
  isTampered?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  equipmentId?: string;
  maintenanceId?: string;
  result: string;
  hash?: string;
}

export interface AppNotification {
  id: string;
  type: 'maintenance' | 'ai' | 'assignment' | 'verification' | 'blockchain' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  referenceId?: string;
}
