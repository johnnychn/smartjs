var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');//文件更名
var version='0.0.1';

gulp.task('build', function () {
    return gulp.src('./build/smartjs.js')
        .pipe(rename({ suffix: '.'+version+'.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});
gulp.task('default', ['build']);