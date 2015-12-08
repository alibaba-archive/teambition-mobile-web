'use strict'

const gulp        = require('gulp')
const concat      = require('gulp-concat')
const batch       = require('gulp-batch')
const watch       = require('gulp-watch')
const tslint      = require('gulp-tslint')
const stylish     = require('gulp-tslint-stylish')
const typescript  = require('gulp-typescript')
const sequence    = require('gulp-sequence')
const sourcemap   = require('gulp-sourcemaps')
const browserSync = require('browser-sync')
const reload      = browserSync.reload


const cssLibsPath = [
  'node_modules/mocha/mocha.css'
];

gulp.task('build-css', () => {
  return gulp.src(cssLibsPath)
    .pipe(concat('lib-test.css'))
    .pipe(gulp.dest('.tmp/test/css/'))
})

gulp.task('compile-test', () => {
  return gulp.src([
    './test/**/*.ts'
  ])
    .pipe(sourcemap.init({loadMaps: true}))
    .pipe(tslint())
    .pipe(tslint.report(stylish, {
      emitError: false,
      sort: true,
      bell: true
    }))
    .pipe(typescript({
      'module': 'umd',
      'experimentalDecorators': true,
      'target': 'ES5'
    }))
    .pipe(sourcemap.write())
    .pipe(gulp.dest('./.tmp/test/js/'))
})

gulp.task('move-app', () => {
  gulp.src('test/index.html')
    .pipe(gulp.dest('.tmp/test'))
  return gulp.src('www/js/**')
    .pipe(gulp.dest('.tmp/test/js/'))
})

gulp.task('watch-test', () => {
  watch(['./test/**/*.ts'], batch((events, done) => {
    gulp.start('compile-test', done)
  }))

  watch(['www/js/**/*.js', './test/index.html'], batch((events, done) => {
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