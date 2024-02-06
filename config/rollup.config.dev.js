import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webconnect.js',
  output: [
    {
      file: 'public/bundle/webconnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    },
    {
      file: 'public/bundle/webconnect.ems.js',
      format: 'es',
    },
  ],
  plugins: [nodeResolve({browser: true}), commonjs()]
}
]