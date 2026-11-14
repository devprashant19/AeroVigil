# AeroVigil — Authorship & Provenance Verification Record
**Code for a Billion — Bharat Agentic-AI Hackathon 2026 (Code for India)**  
*Track 04: Climate / Clean Air & Track 06: Health*

---

## 1. Authoritative Repository & Authorship Statement

This repository (**`devprashant19/AeroVigil`**) is the single authoritative source of the AeroVigil project, built and maintained by:

1. **Dev Prashant** (Lead Architect & Full-Stack Systems)
   - GitHub: [@devprashant19](https://github.com/devprashant19)
   - Email: `dev.prashant1901@gmail.com`
2. **Puneet Yadav** (Hardware Firmware, Data Pipelines & Clinical Invariant Testing)
   - GitHub: [@puneetnith28](https://github.com/puneetnith28)
   - Email: `puneetnith28@gmail.com`

Both authors confirm that:
- We chose the problem, designed the architecture and the sixteen safety invariants, directed and reviewed all agent-generated code, built and flashed the hardware, and deployed and verified the stack on our own AWS account.
- The project was developed inside the **AgentFoundry (AF)** IDE (`https://agentfoundry.me`) during the 90-day *Code for a Billion* hackathon window (15 August 2026 to 15 November 2026).
- All code is released under the **MIT License** as an open-source Digital Public Good for the people of Bharat.

---

## 2. Architectural Engineering & Monorepo Phased Development

AeroVigil was developed from first principles during the *Code for a Billion* hackathon window, organized into four coherent engineering tracks:
- **Track 1: Mathematical Invariant Engine & Contracts (`packages/contracts`, `packages/core`):** Enforces 16 non-negotiable safety rules (no forward-looking data leakage, deterministic exposure thresholds, zero LLM hallucination tolerances).
- **Track 2: Ambient Telemetry & Satellite Ingestion Layer (`packages/data`):** Bidirectional adapters for OpenAQ v3 (indexing 789 live Indian CAAQMS stations), MET Norway wind dispersion vectors, and NASA FIRMS VIIRS satellite thermal anomaly detections.
- **Track 3: Physical DIY Indoor Hardware Monitor (`firmware/aerovigil-unit`, `docs/UNIT.md`):** ESP32-S3 microcontroller coupled with Sensirion SPS30 laser particle sensor streaming real-time room purification telemetry over Web Bluetooth LE without native app installation.
- **Track 4: Edge-Accelerated Cloud Infrastructure (`apps/api`, `apps/web`, `infra`):** Serverless architecture in AWS Asia Pacific (Mumbai - `ap-south-1`) served via CloudFront CDN from the Delhi POP (`DEL51-P7`), featuring active xSpan CareHub Digital Twin synchronization (`POST /v1/carehub/sync`) and machine-readable impact verification (`GET /v1/impact`).

**Development & Publishing Timeline:**  
Engineering was conducted locally inside the **AgentFoundry (AF)** IDE throughout October and November 2026; the canonical repository **`devprashant19/AeroVigil`** was published to GitHub on 14 November 2026 as the authoritative open-source submission artifact.

---

## 3. Provenance Verification Matrix

| Verification Vector | Canonical AeroVigil Status | Verification Proof |
| :--- | :--- | :--- |
| **Authors** | Dev Prashant & Puneet Yadav | `git log`, `CONTRIBUTIONS.md`, GitHub Commits |
| **Official IDE** | AgentFoundry (AF) | `.agentfoundry/config.json`, multi-agent workflows |
| **Hackathon Window** | 15 August 2026 – 15 November 2026 | Commit chronology strictly within hackathon dates |
| **Live Production** | 100% Deployed & Active | `https://d3sqz5i7m8h3wk.cloudfront.net` (AWS ap-south-1) |
| **Automated Verification** | 1,301 passing tests | `make prove` (163 test suites, zero mocks in bundle) |
| **Falsifiable Outcome** | Same walk, 42.0% less PM2.5 | `scripts/backtest-outcomes.mjs`, `docs/BACKTEST_OUTCOMES.md` |
| **Clinical Partner Sync** | Payload builder live; no remote dispatch configured | `POST /v1/carehub/sync` returns `remoteDispatched: false` |
| **Physical Hardware** | ESP32-S3 + Sensirion SPS30 (₹4,000 BOM) | `firmware/aerovigil-unit/`, `docs/UNIT.md` |

---

## 4. Open Source License

Released under the **MIT License**. Copyright (c) 2026 Dev Prashant and Puneet Yadav. Licensed as an open-source Digital Public Good for deployment across Indian schools, Primary Health Centres (PHCs), and urban local bodies.
