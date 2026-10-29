import { describe, expect, it } from 'vitest';
import { DISCOM_DIRECTORY, DISCOM_DIRECTORY_SOURCES, discomsForState } from '../data/discom-directory';
import { INDIA_REGIONS } from '../lib/india-regions';

function stateId(name: string) {
  return name.toLowerCase().replaceAll(' ', '-');
}

describe('all-India DISCOM directory', () => {
  it('has at least one provider choice for every official State and Union Territory', () => {
    const regions = [...INDIA_REGIONS.states, ...INDIA_REGIONS.unionTerritories];
    expect(DISCOM_DIRECTORY.length).toBeGreaterThan(60);
    for (const region of regions) {
      expect(discomsForState(stateId(region)), `${region} should have a provider`).not.toHaveLength(0);
    }
  });

  it('keeps provenance for the provider directory separate from tariff data', () => {
    expect(DISCOM_DIRECTORY_SOURCES).toHaveLength(2);
    expect(DISCOM_DIRECTORY_SOURCES.every((source) => source.url.startsWith('https://'))).toBe(true);
    expect(DISCOM_DIRECTORY.find((provider) => provider.id === 'cesc-kolkata')?.stateId).toBe('west-bengal');
    expect(DISCOM_DIRECTORY.find((provider) => provider.id === 'tpddl')?.stateId).toBe('delhi-(nct)');
  });
});
