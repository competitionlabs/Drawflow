const webpackDevConfig = require('./webpack.dev.config');
const webpackProdConfig = require('./webpack.prod.config');

module.exports = (env) => {
  if (process.env && process.env.mode) {
    return (process.env.mode === "prod") ? webpackProdConfig : webpackDevConfig;
  } else {
    return webpackDevConfig;
  }
};

// module.exports = {
//   entry: './src/drawflow.js',
//   output: {
//     library: 'Drawflow',
//     libraryTarget: 'umd',
//     libraryExport: 'default',
//     filename: 'drawflow.min.js',
//     globalObject: `(typeof self !== 'undefined' ? self : this)`
//   }
// };
