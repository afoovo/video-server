// ESLint 9+ Flat Configuration - 优化版，集成Prettier
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import * as tsParser from '@typescript-eslint/parser';
import * as vueParser from 'vue-eslint-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // 基础忽略配置
  {
    ignores: [
      'dist/',
      'dist-ssr/',
      '*.local',
      'node_modules/',
      '*.log',
      '.vscode/*',
      '!.vscode/extensions.json',
      '.idea/',
      '.DS_Store',
      '*.sln',
      '*.sw?',
      '.env',
      '.env.*.local',
      'auto-imports.d.ts',
      'components.d.ts',
      'tsconfig.json',
      'tsconfig.node.json',
      '.cache/',
      'coverage/',
      '.prettierrc.cjs',
    ],
  },

  // 基础配置
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // 推荐配置
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // Vue和TypeScript配置（合并）
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  // TypeScript文件配置
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  // Prettier集成
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // 禁用与Prettier冲突的ESLint规则
  eslintConfigPrettier,

  // 核心规则
  {
    rules: {
      // Vue核心规则
      'vue/multi-word-component-names': ['warn', { ignores: ['index'] }],

      // JS核心规则
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',

      // 开发便利性规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
];
