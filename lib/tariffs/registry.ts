import { andhraPradeshTariffs } from '../../data/tariffs/andhra-pradesh';
import { sourceLinkedDomesticTariffs } from '../../data/tariffs/source-linked-domestic';
import { westBengalTariffs } from '../../data/tariffs/west-bengal';
import type { TariffRecord } from './types';

export const TARIFF_REGISTRY: readonly TariffRecord[] = [...andhraPradeshTariffs, ...westBengalTariffs, ...sourceLinkedDomesticTariffs];

export function tariffsForState(stateId: string): TariffRecord[] {
  return TARIFF_REGISTRY.filter((tariff) => tariff.stateId === stateId);
}

export function findTariff(id: string): TariffRecord | undefined {
  return TARIFF_REGISTRY.find((tariff) => tariff.id === id);
}

/** A provider can be in the national directory before its tariff is calculation-ready. */
export function tariffForDiscom(stateId: string, discomId: string): TariffRecord | undefined {
  return TARIFF_REGISTRY.find((tariff) => tariff.stateId === stateId && tariff.discomId === discomId);
}
