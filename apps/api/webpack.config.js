const path = require('path');

module.exports = function(options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        '@shared': path.resolve(__dirname, '../../packages/shared/src')
      },
      extensions: ['.ts', '.js']
    }
  };
};
