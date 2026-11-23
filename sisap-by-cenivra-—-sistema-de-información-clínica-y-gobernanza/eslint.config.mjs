/**
 * Configuración ESLint v9 (Flat Config) — SISAP by CENIVRA v1.1.0
 * Compatible con backend Node.js ESM, motores científicos JS y frontend TS/TSX.
 */
export default [
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'engines/autoencoder/models/**',
      'engines/autoencoder/preprocessing/**',
      'engines/autoencoder/evaluation/**',
    ],
  },
  {
    files: ['backend/**/*.js', 'engines/**/*.js', 'scripts/**/*.mjs', 'e2e/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
];
