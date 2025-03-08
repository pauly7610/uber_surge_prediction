module.exports = {
    extends: ['react-app'],
    ignorePatterns: ['node_modules/wgsl_reflect/**/*'],
    rules: {
      // Suppress specific warnings if needed
      'import/no-webpack-loader-syntax': 'off',
    },
  };