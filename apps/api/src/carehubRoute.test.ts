import { describe, expect, it } from 'vitest';
import { handleCareHubSync } from './carehubRoute';

describe('POST /v1/carehub/sync', () => {
  it('generates ABDM/FHIR compliant digital twin payload and ASHA alert on severe air', async () => {
    const res = await handleCareHubSync({
      method: 'POST',
      path: '/v1/carehub/sync',
      query: {},
      headers: {},
      body: JSON.stringify({
        patientId: 'P123',
        pinCode: '110023',
        aqi: 455,
        pm25: 310,
        vulnerabilities: ['pediatric_asthma'],
      }),
    });

    expect(res.statusCode).toBe(200);
    const body = res.body as any;
    expect(body.status).toBe('success');
    expect(body.digitalTwin.clinicalAssessment.riskLevel).toBe('critical');
    expect(body.careCoordinationAlert).toBeDefined();
    expect(body.careCoordinationAlert.priority).toBe('emergency');
    expect(body.careCoordinationAlert.vernacularSmsText).toContain('सतर्कता');
  });

  it('refuses non-POST methods with 405', async () => {
    const res = await handleCareHubSync({
      method: 'GET',
      path: '/v1/carehub/sync',
      query: {},
      headers: {},
    });
    expect(res.statusCode).toBe(405);
  });
});
