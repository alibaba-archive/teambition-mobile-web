/* global process */
'use strict'

const gulp         = require('gulp')
const watch        = require('gulp-watch')
const batch        = require('gulp-batch')
const rimraf       = require('gulp-rimraf')
const concat       = require('gulp-concat')
const less         = require('gulp-less')
const replace      = require('gulp-replace')
const sourcemaps   = require('gulp-sourcemaps')
const order        = require('gulp-order')
const typescript   = require('gulp-typescript')
const tslint       = require('gulp-tslint')
const stylish      = require('gulp-tslint-stylish')
const ngAnnotate   = require('gulp-ng-annotate')
const minifyHtml   = require('gulp-minify-html')
const ngTemplate   = require('gulp-ng-template')
const sequence     = require('gulp-sequence')
const uglify       = require('gulp-uglify')
const minifyCss    = require('gulp-minify-css')
const RevAll       = require('gulp-rev-all')
const plumber      = require('gulp-plumber')
const autoprefixer = require('gulp-autoprefixer')
const util         = require('gulp-util')
const merge2       = require('merge2')
const cdnUploader  = require('cdn-uploader')
const wrench       = require('wrench')
const streamqueue  = require('streamqueue')

const CDNs = [
  {
    host: 'v0.ftp.upyun.com',
    user: 'teambition/dn-st',
    password: process.env.CDN_UPYUN_PWD
  },
  {
    host: 'ftp.keycdn.com',
    user: 'teambition',
    password: process.env.CDN_UPYUN_PWD
  }
]

let cdnNamespace = 'tb-mobile'

if (process.env.BUILD_TARGET === 'ding') {
  cdnNamespace = 'tb-ding'
}else if (process.env.BUILD_TARGET === 'wechat') {
  cdnNamespace = 'tb-wechat'
}

const cdnPrefix = `https://dn-st.teambition.net/${cdnNamespace}`

const dingScript = '<script src="https://g.alicdn.com/ilw/ding/0.5.1/scripts/dingtalk.js"></script>'
const wechatScript = '<script src="https://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>'

//将gulp 文件夹里面所有的gulp 任务load进来
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
})

let catchError = true
let logError  = function(stream) {
  if(!catchError) return stream
  return stream.on('error', console.log.bind(console))
}

const paths = {
  images: ['src/images/*'],
  less: [
    'src/less/app.less',
    'src/components/**/*.less'
  ],
  html: [
    'src/components/views/**/*.html',
    'src/scripts/directives/**/*.html'
  ],
  app: [
    'src/**/*.ts',
    '!src/components/interface/zone.d.ts'
  ],
  tbui: [
    'src/less/tb-fonts-variables.less',
    'bower_components/UI/less/teambition-ui-variables.less',
    'bower_components/UI/less/teambition-ui-icons.less'
  ]
}

gulp.task('clean', ['tsd:purge'], function() {
  gulp.src('www/*')
    .pipe(rimraf({force: true}))

  gulp.src("dist/*")
    .pipe(rimraf({force: true}))

  gulp.src('.tmp/*')
    .pipe(rimraf({force: true}))
})

gulp.task('less', function() {
  return merge2(
    gulp.src(paths.tbui)
      .pipe(concat('tbui.less'))
      .pipe(logError(less()))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      })),
    gulp.src(paths.less)
      .pipe(sourcemaps.init())
      .pipe(logError(less()))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))
      .pipe(sourcemaps.write())
  )
  .pipe(concat('app.css'))
  .pipe(gulp.dest('www/css/'))
})

function compileTypescript(resources, dest) {
  var _dest = dest ? dest : '.tmp/scripts'
  console.log('compile resource', resources);
  console.log('compile dest', _dest);
  return gulp.src(resources)
    .pipe(sourcemaps.init())
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
    .pipe(sourcemaps.write())
    .pipe(ngAnnotate())
    .pipe(gulp.dest(_dest))
}

function compileTemplate() {
  return gulp.src(paths.html)
    .pipe(minifyHtml({empty: true, quotes: true}))
    .pipe(ngTemplate({
      moduleName: 'tbTemplates',
      standalone: true,
      filePath: 'templates.js'
    }))
    .pipe(gulp.dest('.tmp/scripts/template/'))
}

gulp.task('compile-ts', function() {
  return compileTypescript(paths.app)
})

gulp.task('compile-template', function() {
  return compileTemplate()
})

gulp.task('concat-app', function() {
  merge2(
    gulp.src([
      '.tmp/scripts/app.js',
      '.tmp/scripts/Modules/MomentLocale.js',
      '.tmp/scripts/Modules/WechatService.js',
      '.tmp/scripts/Modules/DingService.js',
      '.tmp/scripts/run.js',
      '.tmp/scripts/components/lib/View.js',
      '.tmp/scripts/components/lib/BaseAPI.js',
      '.tmp/scripts/components/lib/BaseModel.js',
      '.tmp/scripts/components/lib/ETComponents.js'
    ]),
    gulp.src([
      '.tmp/scripts/template/**/*.js',
      '.tmp/scripts/components/**/*.js',
      '!.tmp/scripts/components/lib/*.js'
    ])
  )
  .pipe(sourcemaps.init())
  .pipe(concat('app.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('www/js/'))
})

gulp.task('compile', sequence(['compile-ts', 'compile-template', 'compile-et']))

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('www/'))
})

gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('www/images/'))
})

gulp.task('lib-css', function() {
  return gulp.src([
      'bower_components/ionic/release/css/ionic.css'
    ])
    .pipe(concat('lib.css'))
    .pipe(gulp.dest('www/css/'))
})

gulp.task('lib-font', function() {
  return gulp.src([
    'bower_components/ionic/release/fonts/*',
    'bower_components/UI/fonts/teambition*'
  ])
    .pipe(gulp.dest('www/fonts/'))
})

gulp.task('lib-js', function() {
  gulp.src([
    'bower_components/ionic/release/js/ionic.bundle.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/zone.js/dist/zone.js',
    'bower_components/marked/lib/marked.js',
    'bower_components/store2/dist/store2.js',
    'bower_components/moment/moment.js',
    'bower_components/ng-file-upload/ng-file-upload.js',
    'bower_components/gta/lib/index.js',
    'node_modules/et-template/es5/dependency.ng.js',
    'bower_components/jsonrpc-lite/jsonrpc.js',
    'bower_components/engine.io-client/engine.io.js',
    'bower_components/snapper-consumer/index.js',
    'bower_components/spider/index.js'
  ])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('www/js/'))
})

gulp.task('config', function() {
  let source = gulp.src('.tmp/scripts/app.js')
  const defaultConfig = require('./config/default.json')
  const config = require(`./config/${process.env.BUILD_ENV || 'default'}.json`)
  const keys = Object.keys(config)
  keys.forEach((key) => {
    source.pipe(replace(defaultConfig[key], config[key]))
  })
  return source.pipe(gulp.dest('.tmp/scripts/'))
})

gulp.task('revall', function() {
  var revall = new RevAll({
    prefix: cdnPrefix,
    dontGlobal: [/\/favicon\.ico$/],
    dontRenameFile: [/\.html$/],
    dontUpdateReference: [/\.html$/],
    dontSearchFile: [/\.js$/, /images/]
  })

  return merge2([
    gulp.src([
      'www/fonts/**',
      'www/images/**'
    ]),
    gulp.src([
      'www/js/**'
    ])
      .pipe(uglify())
      .pipe(replace('/weixin/dev/signature', '/weixin/signature'))
      .pipe(replace('/weixin/dev/tpl/message', '/weixin/tpl/message'))
      .pipe(replace('/weixin/dev/', '/weixin/')),
    gulp.src([
      'www/css/**'
    ]).pipe(minifyCss({rebase: false})),
  ])
    .pipe(revall.revision())
    .pipe(gulp.dest('dist'))
})

function watchTs(event) {
  const reg1 = /src\/components/
  const reg2 = /src\/modules/
  const path = event.path
  let dest
  if (reg1.test(path) || reg2.test(path)) {
    let _test, _dest
    if (reg1.test(path)) {
      _test = 'src/components/'
      _dest = 'components'
    }else if(reg2.test(path)) {
      _test = 'src/modules/'
      _dest = 'modules'
    }
    var _pos = path.indexOf(_test)
    var _subLength = path.length - _pos - _test.length
    var _subPos = _pos + _test.length
    var _subStr = path.substr(_subPos, _subLength)
    var _subPath = _subStr.split('/')
    _subPath.pop()
    _subPath = _subPath.join('/')
    _subPath = (_subPath.substr(-1) === '/') ? _subPath : _subPath + '/'
    _subPath = (_subPath.substr(0) === '/') ? _subPath : '/' + _subPath
    dest = '.tmp/scripts/' + _dest + _subPath
  }
  compileTypescript(path, dest)
}

gulp.task('watch', ['watch-et'], function() {
  watch(paths.less, batch(function(events, done) {
    gulp.start('less', done)
  }))
  watch(paths.app, watchTs)
  watch(paths.html, compileTemplate)
  watch(paths.images, batch(function(events, done) {
    gulp.start('images', done)
  }))
  watch('.tmp/scripts/**/*.js', batch(function(events, done) {
    gulp.start('concat-app', done)
  }))
})

gulp.task('before:default', sequence('clean', 'tsd:install', 'compile', 'config', 'concat-app',
  ['lib-css', 'lib-font', 'lib-js', 'less', 'html', 'images']
))

gulp.task('default', ['before:default'], function() {
  let str = '';
  if (process.env.BUILD_TARGET === 'wechat') {
    str = wechatScript
  }else if(process.env.BUILD_TARGET === 'ding') {
    str = dingScript
  }
  return gulp.src('www/index.html')
    .pipe(replace('{{__third.lib.script}}', str))
    .pipe(gulp.dest('www'))
})

gulp.task('build', sequence('default', 'revall'))

gulp.task('cdn', function() {
  return gulp.src(['dist/**', '!dist/index.html'])
    .pipe(cdnUploader(cdnNamespace, CDNs))
})

gulp.task('deploy', function(done) {
  catchError = false
  sequence('build', 'cdn')(done)
})
