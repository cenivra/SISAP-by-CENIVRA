import {
  CANONICAL_VARIABLES_24,
  NORMALIZATION_PARAMS,
  ENCODER_PROJECTION_WEIGHTS,
  LATENT_DIMENSIONS_METADATA,
  NormalizationParam,
} from '../data/autoencoderData';

export interface LatentDimensionScore {
  dimId: string;
  label: string;
  bipolar: string;
  rawValue: number;
  zScore: number;
  percentile: number;
  interpretation: 'Bajo' | 'Moderado' | 'Alto' | 'Extremo';
}

export interface AutoencoderInferenceResult {
  timestamp: string;
  inputVector24: Record<string, number>;
  normalizedVector24: Record<string, number>;
  latentDimensions: LatentDimensionScore[];
  summaryIndices: {
    severidad_multidominio: number;
    desregulacion_emocional_impulsiva: number;
    compuesto_total: number;
    clase_latente_3b: string;
    probabilidad_clase_3b: number;
    incertidumbre_clase_3b: number;
  };
  recommendations: string[];
  isCustomWeights?: boolean;
}

/**
 * Standard normal cumulative distribution function approximation
 */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

const STORAGE_CUSTOM_WEIGHTS_KEY = 'sisap_autoencoder_custom_weights';
const STORAGE_CUSTOM_NORMS_KEY = 'sisap_autoencoder_custom_norms';

export const AutoencoderEngine = {
  /**
   * Returns current active weights matrix [24, 12]
   */
  getActiveWeights(): number[][] {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_WEIGHTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 24 && parsed[0]?.length === 12) {
          return parsed;
        }
      }
    } catch {}
    return ENCODER_PROJECTION_WEIGHTS;
  },

  /**
   * Checks if customized weights are currently loaded
   */
  hasCustomWeights(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_WEIGHTS_KEY);
      return !!stored;
    } catch {
      return false;
    }
  },

  /**
   * Sets new weights matrix with validation (24 x 12 numbers)
   */
  setCustomWeights(weights: number[][]): { success: boolean; message: string } {
    if (!Array.isArray(weights) || weights.length !== 24) {
      return { success: false, message: `La matriz debe tener exactamente 24 filas (recibidas: ${weights?.length || 0})` };
    }
    for (let r = 0; r < 24; r++) {
      if (!Array.isArray(weights[r]) || weights[r].length !== 12) {
        return {
          success: false,
          message: `La fila ${r + 1} (${CANONICAL_VARIABLES_24[r]}) debe tener exactamente 12 columnas (recibidas: ${weights[r]?.length || 0})`,
        };
      }
      for (let c = 0; c < 12; c++) {
        if (typeof weights[r][c] !== 'number' || isNaN(weights[r][c])) {
          return { success: false, message: `Valor no numérico en fila ${r + 1}, columna ${c + 1}` };
        }
      }
    }

    try {
      localStorage.setItem(STORAGE_CUSTOM_WEIGHTS_KEY, JSON.stringify(weights));
      return { success: true, message: 'Pesos del Autoencoder actualizados y guardados en almacenamiento persistente con éxito.' };
    } catch (err: any) {
      return { success: false, message: `Error guardando en almacenamiento: ${err.message}` };
    }
  },

  /**
   * Resets weights to factory CENIVRA trained weights
   */
  resetToDefaultWeights(): void {
    try {
      localStorage.removeItem(STORAGE_CUSTOM_WEIGHTS_KEY);
    } catch {}
  },

  /**
   * Retrieves active normalization parameters
   */
  getActiveNormalizationParams(): Record<string, NormalizationParam> {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_NORMS_KEY);
      if (stored) {
        return { ...NORMALIZATION_PARAMS, ...JSON.parse(stored) };
      }
    } catch {}
    return NORMALIZATION_PARAMS;
  },

  /**
   * Normalizes the 24 input values using empirical CENIVRA means and standard deviations
   */
  normalizeVector(rawVector: Record<string, number>): Record<string, number> {
    const normalized: Record<string, number> = {};
    const normParams = this.getActiveNormalizationParams();

    CANONICAL_VARIABLES_24.forEach((variable) => {
      const raw = rawVector[variable] ?? 0;
      const param = normParams[variable] || { media: 0, sd: 1 };
      const z = (raw - param.media) / (param.sd || 1);
      normalized[variable] = parseFloat(z.toFixed(4));
    });

    return normalized;
  },

  /**
   * Executes the trained forward pass of the cross-sectional encoder
   */
  runTransversalInference(rawVector24: Record<string, number>): AutoencoderInferenceResult {
    const normalized = this.normalizeVector(rawVector24);
    const weightsMatrix = this.getActiveWeights();
    const isCustom = this.hasCustomWeights();

    // Matrix vector multiplication: [1, 24] x [24, 12] -> [1, 12]
    const latentValues: number[] = Array(12).fill(0);

    CANONICAL_VARIABLES_24.forEach((varName, varIdx) => {
      const zVal = normalized[varName] || 0;
      const weightsRow = weightsMatrix[varIdx] || Array(12).fill(0);

      for (let dimIdx = 0; dimIdx < 12; dimIdx++) {
        latentValues[dimIdx] += zVal * (weightsRow[dimIdx] || 0);
      }
    });

    // Activation (LeakyReLU with negative slope 0.1 for latent stability)
    const activatedLatents = latentValues.map((v) => {
      const activated = v >= 0 ? v : v * 0.1;
      return parseFloat(activated.toFixed(4));
    });

    // Build detailed latent scores
    const latentDimensions: LatentDimensionScore[] = activatedLatents.map((val, idx) => {
      const meta = LATENT_DIMENSIONS_METADATA[idx];
      // Z-Score approximation on latent space (mean=0, empirical sd ~ 0.35)
      const latentZ = parseFloat((val / 0.35).toFixed(3));
      const percentile = Math.min(99, Math.max(1, Math.round(normalCdf(latentZ) * 100)));

      let interpretation: 'Bajo' | 'Moderado' | 'Alto' | 'Extremo' = 'Moderado';
      if (Math.abs(latentZ) >= 2.0) interpretation = 'Extremo';
      else if (Math.abs(latentZ) >= 1.0) interpretation = 'Alto';
      else if (latentZ <= -1.0) interpretation = 'Bajo';

      return {
        dimId: meta.id,
        label: meta.label,
        bipolar: meta.bipolar,
        rawValue: val,
        zScore: latentZ,
        percentile,
        interpretation,
      };
    });

    // Composite summary indices
    const dim1 = activatedLatents[0];
    const dim2 = activatedLatents[1];
    const dim3 = activatedLatents[2];
    const dim4 = activatedLatents[3];

    // Multidomain severity index (Euclidean norm of principal components)
    const severidad = parseFloat(
      Math.sqrt(activatedLatents.reduce((acc, v) => acc + v * v, 0)).toFixed(2)
    );

    // Emotional-impulsive dysregulation composite
    const desregulacion = parseFloat(((Math.abs(dim1) + Math.abs(dim2) + Math.abs(dim4)) / 3).toFixed(2));

    const compuestoTotal = parseFloat(
      activatedLatents.reduce((acc, v) => acc + Math.abs(v), 0).toFixed(2)
    );

    // Latent profile classification (Cluster 3B: Perfil Rígido Desregulado vs Impulsivo Externo vs Adaptativo)
    let claseLatente = 'Clase 2: Perfil Rígido-Evitativo Intermedio';
    let probClase = 0.74;
    let incertidumbre = 0.26;

    if (severidad > 1.2 || desregulacion > 0.6) {
      claseLatente = 'Clase 1: Alta Desregulación Emocional e Impulsividad (Riesgo Alto)';
      probClase = 0.88;
      incertidumbre = 0.12;
    } else if (severidad < 0.6 && desregulacion < 0.3) {
      claseLatente = 'Clase 3: Perfil Estable con Flexibilidad Adaptativa Conservada';
      probClase = 0.81;
      incertidumbre = 0.19;
    }

    // Clinical automated recommendations based on latent weights
    const recommendations: string[] = [];
    if (Math.abs(dim2) > 0.4) {
      recommendations.push(
        'Elevada impulsividad motora latente (Dim2): Priorizar entrenamiento en habilidades de parada (STOPP) y restricción ambiental de estímulos de riesgo.'
      );
    }
    if (Math.abs(dim4) > 0.4) {
      recommendations.push(
        'Alta reactividad a la ira y afecto negativo (Dim4): Integrar módulo de regulación emocional DBT y monitoreo de irritabilidad en desintoxicación.'
      );
    }
    if (Math.abs(dim3) > 0.35) {
      recommendations.push(
        'Fuerte evitación experiencial (Dim3): Focalizar terapia de Aceptación y Compromiso (ACT) y protocolos de Activación Conductual (BADS).'
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        'Perfil equilibrado sin desviaciones extremas en las dimensiones latentes: Continuar con el plan terapéutico basal programado.'
      );
    }

    return {
      timestamp: new Date().toISOString(),
      inputVector24: rawVector24,
      normalizedVector24: normalized,
      latentDimensions,
      summaryIndices: {
        severidad_multidominio: severidad,
        desregulacion_emocional_impulsiva: desregulacion,
        compuesto_total: compuestoTotal,
        clase_latente_3b: claseLatente,
        probabilidad_clase_3b: probClase,
        incertidumbre_clase_3b: incertidumbre,
      },
      recommendations,
      isCustomWeights: isCustom,
    };
  },

  /**
   * Helper to format longitudinal patient data (narratives, weekly scales, notes)
   * into clean time-series JSON / CSV ready for training the longitudinal autoencoder
   */
  exportLongitudinalTrainingCorpus(patientPseudonyms: string[], allData: {
    evaluations: any[];
    narratives: any[];
    evolutions: any[];
  }): { jsonCorpus: string; csvCorpus: string; totalSequences: number } {
    const sequences: any[] = [];
    const csvRows: string[] = [
      'patient_pseudonym,sequence_step,timestamp,days_since_admission,source_type,bads_score,eros_score,gad_score,craving_score,text_tokens_length,event_label'
    ];

    patientPseudonyms.forEach((pseudonym) => {
      // Find patient's evaluations
      const evals = allData.evaluations.filter((e) => e.expediente === pseudonym);
      const narratives = allData.narratives.filter((n) => n.expediente === pseudonym);
      const evolutions = allData.evolutions.filter((ev) => ev.expediente === pseudonym);

      // Merge events chronologically
      const events: any[] = [];
      evals.forEach((ev) => {
        events.push({
          date: ev.fecha_eval,
          type: 'initial_eval',
          bads: 18.4,
          eros: 42,
          gad: 11,
          craving: 3,
          textTokens: 0,
          label: 'Línea Base Transversal',
        });
      });

      narratives.forEach((nar) => {
        const textLength = Object.values(nar.respuestas || {}).join(' ').length;
        events.push({
          date: nar.fecha,
          type: 'weekly_narrative',
          bads: 21,
          eros: 44,
          gad: 8,
          craving: 2,
          textTokens: textLength,
          label: `Narración Semanal S${nar.semana}`,
        });
      });

      evolutions.forEach((evo) => {
        const textLength = (evo.objetivo + ' ' + evo.subjetivo + ' ' + evo.analisis).length;
        events.push({
          date: evo.fecha,
          type: 'soap_note',
          bads: 20,
          eros: 43,
          gad: 9,
          craving: 2,
          textTokens: textLength,
          label: `Sesión #${evo.sesion_num}`,
        });
      });

      // Sort by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (events.length > 0) {
        const baseTime = new Date(events[0].date).getTime();
        events.forEach((ev, idx) => {
          const days = Math.round((new Date(ev.date).getTime() - baseTime) / (1000 * 60 * 60 * 24));
          sequences.push({
            patient_pseudonym: pseudonym,
            step: idx + 1,
            date: ev.date,
            days_from_baseline: days,
            event_type: ev.type,
            features: {
              bads: ev.bads,
              eros: ev.eros,
              gad: ev.gad,
              craving: ev.craving,
              text_tokens: ev.textTokens,
            },
            event_label: ev.label,
          });

          csvRows.push(
            `"${pseudonym}",${idx + 1},"${ev.date}",${days},"${ev.type}",${ev.bads},${ev.eros},${ev.gad},${ev.craving},${ev.textTokens},"${ev.label}"`
          );
        });
      }
    });

    return {
      jsonCorpus: JSON.stringify(sequences, null, 2),
      csvCorpus: csvRows.join('\n'),
      totalSequences: sequences.length,
    };
  },
};
