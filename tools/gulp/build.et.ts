'use strict'
import * as gulp from 'gulp'
import * as concat from 'gulp-concat'
import * as through from 'through2'

const ET = require('et-template')

export default () => {
  const option = {
    modules: 'angular',
    modelType: 'event'
  }
  const et = new ET(option)
  const compile = () => {
    return through.obj(function (file, enc, next) {
      if (!file.isBuffer()) {
        return next()
      }
      const moduleId = file.path.split('/')
      const pathLength = moduleId.length
      const moduleId0 = moduleId[pathLength - 3] || ''
      const moduleId1 = moduleId[pathLength - 2] || ''
      const moduleId2 = moduleId[pathLength - 1].split('.')[0]
      const moduleName = moduleId0 + '_' + moduleId1 + '_' + moduleId2
      const contents = et.compile(file.contents.toString(), {
        moduleId: moduleName,
        angularModuleName: 'ET-Template'
      })
      file.contents = new Buffer(contents)
      file.path = file.path.replace(/\.html/, '.js')
      this.push(file)
      next()
    })
  }
  return new Promise((resolve, reject) => {
    gulp.src('./src/components/et/**/*.html')
      .pipe(compile())
      .pipe(concat('et.js'))
      .pipe(gulp.dest('.tmp/scripts/et/'))
      .on('end', () => {
        resolve()
      })
  })
}
