const Jasmine = require('jasmine');
const { SpecReporter } = require('jasmine-spec-reporter');

function getJasmine() {
  const jasmine = new Jasmine();
  jasmine.loadConfig({
    spec_dir: 'out',
    spec_files: ['**/*.spec.js'],
  });
  jasmine.clearReporters();
  jasmine.addReporter(
    new SpecReporter({
      spec: { displayPending: true },
    })
  );
  jasmine.onComplete((_passed) => console.log('\n[test] tests finished'));
  return jasmine;
}

console.log('[test] tests started\n');
getJasmine().execute();
