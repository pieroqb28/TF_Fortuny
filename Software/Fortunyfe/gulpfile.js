var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var notify = require('gulp-notify')
var plumber = require('gulp-plumber')


gulp.task('jsapp', function () {
  gulp.src(['js/loginapp.js','js/app/Login/*.module.js', 'js/app/Login/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('loginapp.js'))
         .pipe(ngAnnotate())
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))

})


gulp.task('jsmainapp', function () {
  gulp.src(['js/app.js','js/app/**/*.module.js', 'js/app/**/*.js'])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))

    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
         .pipe(ngAnnotate())
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
    .pipe(notify({ message: 'Compilado!'}))
    
})



gulp.task('watch', ['jsmainapp','jsapp'], function () {

  gulp.watch('js/app/Login/*.js', ['jsapp'])
  gulp.watch('js/app/**/*.js', ['jsmainapp'])



   })
