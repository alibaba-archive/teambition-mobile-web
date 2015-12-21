/* global __dirname, process */
'use strict'

const gulp       = require('gulp')
const rename     = require('gulp-rename')
const concat     = require('gulp-concat')
const gutil      = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const merge2     = require('merge2')
const browserify = require('browserify')
const tsify      = require('tsify')
const source     = require('vinyl-source-stream')
const buffer     = require('vinyl-buffer')
const merge      = require('utils-merge')
const chalk      = require('chalk')

const entry = `./src/${process.env.BUILD_TARGET}/index.ts`

function map_error(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber || err.line)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description || err.message))
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message))
  }
}

gulp.task('lib-js', () => {
  return gulp.src([
    './node_modules/ionic-release/js/ionic.bundle.js',
    './node_modules/zone.js/dist/zone.js',
    './node_modules/spiderjs/index.js',
    './node_modules/moment/min/moment.min.js',
    './node_modules/et-dependency/ng/index.js',
    './node_modules/marked/lib/marked.js',
    './node_modules/angular-resource/angular-resource.js',
    './node_modules/gta/lib/index.js',
    './node_modules/ng-file-upload/dist/ng-file-upload-all.js',
    './node_modules/engine.io-client/engine.io.js',
    './node_modules/jsonrpc-lite/jsonrpc.js',
    './node_modules/snapper-consumer/index.js'
  ])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('www/js'))
})

let buildBundle = (bundler) => {
  return bundler.bundle()
    .on('error', map_error)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write())
}

gulp.task('compile-ts', () => {
  const bundler = browserify({
    entries: [
      './src/typings.d.ts',
      entry
    ],
    debug: true
  })
  .plugin(tsify, {
    target: 'ES5'
  })

  return buildBundle(bundler)
  .pipe(sourcemaps.init({
    loadMaps: true
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('.tmp/'))
})

module.exports = buildBundle
