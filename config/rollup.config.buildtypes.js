import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webconnect.js',
  output: [
    {
      file: 'public/umd/webconnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    },
    {
      file: 'public/esm/webconnect.esm.js',
      format: 'es',
    },
  ],
  plugins:[]
}
]