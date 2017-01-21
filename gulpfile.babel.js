import gulp from "gulp";
import babel from "gulp-babel";
import sourcemaps from "gulp-sourcemaps";
import mocha from "gulp-mocha";
import espower from "gulp-espower";
import runSequence from "run-sequence";

const srcFiles = ['src/**/*.js'];
const testFiles = ['test/**/*.js'];
const espoweredDir = './espowered';
const destDir = './lib';

gulp.task('test', ['mocha']);

gulp.task('espower', () =>
    gulp.src(testFiles)
        .pipe(sourcemaps.init('test/'))
        .pipe(babel())
        .pipe(espower())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(espoweredDir))
);

gulp.task('mocha', ['espower'], () => 
    gulp.src(`${espoweredDir}/**/*.js`)
        .pipe(mocha())
);
