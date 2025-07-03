import path from 'path';
import fs from 'fs/promises';
import prompts from 'prompts';
import fg from 'fast-glob';
import semver from 'semver';
import { execa } from 'execa';

const PACKAGES_DIR = path.resolve(__dirname, '../packages');

async function findPackages(): Promise<string[]> {
  const dirs = await fg('*/package.json', {
    cwd: PACKAGES_DIR,
    ignore: ['docs/**']
  });
  return dirs.map(file => path.dirname(file));
}

async function readPackage(pkgDir: string) {
  const pkgPath = path.join(PACKAGES_DIR, pkgDir, 'package.json');
  const content = await fs.readFile(pkgPath, 'utf-8');
  return {
    path: pkgPath,
    dir: path.join(PACKAGES_DIR, pkgDir),
    json: JSON.parse(content)
  };
}

async function main() {
  const packageDirs = await findPackages();

  const packageChoices = packageDirs.map(name => ({
    title: name,
    value: name
  }));

  const { selectedPackages } = await prompts({
    type: 'multiselect',
    name: 'selectedPackages',
    message: 'Which package(s) do you want to update ?',
    choices: [...packageChoices],
    min: 1
  });

  const updates: {
    name: string;
    oldVersion: string;
    newVersion: string;
    dir: string;
    path: string;
  }[] = [];

  for (const pkg of selectedPackages) {
    const pkgData = await readPackage(pkg);
    const { name, version } = pkgData.json;

    const { bumpType } = await prompts({
      type: 'select',
      name: 'bumpType',
      message: `What kind of update ${name}@${version} ?`,
      choices: [
        { title: 'first release', value: 'first' },
        { title: 'patch', value: 'patch' },
        { title: 'minor', value: 'minor' },
        { title: 'major', value: 'major' }
      ]
    });

    let newVersion = version;
    if (bumpType !== 'first') {
      newVersion = semver.inc(version, bumpType as semver.ReleaseType)!;
    }

    if (newVersion !== version) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Confirm ${name}: ${version} → ${newVersion} ?`
      });

      if (!confirm) continue;

      pkgData.json.version = newVersion;
      await fs.writeFile(pkgData.path, JSON.stringify(pkgData.json, null, 2));
    }

    updates.push({
      name,
      oldVersion: version,
      newVersion,
      dir: pkgData.dir,
      path: pkgData.path
    });
  }

  if (updates.length === 0) {
    console.log('\nNo update made.');
    return;
  }

  console.log('\n Summary of changes :');
  updates.forEach(({ name, oldVersion, newVersion }) => {
    console.log(`- ${name}: ${oldVersion} → ${newVersion}`);
  });

  const { confirmPublish } = await prompts({
    type: 'confirm',
    name: 'confirmPublish',
    message: 'Do you want to publish the updated packages ?'
  });

  if (!confirmPublish) return;

  try {
    console.log('\n🛠️ Running build...');
    await execa('npm', ['run', 'build'], { stdio: 'inherit' });

    console.log('\n🧪 Running tests...');
    await execa('npm', ['test'], { stdio: 'inherit' });

    for (const { dir, name, newVersion } of updates) {
      console.log(`\n📦 Publication of ${name}@${newVersion}...`);
      await execa('npm', ['publish', '--access', 'public'], {
        cwd: dir,
        stdio: 'inherit'
      });
    }

    console.log('\n✅ Publication finish.');
  } catch (e) {
    console.error(e);
  }
}

main();
