# Contributions & Authorship

We (**Dev Prashant**, GitHub: [@devprashant19](https://github.com/devprashant19), Email: dev.prashant1901@gmail.com, and **Puneet Yadav**, GitHub: [@puneetnith28](https://github.com/puneetnith28), Email: puneetnith28@gmail.com) created and built **AeroVigil** using **AgentFoundry (AF)** ([https://agentfoundry.me](https://agentfoundry.me)) as our official agentic IDE during the 90-day *Code for a Billion: Bharat Agentic-AI Hackathon 2026*. We chose the problem, designed the multi-agent architecture and invariant safety rules, directed the engineering work, engineered the hardware, integrated xSpan CareHub APIs, and deployed and verified all systems on AWS. This document details authorship, team roles, and verification standards.

## Team & Author Information

- **Dev Prashant** ([@devprashant19](https://github.com/devprashant19) · dev.prashant1901@gmail.com): Lead Architect, Full-Stack System Design, AWS CloudFront/CDK Infrastructure, UI/UX & AR Lens Engine.
- **Puneet Yadav** ([@puneetnith28](https://github.com/puneetnith28) · puneetnith28@gmail.com): Systems Engineering, SPS30/ESP32-S3 Hardware Firmware, Data Harvest Pipelines, xSpan CareHub Integration & Invariant Testing.
- **Repository:** [https://github.com/devprashant19/aerovigil](https://github.com/devprashant19/aerovigil)
- **Official IDE:** AgentFoundry (AF) with 1M allocated smart-code tokens

## AgentFoundry (AF) IDE Orchestration & Swarm Pipeline

We orchestrated our development using AgentFoundry's smart-code agentic pipelines (`.agentfoundry/config.json`) with an autonomous multi-agent swarm architecture implemented in code (`packages/core/src/afSwarm.ts`, `scripts/run-af-pipeline.ts` via `npm run af:run`):
1. **SensorIngestionAgent (`claude-3-5-sonnet`):** Automated type-safe boundary contracts (Zod) validating live CPCB, DPCC, IITM, and OpenAQ streams against strict provenance rules (rule I2).
2. **DispersionForecastAgent (`llama-3-3-70b`):** Computational wind vector integration (MET Norway) and NASA FIRMS VIIRS satellite thermal anomaly attribution.
3. **CareHubCoordinationAgent (`claude-3-5-haiku`):** Built the integration with xSpan CareHub Digital Twin & Care-Coordination APIs (`packages/core/src/carehub.ts`), bridging severe air spikes directly into frontline ASHA/PHC clinical workflows (`POST /v1/carehub/sync`).
4. **GuardrailValidatorAgent (`amazon.nova-micro`):** Enforces 16 mathematical invariants and prompt guardrails across the test suite and `make prove` gates.

### Development History & Commit Chronology
Engineering was conducted locally inside the AgentFoundry (AF) IDE throughout October and November 2026. The 4 swarm agents executed autonomous synthesis and verification loops. When preparing the canonical submission artifact, the verified monorepo was published to GitHub (`devprashant19/AeroVigil`) on 14 November 2026 as an authoritative open-source Digital Public Good.

## What We Built

- **Decided what to build and what not to claim.** We chose the problem (a Delhi-NCR family or school that has air-quality numbers but not an actionable decision), designed the user screens, established the sixteen core safety rules the app must never break (`docs/safety.md`), and set conservative boundaries: a GRAP stage is our estimate, a reading older than six hours gives no advice, and low-cost sensors are never misrepresented as "scientific-grade".
- **Reviewed and ran every change.** We reviewed every diff, executed builds locally, tested responsive viewports, and rejected improper assumptions. We preserved visual minimalism, unified shared design primitives across screens, and enforced real-world data purity: zero mocked data in production builds, and recorded weeks derived exclusively from public station archives. Every change verified through `make prove` (lint, TypeScript strict mode, 1,301 tests, `cdk synth`, and production bundle checks).
- **Architected and operated AWS infrastructure.** The entire stack (`AeroVigilStack`) lives in our AWS account. We configured provider keys (OpenAQ, NASA FIRMS) in Secrets Manager, monitored live API latencies (median 1.5s cold/warm Lambda, 0.15s CloudFront cache hit), and established alarms for quiet failures.
- **Integrated xSpan CareHub APIs.** Connected hyperlocal particulate intelligence to patient digital twins, translating cumulative exposure into ICMR clinical risk levels and automated vernacular alerts for ASHA workers.
- **Engineered the hardware prototype.** Sourced components, wired a Sensirion SPS30 to an ESP32-S3 over UART, and wrote the firmware (`firmware/aerovigil-unit/aerovigil-unit.ino`) broadcasting Bluetooth LE telemetry every 2 seconds. Diagnosed and resolved sensor communication lockups on connection.
- **Built the air purifier test apparatus.** Fabricated a multi-stage prototype (box, centrifugal blower, pleated HEPA filter, foam pre-filter) and calibrated outlet airflow (~191 cfm) using a digital vane anemometer.
- **Enforced claims governance.** Maintained `docs/claims.md` ensuring every technical claim has rigorous empirical or architectural proof.

## What the app does at run time

Amazon Bedrock (Nova Micro, behind a guardrail) rewords answers that fixed rules already decided, or answers a question no rule covers from the facts it is given. Every number in its wording is checked against the facts, and it has no tools and cannot act. Amazon Polly reads answers aloud. See `docs/AGENT-BOUNDARIES.md`.

## Faults We Caught

- An early draft called a particle sensor "reference-grade" and quoted costs with no source. Neither is claimed (`docs/claims.md`).
- The first firmware assumed an I2C wiring on an ESP32 DevKit. Our board is an ESP32-S3 wired over UART, so it was rewritten for the real wiring, compiled and run.
- The unit's page first repeated the same figures in five cards; we created one unified screen: a chart and the room's numbers side by side, then the day and actionable insights.
- The unit's chart first drew as a black line, and its first card overflowed on My Air: both were diagnosed and fixed.
- The sensor stopped answering as soon as Bluetooth connected. We diagnosed the serial log and modified the firmware to safely restart the transmission loop.
- On 11 October a screenshot showed AQI 500 beside "GRAP Stage II". The estimate used the last 24 hours the monitor had, not the last 24 hours, and stretched one hour's PM10 over the day. It is fixed and checked against the monitors' own PM10 on 24 station-days: 22 landed in the same stage as the monitor's own index and 2 had no estimate (too few recent hours). `docs/learning-log.md` lists these and the rest.
