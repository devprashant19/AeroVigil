import type { StationDataset } from '@aerovigil/core';
import parkJson from '../replay-data/replay/W1/park.json' with { type: 'json' };

export const DEFAULT_BACKTEST_DATASETS: readonly StationDataset[] = [
  {
    name: 'Delhi - Lodhi Road (IMD) / Anand Vihar (Park)',
    hours: parkJson.hours,
  },
];
