const path = require('path');

module.exports = {
  // Extend the existing webpack configuration
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        // Ignore source map warnings from the wgsl_reflect package
        exclude: /node_modules\/wgsl_reflect/,
      },
    ],
  },
  // Ignore warnings for specific modules
  ignoreWarnings: [
    {
      module: /wgsl_reflect/,
    },
  ],
}; 