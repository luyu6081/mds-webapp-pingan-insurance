module.exports = {
  root: true,
  env: {
    node: true,
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'never'],
    'vue/script-indent': ['error', 2, {baseIndent: 1, switchCase: 1}],
    // 项目允许在需要注释时换行书写 else，但 ESLint 不允许混用多种 if-else 风格，因此只得停用此规则。
    // 详见项目编码规范
    'brace-style': 'off',
    'graphql/template-strings': ['error', {env: 'literal', projectName: 'app'}],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'indent': 'off',
      },
    },
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: [
    'graphql',
  ],
}
