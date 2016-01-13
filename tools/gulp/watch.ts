'use strict'
import {webpack, concatApp} from './build'
import {minHtml} from './static'
import et from './build.et'
import less from './less'
import lint from './lint'
import * as watch from 'gulp-watch'
import * as gutil from 'gulp-util'

export default (env: string, target: string) => {
  watch([
    `src/${target}/**/*.html`
  ], async function (event) {
    minHtml(target)
    await concatApp(env, target)
  })

  watch([
    './src/less/*.less',
    './src/components/**/*.less',
    `src/${target}/**/*less`
  ], (event) => {
    less(target)
  })

  watch('./src/components/et/**/*.html', async function (event) {
    await et()
    await concatApp(env, target)
  })

  watch('./src/**/*.ts')
  .pipe(lint())
  .on('error', function (error) {
    gutil.log(error)
    this.emit('end')
  })

  webpack(env, target, true, async function (resolve) {
    await concatApp(env, target)
    resolve()
  })

}
