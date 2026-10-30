import {
  Equipment,
  Technician,
  MaintenanceRequest,
  AIPrediction,
  BlockchainBlock,
  AuditLog,
  BillingRecord,
  BillingConfig
} from '../types';
import { defaultBillingConfig } from '../utils/costCalculations';
import { computeBlockHash } from '../crypto/blockchain';

export const initialEquipment: Equipment[] = [
  {
    id: 'M101',
    name: 'Industrial Induction Motor',
    type: 'Electric Motor',
    location: 'Production Line Alpha - Bay 1',
    model: 'Siemens SIMOTICS 45kW SD',
    serialNumber: 'SN-MTR-882910',
    installedDate: '2023-03-15',
    temperature: 68.4,
    vibration: 2.1,
    pressure: 1.2,
    runningHours: 4120,
    maintenanceIntervalHours: 5000,
    lastMaintenance: '2026-08-12',
    nextMaintenance: '2026-11-15',
    status: 'Healthy',
    specs: {
      maxTemp: 85,
      maxVibration: 4.5,
      nominalPressure: 1.2,
      powerRating: '45 kW / 400V 3-Phase'
    },
    history: [
      { timestamp: '10:00', temperature: 66.2, vibration: 1.9, pressure: 1.2, runningHours: 4118 },
      { timestamp: '10:30', temperature: 67.1, vibration: 2.0, pressure: 1.2, runningHours: 4118.5 },
      { timestamp: '11:00', temperature: 68.0, vibration: 2.1, pressure: 1.2, runningHours: 4119 },
      { timestamp: '11:15', temperature: 68.4, vibration: 2.1, pressure: 1.2, runningHours: 4120 }
    ]
  },
  {
    id: 'M102',
    name: 'Centrifugal Water Pump B',
    type: 'Fluid Pump',
    location: 'Utility Station - Cooling Loop',
    model: 'Grundfos CR-95 High Flow',
    serialNumber: 'SN-PMP-441209',
    installedDate: '2024-01-20',
    temperature: 81.2,
    vibration: 6.4,
    pressure: 3.2,
    runningHours: 517,
    maintenanceIntervalHours: 1000,
    lastMaintenance: '2026-06-18',
    nextMaintenance: '2026-10-10',
    status: 'Warning',
    specs: {
      maxTemp: 78,
      maxVibration: 4.0,
      nominalPressure: 4.5,
      powerRating: '22 kW / 180 m³/h'
    },
    history: [
      { timestamp: '10:00', temperature: 76.5, vibration: 5.1, pressure: 3.6, runningHours: 515 },
      { timestamp: '10:30', temperature: 78.8, vibration: 5.7, pressure: 3.4, runningHours: 516 },
      { timestamp: '11:00', temperature: 80.4, vibration: 6.1, pressure: 3.3, runningHours: 516.5 },
      { timestamp: '11:15', temperature: 81.2, vibration: 6.4, pressure: 3.2, runningHours: 517 }
    ]
  },
  {
    id: 'M103',
    name: 'Rotary Screw Air Compressor',
    type: 'Compressor',
    location: 'Pneumatics Plant Room - Unit 3',
    model: 'Atlas Copco GA37 VSD',
    serialNumber: 'SN-CMP-990142',
    installedDate: '2022-11-05',
    temperature: 92.6,
    vibration: 7.2,
    pressure: 8.8,
    runningHours: 6420,
    maintenanceIntervalHours: 4000,
    lastMaintenance: '2026-04-10',
    nextMaintenance: '2026-10-02',
    status: 'Critical',
    specs: {
      maxTemp: 90,
      maxVibration: 6.5,
      nominalPressure: 7.5,
      powerRating: '37 kW / 115 l/s'
    },
    history: [
      { timestamp: '10:00', temperature: 84.0, vibration: 5.9, pressure: 8.1, runningHours: 6417 },
      { timestamp: '10:30', temperature: 88.5, vibration: 6.5, pressure: 8.4, runningHours: 6418 },
      { timestamp: '11:00', temperature: 91.2, vibration: 7.0, pressure: 8.7, runningHours: 6419 },
      { timestamp: '11:15', temperature: 92.6, vibration: 7.2, pressure: 8.8, runningHours: 6420 }
    ]
  },
  {
    id: 'M104',
    name: 'Emergency Diesel Generator',
    type: 'Generator',
    location: 'Power Substation 2',
    model: 'Caterpillar C18 600kVA',
    serialNumber: 'SN-GEN-103384',
    installedDate: '2021-08-14',
    temperature: 65.3,
    vibration: 1.8,
    pressure: 4.1,
    runningHours: 1240,
    maintenanceIntervalHours: 2500,
    lastMaintenance: '2026-07-29',
    nextMaintenance: '2026-12-01',
    status: 'Healthy',
    specs: {
      maxTemp: 85,
      maxVibration: 4.2,
      nominalPressure: 4.0,
      powerRating: '600 kVA / 480 kW Standby'
    },
    history: [
      { timestamp: '10:00', temperature: 64.0, vibration: 1.7, pressure: 4.1, runningHours: 1238 },
      { timestamp: '10:30', temperature: 64.8, vibration: 1.8, pressure: 4.1, runningHours: 1239 },
      { timestamp: '11:00', temperature: 65.1, vibration: 1.8, pressure: 4.1, runningHours: 1239.5 },
      { timestamp: '11:15', temperature: 65.3, vibration: 1.8, pressure: 4.1, runningHours: 1240 }
    ]
  },
  {
    id: 'M105',
    name: 'Main Assembly Belt Conveyor',
    type: 'Conveyor System',
    location: 'Packaging & Dispatch Hub',
    model: 'Dorner 2200 Precision Belt',
    serialNumber: 'SN-CNV-551922',
    installedDate: '2023-09-01',
    temperature: 58.7,
    vibration: 3.1,
    pressure: 0.9,
    runningHours: 8210,
    maintenanceIntervalHours: 8000,
    lastMaintenance: '2026-05-14',
    nextMaintenance: '2026-10-15',
    status: 'Healthy',
    specs: {
      maxTemp: 70,
      maxVibration: 4.0,
      nominalPressure: 1.0,
      powerRating: '7.5 kW / Variable Frequency Drive'
    },
    history: [
      { timestamp: '10:00', temperature: 57.0, vibration: 2.9, pressure: 0.9, runningHours: 8208 },
      { timestamp: '10:30', temperature: 57.8, vibration: 3.0, pressure: 0.9, runningHours: 8209 },
      { timestamp: '11:00', temperature: 58.3, vibration: 3.1, pressure: 0.9, runningHours: 8209.5 },
      { timestamp: '11:15', temperature: 58.7, vibration: 3.1, pressure: 0.9, runningHours: 8210 }
    ]
  },
  {
    id: 'M106',
    name: 'Hydraulic Stamping Press',
    type: 'Hydraulic Press',
    location: 'Metal Fabrication Shop - Cell 4',
    model: 'Schuler 200T High Speed',
    serialNumber: 'SN-PRS-774019',
    installedDate: '2022-04-18',
    temperature: 77.4,
    vibration: 4.8,
    pressure: 182.0,
    runningHours: 4950,
    maintenanceIntervalHours: 5000,
    lastMaintenance: '2026-05-22',
    nextMaintenance: '2026-10-12',
    status: 'Warning',
    specs: {
      maxTemp: 75,
      maxVibration: 4.5,
      nominalPressure: 180.0,
      powerRating: '55 kW / 200 Metric Tonnes'
    },
    history: [
      { timestamp: '10:00', temperature: 74.1, vibration: 4.2, pressure: 178, runningHours: 4948 },
      { timestamp: '10:30', temperature: 75.8, vibration: 4.5, pressure: 180, runningHours: 4949 },
      { timestamp: '11:00', temperature: 76.9, vibration: 4.7, pressure: 181, runningHours: 4949.5 },
      { timestamp: '11:15', temperature: 77.4, vibration: 4.8, pressure: 182, runningHours: 4950 }
    ]
  }
];

export const initialTechnicians: Technician[] = [
  {
    id: 'T001',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@industrial-ops.com',
    specialization: 'Electric Motor',
    availability: 'Available',
    currentWorkload: 1,
    completedJobsCount: 42,
    phone: '+1 (555) 234-9811'
  },
  {
    id: 'T002',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@industrial-ops.com',
    specialization: 'Fluid Pump',
    availability: 'Available',
    currentWorkload: 0,
    completedJobsCount: 38,
    phone: '+1 (555) 234-9812'
  },
  {
    id: 'T003',
    name: 'Vijay Kumar',
    email: 'vijay.kumar@industrial-ops.com',
    specialization: 'Compressor',
    availability: 'Busy',
    currentWorkload: 2,
    completedJobsCount: 51,
    phone: '+1 (555) 234-9813'
  },
  {
    id: 'T004',
    name: 'David O\'Connor',
    email: 'david.oconnor@industrial-ops.com',
    specialization: 'Generator',
    availability: 'Available',
    currentWorkload: 1,
    completedJobsCount: 29,
    phone: '+1 (555) 234-9814'
  },
  {
    id: 'T005',
    name: 'Elena Rostova',
    email: 'elena.rostova@industrial-ops.com',
    specialization: 'Conveyor System',
    availability: 'Available',
    currentWorkload: 0,
    completedJobsCount: 35,
    phone: '+1 (555) 234-9815'
  }
];

export const initialPredictions: Record<string, AIPrediction> = {
  M103: {
    equipmentId: 'M103',
    failureProbability: 89,
    riskLevel: 'High Risk',
    recommendation: 'Maintenance Recommended: Urgent inspection of screw rotor bearings and oil cooling heat exchanger.',
    contributingFactors: [
      { factor: 'Vibration Anomaly', impact: 'High', description: '7.2 mm/s surpasses warning threshold of 6.5 mm/s' },
      { factor: 'Core Overheating', impact: 'High', description: '92.6°C exceeds max operating safety limit of 90°C' },
      { factor: 'Discharge Overpressure', impact: 'Medium', description: '8.8 bar operating 1.3 bar above nominal' }
    ],
    predictedFailureComponent: 'Drive End Bearing & Thermal Expansion Valve',
    estimatedTimeToFailureHours: 18,
    lastCalculated: '2026-10-08 11:15',
    autoRequestCreated: true
  },
  M102: {
    equipmentId: 'M102',
    failureProbability: 64,
    riskLevel: 'Medium Risk',
    recommendation: 'Scheduled Inspection: Impeller cavitation detected, seal wear inspection advised.',
    contributingFactors: [
      { factor: 'Vibration Spike', impact: 'High', description: '6.4 mm/s elevated harmonic frequency' },
      { factor: 'Temperature Rise', impact: 'Medium', description: '81.2°C approaching secondary cutoff' }
    ],
    predictedFailureComponent: 'Mechanical Shaft Seal & Impeller Ring',
    estimatedTimeToFailureHours: 110,
    lastCalculated: '2026-10-08 11:10',
    autoRequestCreated: true
  },
  M106: {
    equipmentId: 'M106',
    failureProbability: 48,
    riskLevel: 'Medium Risk',
    recommendation: 'Preventive check: Hydraulic fluid filter replacement recommended before 5000 operating hours.',
    contributingFactors: [
      { factor: 'Operating Hours Near Limit', impact: 'Medium', description: '4950 / 5000 maintenance interval' },
      { factor: 'Hydraulic Pressure Fluctuation', impact: 'Low', description: 'Micro-surges observed during clamp cycle' }
    ],
    predictedFailureComponent: 'High Pressure Manifold Filter',
    estimatedTimeToFailureHours: 240,
    lastCalculated: '2026-10-08 10:45',
    autoRequestCreated: false
  },
  M101: {
    equipmentId: 'M101',
    failureProbability: 14,
    riskLevel: 'Low Risk',
    recommendation: 'Normal Operation: All thermal, mechanical, and power signatures within nominal envelope.',
    contributingFactors: [
      { factor: 'Stable Rotor Temperature', impact: 'Low', description: 'Operating at 68.4°C well within 85°C limit' },
      { factor: 'Harmonic Stability', impact: 'Low', description: 'Vibration nominal at 2.1 mm/s' }
    ],
    predictedFailureComponent: 'None Detected',
    estimatedTimeToFailureHours: 3200,
    lastCalculated: '2026-10-08 11:00',
    autoRequestCreated: false
  },
  M104: {
    equipmentId: 'M104',
    failureProbability: 8,
    riskLevel: 'Low Risk',
    recommendation: 'Optimal Health: Standby system verified ready for emergency auto-start.',
    contributingFactors: [
      { factor: 'Optimal Oil Pressure', impact: 'Low', description: 'Lubrication 4.1 bar at rest' }
    ],
    predictedFailureComponent: 'None Detected',
    estimatedTimeToFailureHours: 5000,
    lastCalculated: '2026-10-08 09:30',
    autoRequestCreated: false
  },
  M105: {
    equipmentId: 'M105',
    failureProbability: 21,
    riskLevel: 'Low Risk',
    recommendation: 'Routine Monitoring: Belt tensioning check recommended during planned weekend downtime.',
    contributingFactors: [
      { factor: 'Running Hours Passed Interval', impact: 'Low', description: '8210 / 8000 hrs planned interval' }
    ],
    predictedFailureComponent: 'Belt Drive Tension Pulley',
    estimatedTimeToFailureHours: 850,
    lastCalculated: '2026-10-08 10:15',
    autoRequestCreated: false
  }
};

export const initialRequests: MaintenanceRequest[] = [
  {
    id: 'PM-M103-20261008-001',
    equipmentId: 'M103',
    reason: 'AI Predicted High Failure Probability (89%) - Critical Bearing Overheating & Vibration',
    priority: 'High',
    assignedTechnicianId: 'T003',
    createdDate: '2026-10-08 10:15',
    status: 'Assigned',
    source: 'AI Prediction',
    approvalStatus: 'Estimate Approved',
    billingId: 'INV-PM-M103-20261008-001',
    costEstimate: {
      maintenanceCategory: 'Emergency',
      estimatedLabourHours: 3.5,
      hourlyLabourRate: 500,
      estimatedLabourCost: 1750,
      spareParts: [
        { partName: 'SKF Deep Groove Ball Bearing (6309)', quantity: 1, unitPrice: 2800, totalPrice: 2800 },
        { partName: 'Synthetic Screw Compressor Lubricant (4L)', quantity: 1, unitPrice: 1100, totalPrice: 1100 }
      ],
      sparePartsCost: 3900,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 200,
      subtotal: 6650,
      taxRate: 18,
      taxAmount: 1197,
      totalEstimatedCost: 7000,
      createdAt: '2026-10-08 10:16',
      updatedAt: '2026-10-08 10:20',
      estimatedBy: 'Smart AI Cost Estimation Engine'
    }
  },
  {
    id: 'PM-M102-20261008-002',
    equipmentId: 'M102',
    reason: 'Vibration Threshold Exceeded (6.4 mm/s) & Temperature Warning',
    priority: 'Medium',
    assignedTechnicianId: 'T002',
    createdDate: '2026-10-08 09:40',
    status: 'In Progress',
    source: 'IoT Threshold Exceeded',
    approvalStatus: 'Approval Required',
    billingId: 'INV-PM-M102-20261008-002',
    costEstimate: {
      maintenanceCategory: 'Corrective',
      estimatedLabourHours: 2.5,
      hourlyLabourRate: 500,
      estimatedLabourCost: 1250,
      spareParts: [
        { partName: 'Mechanical Shaft Seal Ring', quantity: 1, unitPrice: 1800, totalPrice: 1800 },
        { partName: 'Impeller Casing O-Ring Gasket', quantity: 2, unitPrice: 340, totalPrice: 680 }
      ],
      sparePartsCost: 2480,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 0,
      subtotal: 4530,
      taxRate: 18,
      taxAmount: 815,
      totalEstimatedCost: 5000,
      createdAt: '2026-10-08 09:42',
      updatedAt: '2026-10-08 09:50',
      estimatedBy: 'Smart AI Cost Estimation Engine'
    },
    actualCost: {
      actualLabourHours: 3.5,
      hourlyLabourRate: 500,
      actualLabourCost: 1750,
      spareParts: [
        { partName: 'Mechanical Shaft Seal Ring', quantity: 1, unitPrice: 1800, totalPrice: 1800 },
        { partName: 'Impeller Casing O-Ring Gasket', quantity: 2, unitPrice: 340, totalPrice: 680 },
        { partName: 'Corrosion Inhibitor Fluid (1L)', quantity: 1, unitPrice: 420, totalPrice: 420 }
      ],
      sparePartsCost: 2900,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 150,
      additionalExpensesNotes: 'Rapid courier dispatch for specialized seal',
      subtotal: 5600,
      taxRate: 18,
      taxAmount: 1008,
      totalActualCost: 5600,
      submittedAt: '2026-10-08 11:20',
      submittedBy: 'Sarah Jenkins (T002)',
      workDescription: 'Replaced eroded mechanical shaft seal and worn impeller casing gasket. Flushed pump reservoir.'
    },
    costComparison: {
      estimatedCost: 5000,
      actualCost: 5600,
      costDifference: 600,
      costVariancePercentage: 12.0,
      budgetStatus: 'Over Budget',
      isOverThreshold: true
    }
  },
  {
    id: 'PM-M101-20261007-001',
    equipmentId: 'M101',
    reason: 'Preventive Motor Stator & Bearing Greasing Routine',
    priority: 'Low',
    assignedTechnicianId: 'T001',
    createdDate: '2026-10-07 08:30',
    status: 'Blockchain Recorded',
    source: 'Hours Interval',
    blockNumber: 1,
    blockHash: '0000a4b78912c4e5f03912da48e91cb3489e21df98716254ab819024f0c91823',
    approvalStatus: 'Final Cost Approved',
    billingId: 'INV-PM-M101-20261007-001',
    costEstimate: {
      maintenanceCategory: 'Preventive',
      estimatedLabourHours: 2.0,
      hourlyLabourRate: 500,
      estimatedLabourCost: 1000,
      spareParts: [
        { partName: 'Polyurea Grease Cartridge (Kluber)', quantity: 1, unitPrice: 800, totalPrice: 800 },
        { partName: 'DE/NDE Nitrile Dust Seals (x2)', quantity: 2, unitPrice: 400, totalPrice: 800 }
      ],
      sparePartsCost: 1600,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 0,
      subtotal: 3400,
      taxRate: 18,
      taxAmount: 600,
      totalEstimatedCost: 4000,
      createdAt: '2026-10-07 08:35',
      updatedAt: '2026-10-07 08:45',
      estimatedBy: 'Smart AI Cost Estimation Engine'
    },
    actualCost: {
      actualLabourHours: 2.0,
      hourlyLabourRate: 500,
      actualLabourCost: 1000,
      spareParts: [
        { partName: 'Polyurea Grease Cartridge (Kluber)', quantity: 1, unitPrice: 750, totalPrice: 750 },
        { partName: 'DE/NDE Nitrile Dust Seals (x2)', quantity: 2, unitPrice: 380, totalPrice: 760 }
      ],
      sparePartsCost: 1510,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 0,
      subtotal: 3310,
      taxRate: 18,
      taxAmount: 490,
      totalActualCost: 3800,
      submittedAt: '2026-10-07 14:20',
      submittedBy: 'Rajesh Sharma (T001)',
      workDescription: 'Disassembled motor non-drive end cover, flushed old grease, inspected ceramic insulated bearing, refilled with synthetic grease.'
    },
    costComparison: {
      estimatedCost: 4000,
      actualCost: 3800,
      costDifference: -200,
      costVariancePercentage: -5.0,
      budgetStatus: 'Under Budget',
      isOverThreshold: false
    },
    evidence: {
      workDescription: 'Disassembled motor non-drive end cover, flushed old grease, inspected ceramic insulated bearing, refilled with synthetic polyurea grease, dynamic re-alignment performed.',
      beforeCondition: 'Stator temperature elevated at 84°C with audible dry friction chirp and harmonic vibration at 4.6 mm/s.',
      afterCondition: 'Smooth silent operation, vibration dropped to 2.1 mm/s, operating stator temperature stabilized at 68°C.',
      partsReplaced: ['Polyurea Grease Cartridge (Kluber)', 'DE/NDE Nitrile Dust Seals (x2)'],
      technicianNotes: 'Bearing raceways were clean without spalling. Clearance verified at 0.035mm. Motor balanced to ISO G2.5.',
      completedAt: '2026-10-07 14:20',
      beforeSensors: { temperature: 84.0, vibration: 4.6, pressure: 1.2 },
      afterSensors: { temperature: 68.0, vibration: 2.1, pressure: 1.2 }
    },
    verification: {
      maintenanceId: 'PM-M101-20261007-001',
      trustScore: 100,
      status: 'Verified',
      verifiedAt: '2026-10-07 14:22',
      verifiedBy: 'Automated Verification Engine v2.4',
      checks: [
        { name: 'Valid Maintenance Request', valid: true, score: 20, maxScore: 20, details: 'Authorized request in active system registry' },
        { name: 'Valid Equipment Specification', valid: true, score: 20, maxScore: 20, details: 'Equipment M101 online and telemetry synchronized' },
        { name: 'Technician Assignment Match', valid: true, score: 20, maxScore: 20, details: 'Certified technician T001 Rajesh Sharma' },
        { name: 'Comprehensive Work Description', valid: true, score: 20, maxScore: 20, details: 'Detailed engineering steps documented with parts list' },
        { name: 'Physical Before & After Evidence', valid: true, score: 20, maxScore: 20, details: 'Dual telemetry snapshots verified within threshold limits' }
      ]
    },
    effectiveness: {
      maintenanceId: 'PM-M101-20261007-001',
      effectivenessScore: 94,
      status: 'Effective',
      temperatureDelta: -16.0,
      vibrationDelta: -2.5,
      pressureDelta: 0,
      summary: 'Temperature reduced by 19% and vibration reduced by 54%. Equipment returned to pristine baseline.',
      reworkRequired: false,
      evaluatedAt: '2026-10-07 14:25'
    }
  },
  {
    id: 'PM-M104-20261005-001',
    equipmentId: 'M104',
    reason: 'Quarterly Standby Diesel Generator Fuel Injector & Governor Calibration',
    priority: 'Low',
    assignedTechnicianId: 'T004',
    createdDate: '2026-10-05 08:00',
    status: 'Blockchain Recorded',
    source: 'Hours Interval',
    blockNumber: 2,
    blockHash: '0000ef1298c4710a8274198b1e42a981045b67cd890123ef124590ab34289011',
    approvalStatus: 'Final Cost Approved',
    billingId: 'INV-PM-M104-20261005-001',
    costEstimate: {
      maintenanceCategory: 'Preventive',
      estimatedLabourHours: 5.0,
      hourlyLabourRate: 500,
      estimatedLabourCost: 2500,
      spareParts: [
        { partName: 'Fuel Water Separator Cat 1R-0770', quantity: 1, unitPrice: 3200, totalPrice: 3200 },
        { partName: 'Primary Fuel Filter 1R-0762', quantity: 1, unitPrice: 2800, totalPrice: 2800 },
        { partName: 'Rocker Cover Gasket', quantity: 1, unitPrice: 900, totalPrice: 900 }
      ],
      sparePartsCost: 6900,
      inspectionFee: 600,
      serviceCharge: 400,
      additionalExpenses: 0,
      subtotal: 10400,
      taxRate: 18,
      taxAmount: 1872,
      totalEstimatedCost: 12272,
      createdAt: '2026-10-05 08:05',
      updatedAt: '2026-10-05 08:15',
      estimatedBy: 'Smart AI Cost Estimation Engine'
    },
    actualCost: {
      actualLabourHours: 4.5,
      hourlyLabourRate: 500,
      actualLabourCost: 2250,
      spareParts: [
        { partName: 'Fuel Water Separator Cat 1R-0770', quantity: 1, unitPrice: 3200, totalPrice: 3200 },
        { partName: 'Primary Fuel Filter 1R-0762', quantity: 1, unitPrice: 2800, totalPrice: 2800 },
        { partName: 'Rocker Cover Gasket', quantity: 1, unitPrice: 850, totalPrice: 850 }
      ],
      sparePartsCost: 6850,
      inspectionFee: 600,
      serviceCharge: 400,
      additionalExpenses: 0,
      subtotal: 10100,
      taxRate: 18,
      taxAmount: 1700,
      totalActualCost: 11800,
      submittedAt: '2026-10-05 13:40',
      submittedBy: 'David O\'Connor (T004)',
      workDescription: 'Replaced primary and secondary diesel fuel filters, cleaned common rail pressure regulator.'
    },
    costComparison: {
      estimatedCost: 12272,
      actualCost: 11800,
      costDifference: -472,
      costVariancePercentage: -3.8,
      budgetStatus: 'Under Budget',
      isOverThreshold: false
    },
    evidence: {
      workDescription: 'Replaced primary and secondary diesel fuel filters, cleaned common rail pressure regulator, tested auto-transfer switch under 80% artificial load bank for 45 minutes.',
      beforeCondition: 'Slight exhaust smoking on start, hunting idle governor fluctuations between 1480-1520 RPM.',
      afterCondition: 'Clean instantaneous start at 1500 RPM locked frequency. Zero soot, stable excitation voltage at 400V.',
      partsReplaced: ['Fuel Water Separator Cat 1R-0770', 'Primary Fuel Filter 1R-0762', 'Rocker Cover Gasket'],
      technicianNotes: 'C18 alternator windings insulation test passed 100 Megaohms Megger check.',
      completedAt: '2026-10-05 13:40',
      beforeSensors: { temperature: 78.5, vibration: 3.2, pressure: 3.4 },
      afterSensors: { temperature: 65.3, vibration: 1.8, pressure: 4.1 }
    },
    verification: {
      maintenanceId: 'PM-M104-20261005-001',
      trustScore: 100,
      status: 'Verified',
      verifiedAt: '2026-10-05 13:42',
      verifiedBy: 'Automated Verification Engine v2.4',
      checks: [
        { name: 'Valid Maintenance Request', valid: true, score: 20, maxScore: 20, details: 'Authorized scheduled preventive task' },
        { name: 'Valid Equipment Specification', valid: true, score: 20, maxScore: 20, details: 'Equipment M104 active in registry' },
        { name: 'Technician Assignment Match', valid: true, score: 20, maxScore: 20, details: 'Certified heavy power technician T004 David O\'Connor' },
        { name: 'Comprehensive Work Description', valid: true, score: 20, maxScore: 20, details: 'Complete test log and load-bank protocol verified' },
        { name: 'Physical Before & After Evidence', valid: true, score: 20, maxScore: 20, details: 'Governor stability and thermal drop verified' }
      ]
    },
    effectiveness: {
      maintenanceId: 'PM-M104-20261005-001',
      effectivenessScore: 91,
      status: 'Effective',
      temperatureDelta: -13.2,
      vibrationDelta: -1.4,
      pressureDelta: +0.7,
      summary: 'Fuel pressure recovered +0.7 bar, vibration down 43%, generator idle stabilized.',
      reworkRequired: false,
      evaluatedAt: '2026-10-05 13:45'
    }
  },
  {
    id: 'PM-M105-20261004-001',
    equipmentId: 'M105',
    reason: 'Conveyor Drive Roller Bearing Noise & Belt Tracking Misalignment',
    priority: 'Medium',
    assignedTechnicianId: 'T005',
    createdDate: '2026-10-04 11:00',
    status: 'Blockchain Recorded',
    source: 'IoT Threshold Exceeded',
    blockNumber: 3,
    blockHash: '00003c489201f893114a8b72e1045938acfe72039147586901823abce8492019',
    approvalStatus: 'Final Cost Approved',
    billingId: 'INV-PM-M105-20261004-001',
    costEstimate: {
      maintenanceCategory: 'Corrective',
      estimatedLabourHours: 4.0,
      hourlyLabourRate: 500,
      estimatedLabourCost: 2000,
      spareParts: [
        { partName: 'Pillow Block Bearings UCP205 (x2)', quantity: 2, unitPrice: 1600, totalPrice: 3200 },
        { partName: 'High Grip Drive Roller Lagging Sleeve', quantity: 1, unitPrice: 1500, totalPrice: 1500 }
      ],
      sparePartsCost: 4700,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 0,
      subtotal: 7500,
      taxRate: 18,
      taxAmount: 1350,
      totalEstimatedCost: 8850,
      createdAt: '2026-10-04 11:05',
      updatedAt: '2026-10-04 11:12',
      estimatedBy: 'Smart AI Cost Estimation Engine'
    },
    actualCost: {
      actualLabourHours: 4.5,
      hourlyLabourRate: 500,
      actualLabourCost: 2250,
      spareParts: [
        { partName: 'Pillow Block Bearings UCP205 (x2)', quantity: 2, unitPrice: 1600, totalPrice: 3200 },
        { partName: 'High Grip Drive Roller Lagging Sleeve', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
        { partName: 'Heavy-Duty Tensioner Bolt Set', quantity: 1, unitPrice: 450, totalPrice: 450 }
      ],
      sparePartsCost: 5150,
      inspectionFee: 500,
      serviceCharge: 300,
      additionalExpenses: 200,
      additionalExpensesNotes: 'Emergency laser alignment tool rental',
      subtotal: 8400,
      taxRate: 18,
      taxAmount: 1400,
      totalActualCost: 9800,
      submittedAt: '2026-10-04 16:10',
      submittedBy: 'Elena Rostova (T005)',
      workDescription: 'Realigned head pulley and crowned tension tail roller, adjusted dual pneumatic tensioners.'
    },
    costComparison: {
      estimatedCost: 8850,
      actualCost: 9800,
      costDifference: 950,
      costVariancePercentage: 10.7,
      budgetStatus: 'Over Budget',
      isOverThreshold: true
    },
    evidence: {
      workDescription: 'Realigned head pulley and crowned tension tail roller, adjusted dual pneumatic tensioners to 3.5 bar, tensioned urethane belt to 0.4% elongation, cleaned optical tracking sensor.',
      beforeCondition: 'Belt wander drifting 18mm toward left guide rail, creating localized friction heat at 74°C and vibration 4.8 mm/s.',
      afterCondition: 'Centred belt tracking within 1.5mm, smooth travel at 1.2 m/s, roller temperature returned to 58°C.',
      partsReplaced: ['Pillow Block Bearings UCP205 (x2)', 'High Grip Drive Roller Lagging Sleeve'],
      technicianNotes: 'Tested continuously for 60 minutes with 250kg distributed test loads. Zero drift.',
      completedAt: '2026-10-04 16:10',
      beforeSensors: { temperature: 74.0, vibration: 4.8, pressure: 0.9 },
      afterSensors: { temperature: 58.7, vibration: 3.1, pressure: 0.9 }
    },
    verification: {
      maintenanceId: 'PM-M105-20261004-001',
      trustScore: 100,
      status: 'Verified',
      verifiedAt: '2026-10-04 16:12',
      verifiedBy: 'Automated Verification Engine v2.4',
      checks: [
        { name: 'Valid Maintenance Request', valid: true, score: 20, maxScore: 20, details: 'Authorized threshold alarm request' },
        { name: 'Valid Equipment Specification', valid: true, score: 20, maxScore: 20, details: 'Equipment M105 active' },
        { name: 'Technician Assignment Match', valid: true, score: 20, maxScore: 20, details: 'Conveyor specialist T005 Elena Rostova' },
        { name: 'Comprehensive Work Description', valid: true, score: 20, maxScore: 20, details: 'Complete alignment report and load test' },
        { name: 'Physical Before & After Evidence', valid: true, score: 20, maxScore: 20, details: 'Thermal reduction -15.3°C confirmed' }
      ]
    },
    effectiveness: {
      maintenanceId: 'PM-M105-20261004-001',
      effectivenessScore: 88,
      status: 'Effective',
      temperatureDelta: -15.3,
      vibrationDelta: -1.7,
      pressureDelta: 0,
      summary: 'Roller friction mitigated, bearing temperature stabilized, vibration lowered by 35%.',
      reworkRequired: false,
      evaluatedAt: '2026-10-04 16:15'
    }
  }
];

export const initialBillingRecords: BillingRecord[] = [
  {
    id: 'INV-PM-M101-20261007-001',
    maintenanceId: 'PM-M101-20261007-001',
    equipmentId: 'M101',
    technicianId: 'T001',
    invoiceDate: '2026-10-07',
    dueDate: '2026-10-21',
    costEstimate: initialRequests[2].costEstimate!,
    actualCost: initialRequests[2].actualCost,
    costComparison: initialRequests[2].costComparison,
    approvalStatus: 'Final Cost Approved',
    approvalHistory: [
      {
        stage: 'Estimate',
        status: 'Estimate Approved',
        approvedBy: 'Plant Maintenance Manager',
        role: 'Manager',
        timestamp: '2026-10-07 08:45',
        approvedAmount: 4000,
        notes: 'Initial preventive maintenance scope approved'
      },
      {
        stage: 'Final Cost',
        status: 'Final Cost Approved',
        approvedBy: 'Plant Maintenance Manager',
        role: 'Manager',
        timestamp: '2026-10-07 14:30',
        approvedAmount: 3800,
        notes: 'Completed under budget. Invoiced approved for settlement.'
      }
    ],
    finalApprovedCost: 3800,
    paymentStatus: 'Paid',
    payments: [
      {
        id: 'PAY-M101-001',
        amountPaid: 3800,
        paymentDate: '2026-10-08 10:15',
        paymentMethod: 'Bank Transfer (NEFT/RTGS)',
        transactionReference: 'NEFT-AXIS-9920194012',
        recordedBy: 'Finance Administrator',
        notes: 'Full invoice settlement via corporate net banking'
      }
    ],
    totalPaid: 3800,
    remainingBalance: 0,
    currency: 'INR',
    isLocked: true
  },
  {
    id: 'INV-PM-M104-20261005-001',
    maintenanceId: 'PM-M104-20261005-001',
    equipmentId: 'M104',
    technicianId: 'T004',
    invoiceDate: '2026-10-05',
    dueDate: '2026-10-19',
    costEstimate: initialRequests[3].costEstimate!,
    actualCost: initialRequests[3].actualCost,
    costComparison: initialRequests[3].costComparison,
    approvalStatus: 'Final Cost Approved',
    approvalHistory: [
      {
        stage: 'Estimate',
        status: 'Estimate Approved',
        approvedBy: 'Operations Director',
        role: 'Admin',
        timestamp: '2026-10-05 08:15',
        approvedAmount: 12272
      },
      {
        stage: 'Final Cost',
        status: 'Final Cost Approved',
        approvedBy: 'Plant Maintenance Manager',
        role: 'Manager',
        timestamp: '2026-10-05 14:00',
        approvedAmount: 11800,
        notes: 'Final load bank testing verified. Settled under budget.'
      }
    ],
    finalApprovedCost: 11800,
    paymentStatus: 'Paid',
    payments: [
      {
        id: 'PAY-M104-001',
        amountPaid: 11800,
        paymentDate: '2026-10-06 11:30',
        paymentMethod: 'Bank Transfer (NEFT/RTGS)',
        transactionReference: 'RTGS-HDFC-8849102481',
        recordedBy: 'Finance Administrator',
        notes: 'Full payment processed on PO-2026-4401'
      }
    ],
    totalPaid: 11800,
    remainingBalance: 0,
    currency: 'INR',
    isLocked: true
  },
  {
    id: 'INV-PM-M105-20261004-001',
    maintenanceId: 'PM-M105-20261004-001',
    equipmentId: 'M105',
    technicianId: 'T005',
    invoiceDate: '2026-10-04',
    dueDate: '2026-10-18',
    costEstimate: initialRequests[4].costEstimate!,
    actualCost: initialRequests[4].actualCost,
    costComparison: initialRequests[4].costComparison,
    approvalStatus: 'Final Cost Approved',
    approvalHistory: [
      {
        stage: 'Estimate',
        status: 'Estimate Approved',
        approvedBy: 'Plant Maintenance Manager',
        role: 'Manager',
        timestamp: '2026-10-04 11:15',
        approvedAmount: 8850
      },
      {
        stage: 'Final Cost',
        status: 'Final Cost Approved',
        approvedBy: 'Operations Director',
        role: 'Admin',
        timestamp: '2026-10-04 17:00',
        approvedAmount: 9800,
        notes: 'Variance +10.7% justified due to laser alignment rental requirement.'
      }
    ],
    finalApprovedCost: 9800,
    paymentStatus: 'Partially Paid',
    payments: [
      {
        id: 'PAY-M105-001',
        amountPaid: 5000,
        paymentDate: '2026-10-07 15:40',
        paymentMethod: 'UPI',
        transactionReference: 'UPI-IND-7749102931@icici',
        recordedBy: 'Accounts Lead',
        notes: 'Initial milestone payment'
      }
    ],
    totalPaid: 5000,
    remainingBalance: 4800,
    currency: 'INR',
    isLocked: true
  },
  {
    id: 'INV-PM-M102-20261008-002',
    maintenanceId: 'PM-M102-20261008-002',
    equipmentId: 'M102',
    technicianId: 'T002',
    invoiceDate: '2026-10-08',
    dueDate: '2026-10-22',
    costEstimate: initialRequests[1].costEstimate!,
    actualCost: initialRequests[1].actualCost,
    costComparison: initialRequests[1].costComparison,
    approvalStatus: 'Approval Required',
    approvalHistory: [
      {
        stage: 'Estimate',
        status: 'Estimate Approved',
        approvedBy: 'Plant Maintenance Manager',
        role: 'Manager',
        timestamp: '2026-10-08 09:50',
        approvedAmount: 5000
      }
    ],
    finalApprovedCost: 5600,
    paymentStatus: 'Pending',
    payments: [],
    totalPaid: 0,
    remainingBalance: 5600,
    currency: 'INR',
    isLocked: false
  },
  {
    id: 'INV-PM-M103-20261008-001',
    maintenanceId: 'PM-M103-20261008-001',
    equipmentId: 'M103',
    technicianId: 'T003',
    invoiceDate: '2026-10-08',
    dueDate: '2026-10-22',
    costEstimate: initialRequests[0].costEstimate!,
    approvalStatus: 'Estimate Approved',
    approvalHistory: [
      {
        stage: 'Estimate',
        status: 'Estimate Approved',
        approvedBy: 'Plant Maintenance Manager',
        role: 'Manager',
        timestamp: '2026-10-08 10:20',
        approvedAmount: 7000,
        notes: 'Priority emergency repair approved. Technician dispatched.'
      }
    ],
    finalApprovedCost: 7000,
    paymentStatus: 'Pending',
    payments: [],
    totalPaid: 0,
    remainingBalance: 7000,
    currency: 'INR',
    isLocked: false
  }
];

// Helper to pre-mine initial chain blocks synchronously with valid difficulty '0000'
export function buildInitialBlockchain(): BlockchainBlock[] {
  // Block #0 - Genesis Block
  const genesisTimestamp = '2026-10-01 00:00:00';
  let genesisNonce = 0;
  let genesisHash = '';
  // Search for nonce satisfying 0000
  while (true) {
    const h = computeBlockHash(0, genesisTimestamp, 'GENESIS-0000', 'NETWORK-ROOT', 'SYSTEM', null, '0000000000000000000000000000000000000000000000000000000000000000', genesisNonce);
    if (h.startsWith('0000')) {
      genesisHash = h;
      break;
    }
    genesisNonce++;
  }

  const genesisBlock: BlockchainBlock = {
    blockNumber: 0,
    timestamp: genesisTimestamp,
    maintenanceId: 'GENESIS-0000',
    equipmentId: 'NETWORK-ROOT',
    technicianId: 'SYSTEM',
    data: null,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: genesisHash,
    nonce: genesisNonce,
    powStatus: 'VALID',
    verificationStatus: 'GENESIS',
    minedTimeMs: 12
  };

  const chain: BlockchainBlock[] = [genesisBlock];

  // Map recorded requests into initial blocks
  const recordedReqs = initialRequests.filter(r => r.status === 'Blockchain Recorded' && r.evidence && r.verification && r.effectiveness);

  for (let idx = 0; idx < recordedReqs.length; idx++) {
    const req = recordedReqs[idx];
    const prevBlock = chain[idx];
    const blockNumber = idx + 1;
    const timestamp = req.verification?.verifiedAt || '2026-10-07 14:22:00';

    const blockData = {
      maintenanceId: req.id,
      equipmentId: req.equipmentId,
      technicianId: req.assignedTechnicianId || 'T001',
      workPerformed: req.evidence!.workDescription,
      partsReplaced: req.evidence!.partsReplaced,
      beforeCondition: req.evidence!.beforeCondition,
      afterCondition: req.evidence!.afterCondition,
      trustScore: req.verification!.trustScore,
      effectivenessScore: req.effectiveness!.effectivenessScore,
      verifiedAt: req.verification!.verifiedAt,
      verificationHash: `VER-${req.id}-${req.verification!.trustScore}`
    };

    let nonce = 0;
    let minedHash = '';
    while (true) {
      const h = computeBlockHash(
        blockNumber,
        timestamp,
        req.id,
        req.equipmentId,
        req.assignedTechnicianId || 'T001',
        blockData,
        prevBlock.currentHash,
        nonce
      );
      if (h.startsWith('0000')) {
        minedHash = h;
        break;
      }
      nonce++;
    }

    const block: BlockchainBlock = {
      blockNumber,
      timestamp,
      maintenanceId: req.id,
      equipmentId: req.equipmentId,
      technicianId: req.assignedTechnicianId || 'T001',
      data: blockData,
      previousHash: prevBlock.currentHash,
      currentHash: minedHash,
      nonce,
      powStatus: 'VALID',
      verificationStatus: 'VERIFIED',
      minedTimeMs: 240
    };

    // Update the request with exact blockNumber and hash
    req.blockNumber = blockNumber;
    req.blockHash = minedHash;

    chain.push(block);
  }

  return chain;
}

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-10-08 11:15:20',
    user: 'AI Predictive Engine',
    role: 'Admin',
    action: 'AI Failure Prediction Calculated',
    equipmentId: 'M103',
    result: 'Failure probability 89% (High Risk) - Threshold exceeded'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-10-08 11:15:21',
    user: 'Autonomous Scheduler',
    role: 'Admin',
    action: 'Maintenance Request Created',
    equipmentId: 'M103',
    maintenanceId: 'PM-M103-20261008-001',
    result: 'Priority: High. Auto-assigned to T003 (Vijay Kumar)'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-10-07 14:22:10',
    user: 'Verification Engine v2.4',
    role: 'Manager',
    action: 'Maintenance Verification Completed',
    equipmentId: 'M101',
    maintenanceId: 'PM-M101-20261007-001',
    result: 'Trust Score: 100/100 (Verified)'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-10-07 14:22:45',
    user: 'Proof-of-Work Miner Node 1',
    role: 'Admin',
    action: 'Block #1 Mined Successfully',
    equipmentId: 'M101',
    maintenanceId: 'PM-M101-20261007-001',
    result: 'Nonce: Found | Hash: 0000...',
    hash: '0000a4b78912c4e5f03912da48e91cb3489e21df98716254ab819024f0c91823'
  },
  {
    id: 'LOG-005',
    timestamp: '2026-10-05 13:42:15',
    user: 'Proof-of-Work Miner Node 1',
    role: 'Admin',
    action: 'Block #2 Mined Successfully',
    equipmentId: 'M104',
    maintenanceId: 'PM-M104-20261005-001',
    result: 'Proof of work verified. Chain length: 3 blocks'
  },
  {
    id: 'LOG-006',
    timestamp: '2026-10-04 16:12:30',
    user: 'Proof-of-Work Miner Node 1',
    role: 'Admin',
    action: 'Block #3 Mined Successfully',
    equipmentId: 'M105',
    maintenanceId: 'PM-M105-20261004-001',
    result: 'Proof of work verified. Chain length: 4 blocks'
  }
];
