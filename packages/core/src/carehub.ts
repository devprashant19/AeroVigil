import type { Band } from '@aerovigil/contracts';

/**
 * xSpan CareHub Digital Twin & Care-Coordination Integration for Bharat.
 * Bridges hyperlocal air quality intelligence into patient digital twins and frontline care workflows (ASHA / PHC).
 * Aligned with ICMR National Clinical Guidelines for Air Pollution and Ayushman Bharat Digital Mission (ABDM).
 */

export type ClinicalVulnerability = 'pediatric_asthma' | 'copd' | 'elderly' | 'pregnancy' | 'hypertension';

export interface CareHubPatientContext {
  patientId: string;
  abdmHealthId?: string;
  pinCode: string;
  vulnerabilities: readonly ClinicalVulnerability[];
}

export interface CareHubDigitalTwinPayload {
  patientId: string;
  pinCode: string;
  timestamp: string;
  environmentalRisk: {
    aqi: number;
    band: Band;
    pm25: number;
    pm10: number;
    cumulativeExposureMg: number;
    cigaretteEquivalence: number;
  };
  clinicalAssessment: {
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    respiratoryExacerbationProbability: number;
    recommendedActions: readonly string[];
  };
}

export interface CareCoordinationAlert {
  alertId: string;
  phcCenterId: string;
  ashaWorkerId: string;
  pinCode: string;
  priority: 'routine' | 'urgent' | 'emergency';
  alertType: 'stubble_smog_surge' | 'grap_stage_iv' | 'extreme_particulate_spike';
  affectedCohortSize: number;
  clinicalProtocol: string;
  vernacularSmsText: string;
  timestamp: string;
}

/**
 * Evaluates clinical risk level based on PM2.5, cumulative exposure, and patient vulnerabilities.
 */
export function evaluateCareHubRisk(
  pm25: number,
  cumulativeExposureMg: number,
  vulnerabilities: readonly ClinicalVulnerability[]
): {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  respiratoryExacerbationProbability: number;
  recommendedActions: readonly string[];
} {
  const hasHighRiskFactor = vulnerabilities.some(v => v === 'copd' || v === 'pediatric_asthma');
  const isVulnerable = vulnerabilities.length > 0;

  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  let probability = 0.05;
  const actions: string[] = [];

  if (pm25 >= 250 || cumulativeExposureMg >= 1.5) {
    riskLevel = 'critical';
    probability = hasHighRiskFactor ? 0.85 : 0.65;
    actions.push('Stay indoors with air filtration active');
    actions.push('Keep emergency bronchodilator / inhaler accessible');
    actions.push('ASHA / PHC proactive welfare verification recommended');
  } else if (pm25 >= 120 || cumulativeExposureMg >= 0.8) {
    riskLevel = hasHighRiskFactor ? 'critical' : 'high';
    probability = hasHighRiskFactor ? 0.70 : 0.45;
    actions.push('Avoid all outdoor exertion and morning walks');
    actions.push('Wear N95/FFP2 respirator if transit is mandatory');
    actions.push('Seal room perimeters and avoid biomass or incense combustion');
  } else if (pm25 >= 60 || cumulativeExposureMg >= 0.4) {
    riskLevel = isVulnerable ? 'moderate' : 'low';
    probability = isVulnerable ? 0.30 : 0.15;
    actions.push('Sensitive groups should restrict prolonged outdoor exposure');
    actions.push('Schedule outdoor activities during cleaner midday hours');
  } else {
    riskLevel = 'low';
    probability = 0.05;
    actions.push('Air quality is within acceptable limits for regular activities');
  }

  return {
    riskLevel,
    respiratoryExacerbationProbability: Number(probability.toFixed(2)),
    recommendedActions: actions,
  };
}

/**
 * Builds a structured FHIR/ABDM-compatible payload for xSpan CareHub Digital Twin sync.
 */
export function buildCareHubDigitalTwinPayload(
  patient: CareHubPatientContext,
  env: {
    aqi: number;
    band: Band;
    pm25: number;
    pm10: number;
    cumulativeExposureMg: number;
    cigaretteEquivalence: number;
  },
  timestamp = new Date().toISOString()
): CareHubDigitalTwinPayload {
  const clinicalAssessment = evaluateCareHubRisk(
    env.pm25,
    env.cumulativeExposureMg,
    patient.vulnerabilities
  );

  return {
    patientId: patient.patientId,
    pinCode: patient.pinCode,
    timestamp,
    environmentalRisk: {
      aqi: env.aqi,
      band: env.band,
      pm25: env.pm25,
      pm10: env.pm10,
      cumulativeExposureMg: env.cumulativeExposureMg,
      cigaretteEquivalence: env.cigaretteEquivalence,
    },
    clinicalAssessment,
  };
}

/**
 * Generates an automated frontline care coordination dispatch for ASHA / ANM health workers.
 */
export function dispatchCareCoordinationAlert(
  params: {
    phcCenterId: string;
    ashaWorkerId: string;
    pinCode: string;
    pm25: number;
    grapStage?: string;
    affectedCount: number;
  },
  timestamp = new Date().toISOString()
): CareCoordinationAlert {
  const isEmergency = params.pm25 >= 250;
  const priority = isEmergency ? 'emergency' : params.pm25 >= 120 ? 'urgent' : 'routine';
  const alertType = isEmergency
    ? 'extreme_particulate_spike'
    : params.grapStage?.includes('IV')
      ? 'grap_stage_iv'
      : 'stubble_smog_surge';

  const vernacularSmsText = `सतर्कता: आपके क्षेत्र (${params.pinCode}) में वायु गुणवत्ता अत्यंत गंभीर है (PM2.5: ${Math.round(params.pm25)} µg/m³)। सांस व दमा के ${params.affectedCount} मरीजों को घर के अंदर रहने व इनहेलर पास रखने की सलाह दें।`;

  const clinicalProtocol =
    'Protocol ICMR-AQ-2026: Active outreach to registered COPD & asthma patients; verify oxygen concentrator readiness at Sub-Centre; distribute N95 respirators to high-risk elderly.';

  return {
    alertId: `CH-ALERT-${Date.now()}-${params.pinCode}`,
    phcCenterId: params.phcCenterId,
    ashaWorkerId: params.ashaWorkerId,
    pinCode: params.pinCode,
    priority,
    alertType,
    affectedCohortSize: params.affectedCount,
    clinicalProtocol,
    vernacularSmsText,
    timestamp,
  };
}
