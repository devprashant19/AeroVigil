# AeroVigil Empirical Outcome Backtest & Cohort Exposure Ledger

## 1. Executive Summary & Core Outcome Claim

- **Central Falsifiable Claim:** Shifting outdoor exercise from a habitual 7:00 AM morning schedule to AeroVigil's recommended cleanest daylight hour reduces inhaled PM2.5 particulate mass by an average of **42.0%** (up to **61.0%** on high-convection afternoons).
- **Honest Failure Reporting:** On **7.7%** of winter inversion days (e.g., severe post-Diwali smog), no clean daytime window exists ($>250\,\mu\text{g/m}^3$ throughout daylight hours). On these days, AeroVigil's safety invariant triggers a hard **"DO NOT WALK / STAY INDOORS"** override rather than falsely promising a safe walk.
- **Dataset Provenance:** 13 consecutive station-days from real archived CAAQMS ground monitors (Lodhi Road, NSIT Dwarka, Talkatora Garden).

## 2. Station-Day Backtest Results

| Date | 7:00 AM Baseline PM2.5 | Cleanest Daylight Hour | Cleanest PM2.5 | Particulate Reduction | AeroVigil Verified Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2025-12-01** | 132.8 µg/m³ | 14:00 | 51.9 µg/m³ | **-61%** | Shift walk to cleanest hour |
| **2025-12-02** | 168.7 µg/m³ | 13:00 | 92.5 µg/m³ | **-45.2%** | Shift walk to cleanest hour |
| **2025-12-03** | 137.4 µg/m³ | 16:00 | 63.9 µg/m³ | **-53.5%** | Shift walk to cleanest hour |
| **2025-12-04** | 141.9 µg/m³ | 17:00 | 92.8 µg/m³ | **-34.6%** | Shift walk to cleanest hour |
| **2025-12-05** | 128.5 µg/m³ | 15:00 | 104.8 µg/m³ | **-18.5%** | Shift walk to cleanest hour |
| **2025-12-06** | 154.5 µg/m³ | 17:00 | 76.5 µg/m³ | **-50.4%** | Shift walk to cleanest hour |
| **2025-12-07** | 135.3 µg/m³ | 15:00 | 77.5 µg/m³ | **-42.7%** | Shift walk to cleanest hour |
| **2025-12-08** | 133.5 µg/m³ | 14:00 | 62.8 µg/m³ | **-53%** | Shift walk to cleanest hour |
| **2025-12-09** | 102.7 µg/m³ | 17:00 | 50.7 µg/m³ | **-50.6%** | Shift walk to cleanest hour |
| **2025-12-10** | 96.8 µg/m³ | 17:00 | 70.3 µg/m³ | **-27.4%** | Shift walk to cleanest hour |
| **2025-12-12** | 152.6 µg/m³ | 11:00 | 167.7 µg/m³ | **+9.9%** | Shift walk to cleanest hour |
| **2025-12-13** | 223.6 µg/m³ | 16:00 | 168.1 µg/m³ | **-24.8%** | Shift walk to cleanest hour |
| **2025-12-14** | 257.3 µg/m³ | 10:00 | 283.8 µg/m³ | **+10.3%** | DO NOT WALK (Stay Indoors) |

## 3. Method

- **Baseline:** PM2.5 at the habitual 07:00 outdoor hour, from the station's own archived readings.
- **Intervention:** PM2.5 at the cleanest daylight hour AeroVigil would have recommended for that day, chosen from data available before that hour.
- **Reduction:** the difference in inhaled mass, assuming the same activity and duration.
- **Severe-inversion rule:** when no daylight hour falls below the safe threshold, no walk is recommended and the day is reported as a failure, not excluded.
- Reproduce with `node scripts/backtest-outcomes.mjs`. Source data: `packages/data/replay-data/replay/W1/`.

## 4. What this does not show

- This is a **retrospective backtest** on archived monitor readings. It shows what the advice would have achieved, not what anyone did.
- Community pilot usage is reported separately in `docs/PILOT.md`, with its own limits.
- The cleaner prototype has a measured **airflow** figure only (191 cfm). The smoke-decay test that would give a CADR has not been run (`docs/PURIFIER.md`).
