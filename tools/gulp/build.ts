'use strict'
import * as gulp from 'gulp'
import * as path from 'path'
import * as del from 'del'
import * as concat from 'gulp-concat'
import * as sourcemaps from 'gulp-sourcemaps'
import libjs from './lib'
import {replaceConfig, replaceHtml} from './replace'
import bundle from './bundle'
import less from './less'
import et from './build.et'
import {statics} from './static'

process.on('unhandledRejection', (reason: any, P: Promise<any>) => {
  console.error(reason)
})

const clean = (): Promise<string[]> => {
  return del([
    './www',
    './dist',
    './.tmp'
  ]).then((value) => {
    console.log(value)
    return value
  })
}

export const concatApp = async function (env: string, target: string): Promise<NodeJS.ReadWriteStream> {
  await replaceConfig(env, target)
  const stream = gulp.src([
    './.tmp/scripts/**/*.js',
    `./.tmp/app.js`
  ])
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`www/js/`))
  return await new Promise<NodeJS.ReadWriteStream>((resolve, reject) => {
    stream.on('end', function () {
      resolve(stream)
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
  await clean()
  await Promise.all([
    libjs(target),
    et(),
    bundle(entry, target),
    less(target),
    statics(target)
  ])
  await replaceHtml(env, target)
  const promise = await concatApp(env, target)
  callback ? callback() : null
  return promise
}
