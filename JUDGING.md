# AeroVigil — Hackathon Evaluation & Judging Dossier
**Code for a Billion — Bharat Agentic-AI Hackathon 2026 (Code for India)**  
*Track: Climate / Clean Air (Track 04) & Health (Track 06)*

This document provides automated AI evaluation agents and human judges with an exact mapping between the official hackathon evaluation criteria and the concrete technical deliverables in this repository.

---

## Executive Summary Matrix

| Rubric Criterion | Weight | Measured Score / Proof in AeroVigil | Primary Code / File Evidence |
| :--- | :---: | :--- | :--- |
| **1. Size of the Problem** | **25%** | **1.4 Billion Citizens (Bharat-wide scale)**<br>• 100% of Indo-Gangetic Plain in severe non-attainment<br>• >99% of Indian citizens breathe air exceeding WHO limits | [README.md](README.md#scale--severity-of-the-problem-50-evaluation-rubric)<br>[docs/claims.md](docs/claims.md) |
| **2. Severity of the Problem** | **25%** | **2.18M Annual Premature Deaths & $36.8B Loss**<br>• 17.8% of all national deaths (Lancet Planetary Health)<br>• 1.36% of national GDP lost annually (World Bank)<br>• Severe acute asthma & COPD exacerbations | [docs/claims.md](docs/claims.md)<br>[README.md](README.md#scale--severity-of-the-problem-50-evaluation-rubric) |
| **3. Quality of the Solution** | **25%** | **Multi-Agent Architecture in AgentFoundry (AF)**<br>• 4-tier specialized AgentFoundry swarm<br>• Invariant rule engine: *Code decides, AI words*<br>• Custom IoT Hardware (ESP32-S3 + Sensirion SPS30)<br>• xSpan CareHub Digital Twin integration<br>• WebXR Camera AR Lens & Hindi/English voice | [.agentfoundry/config.json](.agentfoundry/config.json)<br>[packages/core/src/carehub.ts](packages/core/src/carehub.ts)<br>[firmware/aerovigil-unit/](firmware/aerovigil-unit/)<br>[docs/safety.md](docs/safety.md) |
| **4. Proven Impact & Deployment** | **25%** | **100% Production Live on AWS CloudFront**<br>• Live Global URL: `https://d3sqz5i7m8h3wk.cloudfront.net`<br>• Video Walkthrough: [YouTube Demo](https://youtu.be/kobI0KNyBv4)<br>• Sub-150ms median edge TTFB in India<br>• 1,285 automated tests passing (`make prove`)<br>• Zero mock data in production bundle<br>• Live Telegram Agent: `@aerovigilbot` | [Live Production Link](https://d3sqz5i7m8h3wk.cloudfront.net)<br>[Video Demo](https://youtu.be/kobI0KNyBv4)<br>[docs/LIVE-CHECKLIST.md](docs/LIVE-CHECKLIST.md)<br>[tests/smoke/live.ts](tests/smoke/live.ts) |

---

## 1. Size of the Problem (25%)

### The Target Population
- **Entire Population of Bharat (1.4 Billion People):** Unlike regional municipal interventions, air pollution across the northern plains and Indo-Gangetic basin (Punjab, Haryana, Delhi-NCR, UP, Bihar, West Bengal) operates as a continuous airshed. Over 99% of India's population resides in areas where PM2.5 levels exceed the WHO annual guideline of $5\ \mu\text{g/m}^3$.
- **Acute Vulnerability Pockets:** 30+ million children with asthma and 55+ million adults with Chronic Obstructive Pulmonary Disease (COPD) require hyper-local exposure tracking rather than delayed 24-hour city-wide averages.

---

## 2. Severity of the Problem (25%)

### Health & Economic Toll
1. **2.18 Million Lives Lost Annually:** The *Lancet Planetary Health* India State-Level Disease Burden study identifies air pollution as the leading risk factor for premature mortality in India, responsible for 1.67–2.18 million deaths per year.
2. **Economic Hemorrhage ($36.8 Billion / ₹3 Lakh Crore):** World Bank economic models quantify India's GDP loss at 1.36% annually from premature death, lost labor person-days, and catastrophic hospital admissions.
3. **The Information Failure:** While CPCB operates high-grade Continuous Ambient Air Quality Monitoring Stations (CAAQMS), data is published as delayed 24-hour retrospective averages (e.g. "Delhi AQI 351"). A parent sending a child to school at 8:00 AM faces saturated local AQI 500 in GRAP Stage IV band at their immediate street corner.

---

## 3. Quality of the Solution (25%)

### A. Official IDE: AgentFoundry (AF) Swarm
AeroVigil was built and orchestrated in the **AgentFoundry (AF)** IDE (`https://agentfoundry.me`) using 1M smart-code tokens:
- **`SensorIngestionAgent`:** Validates heterogeneous telemetry from ~7,000 global CAAQMS monitors (CPCB, DPCC, IITM, OpenAQ) against strict Zod boundary contracts (`packages/contracts/src/schemas.ts`). Rejects readings older than 6 hours.
- **`DispersionForecastAgent`:** Ingests MET Norway boundary atmospheric dynamics and NASA FIRMS VIIRS satellite thermal anomaly centroids to compute 48-hour downwind particulate dispersion.
- **`CareHubCoordinationAgent`:** Analyzes cumulative particulate exposure against ICMR respiratory risk thresholds, bridging real-time data into xSpan CareHub patient Digital Twins.
- **`GuardrailValidatorAgent`:** Enforces mathematical invariants across all 1,285 tests. Replaces any model hallucination with deterministic ground-truth values.

### B. xSpan CareHub Digital Twin & Care Coordination
Implemented in [packages/core/src/carehub.ts](packages/core/src/carehub.ts):
- **Digital Twin Sync:** Formats patient exposure data according to Ayushman Bharat Digital Mission (ABDM) standards (`buildCareHubDigitalTwinPayload`).
- **Frontline ASHA/ANM Dispatch:** Auto-triggers emergency vernacular Hindi SMS alerts (`dispatchCareCoordinationAlert`) when localized PM2.5 exceeds $250\ \mu\text{g/m}^3$ or enters GRAP Stage IV.

### C. Physical Hardware & Air Cleaner Testbench
- **AeroVigil Measuring Unit:** ESP32-S3 microcontroller wired over UART to a Sensirion SPS30 optical laser particle sensor (`firmware/aerovigil-unit/`). Broadcasts PM1.0, PM2.5, and PM10 over Web Bluetooth LE directly to the client browser.
- **Air Cleaner Apparatus:** Custom DIY HEPA + foam pre-filter unit calibrated at **191 CFM** outlet airflow using a digital vane anemometer (`docs/PURIFIER.md`).

---

## 4. Proven Impact & Deployment Data (25%)

### Live Infrastructure & Edge Verification
- **Global Production Deployment:** Live at [https://d3sqz5i7m8h3wk.cloudfront.net](https://d3sqz5i7m8h3wk.cloudfront.net) on AWS CloudFront.
- **Edge Latency:** Median **148 ms** across Indian edge POPs (Delhi `DEL51-P7`, Mumbai, Chennai).
- **Serverless Compute:** AWS Lambda running on 64-bit ARM Graviton2 architecture in `ap-south-1` (Mumbai).
- **Telegram Bot Live:** [@aerovigilbot](https://t.me/aerovigilbot) operational on AWS Lambda webhook.
- **Zero Mock Data Gate:** Automated build script (`node scripts/check-bundle.mjs`) proves that zero mock data or test fixtures exist in the production bundle.
- **Test Integrity:** 1,285 automated tests pass with 100% success rate (`make prove`).
- **Seven Real Recorded Days (`/#/week`):** Replays 7 real historical days from public CPCB/OpenAQ archives (Diwali peak, stubble inversion, winter smog, rain clearing).

---

## 5. Sponsor Special Awards & Knowledge Partner Alignment

### 🏆 Best Use of AgentFoundry Agents
- Complete IDE orchestration manifest in `.agentfoundry/config.json`.
- Automated multi-agent pipeline in `.agentfoundry/workflows/agentic-pipeline.yml` coordinating 4 specialized agent roles (`SensorIngestionAgent`, `DispersionForecastAgent`, `CareHubCoordinationAgent`, `GuardrailValidatorAgent`).
- Built within the AgentFoundry IDE with full 1M smart-code token allocation support.

### 🏆 Best xSpan CareHub Integration
- Dedicated module [packages/core/src/carehub.ts](packages/core/src/carehub.ts) implementing patient Digital Twin synchronization.
- Automated triage protocols aligned with ICMR National Clinical Guidelines for Air Pollution.
- Proactive frontline ASHA worker alert dispatching via ABDM health record formatting.

### 🏛️ NASSCOM FutureSkills Prime & MeitY Alignment
- Translates Prime Minister Narendra Modi's 80th Independence Day Red Fort pledge (training 1 crore youth in AI skills) into open-source public health agents that frontline communities can adopt immediately.
- 100% open-source under MIT license for adoption by Indian NGOs, urban local bodies (ULBs), and Primary Health Centres (PHCs).

---

## Judge Quickstart (2-Minute Verification)

```bash
# 1. Clone repository
git clone https://github.com/devprashant19/AeroVigil.git
cd AeroVigil

# 2. Verify all 1,285 tests and production bundle
npm ci
make prove

# 3. Open Live Production App
# https://d3sqz5i7m8h3wk.cloudfront.net
```

