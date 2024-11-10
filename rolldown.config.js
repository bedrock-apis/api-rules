import { defineConfig } from 'rolldown';

const config = defineConfig({
  input: 'src/index.ts',
  external: [
    /typescript/g,
    /eslint/g,
    /^node:/g
  ],
  output: {
    file: `index.js`
  }
});

export default config;