import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webconnect.js',
  output: [
    {
      file: 'public/bundle/webconnect.esm.js',
      format: 'es',
    },
  ],
  plugins: [nodeResolve({browser: true,preferBuiltins: false}), commonjs()]
},
{
  input: 'src/umd.js',
  output: [
    {
      file: 'public/bundle/webconnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    }
  ],
  plugins: [nodeResolve({browser: true,preferBuiltins: false}), commonjs()]
}
]