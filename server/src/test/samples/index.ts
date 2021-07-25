// esbuild allows text files to be imported
const holiday: string = require('./holiday.elsql');
const sample: string = require('./sample.elsql');

// this allows them to be imported in a TypeScript-friendly way
export { holiday, sample };
