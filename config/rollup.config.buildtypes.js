import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webConnect.js',
  output: [
    {
      file: 'public/umd/webConnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    },
    {
      file: 'public/esm/webConnect.esm.js',
      format: 'es',
    },
  ],
  plugins:[]
}
]