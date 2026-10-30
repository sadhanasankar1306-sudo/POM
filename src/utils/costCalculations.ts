import {
  MaintenanceCostEstimate,
  ActualMaintenanceCost,
  CostComparison,
  BudgetStatus,
  SparePartItem,
  MaintenanceCategory,
  BillingConfig
} from '../types';

export const defaultBillingConfig: BillingConfig = {
  defaultHourlyRate: 500, // ₹500/hr
  defaultInspectionFee: 500, // ₹500
  defaultServiceCharge: 300, // ₹300
  defaultTaxRate: 18, // 18% GST
  budgetVarianceThresholdPercent: 10, // 10% variance triggers manager approval
  currencySymbol: '₹'
};

/**
 * Format currency amount in Indian Rupee format with ₹ symbol
 * e.g., ₹1,50,000 or ₹4,800
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Calculate total estimated maintenance cost
 * Formula: Labour Cost + Spare Parts + Inspection Fee + Service Charge + Additional Expenses + Tax
 */
export function calculateEstimatedCost(params: {
  labourHours: number;
  hourlyRate: number;
  spareParts: SparePartItem[];
  inspectionFee: number;
  serviceCharge: number;
  additionalExpenses: number;
  taxRate: number;
}): {
  labourCost: number;
  sparePartsCost: number;
  subtotal: number;
  taxAmount: number;
  totalEstimatedCost: number;
} {
  const labourCost = Math.max(0, params.labourHours) * Math.max(0, params.hourlyRate);
  const sparePartsCost = params.spareParts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const subtotal = labourCost + sparePartsCost + Math.max(0, params.inspectionFee) + Math.max(0, params.serviceCharge) + Math.max(0, params.additionalExpenses);
  const taxAmount = Math.round((subtotal * Math.max(0, params.taxRate)) / 100);
  const totalEstimatedCost = subtotal + taxAmount;

  return {
    labourCost,
    sparePartsCost,
    subtotal,
    taxAmount,
    totalEstimatedCost
  };
}

/**
 * Calculate actual maintenance cost
 */
export function calculateActualCost(params: {
  labourHours: number;
  hourlyRate: number;
  spareParts: SparePartItem[];
  inspectionFee: number;
  serviceCharge: number;
  additionalExpenses: number;
  taxRate: number;
}): {
  labourCost: number;
  sparePartsCost: number;
  subtotal: number;
  taxAmount: number;
  totalActualCost: number;
} {
  const labourCost = Math.max(0, params.labourHours) * Math.max(0, params.hourlyRate);
  const sparePartsCost = params.spareParts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const subtotal = labourCost + sparePartsCost + Math.max(0, params.inspectionFee) + Math.max(0, params.serviceCharge) + Math.max(0, params.additionalExpenses);
  const taxAmount = Math.round((subtotal * Math.max(0, params.taxRate)) / 100);
  const totalActualCost = subtotal + taxAmount;

  return {
    labourCost,
    sparePartsCost,
    subtotal,
    taxAmount,
    totalActualCost
  };
}

/**
 * Compare estimated vs actual costs
 * Cost Difference = Actual Cost - Estimated Cost
 * Cost Variance (%) = (Cost Difference / Estimated Cost) * 100
 */
export function compareCosts(
  estimatedCost: number,
  actualCost: number,
  varianceThresholdPercent: number = 10
): CostComparison {
  const diff = actualCost - estimatedCost;
  const variancePct = estimatedCost > 0 ? (diff / estimatedCost) * 100 : 0;

  let budgetStatus: BudgetStatus = 'Within Budget';
  if (diff > 0 && Math.abs(variancePct) > 1) {
    budgetStatus = 'Over Budget';
  } else if (diff < 0 && Math.abs(variancePct) > 1) {
    budgetStatus = 'Under Budget';
  }

  const isOverThreshold = diff > 0 && variancePct >= varianceThresholdPercent;

  return {
    estimatedCost,
    actualCost,
    costDifference: diff,
    costVariancePercentage: Math.round(variancePct * 10) / 10,
    budgetStatus,
    isOverThreshold
  };
}

/**
 * Generate smart initial cost estimate based on equipment type, reason, and priority
 */
export function generateInitialEstimate(
  equipmentType: string,
  priority: string,
  config: BillingConfig = defaultBillingConfig
): MaintenanceCostEstimate {
  let category: MaintenanceCategory = 'Preventive';
  let hours = 2.5;
  let parts: SparePartItem[] = [];

  const lowerType = equipmentType.toLowerCase();

  if (priority === 'Emergency') {
    category = 'Emergency';
    hours = 5;
  } else if (priority === 'High') {
    category = 'Corrective';
    hours = 4;
  } else if (priority === 'Medium') {
    category = 'Predictive';
    hours = 3;
  } else {
    category = 'Preventive';
    hours = 2;
  }

  if (lowerType.includes('compressor')) {
    parts = [
      { partName: 'Rotary Shaft Seal Kit', quantity: 1, unitPrice: 1800, totalPrice: 1800 },
      { partName: 'Synthetic Screw Compressor Lubricant (5L)', quantity: 1, unitPrice: 1400, totalPrice: 1400 }
    ];
  } else if (lowerType.includes('pump')) {
    parts = [
      { partName: 'Mechanical Ceramic Seal Ring', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
      { partName: 'EPDM O-Ring Gasket Flange Set', quantity: 2, unitPrice: 350, totalPrice: 700 }
    ];
  } else if (lowerType.includes('motor')) {
    parts = [
      { partName: 'SKF Insulated Bearing 6309', quantity: 1, unitPrice: 1600, totalPrice: 1600 },
      { partName: 'Synthetic Polyurea Grease Cartridge', quantity: 1, unitPrice: 400, totalPrice: 400 }
    ];
  } else if (lowerType.includes('generator')) {
    parts = [
      { partName: 'Heavy Fuel Filter Element Set', quantity: 2, unitPrice: 2200, totalPrice: 4400 },
      { partName: 'Alternator Exciter Carbon Brushes', quantity: 1, unitPrice: 1200, totalPrice: 1200 }
    ];
  } else {
    parts = [
      { partName: 'Heavy Duty Drive Roller Bearing', quantity: 2, unitPrice: 1300, totalPrice: 2600 },
      { partName: 'High-Grip Tensioner Bushing', quantity: 1, unitPrice: 600, totalPrice: 600 }
    ];
  }

  const calc = calculateEstimatedCost({
    labourHours: hours,
    hourlyRate: config.defaultHourlyRate,
    spareParts: parts,
    inspectionFee: config.defaultInspectionFee,
    serviceCharge: config.defaultServiceCharge,
    additionalExpenses: priority === 'Emergency' ? 400 : 0,
    taxRate: config.defaultTaxRate
  });

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return {
    maintenanceCategory: category,
    estimatedLabourHours: hours,
    hourlyLabourRate: config.defaultHourlyRate,
    estimatedLabourCost: calc.labourCost,
    spareParts: parts,
    sparePartsCost: calc.sparePartsCost,
    inspectionFee: config.defaultInspectionFee,
    serviceCharge: config.defaultServiceCharge,
    additionalExpenses: priority === 'Emergency' ? 400 : 0,
    subtotal: calc.subtotal,
    taxRate: config.defaultTaxRate,
    taxAmount: calc.taxAmount,
    totalEstimatedCost: calc.totalEstimatedCost,
    createdAt: now,
    updatedAt: now,
    estimatedBy: 'Smart AI Cost Estimation Engine'
  };
}
