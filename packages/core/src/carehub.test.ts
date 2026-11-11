import { describe, it, expect } from 'vitest';
import {
  evaluateCareHubRisk,
  buildCareHubDigitalTwinPayload,
  dispatchCareCoordinationAlert,
  type CareHubPatientContext,
} from './carehub';

describe('xSpan CareHub Integration', () => {
  describe('evaluateCareHubRisk', () => {
    it('categorizes hazardous air as critical risk for COPD and asthma patients', () => {
      const assessment = evaluateCareHubRisk(320, 1.8, ['copd']);
      expect(assessment.riskLevel).toBe('critical');
      expect(assessment.respiratoryExacerbationProbability).toBeGreaterThan(0.7);
      expect(assessment.recommendedActions).toContain('Stay indoors with air filtration active');
    });

    it('identifies moderate risk for sensitive groups during moderate particulate spikes', () => {
      const assessment = evaluateCareHubRisk(85, 0.5, ['elderly', 'hypertension']);
      expect(assessment.riskLevel).toBe('moderate');
      expect(assessment.respiratoryExacerbationProbability).toBe(0.3);
    });

    it('returns low risk when PM2.5 is low', () => {
      const assessment = evaluateCareHubRisk(25, 0.1, []);
      expect(assessment.riskLevel).toBe('low');
      expect(assessment.respiratoryExacerbationProbability).toBe(0.05);
    });
  });

  describe('buildCareHubDigitalTwinPayload', () => {
    it('constructs a valid Digital Twin sync record', () => {
      const patient: CareHubPatientContext = {
        patientId: 'PT-DELHI-110023',
        abdmHealthId: '91-4829-1029-44',
        pinCode: '110023',
        vulnerabilities: ['pediatric_asthma'],
      };

      const env = {
        aqi: 412,
        band: 'severe' as const,
        pm25: 280,
        pm10: 450,
        cumulativeExposureMg: 1.6,
        cigaretteEquivalence: 18.5,
      };

      const payload = buildCareHubDigitalTwinPayload(patient, env, '2026-11-14T10:00:00Z');
      expect(payload.patientId).toBe('PT-DELHI-110023');
      expect(payload.environmentalRisk.aqi).toBe(412);
      expect(payload.clinicalAssessment.riskLevel).toBe('critical');
      expect(payload.clinicalAssessment.recommendedActions).toContain(
        'Keep emergency bronchodilator / inhaler accessible'
      );
    });
  });

  describe('dispatchCareCoordinationAlert', () => {
    it('generates emergency coordination dispatch with Hindi vernacular text for ASHA workers', () => {
      const alert = dispatchCareCoordinationAlert({
        phcCenterId: 'PHC-DELHI-SOUTH-04',
        ashaWorkerId: 'ASHA-ANM-102',
        pinCode: '110016',
        pm25: 310,
        grapStage: 'GRAP Stage IV',
        affectedCount: 28,
      });

      expect(alert.priority).toBe('emergency');
      expect(alert.alertType).toBe('extreme_particulate_spike');
      expect(alert.affectedCohortSize).toBe(28);
      expect(alert.vernacularSmsText).toContain('110016');
      expect(alert.vernacularSmsText).toContain('दमा के 28 मरीजों');
      expect(alert.clinicalProtocol).toContain('ICMR-AQ-2026');
    });
  });
});
