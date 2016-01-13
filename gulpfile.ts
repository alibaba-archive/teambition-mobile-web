import * as gulp from 'gulp'
import {buildBundle} from './tools/gulp/build'
import watch from './tools/gulp/watch'
import lint from './tools/gulp/lint'
import release from './tools/gulp/release'

const cdnUploader = require('cdn-uploader')

export const logError = (stream) => {
  return stream.on('error', function(err: any) {
    console.error(err)
    this.emit('end')
  })
}

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

gulp.task('lint', () => {
  return lint()
})

gulp.task('watch.wechat', () => {
  watch('default', 'wechat')
})

gulp.task('watch.ding', () => {
  watch('default', 'ding')
})

gulp.task('watch.qqgroup', () => {
  watch('default', 'qqgroup')
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
  return gulp.src(['dist/**', '!dist/index.html'])
    .pipe(cdnUploader(config.cdnNames['wechat'], CDNs))
})

gulp.task('deploy.qqgroup', async function () {
  const config = require('./config/release.json')
  await release('release', 'qqgroup')
  return gulp.src(['dist/**', '!dist/index.html'])
      .pipe(cdnUploader(config.cdnNames['qqgroup'], CDNs))
})

gulp.task('deploy.ding', async function () {
  const config = require('./config/release.json')
  await release('release', 'ding')
  return gulp.src(['dist/**', '!dist/index.html'])
      .pipe(cdnUploader(config.cdnNames['ding'], CDNs))
})
