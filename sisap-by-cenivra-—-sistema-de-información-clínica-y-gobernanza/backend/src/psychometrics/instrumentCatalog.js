/**
 * Motor de Configuración Psicométrica Versionado (Backend ESM).
 * Comparte la fuente única de verdad `engines/psychometrics/catalog_v1.json`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../../../engines/psychometrics/catalog_v1.json');

let _cachedCatalog = null;

export function loadCatalogJson() {
  if (!_cachedCatalog) {
    _cachedCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  }
  return _cachedCatalog;
}

export const ACTIVE_INSTRUMENT_IDS = ['BIS-11', 'BSL-23', 'GAD-7', 'EROS', 'BADS', 'STAXI-2'];

export function isInstrumentExcluded(instrumentId) {
  const catalog = loadCatalogJson();
  const norm = String(instrumentId || '').trim().toUpperCase().replace(/_/g, '-');
  return (catalog.excludedInstruments || []).some((x) => x.id.toUpperCase() === norm);
}

export function normalizeInstrumentId(rawId) {
  const clean = String(rawId || '').trim().toUpperCase().replace(/_/g, '-');
  if (clean === 'BIS11' || clean === 'BIS-11') return 'BIS-11';
  if (clean === 'BSL23' || clean === 'BSL-23') return 'BSL-23';
  if (clean === 'GAD7' || clean === 'GAD-7') return 'GAD-7';
  if (clean === 'EROS') return 'EROS';
  if (clean === 'BADS' || clean === 'BADS-22' || clean === 'BADS-25') return 'BADS';
  if (clean === 'STAXI2' || clean === 'STAXI-2') return 'STAXI-2';
  return null;
}

export function resolveInstrumentConfig(instrumentId, requestedVersion) {
  const catalog = loadCatalogJson();
  if (isInstrumentExcluded(instrumentId)) {
    throw new Error(`El instrumento ${instrumentId} está excluido del catálogo activo de aplicación.`);
  }
  const normalizedId = normalizeInstrumentId(instrumentId);
  if (!normalizedId) {
    throw new Error(`Instrumento no reconocido en catálogo activo: ${instrumentId}`);
  }

  const rawSpec = catalog.instruments.find((inst) => inst.id === normalizedId);
  if (!rawSpec) {
    throw new Error(`Configuración no encontrada para ${normalizedId}`);
  }

  const targetVersion = requestedVersion || rawSpec.defaultVersion;
  let items = JSON.parse(JSON.stringify(rawSpec.items));
  let responseOptions = JSON.parse(JSON.stringify(rawSpec.responseOptions));
  let recommendedBlocks = JSON.parse(JSON.stringify(rawSpec.recommendedBlocks));
  let subscales = JSON.parse(JSON.stringify(rawSpec.subscales));
  let itemCount = rawSpec.itemCount;
  let name = rawSpec.name;
  let scoringAlgorithm = JSON.parse(JSON.stringify(rawSpec.scoringAlgorithm));
  let inversionRules = JSON.parse(JSON.stringify(rawSpec.inversionRules));

  if (normalizedId === 'BIS-11' && targetVersion === 'v1.0-campo-0134') {
    const override = rawSpec.versionOptionOverrides?.['v1.0-campo-0134'];
    if (override) {
      responseOptions = JSON.parse(JSON.stringify(override));
    }
    inversionRules = {
      ...inversionRules,
      min: 0,
      max: 4,
      note: 'Codificación histórica de campo 0,1,3,4 (cohorte N=166).',
    };
  }

  if (normalizedId === 'BADS' && targetVersion === 'v25.0-barraca2011') {
    const extra = JSON.parse(JSON.stringify(rawSpec.excludedHistoricalItems || []));
    const merged = [...items, ...extra].sort(
      (a, b) => (a.originalItemNumber25 || a.displayNumber) - (b.originalItemNumber25 || b.displayNumber)
    );
    items = merged.map((it, idx) => ({
      ...it,
      displayNumber: idx + 1,
      section: 'BADS-25 (Barraca et al., 2011 · Compatibilidad Autoencoder)',
    }));
    itemCount = 25;
    name = 'Escala de Activación Conductual para la Depresión — Completa 25 ítems (BADS-25)';
    recommendedBlocks = [
      { id: 'b1', title: 'Bloque 1 · Reactivos 1 al 13', start: 1, end: 13 },
      { id: 'b2', title: 'Bloque 2 · Reactivos 14 al 25', start: 14, end: 25 },
    ];
    subscales = [
      { id: 'bads_activation', name: 'Activación Conductual (7 ítems)', order: 'first_order', itemIds: ['BADS_P3', 'BADS_P4', 'BADS_P5', 'BADS_P7', 'BADS_P11', 'BADS_P12', 'BADS_P23'], range: [0, 42] },
      { id: 'bads_avoidance', name: 'Evitación / Rumia (8 ítems)', order: 'first_order', itemIds: ['BADS_P8', 'BADS_P9', 'BADS_P10', 'BADS_P13', 'BADS_P14', 'BADS_P15', 'BADS_P24', 'BADS_P25'], range: [0, 48] },
      { id: 'bads_work', name: 'Deterioro Laboral (5 ítems)', order: 'first_order', itemIds: ['BADS_P1', 'BADS_P2', 'BADS_P6', 'BADS_P21', 'BADS_P22'], range: [0, 30] },
      { id: 'bads_social', name: 'Deterioro Social (5 ítems)', order: 'first_order', itemIds: ['BADS_P16', 'BADS_P17', 'BADS_P18', 'BADS_P19', 'BADS_P20'], range: [0, 30] },
      { id: 'bads_functional_impairment', name: 'Deterioro Funcional Integrado (10 ítems)', order: 'second_order', subscaleRefs: ['bads_work', 'bads_social'], range: [0, 60] },
      { id: 'bads_dysfunction_avoidance_total', name: 'Disfunción y Evitación Total (18 ítems)', order: 'second_order', subscaleRefs: ['bads_avoidance', 'bads_work', 'bads_social'], range: [0, 108] },
    ];
    inversionRules = {
      ...inversionRules,
      reverseItemIdsInTechnicalTotal: [
        ...(inversionRules.reverseItemIdsInTechnicalTotal || []),
        'BADS_P10',
        'BADS_P16',
      ],
    };
    scoringAlgorithm = {
      ...scoringAlgorithm,
      totalRange: [0, 150],
    };
  }

  if (normalizedId === 'STAXI-2' && targetVersion === 'v49.0-tea2001') {
    items = items.filter((it) => it.displayNumber <= 49);
    itemCount = 49;
    name = 'Inventario de Expresión de Ira Estado-Rasgo — Adaptación Española TEA (STAXI-2 · 49)';
    recommendedBlocks = recommendedBlocks.filter((b) => b.end <= 49);
  }

  return {
    id: normalizedId,
    name,
    shortName: rawSpec.shortName,
    version: targetVersion,
    defaultVersion: rawSpec.defaultVersion,
    supportedVersions: rawSpec.supportedVersions,
    language: rawSpec.language,
    itemCount,
    description: rawSpec.description,
    instructions: rawSpec.instructions,
    instructionsBySection: rawSpec.instructionsBySection,
    instructionsSourceStatus: rawSpec.instructionsSourceStatus,
    instructionsNote: rawSpec.instructionsNote,
    referencePeriod: rawSpec.referencePeriod,
    recommendedBlocks,
    responseOptions,
    sectionResponseOptions: rawSpec.sectionResponseOptions,
    inversionRules,
    subscales,
    optionalComplements: rawSpec.optionalComplements,
    scoringAlgorithm,
    missingDataPolicy: rawSpec.missingDataPolicy,
    interpretationRules: rawSpec.interpretationRules,
    copyrightAndSourceMeta: rawSpec.copyrightAndSourceMeta,
    items,
    algorithmVersion: catalog.algorithmVersion,
    catalogVersion: catalog.catalogVersion,
  };
}

export function listActiveInstruments() {
  const catalog = loadCatalogJson();
  return {
    catalogVersion: catalog.catalogVersion,
    algorithmVersion: catalog.algorithmVersion,
    excludedInstruments: catalog.excludedInstruments,
    instruments: ACTIVE_INSTRUMENT_IDS.map((id) => resolveInstrumentConfig(id)),
  };
}

export function getOptionsForItem(config, item) {
  if (config.sectionResponseOptions && config.sectionResponseOptions[item.section]) {
    return config.sectionResponseOptions[item.section];
  }
  return config.responseOptions;
}
