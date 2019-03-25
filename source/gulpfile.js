/*
 * This file is set up to run standard build and testing tasks over
 * mulitple themes that are defined in the gulp_config directory.
 * It is assumed that each theme has its own javascript file in that
 * directory that defines the variables needed by each task. If you
 * used the "fin init-theme" command the file for the them you created
 * will alredy be in that directory.
 * 
 * Options - The only options are the --production and --development
 * options provided by the gulp-mode module.
 *   Examples:
 *     - "fin k gulp --production" runs the default tasks in production
 *       mode
 *     - "fin k gulp --development" or "fin k gulp" runs the default
 *       tasks in development mode
 * 
 * Tasks
 *   
 */

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const mode = require('gulp-mode')();
const requireDir = require('require-dir');
const changed = require('gulp-changed');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const sassLint = require('gulp-sass-lint');
const eslint = require('gulp-eslint');

const iconFontName = 'themeIcons';
const CONFIGS = requireDir('./gulp_config');

/**************************************
 * Build Tasks                        *
 **************************************/

function buildSass(done) {
  console.log('Building Sass');
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.sass && config.sass.src && config.sass.dest) {
      gulp.src(config.sass.src)
          .pipe(mode.development(sourcemaps.init()))
          .pipe(mode.production(sass({
            outputStyle: 'compressed',
            includePaths: []
          })))
          .pipe(mode.development(sass({
             noCache: true,
             outputStyle: "compressed",
             lineNumbers: false,
             includePaths: [],
             sourceMap: true
          })))
          .pipe(mode.development(sourcemaps.write('./maps')))
          .pipe(gulp.dest(config.sass.dest));
    }
  });
  return done();
}

function buildJavascript(done) {
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.javascript && config.javascript.src && config.javascript.dest) {
      gulp.src(config.javascript.src)
          .pipe(mode.development(changed(config.javascript.dest)))
          .pipe(mode.development(sourcemaps.init()))
          .pipe(mode.production(uglify()))
          .pipe(mode.development(sourcemaps.write('./maps')))
          .pipe(gulp.dest(config.javascript.dest));
    }
  });
  return done();
}

function buildImages(done) {
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.images && config.images.src && config.images.dest) {
      gulp.src(config.images.src)
          .pipe(mode.development(changed(config.images.dest)))
          .pipe(imagemin({progressive: true}))
          .pipe(gulp.dest(config.images.dest));
    }
  });
  return done();
}

function buildIcons(done) {
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.iconFont && config.iconFont.src && config.iconFont.dest && config.iconFont.scssFile && config.iconFont.filePath) {
      gulp.src(config.iconFont.src)
          .pipe(iconfontCss({
            fontName: iconFontName,
            path: 'scss',
            targetPath: config.iconFont.scssFile,
            fontPath: config.iconFont.filePath
          }))
          .pipe(iconfont({
            fontName: iconFontName,
            prependUnicode: false,
            formats: ['ttf', 'eot', 'woff'],
            timestamp: runTimestamp,
            normalize: true,
            fontHeight: 1001
          }))
          .pipe(gulp.dest(config.iconFont.dest));
    }
  });
  return done();
}

function buildFonts(done) {
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.fonts && config.fonts.src && config.fonts.dest) {
      gulp.src(config.fonts.src)
          .pipe(mode.development(changed(config.fonts.dest)))
          .pipe(changed(config.fonts.dest))
          .pipe(gulp.dest(config.fonts.dest));
    }
  });
  return done();
}

/**************************************
 * Testing Tasks                      *
 **************************************/

function testSassLint(done) {
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.sass && config.sass.src && config.sass.dest) {
      gulp.src(config.sass.lintSrc)
          .pipe(sassLint({ sasslintConfig: '.sass-lint.yml' }))
          .pipe(sassLint.format())
          .pipe(sassLint.failOnError());
    }
  });
  return done();
}

function testJsLint(done) {
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.javascript && config.javascript.src && config.javascript.dest) {
      gulp.src(config.javascript.src)
          .pipe(eslint())
          .pipe(eslint.format())
          .pipe(eslint.failAfterError());
    }
  });
  return done();
}

/**************************************
 * Watchers                           *
 **************************************/

function watchSass(done) {
  var sources = [];
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.sass && config.sass.src) {
      for (src of config.sass.src) {
        sources.push(src);
      }
    }
  });
  gulp.watch(sources, buildSass);
  return done();
}

function watchJavascript(done) {
  var sources = [];
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.javascript && config.javascript.src) {
      for (src of config.javascript.src) {
        sources.push(src);
      }
    }
  });
  gulp.watch(sources, buildJavascript);
  return done();
}

function watchImages(done) {
  var sources = [];
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.images && config.images.src) {
      for (src of config.images.src) {
        sources.push(src);
      }
    }
  });
  gulp.watch(sources, buildImages);
  return done();
}

function watchFonts(done) {
  var sources = [];
  Object.keys(CONFIGS).forEach(function (key) {
    var config = CONFIGS[key];
    if (config.fonts && config.fonts.src) {
      for (src of config.fonts.src) {
        sources.push(config.fonts.src);
      }
    }
  });
  gulp.watch(sources, buildFonts);
  return done();
}

exports.default = gulp.parallel(buildSass, buildJavascript, buildImages, buildIcons, buildFonts);
exports.test = gulp.parallel(testSassLint, testJsLint);
exports.watch = gulp.series(watchSass);
