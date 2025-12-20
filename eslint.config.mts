// eslint.config.ts
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // Базовые правила ESLint
  js.configs.recommended,

  // Рекомендованные правила TypeScript
  ...tseslint.configs.recommended,

  // Окружение: только Node.js
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Применяем к файлам в src
  {
    files: ['src/**/*.{ts,mts,js}'],
  },

  // Игнорируем ненужное
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '**/*.d.ts',
      '**/*.d.mts',
      '**/*.js',
    ],
  },

  // Кастомные правила
  {
    rules: {
      // Полностью отключаем запрет на console.log, console.error и т.д.
      'no-console': 'off',

      // Полностью отключаем запрет на any
      '@typescript-eslint/no-explicit-any': 'off',

      // Дополнительные полезные настройки (оставь по желанию)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-process-exit': 'off', // часто нужен в бэкенде
    },
  },
);