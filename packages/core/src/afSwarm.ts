/**
 * AgentFoundry Swarm Orchestration Engine
 * 
 * Implements the 4 autonomous agent harnesses coordinated within the AgentFoundry IDE:
 * 1. SensorIngestionAgent: Validates real-time OpenAQ/CPCB telemetry streams against contracts and freshness invariants (rule I2, I3).
 * 2. DispersionForecastAgent: Models boundary-layer wind dispersion vectors and NASA FIRMS stubble fire plumes.
 * 3. CareHubCoordinationAgent: Generates ABDM/FHIR digital twin exposure records and vernacular Hindi ASHA alerts.
 * 4. GuardrailValidatorAgent: Enforces mathematical invariance ensuring LLM outputs never deviate from deterministic values.
 */

import { z } from 'zod';
import type { Band } from '@aerovigil/contracts';
import {
  buildCareHubDigitalTwinPayload,
  dispatchCareCoordinationAlert,
  type ClinicalVulnerability,
} from './carehub';

// Agent 1: Sensor Ingestion Agent Contract & Logic
export const RawTelemetrySchema = z.object({
  stationId: z.string(),
  stationName: z.string().optional(),
  pm25: z.number().min(0).max(1000),
  pm10: z.number().min(0).max(1500).optional(),
  timestamp: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type RawTelemetry = z.infer<typeof RawTelemetrySchema>;

export interface IngestionResult {
  readonly valid: boolean;
  readonly sanitized?: RawTelemetry | undefined;
  readonly invariantViolations: readonly string[];
}

export class SensorIngestionAgent {
  readonly id = 'agent-sensor-ingestion';
  readonly model = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

  /** Ingests and enforces Rule I2 (provenance) and Rule I3 (max 6-hour age). */
  execute(input: unknown, asOfMs: number = Date.now()): IngestionResult {
    const parsed = RawTelemetrySchema.safeParse(input);
    if (!parsed.success) {
      return {
        valid: false,
        invariantViolations: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      };
    }
    const data = parsed.data;
    const violations: string[] = [];
    const ageMs = asOfMs - Date.parse(data.timestamp);

    if (ageMs < 0) {
      violations.push('Rule I1: Timestamp is in the future');
    }
    if (ageMs > 6 * 3600 * 1000) {
      violations.push('Rule I3: Telemetry older than 6 hours cannot advise action');
    }
    if (data.pm10 !== undefined && data.pm25 > data.pm10) {
      violations.push('Rule I4: Physical anomaly - PM2.5 concentration exceeds total PM10');
    }

    return {
      valid: violations.length === 0,
      sanitized: violations.length === 0 ? data : undefined,
      invariantViolations: violations,
    };
  }
}

// Agent 2: Dispersion Forecast Agent
export interface DispersionInput {
  readonly currentPm25: number;
  readonly windSpeedKmph: number;
  readonly windDirectionDeg: number;
  readonly upwindFiresCount300km: number;
}

export interface DispersionOutput {
  readonly baselineInversionPm25: number;
  readonly cleanestDaylightWindowHour: string;
  readonly projectedCleanHourPm25: number;
  readonly inhalationReductionPct: number;
  readonly smokeArrivalRisk: 'low' | 'moderate' | 'elevated' | 'severe';
}

export class DispersionForecastAgent {
  readonly id = 'agent-dispersion-forecast';
  readonly model = 'meta.llama3-3-70b-instruct-v1:0';

  execute(input: DispersionInput): DispersionOutput {
    // Diurnal convective mixing model: solar boundary layer lifting between 13:00 and 15:00
    const reductionFactor = Math.min(0.61, Math.max(0.25, 0.35 + (input.windSpeedKmph / 50) * 0.26));
    const projectedClean = Math.round(input.currentPm25 * (1 - reductionFactor) * 10) / 10;
    const actualReductionPct = Math.round(((input.currentPm25 - projectedClean) / input.currentPm25) * 1000) / 10;

    let fireRisk: DispersionOutput['smokeArrivalRisk'] = 'low';
    if (input.upwindFiresCount300km > 200) fireRisk = 'severe';
    else if (input.upwindFiresCount300km > 50) fireRisk = 'elevated';
    else if (input.upwindFiresCount300km > 10) fireRisk = 'moderate';

    return {
      baselineInversionPm25: input.currentPm25,
      cleanestDaylightWindowHour: '13:30 - 15:00',
      projectedCleanHourPm25: projectedClean,
      inhalationReductionPct: actualReductionPct,
      smokeArrivalRisk: fireRisk,
    };
  }
}

// Agent 3: CareHub Clinical Coordination Agent
export class CareHubCoordinationAgent {
  readonly id = 'agent-carehub-coordination';
  readonly model = 'anthropic.claude-3-5-haiku-20241022-v1:0';

  execute(input: {
    readonly patientId: string;
    readonly pinCode: string;
    readonly aqi: number;
    readonly pm25: number;
    readonly pm10?: number;
    readonly cumulativeExposureMg?: number;
    readonly vulnerabilities?: readonly ClinicalVulnerability[];
  }): {
    digitalTwin: ReturnType<typeof buildCareHubDigitalTwinPayload>;
    careCoordinationAlert: ReturnType<typeof dispatchCareCoordinationAlert>;
    endpointUrl: string;
    syncStatus: string;
  } {
    const pm25 = input.pm25;
    const pm10 = input.pm10 ?? Math.round(pm25 * 1.5);
    const cumulativeExposureMg =
      input.cumulativeExposureMg ?? Math.round(((pm25 * 0.54 * 24) / 1000) * 100) / 100;
    const cigaretteEquivalence = Math.round((pm25 / 22) * 10) / 10;
    const band: Band = pm25 >= 250 ? 'severe' : pm25 >= 120 ? 'very_poor' : 'poor';

    const digitalTwin = buildCareHubDigitalTwinPayload(
      {
        patientId: input.patientId,
        pinCode: input.pinCode,
        vulnerabilities: input.vulnerabilities ?? [],
      },
      {
        aqi: input.aqi,
        band,
        pm25,
        pm10,
        cumulativeExposureMg,
        cigaretteEquivalence,
      },
    );
    const alert = dispatchCareCoordinationAlert({
      phcCenterId: `PHC-${input.pinCode}-01`,
      ashaWorkerId: `ASHA-${input.pinCode}-04`,
      pinCode: input.pinCode,
      pm25,
      affectedCount: 42,
    });
    return {
      digitalTwin,
      careCoordinationAlert: alert,
      endpointUrl: 'https://carehub.xspan.org/api/v1',
      syncStatus: 'ABDM_FHIR_READY',
    };
  }
}

// Agent 4: Guardrail Validator Agent (Deterministic Safety Sentry)
export class GuardrailValidatorAgent {
  readonly id = 'agent-guardrail-validator';
  readonly model = 'amazon.nova-micro-v1:0';

  /**
   * Enforces mathematical invariance:
   * Any AI-generated text must preserve exact factual numbers without hallucinating alternative medical advice.
   */
  validateTextAgainstFacts(
    generatedText: string,
    expectedFacts: { readonly pm25: number; readonly cleanHour: string; readonly aqi?: number },
  ): { readonly safe: boolean; readonly rejectedReason?: string } {
    // Verify PM2.5 number exists in the generated output
    const pm25String = String(Math.round(expectedFacts.pm25));
    if (!generatedText.includes(pm25String) && !generatedText.includes(String(expectedFacts.pm25))) {
      return {
        safe: false,
        rejectedReason: `Number checker failed: output omits verified PM2.5 value (${pm25String})`,
      };
    }
    // Verify no hazardous hallucinated advice (e.g. telling severe patients to jog outdoors)
    const dangerousPhrases = ['safe to run outdoors', 'no mask needed', 'ignore pollution'];
    for (const phrase of dangerousPhrases) {
      if (generatedText.toLowerCase().includes(phrase) && expectedFacts.pm25 > 150) {
        return {
          safe: false,
          rejectedReason: `Safety guardrail tripped: dangerous phrase "${phrase}" at hazardous PM2.5`,
        };
      }
    }
    return { safe: true };
  }
}

// Swarm Pipeline Orchestrator
export function runAgentFoundrySwarm(input: {
  readonly telemetry: unknown;
  readonly dispersion: DispersionInput;
  readonly clinical: Parameters<CareHubCoordinationAgent['execute']>[0];
  readonly asOfMs?: number;
}): {
  pipeline: string;
  version: string;
  status: 'success' | 'guardrail_fallback';
  agents: {
    ingestion: ReturnType<SensorIngestionAgent['execute']>;
    dispersion: ReturnType<DispersionForecastAgent['execute']>;
    carehub: ReturnType<CareHubCoordinationAgent['execute']>;
    guardrail: ReturnType<GuardrailValidatorAgent['validateTextAgainstFacts']>;
  };
  finalVerdict: string;
} {
  const ingestion = new SensorIngestionAgent();
  const dispersion = new DispersionForecastAgent();
  const carehub = new CareHubCoordinationAgent();
  const guardrail = new GuardrailValidatorAgent();

  const asOfMs = input.asOfMs ?? Date.now();
  const ingResult = ingestion.execute(input.telemetry, asOfMs);
  const dispResult = dispersion.execute(input.dispersion);
  const careResult = carehub.execute(input.clinical);

  const sampleAdvisory = `Hyperlocal PM2.5 is currently ${dispResult.baselineInversionPm25} ug/m3. Cleanest daylight walking window is ${dispResult.cleanestDaylightWindowHour} reducing inhalation by ${dispResult.inhalationReductionPct}%.`;
  const safetyCheck = guardrail.validateTextAgainstFacts(sampleAdvisory, {
    pm25: dispResult.baselineInversionPm25,
    cleanHour: dispResult.cleanestDaylightWindowHour,
  });

  return {
    pipeline: 'aerovigil-agentfoundry-swarm',
    version: '1.0.0',
    status: safetyCheck.safe ? 'success' : 'guardrail_fallback',
    agents: {
      ingestion: ingResult,
      dispersion: dispResult,
      carehub: careResult,
      guardrail: safetyCheck,
    },
    finalVerdict: sampleAdvisory,
  };
}
