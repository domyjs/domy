import fs from 'fs';
import path from 'path';
import ts from 'rollup-plugin-ts';
import terser from '@rollup/plugin-terser';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import config from '../tsconfig.json';

// Filters for directories to ignore
const filters = ['docs'];

// Argument to target a specific package to build
const toBuild = process.argv[2]?.split(',');

(async () => {
  // Read directories within the packages folder
  const packages = fs.readdirSync('./packages').filter(dir => {
    if (filters.includes(dir) || (toBuild && !toBuild.includes(dir))) return false;
    return fs.statSync(path.join('./packages', dir)).isDirectory();
  });

  // Ensure domy is build first because plugin depends of it (same for reactive)
  const sorted = ['domy', 'reactive'];
  const sortedPackages = toBuild
    ? packages
    : [...sorted, ...packages.filter(name => !sorted.includes(name))];

  console.log('Building packages: ', sortedPackages.join(','));

  for (const packageName of sortedPackages) {
    // Read and parse the package.json file
    const packageJsonPath = `./packages/${packageName}/package.json`;
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Rollup configuration for each package
    const options: RollupOptions = {
      input: `./packages/${packageName}/src/index.ts`,
      output: {
        name: packageJson.buildName ?? packageName,
        file: `./packages/${packageName}/dist/index.js`,
        format: 'umd',
        sourcemap: true
      },
      plugins: [ts(config), terser()]
    };

    // Create a bundle
    const bundle = await rollup(options);

    // Write the bundle to disk
    if (options.output) {
      await bundle.write(options.output as OutputOptions);
    }

    console.log(`[SUCESS] Successfully built ${packageName}`);
  }
})();
