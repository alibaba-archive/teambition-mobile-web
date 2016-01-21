import * as gulp from 'gulp'
import * as uglify from 'gulp-uglify'
import * as merge2 from 'merge2'
import * as greplace from 'gulp-replace'
import {buildBundle} from './build'
const RevAll = require('gulp-rev-all')
const cssNano = require('gulp-cssnano')
const cdnUploader = require('cdn-uploader')
const stripDebug = require('gulp-strip-debug')

export default async function (env: string, target: string, callback?: Function) {
  await buildBundle(env, target)

  const config = require(`../../config/${env}.json`)
  const cdnPrefix = `https://dn-st.teambition.net/${config.cdnNames[target]}`
  const revall = new RevAll({
    prefix: cdnPrefix,
    dontGlobal: [/\/favicon\.ico$/],
    dontRenameFile: [/\.html$/],
    dontUpdateReference: [/\.html$/],
    dontSearchFile: [/lib.js/, /images/]
  })

  const stream = merge2([
    gulp.src([
      `www/index.html`,
      `www/fonts/**`,
      `www/images/**`
    ]),
    gulp.src([
      `www/js/**`
    ])
      .pipe(stripDebug())
      .pipe(uglify())
      .pipe(greplace('/weixin/dev/signature', '/weixin/signature'))
      .pipe(greplace('/weixin/dev/tpl/message', '/weixin/tpl/message'))
      .pipe(greplace('http://"+window.location.host+"/images/teambition.png', '/images/teambition.png'))
      .pipe(greplace('/weixin/dev/', '/weixin/')),
    gulp.src([
      `www/css/**`
    ]).pipe(cssNano({rebase: false})),
  ])
    .pipe(revall.revision())
    .pipe(gulp.dest(`dist`), callback)

  return new Promise((resolve, reject) => {
    stream.on('end', async function() {
      resolve()
    })
  })
}
