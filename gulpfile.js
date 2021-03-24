'use strict'; 
const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const include = require('gulp-include')
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
scss.compiler = require('node-sass');

function styles(){
  return src('./app/assets/scss/styles.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({
      overrideBrowserslist:['last 10 version'],
      grid: true
    }))
    .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write())
    .pipe(dest('./app/assets/styles'))
    .pipe(browserSync.stream())
}
function scripts(){
  return src([
    // 'node_modules/jquery/dist/jquery.js',
    './app/assets/scripts/index.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(include()).on('error', console.log)
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(dest('./app/assets/js'))
  .pipe(browserSync.stream())
}

function images(){
  return src('app/assets/images/**/*')
    .pipe(imagemin(
      [
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
      ]
    ))
    .pipe(dest('dist/assets/images'))
}

function watching(){
  watch(['app/assets/scss/**/*.scss'], styles)
  watch(['app/assets/scripts/**/*.js'], scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
}

function server(){
  browserSync.init({
    server: {
      baseDir: './app'
    }
  })
}
function cleanDist(){
  return del('dist')
}

function build(){
  return src([
    'app/assets/styles/style.min.css',
    'app/assets/js/main.min.js',
    'app/assets/fonts/**/*',
    'app/*.html',
  ], {base: 'app'})
  .pipe(dest('dist'))
}


exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watching = watching;
exports.server = server;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, server, watching);




