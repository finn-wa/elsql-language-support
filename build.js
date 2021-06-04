const esbuild = require('esbuild');

/** @type {esbuild.BuildOptions} */
const baseConfig = {
  bundle: true,
  entryPoints: ['./client/src/extension.ts', './server/src/server.ts'],
  external: ['vscode'],
  format: 'cjs',
  logLevel: 'info',
  outdir: 'out',
  platform: 'node',
  tsconfig: './tsconfig.json',
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

const args = process.argv.slice(2);
if (args.length !== 1 || !Object.keys(configs).includes(args[0])) {
  console.log(`Expected args in the following format:
node build.js <CONFIG>
CONFIG = ${Object.keys(configs).join('|')}
`);
  process.exit(1);
}

const config = configs[args[0]];

esbuild.build({ ...baseConfig, ...config }).catch(() => process.exit(1));
