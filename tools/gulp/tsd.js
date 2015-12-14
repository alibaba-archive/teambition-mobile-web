/* global process */
'use strict';

const gulp    = require('gulp')
const gutil   = require('gulp-util')

const path    = require('path')
const Tsd     = require('tsd')
const co      = require('co')
const tsdJson = 'tsd.json'
const GetAPI  = Tsd.getAPI
const tsdApi  = new GetAPI(tsdJson)

gulp.task('tsd:install', function () {
  return co(function * () {
    let npmDependency = require(path.join(process.cwd(), 'package.json'))

    delete npmDependency.dependencies['zone.js']

    let dependencies = ['ionic'].concat(
      Object.keys(npmDependency.dependencies)
    )

    let query = new Tsd.Query()
    dependencies.forEach(function (dependency) {
      query.addNamePattern(dependency)
    })

    let options = new Tsd.Options()
    options.resolveDependencies = true
    options.overwriteFiles = true
    options.saveBundle = true

    yield tsdApi.readConfig()
    let selection = yield tsdApi.select(query, options)
    let installResult = yield tsdApi.install(selection, options)
    let written = Object.keys(installResult.written.dict)
    let removed = Object.keys(installResult.removed.dict)
    let skipped = Object.keys(installResult.skipped.dict)

    written.forEach(function (dts) {
      gutil.log('Definition file written: ' + dts)
    })

    removed.forEach(function (dts) {
      gutil.log('Definition file removed: ' + dts)
    })

    skipped.forEach(function (dts) {
      gutil.log('Definition file skipped: ' + dts)
    })
  })
})

gulp.task('tsd:purge', function () {
  return tsdApi.purge(true, true)
})

gulp.task('tsd', ['tsd:install'])
