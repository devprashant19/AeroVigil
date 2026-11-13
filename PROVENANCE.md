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
- We chose the problem, designed the architecture and the 16 safety invariants, directed and reviewed all agent-generated code, built the physical hardware, deployed and verified the production stack.
- The project was developed inside the **AgentFoundry (AF)** IDE (`https://agentfoundry.me`) during the 90-day *Code for a Billion* hackathon window (15 August 2026 to 15 November 2026).
- All code is released under the **MIT License** as an open-source Digital Public Good for the people of Bharat.

---

## 2. Lineage & Repository Disambiguation

During early rapid prototyping and proof-of-concept experiments in September and October 2026:
- Preliminary spike repositories and initial test harnesses were created under working project titles (including temporary scratch forks).
- Certain early commits and commit messages from those scratch spikes were imported or mirrored during initial monorepo consolidation.
- Third-party fork mirrors or early scratch forks from preliminary exploratory spikes are unmaintained prototype forks from earlier spikes.
- **`devprashant19/AeroVigil` is the canonical, active, production monorepo.** It contains the complete 16-invariant safety engine, 1,292 passing automated tests, live AWS CloudFront deployment, real ESP32-S3 + Sensirion SPS30 hardware firmware, xSpan CareHub Digital Twin integration (`POST /v1/carehub/sync`), and the empirical 13-day Delhi CAAQMS backtest ledger (`docs/BACKTEST_OUTCOMES.md`).

---

## 3. Provenance Verification Matrix

| Verification Vector | Canonical AeroVigil Status | Verification Proof |
| :--- | :--- | :--- |
| **Authors** | Dev Prashant & Puneet Yadav | `git log`, `CONTRIBUTIONS.md`, GitHub Commits |
| **Official IDE** | AgentFoundry (AF) | `.agentfoundry/config.json`, multi-agent workflows |
| **Hackathon Window** | 15 August 2026 – 15 November 2026 | Commit chronology strictly within hackathon dates |
| **Live Production** | 100% Deployed & Active | `https://d3sqz5i7m8h3wk.cloudfront.net` (AWS ap-south-1) |
| **Automated Verification** | 1,292 passing tests | `make prove` (161 test suites, zero mocks in bundle) |
| **Falsifiable Outcome** | Same walk, 42.0% less PM2.5 | `scripts/backtest-outcomes.mjs`, `docs/BACKTEST_OUTCOMES.md` |
| **Clinical Partner Sync** | xSpan CareHub Digital Twin | `POST /v1/carehub/sync`, `packages/core/src/carehub.ts` |
| **Physical Hardware** | ESP32-S3 + Sensirion SPS30 (₹4,000 BOM) | `firmware/aerovigil-unit/`, `docs/UNIT.md` |

---

## 4. Open Source License

Released under the **MIT License**. Copyright (c) 2026 Dev Prashant and Puneet Yadav. Licensed as an open-source Digital Public Good for deployment across Indian schools, Primary Health Centres (PHCs), and urban local bodies.
