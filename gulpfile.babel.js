import gulp from "gulp";
import babel from "gulp-babel";
import sourcemaps from "gulp-sourcemaps";
import mocha from "gulp-mocha";
import esdoc from "gulp-esdoc";
import espower from "gulp-espower";
import runSequence from "run-sequence";

const srcFiles = ['src/**/*.js'];
const testFiles = ['test/**/*.js'];
const espoweredDir = './espowered';
const destDir = './lib';

gulp.task('build', ['babel', 'esdoc']);
gulp.task('watch', ['build'], () => 
  gulp.watch(srcFiles, ['build', 'test'])
);
gulp.task('test', ['mocha']);

gulp.task('babel', () =>
    gulp.src(srcFiles)
        .pipe(sourcemaps.init('src/'))
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(destDir))
);

gulp.task('esdoc', () =>
    gulp.src('./src')
        .pipe(esdoc({ destination: "./docs" }))
);

gulp.task('espower', () =>
    gulp.src(testFiles)
        .pipe(sourcemaps.init('test/'))
        .pipe(babel())
        .pipe(espower())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(espoweredDir))
);

gulp.task('mocha', ['babel', 'espower'], () => 
    gulp.src(`${espoweredDir}/**/*.js`)
        .pipe(mocha())
);
