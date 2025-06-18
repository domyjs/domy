import fs from 'fs';
import path from 'path';
import ts from 'rollup-plugin-ts';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import alias from '@rollup/plugin-alias';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import config from '../tsconfig.json';

const filters = ['docs'];
const toBuild = process.argv[2]?.split(',');

const packageRoot = path.resolve('./packages');

// 🔁 Génère les alias @domyjs/* -> ./packages/*/src/index.ts
function getDomyAliases(): { find: string; replacement: string }[] {
  return fs
    .readdirSync(packageRoot)
    .filter(dir => {
      const fullPath = path.join(packageRoot, dir);
      return fs.statSync(fullPath).isDirectory() && !filters.includes(dir);
    })
    .map(dir => ({
      find: `@domyjs/${dir}`,
      replacement: path.join(packageRoot, dir, 'src/index.ts')
    }));
}

(async () => {
  const packages = fs.readdirSync(packageRoot).filter(dir => {
    if (filters.includes(dir) || (toBuild && !toBuild.includes(dir))) return false;
    return fs.statSync(path.join(packageRoot, dir)).isDirectory();
  });

  const sorted = ['domy', 'reactive'];
  const sortedPackages = toBuild
    ? packages
    : [...sorted, ...packages.filter(name => !sorted.includes(name))];

  console.log('Building packages:', sortedPackages.join(', '));

  for (const packageName of sortedPackages) {
    const inputPath = path.join(packageRoot, packageName, 'src/index.ts');
    const outPath = path.join(packageRoot, packageName, 'dist');

    const packageJsonPath = path.join(packageRoot, packageName, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const aliases = alias({
      entries: getDomyAliases()
    });

    // JS build (UMD + minify)
    const jsOptions: RollupOptions = {
      input: inputPath,
      output: {
        name: packageJson.buildName ?? packageName,
        file: path.join(outPath, 'index.js'),
        format: 'umd',
        sourcemap: true
      },
      plugins: [ts(config), terser()]
    };

    const jsBundle = await rollup(jsOptions);
    await jsBundle.write(jsOptions.output as OutputOptions);

    // DTS build (with alias resolution)
    const dtsOptions: RollupOptions = {
      input: path.join(outPath, 'index.d.ts'),
      output: {
        file: path.join(outPath, 'index.d.ts'),
        format: 'es'
      },
      plugins: [aliases, dts()],
      external: [] // force inlining of all local types
    };

    const dtsBundle = await rollup(dtsOptions);
    await dtsBundle.write(dtsOptions.output as OutputOptions);

    console.log(`[SUCCESS] Successfully built ${packageName}`);
  }
})();
