// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  // Base
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project-wide rules
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // No raw SQL bypassing the tenant-aware query helper.
      // (Custom rule placeholder — implement via no-restricted-syntax in CI later.)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'eqeqeq': ['error', 'always'],
      'prefer-const': 'error',
    },
  },

  // Frontend (React)
  {
    files: ['frontend/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Vite + React 18
      'react/prop-types': 'off', // We use TypeScript
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Test files — looser
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Ignore
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.turbo/',
      'coverage/',
      'playwright-report/',
      '**/*.d.ts',
    ],
  },
);
