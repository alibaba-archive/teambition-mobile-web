'use strict'
import * as gulp from 'gulp'
import * as concat from 'gulp-concat'
import * as merge2 from 'merge2'

const minifyHtml = require('gulp-htmlmin')
const ngTemplate = require('gulp-ng-template')

export const minHtml = (target: string): NodeJS.ReadWriteStream => {
  return gulp.src([
    `./src/${target}/**/*.html`,
    './src/components/directives/**/*.html'
  ])
    .pipe(minifyHtml({empty: true, quotes: true}))
    .pipe(ngTemplate({
      moduleName: 'tbTemplates',
      standalone: true,
      filePath: 'templates.js'
    }))
    .pipe(gulp.dest('./.tmp/scripts/template/'))
}

export const Promiseify = (stream: NodeJS.ReadWriteStream) => {
  return new Promise((resolve, reject) => {
    stream.on('end', e => {
      resolve()
    })
    .on('error', e => {
      reject(e)
    })
  })
}

export const statics = (target: string) => {
  return Promise.all([
    Promiseify( gulp.src('src/index.html')
      .pipe(gulp.dest(`www`))
    ),
    Promiseify(gulp.src(['./src/images/*'])
      .pipe(gulp.dest(`www/images/`))
    ),
    Promiseify(minHtml(target)),
    Promiseify( gulp.src([
      'node_modules/ionic-release/fonts/*',
      'tools/libs/fonts/teambition*'
      ])
        .pipe(gulp.dest(`www/fonts/`))
    ),
    Promiseify(gulp.src('node_modules/ionic-release/css/ionic.css')
      .pipe(concat('lib.css'))
      .pipe(gulp.dest(`www/css/`))
    )
  ])
}
