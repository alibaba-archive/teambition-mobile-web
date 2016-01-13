'use strict'
import * as gulp from 'gulp'
import * as path from 'path'
import * as gutil from 'gulp-util'
import config from './webpack.config'

const webpack = require('webpack')

export default (
  entry: any,
  target: string,
  buildConfig?: string,
  minify?: boolean,
  watch?: boolean,
  callback?: Function
) => {
  const webpackConfig = Object.assign({}, config)
  buildConfig = buildConfig ? buildConfig : path.join(process.cwd(), 'tools/build/bundle.json')
  webpackConfig.entry = entry
  webpackConfig.ts.configFileName = buildConfig
  delete webpackConfig.output.path
  if (minify) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      }
    }))
    webpackConfig.output.filename = path.join(process.cwd(), `dist/js/app.js`)
  }else {
    webpackConfig.output.filename = path.join(process.cwd(), `www/js/app.js`)
  }
  webpackConfig.watch = !!watch
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        throw new gutil.PluginError('webpack', err)
      }
      watch ? null : gutil.log(gutil.colors.cyan('[webpack]', stats.toString()))
      callback ? callback(resolve) : resolve()
    })
  })
}