const { program, Option } = require('commander');
const { fork } = require('child_process');
const esbuild = require('esbuild');
const glob = require('fast-glob');
const fs = require('fs/promises');

/**
 * Runs jasmine tests. Takes onRebuild args.
 *
 * @param {esbuild.BuildFailure} error
 * @param {esbuild.BuildResult} _result
 */
function runJasmine(error, _result) {
  if (!error) {
    fork(__dirname + '/test');
  }
}

/**
 * Produces build options from CLI args.
 *
 * @param {ProgramArgs} args
 * @returns {esbuild.BuildOptions}
 */
function getBuildOptions(args) {
  /** @type {esbuild.BuildOptions} */
  const buildOptions = {
    bundle: true,
    format: 'cjs',
    logLevel: 'info',
    outdir: 'out',
    platform: 'node',
    tsconfig: './tsconfig.json',
    sourcemap: args.sourcemap ? 'inline' : false,
    minify: args.target === 'prod',
  };

  if (args.target === 'test') {
    buildOptions.entryPoints = glob.sync('./server/src/**/*.ts');
    if (args.watch) {
      buildOptions.watch = { onRebuild: runJasmine };
    }
  } else {
    buildOptions.entryPoints = ['./client/src/extension.ts', './server/src/server.ts'];
    buildOptions.external = ['vscode'];
    buildOptions.watch = args.watch;
  }
  return buildOptions;
}

/**
 * Runs esbuild.
 *
 * @param {esbuild.BuildOptions} options
 * @returns {Promise<esbuild.BuildResult>}
 */
async function build(options) {
  await fs.rm(options.outdir, { recursive: true, force: true });
  return esbuild.build(options);
}

/**
 * CLI arguments passed to this program
 * @typedef ProgramArgs
 * @property { 'dev' | 'test' | 'prod'} target build target
 * @property {boolean} watch rebuild on file change.
 * @property {boolean} sourcemap produce sourcemaps for debugging
 */
program
  .addOption(
    new Option('-t, --target <target>', 'build target')
      .choices(['dev', 'test', 'prod'])
      .makeOptionMandatory()
  )
  .option('-w, --watch', 'rebuild on file changes', false)
  .option('-s, --sourcemap', 'produce sourcemaps for debugging', false)
  .parse();

const buildOptions = getBuildOptions(program.opts());
build(buildOptions).catch(() => process.exit(1));
