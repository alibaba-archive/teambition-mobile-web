import * as gulp from 'gulp'
import * as cdnUploader from 'cdn-uploader'
import {buildBundle} from './tools/gulp/build'
import watch from './tools/gulp/watch'
import lint from './tools/gulp/lint'
import release from './tools/gulp/release'

export const logError = (stream) => {
  return stream.on('error', function(err: any) {
    console.error(err)
    this.emit('end')
  })
}

const distDir = [
  [
    './dist/**/*.js',
    './dist/**/*.css'
  ],
  [
    './dist/**/*.png',
    './dist/**/*.jpg'
  ],
  [
    './dist/**/*.ttf',
    './dist/**/*.svg',
    './dist/**/*.woff',
    './dist/**/*.eof'
  ]
]

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

const cdnUpload = (env: string, target: string) => {
  const config = require(`./config/${env}.json`)
  distDir.forEach((path: string []) => {
    gulp.src(path)
      .pipe(cdnUploader(config.cdnNames[target], CDNs))
  })
}

gulp.task('lint', () => {
  return lint()
})

gulp.task('watch.wechat', () => {
  return watch('default', 'wechat')
})

gulp.task('watch.ding', () => {
  return watch('default', 'ding')
})

gulp.task('watch.qqgroup', () => {
  return watch('default', 'qqgroup')
})

gulp.task('wechat', async function () {
  return await buildBundle('default', 'wechat')
})

gulp.task('wechat.beta', async function () {
  return await buildBundle('beta', 'wechat')
})

gulp.task('wechat.release', async function() {
  return await release('release', 'wechat')
})

gulp.task('qqgroup', async function () {
  return await buildBundle('default', 'qqgroup')
})

gulp.task('qqgroup.beta', async function () {
  return await buildBundle('beta', 'qqgroup')
})

gulp.task('qqgroup.beta.deploy', async function () {
  await release('beta', 'qqgroup')
  cdnUpload('beta', 'qqgroup')
})

gulp.task('qqgroup.release', async function() {
  return await release('release', 'qqgroup')
})

gulp.task('ding', async function () {
  return await buildBundle('default', 'ding')
})

gulp.task('ding.beta', async function () {
  return await buildBundle('beta', 'ding')
})

gulp.task('ding.release', async function() {
  return await release('release', 'ding')
})

gulp.task('deploy.wechat', async function () {
  const config = require('./config/release.json')
  await release('release', 'wechat')
  cdnUpload('release', 'wechat')
})

gulp.task('deploy.qqgroup', async function () {
  const config = require('./config/release.json')
  await release('release', 'qqgroup')
  cdnUpload('release', 'qqgroup')
})

gulp.task('deploy.ding', async function () {
  const config = require('./config/release.json')
  await release('release', 'ding')
  cdnUpload('release', 'ding')
})

gulp.task('cdn.qqgroup', () => {
  return cdnUpload('release', 'qqgroup')
})
