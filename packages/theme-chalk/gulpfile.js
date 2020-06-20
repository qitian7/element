'use strict';

/** 用gulp 打包 scss
 *    "build:theme": "node build/bin/gen-cssfile && gulp build --gulpfile packages/theme-chalk/gulpfile.js && cp-cli packages/theme-chalk/lib lib/theme-chalk",
 *    cp-cli packages/theme-chalk/lib lib/theme-chalk
 *     这条指令, 是实现liux指令cp功能,  把 前一个 复制到 后一个路径
 *
 */

const { series, src, dest } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');

function compile() {
  return src('./src/*.scss') // src包 是 入口
    .pipe(sass.sync())
    .pipe(autoprefixer({
      // browsers: ['ie > 9', 'last 2 versions'], // 原版是这样的, 然后终端报错, 仔细看, 换个key名就可以了
      Browserslist: ['ie > 9', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin())
    .pipe(dest('./lib')); // dest 包 是 出口
}

function copyfont() {
  return src('./src/fonts/**')
    .pipe(cssmin())
    .pipe(dest('./lib/fonts'));
}

exports.build = series(compile, copyfont);
