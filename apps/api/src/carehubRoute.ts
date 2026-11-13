import {
  buildCareHubDigitalTwinPayload,
  dispatchCareCoordinationAlert,
  type CareHubPatientContext,
} from '@aerovigil/core';
import { failure, ok, type ApiRequest, type ApiResponse } from './respond';

export interface CareHubDeps {
  readonly endpointUrl?: string;
  readonly fetchImpl?: typeof fetch;
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

  let body: any;
  try {
    body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body ?? {};
  } catch {
    return failure(400, 'invalid_json', 'Malformed JSON payload in request body');
  }

  const patient: CareHubPatientContext = {
    patientId: body.patientId ?? 'ABDM-NDHM-91823',
    abdmHealthId: body.abdmHealthId ?? '91-8293-1029-4821',
    pinCode: body.pinCode ?? '110022',
    vulnerabilities: body.vulnerabilities ?? ['pediatric_asthma', 'copd'],
  };

  const env = {
    aqi: Number(body.aqi ?? 434),
    band: (body.band ?? 'Severe') as any,
    pm25: Number(body.pm25 ?? 295.4),
    pm10: Number(body.pm10 ?? 450),
    cumulativeExposureMg: Number(body.cumulativeExposureMg ?? 1.82),
    cigaretteEquivalence: Number(body.cigaretteEquivalence ?? 13.4),
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

