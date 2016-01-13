'use strict'
import * as gulp from 'gulp'
import * as concat from 'gulp-concat'
import * as merge2 from 'merge2'

const minifyHtml = require('gulp-htmlmin')
const ngTemplate = require('gulp-ng-template')

export const minHtml = (target: string) => {
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
    .pipe(gulp.dest('.tmp/scripts/template/'))
}

export const statics = (target: string) => {
  let count = 0
  return new Promise((resolve, reject) => {
    gulp.src('src/index.html')
      .pipe(gulp.dest(`www`))
      .on('end', () => {
        count ++
        count === 5 ? resolve() : null
      })
    gulp.src(['./src/images/*'])
      .pipe(gulp.dest(`www/images/`))
      .on('end', () => {
        count ++
        count === 5 ? resolve() : null
      })
    minHtml(target)
    .on('end', () => {
      count ++
      count === 5 ? resolve() : null
    })
    gulp.src([
      'node_modules/ionic-release/fonts/*',
      'tools/libs/fonts/teambition*'
    ])
      .pipe(gulp.dest(`www/fonts/`))
      .on('end', () => {
        count ++
        count === 5 ? resolve() : null
      })
    gulp.src('node_modules/ionic-release/css/ionic.css')
      .pipe(concat('lib.css'))
      .pipe(gulp.dest(`www/css/`))
      .on('end', () => {
        count ++
        count === 5 ? resolve() : null
      })
  })
}