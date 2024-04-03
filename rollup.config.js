const fs = require('fs');
const path = require('path');

const ts = require('rollup-plugin-ts');
const terser = require('@rollup/plugin-terser');

const config = require('./tsconfig.json');

const filters = ['docs'];

const packages = fs.readdirSync('./packages').filter(dir => {
  if (filters.includes(dir)) return false;
  return fs.statSync(path.join('./packages', dir)).isDirectory();
});

// We compile types first because other package depends from it
const sortedPackages = ['types', ...packages.filter(pkg => pkg !== 'types')];

const packageConfigs = sortedPackages.map(packageName => {
  return {
    input: `./packages/${packageName}/src/index.ts`,
    output: [
      {
        name:
          JSON.parse(fs.readFileSync(`./packages/${packageName}/package.json`)).buildName ??
          packageName,
        file: `./packages/${packageName}/dist/index.js`,
        format: 'umd',
        sourcemap: true
      }
    ],
    plugins: [ts(config), terser()]
  };
});

module.exports = packageConfigs;
