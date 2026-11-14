import { describe, expect, it } from 'vitest';
import {
  CareHubCoordinationAgent,
  DispersionForecastAgent,
  GuardrailValidatorAgent,
  runAgentFoundrySwarm,
  SensorIngestionAgent,
} from './afSwarm';

describe('AgentFoundry Swarm Agents', () => {
  const asOf = new Date('2026-11-14T10:00:00.000Z').getTime();

  it('SensorIngestionAgent validates live telemetry and enforces freshness invariants', () => {
    const agent = new SensorIngestionAgent();
    // Valid telemetry
    const valid = agent.execute(
      {
        stationId: 'DL-DPCC-04',
        stationName: 'Anand Vihar, Delhi',
        pm25: 285.5,
        timestamp: '2026-11-14T09:30:00.000Z',
        lat: 28.65,
        lng: 77.31,
      },
      asOf,
    );
    expect(valid.valid).toBe(true);
    expect(valid.sanitized?.pm25).toBe(285.5);

    // Stale telemetry (older than 6 hours)
    const stale = agent.execute(
      {
        stationId: 'DL-DPCC-04',
        pm25: 285.5,
        timestamp: '2026-11-14T02:00:00.000Z',
        lat: 28.65,
        lng: 77.31,
      },
      asOf,
    );
    expect(stale.valid).toBe(false);
    expect(stale.invariantViolations).toContain(
      'Rule I3: Telemetry older than 6 hours cannot advise action',
    );
  });

  it('DispersionForecastAgent computes convective mixing reduction', () => {
    const agent = new DispersionForecastAgent();
    const result = agent.execute({
      currentPm25: 194.2,
      windSpeedKmph: 12.5,
      windDirectionDeg: 315,
      upwindFiresCount300km: 120,
    });
    expect(result.baselineInversionPm25).toBe(194.2);
    expect(result.projectedCleanHourPm25).toBeLessThan(result.baselineInversionPm25);
    expect(result.inhalationReductionPct).toBeGreaterThan(30);
    expect(result.smokeArrivalRisk).toBe('elevated');
  });

  it('CareHubCoordinationAgent outputs ABDM/FHIR digital twin and Hindi ASHA alert', () => {
    const agent = new CareHubCoordinationAgent();
    const result = agent.execute({
      patientId: 'PT-9942',
      pinCode: '110022',
      aqi: 434,
      pm25: 295,
      vulnerabilities: ['pediatric_asthma'],
    });
    expect(result.digitalTwin.patientId).toBe('PT-9942');
    expect(result.careCoordinationAlert.vernacularSmsText).toContain('सतर्कता:');
    expect(result.syncStatus).toBe('ABDM_FHIR_READY');
  });

  it('GuardrailValidatorAgent rejects hallucinations and preserves factual numbers', () => {
    const agent = new GuardrailValidatorAgent();
    // Valid text with correct PM2.5
    const pass = agent.validateTextAgainstFacts('The current PM2.5 is 250 with clean air at 2 pm', {
      pm25: 250,
      cleanHour: '2 pm',
    });
    expect(pass.safe).toBe(true);

    // Text missing the factual PM2.5 value
    const failMissing = agent.validateTextAgainstFacts('Air is bad, walk at 2 pm', {
      pm25: 250,
      cleanHour: '2 pm',
    });
    expect(failMissing.safe).toBe(false);

    // Text with dangerous medical advice
    const failDangerous = agent.validateTextAgainstFacts(
      'It is safe to run outdoors even though PM2.5 is 250',
      { pm25: 250, cleanHour: '2 pm' },
    );
    expect(failDangerous.safe).toBe(false);
  });

  it('runAgentFoundrySwarm orchestrates all 4 agents in pipeline', () => {
    const output = runAgentFoundrySwarm({
      asOfMs: new Date('2026-11-14T10:00:00.000Z').getTime(),
      telemetry: {
        stationId: 'DL-01',
        pm25: 180,
        timestamp: '2026-11-14T09:00:00.000Z',
        lat: 28.6,
        lng: 77.2,
      },
      dispersion: {
        currentPm25: 180,
        windSpeedKmph: 15,
        windDirectionDeg: 300,
        upwindFiresCount300km: 40,
      },
      clinical: {
        patientId: 'PT-01',
        pinCode: '110001',
        aqi: 320,
        pm25: 180,
      },
    });
    expect(output.status).toBe('success');
    expect(output.agents.ingestion.valid).toBe(true);
    expect(output.agents.dispersion.inhalationReductionPct).toBeGreaterThan(0);
    expect(output.agents.guardrail.safe).toBe(true);
  });
});
