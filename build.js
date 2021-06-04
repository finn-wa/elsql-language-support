const esbuild = require('esbuild');

/** @type {esbuild.BuildOptions} */
const baseConfig = {
  bundle: true,
  format: 'cjs',
  platform: 'node',
  external: ['vscode'],
  logLevel: 'info',
  outdir: 'out',
};

/** @type {Record<string,esbuild.BuildOptions>} */
const configs = {
  dev: {
    watch: true,
    sourcemap: 'inline',
  },
  prod: {
    minify: true,
  },
};

const clientEntry = './client/src/extension.ts';
const serverEntry = './server/src/server.ts';

/** @type {Record<string,esbuild.BuildOptions>} */
const targets = {
  client: {
    entryPoints: [clientEntry],
    tsconfig: './client/tsconfig.json',
  },
  server: {
    entryPoints: [serverEntry],
    tsconfig: './server/tsconfig.json',
  },
  all: {
    entryPoints: [serverEntry, clientEntry],
    tsconfig: './tsconfig.json',
  },
};

const args = process.argv.slice(2);
if (
  args.length != 2 ||
  !Object.keys(configs).includes(args[0]) ||
  !Object.keys(targets).includes(args[1])
) {
  console.log(`Expected args in the following format:
node build.js <CONFIG> <TARGET>
CONFIG = ${Object.keys(configs).join('|')}
TARGET = ${Object.keys(targets).join('|')}
`);
  process.exit(1);
}

const config = configs[args[0]];
const target = targets[args[1]];

esbuild.build({ ...baseConfig, ...config, ...target }).catch(() => process.exit(1));
