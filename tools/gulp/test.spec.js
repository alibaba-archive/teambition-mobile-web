'use strict'

const gulp        = require('gulp')
const concat      = require('gulp-concat')
const batch       = require('gulp-batch')
const watch       = require('gulp-watch')
const browserify  = require('browserify')
const tsify       = require('tsify')
const sequence    = require('gulp-sequence')
const sourcemaps  = require('gulp-sourcemaps')
const browserSync = require('browser-sync')
const merge2      = require('merge2')
const buildBundle = require('./build')
const reload      = browserSync.reload

const cssLibsPath = [
  'node_modules/mocha/mocha.css'
];

gulp.task('build-css', () => {
  return gulp.src(cssLibsPath)
    .pipe(concat('lib-test.css'))
    .pipe(gulp.dest('.tmp/test/css/'))
})

gulp.task('compile-test', ['compile-et', 'compile-template'], () => {
  const bundler = browserify({
    entries: './test/entry.ts',
    debug: true
  })
  .plugin(tsify, {
    target: 'ES5'
  })
  return merge2(
    gulp.src('./.tmp/scripts/**/*.js'),
    buildBundle(bundler)
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write())
  )
  .pipe(sourcemaps.init({
    loadMaps: true
  }))
  .pipe(concat('app.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./.tmp/test/js/'))
})

gulp.task('move-app', () => {
  return gulp.src('test/index.html')
    .pipe(gulp.dest('.tmp/test'))
})

gulp.task('watch-test', () => {
  watch([
    './test/**/*.ts',
    './src/**/*.ts'
  ], batch((events, done) => {
    gulp.start('compile-test', done)
  }))

  watch(['./test/index.html'], batch((events, done) => {
    gulp.start('move-app', done)
  }))

})

gulp.task('test-serve', () => {
  browserSync({
    notify: false,
    port: 9001,
    server: {
      baseDir: ['.tmp/test'],
      routes: {
        '/test': '.tmp/test',
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch('.tmp/test/**').on('change', reload)
})

gulp.task('test', sequence(['build-css', 'compile-test', 'move-app'], 'test-serve'))