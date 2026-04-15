import { mockDataRepository } from "@/lib/data";

let regenerationIntervalId: NodeJS.Timeout | null = null;

export const mockDataService = {
  regenerate: (seed?: number): void => {
    mockDataRepository.regenerate(seed);
  },
  clear: (): void => {
    mockDataRepository.clear();
  },
  resetToSeed: (): void => {
    mockDataRepository.resetToSeed();
  },
  startContinuousRegeneration: (intervalMs: number = 500): void => {
    if (regenerationIntervalId) return;
    regenerationIntervalId = setInterval(() => {
      mockDataRepository.regenerate();
    }, intervalMs);
  },
  stopContinuousRegeneration: (): void => {
    if (regenerationIntervalId) {
      clearInterval(regenerationIntervalId);
      regenerationIntervalId = null;
    }
  },
};
