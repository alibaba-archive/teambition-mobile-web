'use strict'
import * as gulp from 'gulp'
import * as lint from 'gulp-tslint'

const stylish = require('gulp-tslint-stylish')

export default () => {
  return gulp.src('./src/**/*.ts')
    .pipe(lint())
    .pipe(lint.report(stylish, {
      emitError: false
    }))
}
