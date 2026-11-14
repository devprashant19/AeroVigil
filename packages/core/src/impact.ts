export interface BacktestInputHour {
  readonly hourStart: string;
  readonly pm25: number | null;
}

export interface StationDataset {
  readonly name: string;
  readonly hours: readonly BacktestInputHour[];
}

export interface DayOutcome {
  readonly date: string;
  readonly morning7am: number;
  readonly cleanestHour: string;
  readonly cleanestPm25: number;
  readonly reductionPct: number;
  readonly isSevereInversion: boolean;
  readonly action: string;
}

export interface BacktestImpactResult {
  readonly stationDaysAnalyzed: number;
  readonly averageInhalationReductionPct: number;
  readonly maxInhalationReductionPct: number;
  readonly noCleanWindowDaysPct: number;
  readonly noCleanWindowEnforcedVerdict: string;
  readonly dailyBreakdown: readonly DayOutcome[];
}

/**
 * Computes diurnal convective-shift impact metrics from hourly ground monitor telemetry.
 * Compares morning inversion baseline (07:00 IST) against the cleanest daylight hour (10:00–17:00 IST).
 * Severe inversion rule: when cleanest PM2.5 > 250 µg/m³ (GRAP IV), enforces STAY INDOORS failure.
 */
export function computeBacktestImpact(datasets: readonly StationDataset[]): BacktestImpactResult {
  const days: Record<string, Record<number, number>> = {};

  for (const ds of datasets) {
    for (const h of ds.hours) {
      if (h.pm25 === null) continue;
      const dt = new Date(h.hourStart);
      // Convert to IST (UTC + 5:30)
      const istHour = (dt.getUTCHours() + 5 + Math.floor((dt.getUTCMinutes() + 30) / 60)) % 24;
      const dateStr = dt.toISOString().split('T')[0];
      if (!dateStr) continue;
      days[dateStr] = days[dateStr] ?? {};
      days[dateStr][istHour] = h.pm25;
    }
  }

  const results: DayOutcome[] = [];
  for (const [date, hours] of Object.entries(days)) {
    if (hours[7] !== undefined) {
      const morning7am = hours[7];
      const daylight: { hour: number; pm25: number }[] = [];
      for (let hr = 10; hr <= 17; hr++) {
        const val = hours[hr];
        if (val !== undefined) daylight.push({ hour: hr, pm25: val });
      }

      if (daylight.length > 0) {
        daylight.sort((a, b) => a.pm25 - b.pm25);
        const cleanest = daylight[0];
        if (!cleanest) continue;
        const reductionPct = Math.round((((morning7am - cleanest.pm25) / morning7am) * 100) * 10) / 10;
        const isSevereInversion = cleanest.pm25 > 250;
        results.push({
          date,
          morning7am: Math.round(morning7am * 10) / 10,
          cleanestHour: `${cleanest.hour}:00`,
          cleanestPm25: Math.round(cleanest.pm25 * 10) / 10,
          reductionPct,
          isSevereInversion,
          action: isSevereInversion ? 'DO NOT WALK (Stay Indoors)' : 'Shift walk to cleanest hour',
        });
      }
    }
  }

  results.sort((a, b) => a.date.localeCompare(b.date));

  const allShiftable = results.filter((r) => !r.isSevereInversion && r.reductionPct > 0);
  const avgReduction =
    allShiftable.length > 0
      ? allShiftable.reduce((acc, r) => acc + r.reductionPct, 0) / allShiftable.length
      : 0;
  const severeCount = results.filter((r) => r.isSevereInversion).length;
  const severePct = results.length > 0 ? (severeCount / results.length) * 100 : 0;
  const maxReduction = results.length > 0 ? Math.max(...results.map((r) => r.reductionPct)) : 0;

  return {
    stationDaysAnalyzed: results.length,
    averageInhalationReductionPct: Math.round(avgReduction * 10) / 10,
    maxInhalationReductionPct: Math.round(maxReduction * 10) / 10,
    noCleanWindowDaysPct: Math.round(severePct * 10) / 10,
    noCleanWindowEnforcedVerdict: 'STAY_INDOORS',
    dailyBreakdown: results,
  };
}
