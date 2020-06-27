const gulp = require('gulp');
const uglifyES = require('uglify-es');
const composer = require('gulp-uglify/composer');
const concat = require('gulp-concat');
const del = require('del');
const uglify = composer(uglifyES, console);

const clean = () => del(['dist/*']);

const build = () => {
  return gulp.src('./dist/debugout.js')
    .pipe(concat('debugout.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
}

gulp.task('clean', clean);
gulp.task('build', build);

exports.clean = clean;
exports.default = build;
