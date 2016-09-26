'use strict'
import * as gulp from 'gulp'
import * as merge2 from 'merge2'
import * as greplace from 'gulp-replace'

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
      .pipe(greplace('{{__ENV}}', env === 'default' ? 'ci' : env))
      .pipe(greplace('{{__apphost}}', apphost))
      .pipe(greplace('{{__PLATFORM}}', target))
      .pipe(greplace('{{__ACCOUNTSHOST}}', envConfig.accountsHost))
      .pipe(gulp.dest(`./.tmp/`))
      .on('end', () => {
        resolve()
      })
  })
}

export const replaceHtml = (env: string, target: string) => {
  const envConfig = require(`../../config/${env}.json`)
  const thirdLib = envConfig.scripts[target]
  const stream = gulp.src(`www/index.html`)
      .pipe(greplace('{{__third.lib.script}}', thirdLib))
  if (target !== 'qqgroup') {
    stream.pipe(greplace('name="main"', ''))
  }
  return new Promise((resolve, reject) => {
    stream.pipe(gulp.dest(`www/`))
      .on('end', () => {
        resolve()
      })
  })
}
