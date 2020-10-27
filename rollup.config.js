import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import image from '@rollup/plugin-image'

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    file: 'lib/simple-vue-mind-map.min.js',
    name: 'MindMap'
  },
  plugins: [
    commonjs(),
    resolve(),
    vue(),
    image(),
    babel({
      babelHelpers: 'runtime'
    }),
    terser()
  ]
}
