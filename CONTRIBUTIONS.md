# Contributions & Authorship

I (**Dev Prashant**, GitHub: [@devprashant19](https://github.com/devprashant19), Email: dev.prashant1901@gmail.com) created and built **AeroVigil** solo, with AI assistance (AgentFoundry (AF)) helping as a pair programmer. I chose the problem, designed the architecture and invariant rules, directed the engineering work, read and ran every change, engineered the hardware, and deployed and verified all systems on AWS. This document details authorship, roles, and verification standards.

## Author & Creator Information

- **Creator & Lead Maintainer:** Dev Prashant
- **GitHub:** [devprashant19](https://github.com/devprashant19)
- **Repository:** [https://github.com/devprashant19/aerovigil](https://github.com/devprashant19/aerovigil)
- **Contact:** dev.prashant1901@gmail.com

## AI assistance

I directed the AI assistant to write code and documentation under strict engineering oversight. Every change was mine to accept or send back. Many commits carry its co-author line. It had zero access to my AWS account: I ran every deploy and put provider keys into AWS Secrets Manager myself. I decided what the app may say, and no change was accepted until `make prove` passed cleanly. The app itself uses Amazon Bedrock (Nova Micro) and Amazon Polly at run time, governed by strict guardrails described in `docs/AGENT-BOUNDARIES.md`.

## What I did

- **Decided what to build and what not to claim.** I chose the problem (a Delhi family or school that has air-quality
  numbers but not an actionable decision), designed the user screens, established the sixteen core safety rules the app must never break (`docs/safety.md`), and set conservative boundaries: a GRAP stage is our estimate, a reading older than six hours gives no advice, and low-cost sensors are never misrepresented as "scientific-grade".
- **Reviewed and ran every change.** I reviewed every diff, executed builds locally, tested responsive viewports, and rejected improper assumptions. I preserved visual minimalism, unified shared design primitives across screens, and enforced real-world data purity: zero mocked data in production builds, and recorded weeks derived exclusively from public station archives. Every change verified through `make prove` (lint, TypeScript strict mode, 1,285 tests, `cdk synth`, and production bundle checks).
- **Architected and operated AWS infrastructure.** The entire stack (`AeroVigilStack`) lives in my AWS account. I configured provider keys (OpenAQ, NASA FIRMS) in Secrets Manager, monitored live API latencies (median 1.5s cold/warm Lambda, 0.15s CloudFront cache hit), and established alarms for quiet failures.
- **Engineered the hardware prototype.** Sourced components, wired a Sensirion SPS30 to an ESP32-S3 over UART, and wrote the firmware (`firmware/aerovigil-unit/aerovigil-unit.ino`) broadcasting Bluetooth LE telemetry every 2 seconds. Diagnosed and resolved sensor communication lockups on connection.
- **Built the air purifier test apparatus.** Fabricated a multi-stage prototype (box, centrifugal blower, pleated HEPA filter, foam pre-filter) and calibrated outlet airflow (~191 cfm) using a digital vane anemometer.
- **Enforced claims governance.** Maintained `docs/claims.md` ensuring every technical claim has rigorous empirical or architectural proof.

## What the app does at run time

Amazon Bedrock (Nova Micro, behind a guardrail) rewords answers that fixed rules already decided, or answers a question no
rule covers from the facts it is given. Every number in its wording is checked against the facts, and it has no tools and
cannot act. Amazon Polly reads answers aloud. See `docs/AGENT-BOUNDARIES.md`.

## Faults I caught

- An early draft called a particle sensor "reference-grade" and quoted costs with no source. Neither is claimed
  (`docs/claims.md`).
- The first firmware assumed an I2C wiring on an ESP32 DevKit. My board is an ESP32-S3 wired over UART, so it was rewritten
  for the real wiring, compiled and run.
- The unit's page first repeated the same figures in five cards; I asked for one screen, a chart and the room's numbers side by
  side, then the day and a few insights.
- The unit's chart first drew as a black line, and its first card overflowed on My Air: both were found by looking at my own
  screenshots, then fixed.
- The sensor stopped answering as soon as Bluetooth connected. I saw "no reading" in the app, I read the serial log, and the
  firmware now restarts it.
- On 11 October my own screenshot showed AQI 500 beside "GRAP Stage II". The estimate used the last 24 hours the monitor had,
  not the last 24 hours, and stretched one hour's PM10 over the day. It is fixed and checked against the monitors' own PM10
  on 24 station-days: 22 landed in the same stage as the monitor's own index and 2 had no estimate (too few recent hours). `docs/learning-log.md` lists these and the rest.
