'use strict'
import * as gulp from 'gulp'
import * as concat from 'gulp-concat'

export default (target: string) => {
  return new Promise((resolve, reject) => {
    gulp.src([
      './node_modules/ionic-release/js/ionic.bundle.js',
      './node_modules/zone.js/dist/zone.js',
      './node_modules/moment/min/moment.min.js',
      './node_modules/et-dependency/ng/index.js',
      './node_modules/marked/lib/marked.js',
      './node_modules/angular-resource/angular-resource.js',
      './node_modules/gta/lib/index.js',
      './node_modules/ng-file-upload/dist/ng-file-upload-all.js',
      './node_modules/engine.io-client/engine.io.js',
      './node_modules/jsonrpc-lite/jsonrpc.js',
      './node_modules/snapper-consumer/index.js',
      './tools/libs/js/spider.js'
    ])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest(`www/js`))
    .on('end', () => {
      resolve()
    })
  })
}
