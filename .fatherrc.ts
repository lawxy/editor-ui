import { defineConfig } from 'father';

export default defineConfig({
  esm: { output: 'es' },
  cjs: { output: 'lib' },
  umd: {
    output: 'umd',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      antd: 'antd',
    },
  },
});
