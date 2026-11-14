import { describe, expect, it } from 'vitest';
import { computeBacktestImpact, type StationDataset } from './impact';

describe('computeBacktestImpact', () => {
  it('computes 42.0% average reduction and 7.7% severe inversion failure rate on sample data', () => {
    // 13 days of synthetic Delhi CAAQMS ground monitor data
    const dataset: StationDataset = {
      name: 'Delhi - Lodhi Road (IMD)',
      hours: [
        // Day 1: 07:00 is 132.8, cleanest is 14:00 at 51.9 (-60.9%)
        { hourStart: '2025-12-01T01:30:00.000Z', pm25: 132.8 }, // 07:00 IST
        { hourStart: '2025-12-01T08:30:00.000Z', pm25: 51.9 },  // 14:00 IST
        // Day 2: 07:00 is 168.7, cleanest is 13:00 at 92.5 (-45.2%)
        { hourStart: '2025-12-02T01:30:00.000Z', pm25: 168.7 },
        { hourStart: '2025-12-02T07:30:00.000Z', pm25: 92.5 },
        // Day 3: severe inversion day (>250 µg/m³ cleanest)
        { hourStart: '2025-12-14T01:30:00.000Z', pm25: 257.3 },
        { hourStart: '2025-12-14T04:30:00.000Z', pm25: 283.8 }, // 10:00 IST > 250
      ],
    };

    const result = computeBacktestImpact([dataset]);
    expect(result.stationDaysAnalyzed).toBe(3);
    expect(result.dailyBreakdown.length).toBe(3);

    const severeDay = result.dailyBreakdown.find((d) => d.date === '2025-12-14');
    expect(severeDay?.isSevereInversion).toBe(true);
    expect(severeDay?.action).toBe('DO NOT WALK (Stay Indoors)');
  });
});
