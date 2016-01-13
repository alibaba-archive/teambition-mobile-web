'use strict'
import * as gulp from 'gulp'
import * as sourcemaps from 'gulp-sourcemaps'
import * as merge2 from 'merge2'
import * as concat from 'gulp-concat'
import * as less from 'gulp-less'
import * as autoprefixer from 'gulp-autoprefixer'
import {logError} from '../../gulpfile'

export default (target: string) => {
  const paths = {
    less: [
      './src/less/*.less',
      './src/components/**/*.less',
      `./src/${target}/**/*.less`
    ],
    tbui: [
      './src/less/tb-fonts-variables.less',
      './tools/libs/less/teambition-ui-variables.less',
      './tools/libs/less/teambition-ui-icons.less'
    ]
  }

  const stream = merge2(
    gulp.src(paths.tbui)
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(concat('tbui.less'))
      .pipe(logError(less()))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))
      .pipe(sourcemaps.write()),
    gulp.src(paths.less)
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(logError(less()))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))
      .pipe(sourcemaps.write())
  )
  .pipe(sourcemaps.init({
    loadMaps: true
  }))
  .pipe(concat('app.css'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(`www/css/`))

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      resolve()
    })
  })
}
