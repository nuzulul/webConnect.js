import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webConnect.js',
  output: [
    {
      file: 'dist/umd/webConnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    },
    {
      file: 'dist/esm/webConnect.esm.js',
      format: 'es',
    },
  ],
  plugins: [nodeResolve({browser: true}), commonjs()]
}
]