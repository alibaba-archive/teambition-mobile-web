'use strict'
import * as gulp from 'gulp'
import * as merge2 from 'merge2'

const greplace = require('gulp-replace')

export const replaceConfig = (env: string, target: string) => {
  const envConfig = require(`../../config/${env}.json`)
  const apphost = envConfig.hosts[target]
  const thirdLib = envConfig.scripts[target]
  const defaultConfig = require('../../config/default.json')

  const source = gulp.src(`./.tmp/app.js`)
  const keys = Object.keys(envConfig)
  const version = require('../../package.json').version
  keys.forEach((key) => {
    if (typeof envConfig[key] === 'string') {
      source.pipe(greplace(defaultConfig[key], envConfig[key]))
    }
  })
  return new Promise((resolve, reject) => {
    source.pipe(greplace('{{__version}}', version))
      .pipe(greplace('{{__apphost}}', apphost))
      .pipe(gulp.dest(`./.tmp/`))
      .on('end', () => {
        resolve()
      })
  })
}

export const replaceHtml = (env: string, target: string) => {
  const envConfig = require(`../../config/${env}.json`)
  const thirdLib = envConfig.scripts[target]
  return new Promise((resolve, reject) => {
    gulp.src(`www/index.html`)
      .pipe(greplace('{{__third.lib.script}}', thirdLib))
      .pipe(gulp.dest(`www/`))
      .on('end', () => {
        resolve()
      })
  })
}
