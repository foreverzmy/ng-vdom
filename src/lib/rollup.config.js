import resolve from 'rollup-plugin-node-resolve'
import sourcemaps from 'rollup-plugin-sourcemaps'
import uglify from 'rollup-plugin-uglify'

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
}

const plugins = [resolve(), sourcemaps()]

if (process.env.MINIFY) {
  plugins.push(uglify())
}

export default {
  format: 'es',
  exports: 'named',
  amd: {id: 'ng-vdom'},
  moduleName: 'ngVdom',
  sourcemap: true,
  plugins,
  external: Object.keys(globals),
  globals,
}
