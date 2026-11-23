import { defineConfig } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

const pwDbDir = path.join(os.tmpdir(), 'sisap-pw-db');

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'e2e/playwright-results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:18091',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'node backend/src/server.js',
    url: 'http://127.0.0.1:18091/api/health',
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      SISAP_HOST: '127.0.0.1',
      SISAP_PORT: '18091',
      SISAP_DB_DIR: pwDbDir,
      SISAP_DB_FILE: 'sisap_playwright.sqlite3',
      SISAP_ALLOWED_ORIGINS: 'http://127.0.0.1:18091,http://localhost:18091',
      SISAP_RATE_LIMIT: '1000',
      NODE_ENV: 'test',
    },
  },
});
