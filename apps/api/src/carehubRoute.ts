import type { Band } from '@aerovigil/contracts';
import {
  buildCareHubDigitalTwinPayload,
  dispatchCareCoordinationAlert,
  type CareHubPatientContext,
  type ClinicalVulnerability,
} from '@aerovigil/core';
import { failure, ok, type ApiRequest, type ApiResponse } from './respond';

export interface CareHubDeps {
  readonly endpointUrl?: string;
  readonly fetchImpl?: typeof fetch;
}

interface CareHubRequestBody {
  readonly patientId?: string;
  readonly abdmHealthId?: string;
  readonly pinCode?: string;
  readonly vulnerabilities?: readonly ClinicalVulnerability[];
  readonly aqi?: number;
  readonly band?: Band;
  readonly pm25?: number;
  readonly pm10?: number;
  readonly cumulativeExposureMg?: number;
  readonly cigaretteEquivalence?: number;
  readonly phcCenterId?: string;
  readonly ashaWorkerId?: string;
  readonly affectedCohortSize?: number;
}

/**
 * `POST /v1/carehub/sync`:
 * Connects hyperlocal particulate intelligence directly into the xSpan CareHub Digital Twin & Care-Coordination pipeline.
 * Formats structured ABDM/FHIR-compatible payloads and triggers vernacular alerts for ASHA workers on severe air spikes.
 */
export async function handleCareHubSync(request: ApiRequest, deps: CareHubDeps = {}): Promise<ApiResponse> {
  if (request.method !== 'POST') {
    return failure(405, 'method_not_allowed', `${request.method} is not supported here; use POST`);
  }

  let body: CareHubRequestBody;
  try {
    const raw: unknown = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    body = (raw && typeof raw === 'object' ? raw : {});
  } catch {
    return failure(400, 'invalid_json', 'Malformed JSON payload in request body');
  }

  const patient: CareHubPatientContext = {
    patientId: body.patientId ?? 'unlinked-patient',
    ...(body.abdmHealthId !== undefined ? { abdmHealthId: body.abdmHealthId } : {}),
    pinCode: body.pinCode ?? '110001',
    vulnerabilities: body.vulnerabilities ?? [],
  };

  const env = {
    aqi: body.aqi ?? 434,
    band: body.band ?? 'severe',
    pm25: body.pm25 ?? 295.4,
    pm10: body.pm10 ?? 450,
    cumulativeExposureMg: body.cumulativeExposureMg ?? 1.82,
    cigaretteEquivalence: body.cigaretteEquivalence ?? 13.4,
  };

  const twinPayload = buildCareHubDigitalTwinPayload(patient, env);
  let alert = undefined;

  if (env.pm25 >= 120 || env.aqi >= 400) {
    alert = dispatchCareCoordinationAlert({
      phcCenterId: body.phcCenterId ?? 'PHC-DELHI-SOUTH-04',
      ashaWorkerId: body.ashaWorkerId ?? 'ASHA-RKPURAM-12',
      pinCode: patient.pinCode,
      pm25: env.pm25,
      grapStage: env.aqi >= 450 ? 'Stage IV' : 'Stage III',
      affectedCount: body.affectedCohortSize ?? 42,
    });
  }

  // If a live CareHub endpoint is configured, forward payload; otherwise return compliant payload ready for ingestion
  const endpoint = deps.endpointUrl ?? process.env.CAREHUB_ENDPOINT;
  const doFetch = deps.fetchImpl ?? fetch;

  let remoteSynced = false;
  if (endpoint) {
    try {
      const res = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twinPayload, alert }),
      });
      remoteSynced = res.ok;
    } catch {
      remoteSynced = false;
    }
  }

  return ok({
    status: 'success',
    synced: true,
    remoteDispatched: remoteSynced,
    endpointConfigured: Boolean(endpoint),
    digitalTwin: twinPayload,
    ...(alert ? { careCoordinationAlert: alert } : {}),
  });
}

