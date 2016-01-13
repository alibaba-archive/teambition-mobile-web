'use strict'
import * as gulp from 'gulp'
import * as path from 'path'
import * as merge2 from 'merge2'
import * as rimraf from 'rimraf'
import * as concat from 'gulp-concat'
import libjs from './lib'
import replace from './replace'
import bundle from './bundle'
import less from './less'
import et from './build.et'
import {statics} from './static'

const clean = () => {
  let count = 0
  return new Promise((resolve, reject) => {
    rimraf('www', () => {
      count ++
      count === 3 ? resolve() : null
    })
    rimraf('dist', () => {
      count ++
      count === 3 ? resolve() : null
    })
    rimraf('.tmp', () => {
      count ++
      count === 3 ? resolve(): null
    })
  })
}

export const concatApp = (env: string, target: string) => {
  const stream = gulp.src([
    './.tmp/scripts/**/*.js',
    `./www/js/app.js`
  ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest(`www/js/`))
  return new Promise((resolve, reject) => {
    stream.on('end', async function () {
      await replace(env, target)
      resolve()
    })
  })
}

export const webpack = async function(
  env: string,
  target: string,
  watch?: boolean,
  callback?: Function
) {
  const entry = [
    path.join(process.cwd(), `src/${target}/index.ts`)
  ]
  const output = path.join(process.cwd(), `www/js`)
  return bundle(entry, target, null, false, watch, callback)
}

export const buildBundle = async function(
  env: string,
  target: string,
  callback?: Function
) {
  const entry = [
    path.join(process.cwd(), `src/${target}/index.ts`)
  ]
  const output = path.join(process.cwd(), `www/js`)
  await clean()
  await Promise.all([
    libjs(target),
    et(),
    bundle(entry, target),
    less(target),
    statics(target)
  ])
  const promise = await concatApp(env, target)
  callback ? callback() : null
  return promise
}
