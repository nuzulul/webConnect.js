import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webConnect.js',
  output: [
    {
      file: 'public/bundle/webConnect.umd.js',
      format: 'umd',
      name: 'webconnect',
    },
    {
      file: 'public/bundle/webConnect.ems.js',
      format: 'es',
    },
  ],
  plugins: [nodeResolve({browser: true}), commonjs()]
}
]