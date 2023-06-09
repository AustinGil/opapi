module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'jsdoc',
    'security',
    'unicorn',
    // 'vue',
    // 'vuejs-accessibility',
    // 'react',
    // 'jsx-a11y',
  ],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:jsdoc/recommended',
    'plugin:security/recommended',
    'plugin:solid/recommended',
    // 'plugin:vue/recommended',
    // "plugin:vuejs-accessibility/recommended",
    // 'plugin:react/recommended',
    // 'plugin:jsx-a11y/recommended',
  ],

  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],

    'jsdoc/no-undefined-types': [
      'error',
      {
        definedTypes: [
          'Record',
          'Pick',
          'T',
          'SubmitEvent',
          'AsyncIterable',
          'Awaited',
          'ReturnType',
        ],
      },
    ],
    'jsdoc/require-param-description': 'off',
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/require-property-description': 'off',
    'jsdoc/valid-types': 'off',

    // 'vue/require-prop-types': ['error']
    // 'vue/max-attributes-per-line': 'off',
    // 'vue/custom-event-name-casing': 'off',
    // 'vue/no-template-shadow': 'off',
    // 'vue/html-self-closing': [
    //   'error',
    //   {
    //     html: {
    //       void: 'any',
    //     },
    //   },
    // ],
  },
};
