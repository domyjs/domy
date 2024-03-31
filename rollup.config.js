const fs = require('fs');
const path = require('path');

const ts = require('rollup-plugin-ts');
const terser = require('@rollup/plugin-terser');

const config = require('./tsconfig.json');

module.exports = [
  {
    input: './src/index.ts',
    output: [
      {
        name: 'DOMY',
        file: './dist/index.js',
        format: 'umd',
        sourcemap: true
      }
    ],
    plugins: [ts(config), terser()]
  }
  // Plugins auto genration
  // ...fs.readdirSync('./src/plugins').map(file => ({
  //   input: `./src/plugins/${file}`,
  //   output: {
  //     name: file.split('.')[0],
  //     file: `./dist/plugins/${path.basename(file, '.ts')}.js`,
  //     format: 'umd',
  //     sourcemap: true
  //   },
  //   plugins: [ts(config), terser()]
  // }))
];
