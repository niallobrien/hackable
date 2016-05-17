// npm i --save-dev gulp-sass gulp-autoprefixer gulp-postcss gulp-cssnano gulp-rename gulp-size gulp-uglify gulp-util browser-sync browserify watchify del babelify vinyl-source-stream vinyl-buffer gulp-notify babel-preset-stage-3 babel-register
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    size = require('gulp-size'),
    uglify = require('gulp-uglify')
    gutil = require('gulp-util'),
    browserSync = require('browser-sync').create(),
    browserify = require('browserify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    del = require('del')
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    notify = require('gulp-notify')
    paths = {
      admin: {
        scripts: './assets/admin/scripts/admin.js',
        styles: './assets/admin/styles/admin.scss'
      },
      site: {
        scripts: './assets/site/scripts/main.js',
        styles: './assets/site/styles/main.scss'
      }
    }

gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: 'http://localhost:3000',
    port: 3001,
    xip: true,
    host: 'localhost'
  })
})

/**
 * Handle errors
 * @see https://gist.github.com/wesbos/52b8fe7e972356e85b43
 * @return {void}
 */
function handleErrors() {
  var args = Array.prototype.slice.call(arguments)
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args)
  this.emit('end') // Keep gulp from hanging on this task
}

/**
 * Build our main.js file
 * @param  {string} 'scripts'
 * @param  {function} callback
 */
gulp.task('scripts:admin', function() {
  return buildScripts(paths.admin.scripts, false)
})

/**
 * Build our main.js file
 * @param  {string} 'scripts'
 * @param  {function} callback
 */
gulp.task('scripts:site', function() {
  return buildScripts(paths.site.scripts, false)
})

/**
 * Watch and build our main.js file
 * @param  {string} 'scripts:watch'
 * @param  {function} callback
 */
gulp.task('scripts:admin:watch', function() {
  return buildScripts(paths.admin.scripts, true)
})

/**
 * Watch and build our main.js file
 * @param  {string} 'scripts:watch'
 * @param  {function} callback
 */
gulp.task('scripts:site:watch', function() {
  return buildScripts(paths.site.scripts, true)
})

/**
 * Build scripts
 * @see https://gist.github.com/wesbos/52b8fe7e972356e85b43
 */
function buildScripts(file, watch) {
  var props = {
    entries: file,
    debug : true,
    transform:  [babelify]
  }

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props)

  function rebundle() {
    var stream = bundler.bundle(),
        fileName = file.split('/scripts/').pop().split('.js')[0]

    return stream
      .on('error', handleErrors)
      .pipe(source(fileName + '.js'))
      .pipe(gulp.dest('./public/scripts/'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./public/scripts/'))
      .pipe(notify('JS Compiled.'));
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle()
    gutil.log('Rebundle...')
  })

  // run it once the first time buildScripts is called
  return rebundle()
}

/**
 * Compile styles
 * @param  {string} 'styles'
 * @param  {function} callback for the task
 */
gulp.task('styles:admin', function() {
  return buildStyles(paths.admin.styles)
})

/**
 * Compile styles
 * @param  {string} 'styles'
 * @param  {function} callback for the task
 */
gulp.task('styles:site', function() {
  return buildStyles(paths.site.styles)
})

function buildStyles(file) {
  return gulp.src(file)
    .pipe(sass().on('error', handleErrors))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('./public/styles/'))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/styles/'))
    .pipe(size())
    .pipe(notify('Sass Compiled.'))
    .pipe(browserSync.stream())
}

/**
 * Watch styles and run the 'styles' task on change
 * @param  {string} 'styles:watch'
 * @param  {function} callback
 */
gulp.task('styles:admin:watch', function() {
  gulp.watch('./assets/admin/styles/**/*.scss')
    .on('change', function() {
      buildStyles(paths.admin.styles)
      browserSync.reload()
    })
})

/**
 * Watch styles and run the 'styles' task on change
 * @param  {string} 'styles:watch'
 * @param  {function} callback
 */
gulp.task('styles:site:watch', function() {
  gulp.watch('./assets/site/styles/**/*.scss')
    .on('change', function() {
      buildStyles(paths.site.styles)
      browserSync.reload()
    })
})

gulp.task('copy:jslibs', function() {
   gulp.src('./assets/admin/lib/**/*.js')
     .pipe(gulp.dest('./public/scripts/lib'))
})

gulp.task('clean:dev', function() {
  return del([
    'public/scripts/admin.js',
    'public/styles/admin.css',
    'public/scripts/main.js',
    'public/styles/main.css'
  ])
})

gulp.task('build:assets', [
  'scripts:admin',
  'scripts:site',
  'styles:admin',
  'styles:site',
  'scripts:admin:watch',
  'scripts:site:watch',
  'styles:admin:watch',
  'styles:site:watch',
  'copy:jslibs'
])

gulp.task('build', ['build:assets', 'clean:dev'])

gulp.task('default', ['build:assets', 'browser-sync'])