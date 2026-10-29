import { describe, expect, it } from 'vitest';
import { INDIA_REGIONS, INDIA_REGIONS_SOURCE } from '../lib/india-regions';

describe('India State and Union Territory list', () => {
  it('contains all 28 States and 8 Union Territories from the official source', () => {
    expect(INDIA_REGIONS.states).toHaveLength(28);
    expect(INDIA_REGIONS.unionTerritories).toHaveLength(8);
    expect([...INDIA_REGIONS.states, ...INDIA_REGIONS.unionTerritories]).toHaveLength(36);
    expect(INDIA_REGIONS_SOURCE).toMatch(/^https:\/\/knowindia\.india\.gov\.in\//);
  });
});
