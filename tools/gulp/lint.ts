'use strict'
import * as gulp from 'gulp'
import * as lint from 'gulp-tslint'

const stylish = require('gulp-tslint-stylish')

export default (files? : any) => {
  const source = files ? files : './src/**/*.ts'
  return gulp.src(source)
    .pipe(lint())
    .pipe(lint.report(stylish, {
      emitError: false
    }))
}
