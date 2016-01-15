'use strict'
import {webpack, concatApp} from './build'
import {minHtml} from './static'
import et from './build.et'
import less from './less'
import lint from './lint'
import * as watch from 'gulp-watch'
import * as gutil from 'gulp-util'

export default async function (env: string, target: string) {
  watch([
    `./src/${target}/**/*.html`,
    '!./src/index.html'
  ], async function(event) {
    minHtml(target).on('end', () => {
      gutil.log(gutil.colors.green('minHtml complete'))
    })
  })

  watch(['./.tmp/scripts/**/*.js'], async function (event) {
    await concatApp(env, target)
    gutil.log(gutil.colors.blue('concat complete'))
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
    gutil.log(gutil.colors.cyan('et compile complete'))
  })

  watch('./src/**/*.ts', (event) => {
    lint()
  })
  .on('error', function (error) {
    gutil.log(error)
    this.emit('end')
  })

  return await webpack(env, target, true, async function (resolve) {
    gutil.log(gutil.colors.yellow('webpack complete'))
    await concatApp(env, target)
    gutil.log(gutil.colors.cyan('concat app complete'))
    resolve()
  })

}
