import * as fs from 'fs';
import * as path from 'path';

const tsconfigPath = path.resolve('tsconfig.json');
const notificationsCorePath = 'notifications-core/**/*';
const packageJsonPath = path.resolve('notifications-core/package.json');
const rootPackageJsonPath = path.resolve('package.json');

function updateTsconfig() {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  if (!tsconfig.include) tsconfig.include = [];
  if (!tsconfig.include.includes(notificationsCorePath)) {
    tsconfig.include.push(notificationsCorePath);
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ tsconfig.json updated with notifications-core include.');
  } else {
    console.log('ℹ️ notifications-core already included in tsconfig.json.');
  }
}

function createPackageJson() {
  if (fs.existsSync(packageJsonPath)) {
    console.log('ℹ️ notifications-core/package.json already exists.');
    return;
  }
  const pkg = {
    name: 'notifications-core',
    version: '1.0.0',
    main: 'index.js',
    scripts: {
      docs: 'npx typedoc --entryPointStrategy expand --out docs/api .',
      build: 'tsc -p .',
    },
    dependencies: {},
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  console.log('✅ notifications-core/package.json created.');
}

function updateRootPackageJson() {
  if (!fs.existsSync(rootPackageJsonPath)) {
    console.warn('⚠️ root package.json not found, skipping root script update.');
    return;
  }
  const pkg = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
  if (!pkg.scripts) pkg.scripts = {};
  if (!pkg.scripts.docs) {
    pkg.scripts.docs = 'npx typedoc --entryPointStrategy expand --out notifications-core/docs/api notifications-core';
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(pkg, null, 2));
    console.log('✅ Root package.json script "docs" added.');
  } else {
    console.log('ℹ️ Root package.json already has a "docs" script.');
  }
}

function main() {
  updateTsconfig();
  createPackageJson();
  updateRootPackageJson();
}

main();
