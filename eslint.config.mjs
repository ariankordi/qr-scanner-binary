import eslint from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import globals from 'globals';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const stylisticConfig = stylisticPlugin.configs.customize({
  indent: 4,
  quotes: 'single',
  semi: true,
  // commaDangle: 'never',
  braceStyle: '1tbs',
});

const ecmaVersion = 2015;

export default [
  // https://eslint.org/docs/rules/
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-console': 'off',
      'prefer-const': ['error', {
        destructuring: 'all', // Only error if all destructured variables can be const
      }],
      'no-var': 'error',
      'no-undef': 'off', // typescript handles this
      // TODO: 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' }],
      'one-var': ['error', 'never'],
      // 'curly': ['error', 'all'], // Always require curly braces

      'class-methods-use-this': 'error',
      'no-return-assign': 'error',
      'template-curly-spacing': 'error',
      // See: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-undefined.md#conflict-with-eslint-array-callback-return-and-getter-return-rules
      'getter-return': ['error', { allowImplicit: true }],
    },
  },

  // https://eslint.style/rules
  stylisticConfig,
  {
    rules: {
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/yield-star-spacing': ['error', 'after'],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
      '@stylistic/curly-newline': ['error', {
        multiline: true,
        consistent: true,
      }],
      '@stylistic/object-curly-newline': ['error', {
        multiline: true,
        consistent: true,
      }],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],

      // no opinion on indent style.
      '@stylistic/indent': 'off',
      /*
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 1,
        ignoredNodes: ['Program > ExpressionStatement > CallExpression > :last-child > *']
      }],
      */
      '@stylistic/max-len': ['warn', {
        code: 100,
        comments: 120,
        ignoreUrls: true, // Ignore long URLs
        ignoreStrings: true, // Ignore long strings
        ignoreTemplateLiterals: true, // Ignore long template literals
        ignoreRegExpLiterals: true, // Ignore regex
        ignoreTrailingComments: false, // Enforce trailing comment length
        ignoreComments: false, // Enforce all comment lines
      }],
    },
  },

  // https://www.npmjs.com/package/eslint-plugin-unicorn
  eslintPluginUnicorn.configs.unopinionated,
  {
    rules: {
      // Not a fan of the numeric separators, since I don't think those are a thing in C/C++.
      'unicorn/numeric-separators-style': 'off',
      // The below enforces that hex is always uppercase.
      'unicorn/number-literal-case': 'off',
      // 'unicorn/no-static-only-class': 'off',
      'unicorn/prefer-string-replace-all': 'off', // ES2021 only
      'unicorn/no-array-sort': 'off', // ES2023 only
      'unicorn/prefer-code-point': 'off', // Nullability does not match
      'unicorn/prefer-optional-catch-binding': 'off', // ES2017 only
      'unicorn/prefer-includes': 'off', // ES2017 only
      'unicorn/prefer-global-this': 'off',
    },
  },

  // TypeScript override
  {
    files: ['**/*.ts', '**/*.tsx', '*.mjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion,
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  {
    ignores: [
        '**/dist/', // Common build output directory
        '**/*.min.js', // Minified JavaScript files
        '**/*.all.js',
        '**/*.d.ts',
        'jsQR/', // submodule
    ],
  },
];
