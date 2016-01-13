'use strict'
import * as gulp from 'gulp'
import * as merge2 from 'merge2'

const greplace = require('gulp-replace')

export default (env: string, target: string) => {
  const envConfig = require(`../../config/${env}.json`)
  const apphost = envConfig.hosts[target]
  const thirdLib = envConfig.scripts[target]
  const defaultConfig = require('../../config/default.json')

  const source = gulp.src(`www/js/app.js`)
  const keys = Object.keys(envConfig)
  const version = require('../../package.json').version
  keys.forEach((key) => {
    if (typeof envConfig[key] === 'string') {
      source.pipe(greplace(defaultConfig[key], envConfig[key]))
    }
  })
  let count = 0
  return new Promise((resolve, reject) => {
    source.pipe(greplace('{{__version}}', version))
      .pipe(greplace('{{__apphost}}', apphost))
      .pipe(gulp.dest(`www/js/`))
      .on('end', () => {
        count ++
        count === 2 ? resolve() : null
      })
    gulp.src(`www/index.html`)
      .pipe(greplace('{{__third.lib.script}}', thirdLib))
      .pipe(gulp.dest(`www/`))
      .on('end', () => {
        count ++
        count === 2 ? resolve() : null
      })
  })
}