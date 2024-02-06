import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webconnect.js',
  output: [
    {
      file: 'dist/umd/webconnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    },
    {
      file: 'dist/esm/webconnect.esm.js',
      format: 'es',
    },
  ],
  plugins: [nodeResolve({browser: true}), commonjs()]
}
]