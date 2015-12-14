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
const browserSync  = require('browser-sync')
const reload       = browserSync.reload

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

const dingScript = '<script src="https://g.alicdn.com/ilw/ding/0.6.6/scripts/dingtalk.js"></script>'
const wechatScript = '<script src="https://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>'

//将gulp 文件夹里面所有的gulp 任务load进来
wrench.readdirSyncRecursive('./tools/gulp').filter((file) => {
  return (/\.(js)$/i).test(file);
}).map(file => require('./tools/gulp/' + file))

let catchError = true
let logError  = (stream) => {
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
    './src/**/*.ts',
    '!src/components/interface/zone.d.ts'
  ],
  tbui: [
    'src/less/tb-fonts-variables.less',
    'node_modules/teambition-ui/less/teambition-ui-variables.less',
    'node_modules/teambition-ui/less/teambition-ui-icons.less'
  ],
  et: [
    'src/components/et/**/*.html'
  ]
}

gulp.task('clean', ['tsd:purge'], () => {
  gulp.src('www/*')
    .pipe(rimraf({force: true}))

  gulp.src("dist/*")
    .pipe(rimraf({force: true}))

  gulp.src('.tmp/*')
    .pipe(rimraf({force: true}))
})

gulp.task('less', () => {
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

gulp.task('compile-template', () => {
  return gulp.src(paths.html)
    .pipe(minifyHtml({empty: true, quotes: true}))
    .pipe(ngTemplate({
      moduleName: 'tbTemplates',
      standalone: true,
      filePath: 'templates.js'
    }))
    .pipe(gulp.dest('.tmp/scripts/template/'))
})

gulp.task('concat-app', () => {
  gulp.src([
    './.tmp/scripts/**/*.js',
    './.tmp/app.js'
  ])
  .pipe(sourcemaps.init({
    loadMaps: true
  }))
  .pipe(concat('app.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('www/js/'))
})

gulp.task('compile', sequence(['compile-template','compile-et', 'compile-ts'], 'concat-app'))

gulp.task('html', () => {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('www/'))
})

gulp.task('images', () => {
  return gulp.src(paths.images)
    .pipe(gulp.dest('www/images/'))
})

gulp.task('lib-css', () => {
  return gulp.src([
      'node_modules/ionic-npm/css/ionic.css'
    ])
    .pipe(concat('lib.css'))
    .pipe(gulp.dest('www/css/'))
})

gulp.task('lib-font', () => {
  return gulp.src([
    'node_modules/ionic-npm/fonts/*',
    'node_modules/teambition-ui/fonts/teambition*'
  ])
    .pipe(gulp.dest('www/fonts/'))
})

gulp.task('config', () => {
  const source = gulp.src('www/js/app.js')
  const defaultConfig = require('./config/default.json')
  const config = require(`./config/${process.env.BUILD_ENV || 'default'}.json`)
  const keys = Object.keys(config)
  const version = require('./package.json').version
  keys.forEach((key) => {
    source.pipe(replace(defaultConfig[key], config[key]))
  })
  return source.pipe(replace('{{__version}}', version))
    .pipe(gulp.dest('www/js/'))
})

gulp.task('revall', () => {
  var revall = new RevAll({
    prefix: cdnPrefix,
    dontGlobal: [/\/favicon\.ico$/],
    dontRenameFile: [/\.html$/, /images\/nobody-avator@2x\.png/],
    dontUpdateReference: [/\.html$/],
    dontSearchFile: [/\.js$/, /images/]
  })

  return merge2([
    gulp.src([
      'www/index.html',
      'www/fonts/**',
      'www/images/**',
      'www/index.html'
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

gulp.task('watch', ['watch-et'], () => {
  watch(paths.html, batch((events, done) => {
    gulp.start('compile-template', done)
  }))
  watch(paths.less, batch((events, done) => {
    gulp.start('less', done)
  }))
  watch(paths.et, batch((events, done) => {
    gulp.start('compile-et')
  }))
  watch(paths.images, batch((events, done) => {
    gulp.start('images', done)
  }))
  watch(paths.app, batch((events, done) => {
    gulp.start('compile-ts', done)
  }))
  watch(['./.tmp/app.js', './.tmp/scripts/**/*.js'], batch((events, done) => {
    gulp.start('concat-app', done)
  }))
})

gulp.task('before:default', sequence('clean', 'tsd:install', 'compile',
  ['lib-css', 'lib-font', 'lib-js', 'less', 'html', 'images'], 'config'
))

gulp.task('default', ['before:default'], () => {
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

gulp.task('cdn', () => {
  return gulp.src(['dist/**', '!dist/index.html'])
    .pipe(cdnUploader(cdnNamespace, CDNs))
})

gulp.task('deploy', (done) => {
  catchError = false
  sequence('build', 'cdn')(done)
})
