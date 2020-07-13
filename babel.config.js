module.exports = {
  presets: [
    '@vue/app',
    '@vue/babel-preset-jsx',
    ['@babel/preset-env', {
      'useBuiltIns': 'usage',
      'corejs': 2,
      'targets': {
        'node': 'current',
      },
    }],
  ],
}
