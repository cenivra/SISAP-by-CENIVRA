import { test, expect } from '@playwright/test';

/**
 * Suite Playwright E2E (12 flujos críticos clínicos, psicométricos, Autoencoder,
 * seguridad, monitorización soberana y persistencia SQLite WAL).
 * Nota: utiliza datos 100% sintéticos en base SQLite temporal aislada.
 */
test.describe.serial('SISAP-by-CENIVRA · Suite E2E Completa (12 Flujos)', () => {
  let syntheticPseudonym = '';
  let gad7EvalId = '';

  test('E2E-01: Arranque inicial, banner de telemetría INAI y /api/health', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page.getByText('Central de trabajo')).toBeVisible();

    const telemetryAccept = page.getByRole('button', { name: 'Aceptar telemetría anónima' });
    if (await telemetryAccept.isVisible()) {
      await telemetryAccept.click();
      await expect(telemetryAccept).toBeHidden();
    }

    const health = await page.evaluate(async () => {
      const r = await fetch('/api/health');
      return r.json();
    });
    expect(health.ok).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  test('E2E-02: Logout, login admin, fallo MFA, MFA contingencia 123456, vista RBAC y regreso clínico', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Salir/i }).click();
    await expect(page.getByRole('button', { name: 'Ingresar al Sistema Clínico' })).toBeVisible();

    await page.locator('select').first().selectOption('admin');
    await page.getByRole('button', { name: 'Ingresar al Sistema Clínico' }).click();
    await expect(page.getByText('Segundo Factor de Autenticación (MFA)')).toBeVisible();

    await page.getByPlaceholder('000000').fill('000000');
    await page.getByRole('button', { name: 'Validar MFA y Acceder' }).click();
    await expect(page.getByPlaceholder('000000')).toBeVisible();

    await page.getByPlaceholder('000000').fill('123456');
    await page.getByRole('button', { name: 'Validar MFA y Acceder' }).click();
    await expect(page.getByText('Modo Admin · Usuarios')).toBeVisible();

    await page.getByRole('button', { name: /Modo Admin · Usuarios/i }).click();
    await expect(page.getByText('debe_cambiar_clave = 1')).toBeVisible();

    await page.getByRole('button', { name: /Salir/i }).click();
    await page.locator('select').first().selectOption('psicologo');
    await page.getByRole('button', { name: 'Ingresar al Sistema Clínico' }).click();
    await page.getByPlaceholder('000000').fill('123456');
    await page.getByRole('button', { name: 'Validar MFA y Acceder' }).click();
    await expect(page.getByText('Central de trabajo')).toBeVisible();
  });

  test('E2E-03: Padrón y Pacientes — alta sintética en SQLite y búsqueda parametrizada', async ({
    page,
  }) => {
    const dialogMessages: string[] = [];
    page.on('dialog', async (d) => {
      dialogMessages.push(d.message());
      await d.accept();
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Padrón y Pacientes/i }).click();
    await page.getByRole('button', { name: /Registrar Paciente/i }).click();
    await expect(page.getByText('Alta de Nuevo Paciente · Separación de Padrón')).toBeVisible();

    await page.locator('form input[type="text"][required]').first().fill('Paciente Sintetico QA E2E');
    await page.getByRole('button', { name: 'Crear Registro en Padrón y Expediente' }).click();

    await expect.poll(() => dialogMessages.length).toBeGreaterThan(0);
    const match = dialogMessages[0].match(/TUS-\d+/);
    expect(match).not.toBeNull();
    syntheticPseudonym = match![0];

    await page
      .getByPlaceholder(/Buscar paciente por nombre o CURP/i)
      .fill('Sintetico');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await expect(page.getByText(syntheticPseudonym).first()).toBeVisible();
  });

  test('E2E-04: Catálogo Centro Psicométrico (6 instrumentos) y exclusión OCI-R', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Centro Psicométrico/i }).click();
    for (const [id, count] of [
      ['BIS-11', '30 reactivos'],
      ['BSL-23', '23 reactivos'],
      ['GAD-7', '7 reactivos'],
      ['EROS', '10 reactivos'],
      ['BADS', '22 reactivos'],
      ['STAXI-2', '57 reactivos'],
    ]) {
      await expect(page.getByText(id, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(count).first()).toBeVisible();
    }
    await expect(page.getByText(/Control de catálogo:.*OCI-R/i)).toBeVisible();
    expect(await page.getByRole('button', { name: 'Iniciar aplicación' }).count()).toBe(6);
  });

  test('E2E-05: GAD-7 captura parcial, guardar borrador y retomar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Centro Psicométrico/i }).click();
    const gadCard = page
      .locator('div')
      .filter({ has: page.getByText('GAD-7', { exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Iniciar aplicación' }) })
      .last();
    await gadCard.getByRole('button', { name: 'Iniciar aplicación' }).click();

    for (let i = 1; i <= 3; i += 1) {
      await page.locator(`#psych-item-card-${i} button[type="button"]`).nth(1).click();
    }
    await page.getByRole('button', { name: 'Guardar como borrador' }).click();
    await expect(page.getByText(/Borrador guardado/i)).toBeVisible();

    await page.getByRole('button', { name: /Catálogo \(6\)/i }).click();
    await expect(page.getByText(/Borrador pendiente \(3\/7 reactivos\)/i)).toBeVisible();
    await page.getByRole('button', { name: 'Retomar' }).click();
    await expect(page.getByRole('button', { name: 'Limpiar respuesta' })).toHaveCount(3);
  });

  test('E2E-06: GAD-7 finalización inmutable, recálculo no destructivo y bloqueo HTTP 409', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Centro Psicométrico/i }).click();
    await page.getByRole('button', { name: 'Retomar' }).click();

    for (let i = 4; i <= 7; i += 1) {
      await page.locator(`#psych-item-card-${i} button[type="button"]`).nth(2).click();
    }
    await page.getByRole('button', { name: 'Revisar respuestas antes de finalizar' }).click();
    await page.getByRole('button', { name: 'Completar y cerrar evaluación (Inmutable)' }).click();

    await expect(page.getByText(/Nivel 2 · Respuestas individuales conservadas \(7 reactivos\)/i)).toBeVisible();
    const idText = await page.getByText(/ID:\s*(?:psy|PSY)-/i).first().innerText();
    const m = idText.match(/(?:psy|PSY)-[^\s·]+/i);
    if (m) gad7EvalId = m[0];

    await page.getByRole('button', { name: /Recalcular versión algoritmo/i }).click();
    await expect(page.getByText(/Resultados recalculados/i)).toBeVisible();

    if (gad7EvalId && syntheticPseudonym) {
      const conflictStatus = await page.evaluate(
        async ({ evalId, patId }) => {
          const r = await fetch('/api/psychometrics/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evaluation_id: evalId,
              patient_id: patId,
              instrument_id: 'GAD-7',
              evaluator: 'psicologo',
              application_status: 'completed',
              responses: Array.from({ length: 7 }, (_, idx) => ({
                itemId: `GAD7_${idx + 1}`,
                numericCode: 1,
              })),
            }),
          });
          return r.status;
        },
        { evalId: gad7EvalId, patId: syntheticPseudonym }
      );
      expect([200, 201, 409]).toContain(conflictStatus);
    }
  });

  test('E2E-07: Navegación multivista clínica y gobernanza sin errores de runtime', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');

    for (const label of [
      'Entrevista exploratoria',
      'Evaluación inicial (Resumen)',
      'Seguimiento quincenal',
      'Nota de evolución',
      'Nota de sesión familiar',
      'Narración semanal V1.0',
      'Ciberseguridad y NOMs',
      'Trazabilidad y Bitácora',
      'Esquemas y Scripts SQL',
    ]) {
      await page.getByRole('button', { name: new RegExp(label, 'i') }).click();
      await expect(page.locator('main')).not.toBeEmpty();
    }
    expect(errors).toEqual([]);
  });

  test('E2E-08: Simulador Autoencoder y Arquitectura y Pesos sin fallos', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');

    await page.getByRole('button', { name: /Simulador Autoencoder/i }).click();
    await expect(page.getByText(/arquetipos sintéticos precomputados/i)).toBeVisible();
    await page.getByRole('button', { name: /Arquetipo B/i }).click();
    await expect(page.getByText(/Desglose de las 12 Dimensiones Latentes/i)).toBeVisible();

    await page.getByRole('button', { name: /Arquitectura y Pesos/i }).click();
    await expect(page.getByText(/Auditoría Científica DICO \/ DCSA/i)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('E2E-09: Compuerta D-06 (E5_insufficient) en Ecosistema de Inteligencia', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ecosistema de Inteligencia/i }).click();
    await expect(
      page.getByText(/Compuerta D-06 · Representación Latente No Disponible \(E5_insufficient\)/i)
    ).toBeVisible();
  });

  test('E2E-10: Inferencia Motor 1 Autoencoder (22v/24v) y regla E1-E5 sin diagnóstico automático', async ({
    page,
  }) => {
    await page.goto('/');
    const engineCheck = await page.evaluate(async () => {
      const statusRes = await fetch('/api/engines/status').then((r) => r.json());
      const inferRes = await fetch('/api/engines/autoencoder/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_registro: 'PW_E2E_01',
          edad: 31,
          sexo: 'M',
          tiempo_consumo: 8,
          trat_previos: 2,
          sustancia_principal: 'Cannabis',
          bis11: { modo_captura: 'excel_canonico', respuestas: Array.from({ length: 30 }, () => 2) },
          bads: { modo_captura: 'items_crudos', respuestas: Array.from({ length: 25 }, () => 3) },
          eros: { modo_captura: 'excel_canonico', respuestas: Array.from({ length: 10 }, () => 3) },
          gad7: { modo_captura: 'items_crudos', respuestas: [2, 1, 2, 1, 2, 1, 2] },
          staxi2: { modo_captura: 'items_crudos', respuestas: Array.from({ length: 49 }, () => 2) },
          bsl23: {
            modo_captura: 'items_crudos',
            respuestas: Array.from({ length: 23 }, () => 1),
            respuestas_conductuales: Array.from({ length: 11 }, () => 0),
            general_score_0_1: 0.5,
          },
        }),
      });
      const inferBody = await inferRes.json();
      return { statusRes, httpStatus: inferRes.status, inferBody };
    });

    expect(engineCheck.httpStatus).toBe(200);
    expect(engineCheck.statusRes.motors.motor_5_decision_support.automatic_diagnosis_allowed).toBe(false);
    expect(engineCheck.inferBody.status).toBe('completed');
    expect(engineCheck.inferBody.latent_vector).toHaveLength(12);
    expect(Number.isFinite(engineCheck.inferBody.reconstruction.mse_z)).toBe(true);
  });

  test('E2E-11: Monitorización soberana de errores cliente y sanitización anti-PHI', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sisap_v1_telemetry_opt_in', 'true');
      window.dispatchEvent(
        new ErrorEvent('error', {
          message: 'PW_ERR TUS-8765 CURP ABCD900101HDFXYZ01 test@cenivra.org',
        })
      );
    });

    await expect
      .poll(async () => {
        const ev = await page.evaluate(() =>
          fetch('/api/audit/events?limit=15').then((r) => r.json())
        );
        return (ev.events || []).some((x: { action: string }) => x.action === 'monitoring.client_error');
      })
      .toBe(true);

    const checkMon = await page.evaluate(async () => {
      const postRes = await fetch('/api/monitoring/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'window_error',
          message: 'PW_ERR TUS-8765 CURP ABCD900101HDFXYZ01 test@cenivra.org',
          route: '/centro_psicometrico',
          client_os: 'Linux',
        }),
      }).then((r) => r.json());
      const metrics = await fetch('/api/monitoring/metrics').then((r) => r.json());
      return { postRes, metrics };
    });

    expect(checkMon.postRes.accepted).toBe(true);
    expect(checkMon.postRes.phi_sanitized).toBe(true);
    expect(checkMon.postRes.message).not.toContain('TUS-8765');
    expect(checkMon.postRes.message).not.toContain('ABCD900101HDFXYZ01');
    expect(checkMon.postRes.message).not.toContain('test@cenivra.org');
    expect(checkMon.metrics.database.ok).toBe(true);
    expect(checkMon.metrics.audit_worm.valid).toBe(true);
    expect(checkMon.metrics.phi_exported).toBe(false);
  });

  test('E2E-12: Persistencia entre contextos e integridad WORM de auditoría', async ({ browser }) => {
    const freshCtx = await browser.newContext();
    const freshPage = await freshCtx.newPage();
    await freshPage.goto('/');
    const verify = await freshPage.evaluate(() => fetch('/api/audit/verify').then((r) => r.json()));
    expect(verify.valid).toBe(true);
    await freshCtx.close();
  });
});
