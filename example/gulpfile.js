var gulp = require('gulp');
var rename = require('gulp-rename');
var literate = require('gulp-literate');
var markdown = require('gulp-markdown');

var renamer = rename(function(path) {
    path.basename = path.basename.replace('.lit', '');
});

gulp.task('code', function() {
    return gulp.src('*.lit.*')
        .pipe(literate())
        .pipe(renamer)
        .pipe(gulp.dest('code/'));
});

gulp.task('doc', function() {
    return gulp.src('*.lit.*')
        .pipe(markdown())
        .pipe(renamer)
        .pipe(gulp.dest('doc/'));
});

gulp.task('default', ['doc', 'code']);
