#!/usr/bin/env tsx
/**
 * AgentFoundry Swarm Pipeline Runner
 * Runs the 4-agent swarm pipeline, verifying end-to-end integration.
 * Run via: npx tsx scripts/run-af-pipeline.ts
 */

import { runAgentFoundrySwarm } from '@aerovigil/core';

function main(): void {
  process.stdout.write('Running AgentFoundry 4-Agent Autonomous Swarm Pipeline...\n');
  const sampleTelemetry = {
    stationId: 'DL-ANAND-VIHAR-01',
    stationName: 'Anand Vihar, Delhi - DPCC',
    pm25: 312.4,
    pm10: 480.0,
    timestamp: new Date().toISOString(),
    lat: 28.65,
    lng: 77.31,
  };

  const sampleDispersion = {
    currentPm25: 312.4,
    windSpeedKmph: 14.2,
    windDirectionDeg: 310,
    upwindFiresCount300km: 84,
  };

  const sampleClinical = {
    patientId: 'PT-DELHI-ASHA-008',
    pinCode: '110092',
    aqi: 434,
    pm25: 312.4,
    vulnerabilities: ['pediatric_asthma', 'copd'] as const,
  };

  const result = runAgentFoundrySwarm({
    telemetry: sampleTelemetry,
    dispersion: sampleDispersion,
    clinical: sampleClinical,
  });

  process.stdout.write(`Status: ${result.status}\n`);
  process.stdout.write(`Final Advisory: ${result.finalVerdict}\n`);
  process.stdout.write(`CareHub Alert: ${result.agents.carehub.careCoordinationAlert.vernacularSmsText}\n`);
  process.stdout.write('AgentFoundry Swarm execution complete.\n');
}

try {
  main();
} catch (err: unknown) {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

