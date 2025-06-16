// import fs from 'fs';
// import path from 'path';
// import { execSync } from 'child_process';
// import prompts from 'prompts';
// import semver from 'semver';

// const rootVersion = '1.0.0';
// const packagesDir = './packages';

// async function main() {
//   const response = await prompts({
//     type: 'select',
//     name: 'releaseType',
//     message: `Current version is ${rootVersion}. Choose release type:`,
//     choices: ['patch', 'minor', 'major'].map(type => ({
//       title: type,
//       value: type
//     }))
//   });

//   const nextVersion = semver.inc(rootVersion, response.releaseType);
//   if (!nextVersion) throw new Error('Invalid version bump');

//   const confirm = await prompts({
//     type: 'confirm',
//     name: 'value',
//     message: `Release version ${nextVersion}?`,
//     initial: true
//   });

//   if (!confirm.value) {
//     console.log('Cancelled');
//     process.exit(0);
//   }

//   // Update root package.json
//   const rootPkgPath = './package.json';
//   const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
//   rootPkg.version = nextVersion;
//   fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');

//   // Update each package.json version
//   const packages = fs
//     .readdirSync(packagesDir)
//     .filter(dir => fs.statSync(path.join(packagesDir, dir)).isDirectory());

//   for (const pkgName of packages) {
//     const pkgPath = path.join(packagesDir, pkgName, 'package.json');
//     const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

//     pkgJson.version = nextVersion;

//     // Optional: also update internal dependencies (within your monorepo)
//     for (const depType of ['dependencies', 'peerDependencies']) {
//       const deps = pkgJson[depType];
//       if (deps) {
//         for (const dep in deps) {
//           if (packages.includes(dep) && deps[dep].startsWith('^')) {
//             deps[dep] = `^${nextVersion}`;
//           }
//         }
//       }
//     }

//     fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
//     console.log(`[UPDATED] ${pkgName}@${nextVersion}`);
//   }

//   // Run build
//   console.log('\n🔧 Building packages...');
//   execSync('ts-node scripts/build.ts', { stdio: 'inherit' });

//   // Git commit and tag
//   execSync('git add .', { stdio: 'inherit' });
//   execSync(`git commit -m "release: v${nextVersion}"`, { stdio: 'inherit' });
//   execSync(`git tag v${nextVersion}`, { stdio: 'inherit' });

//   // Optional: publish to npm
//   const publishConfirm = await prompts({
//     type: 'confirm',
//     name: 'value',
//     message: `Publish all packages to npm?`,
//     initial: false
//   });

//   if (publishConfirm.value) {
//     for (const pkgName of packages) {
//       const pkgPath = path.join(packagesDir, pkgName);
//       console.log(`📦 Publishing ${pkgName}...`);
//       execSync('npm publish --access public', {
//         cwd: pkgPath,
//         stdio: 'inherit'
//       });
//     }
//   }

//   console.log(`✅ Release ${nextVersion} complete.`);
// }

// main().catch(err => {
//   console.error(err);
//   process.exit(1);
// });
