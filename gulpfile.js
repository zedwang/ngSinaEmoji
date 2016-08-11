// generated on 2016-06-03 using generator-webapp 2.1.0
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
    return gulp.src('example/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp'))
        .pipe(reload({stream: true}));
})
;

gulp.task('scripts', () => {
    return gulp.src('example/scripts/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        // .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({stream: true}));
})
;

function lint(files, options) {
    return gulp.src(files)
        .pipe(reload({stream: true, once: true}))
        .pipe($.eslint(options))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
    return lint('app/scripts/**/*.js', {
        fix: true
    })
        .pipe(gulp.dest('app/scripts'));
})
;
gulp.task('lint:test', () => {
    return lint('test/spec/**/*.js', {
        fix: true,
        env: {
            mocha: true
        }
    })
        .pipe(gulp.dest('test/spec/**/*.js'));
})
;

gulp.task('html', ['styles', 'scripts'], () => {
    return gulp.src('example/index.html')
        .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
})
;


gulp.task('extras', () => {
    return gulp.src([
        'example/*.*',
        '!example/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
})
;

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles','scripts'], () => {
    browserSync({
        // notify: false,
        port: 9000,
        server: {
         baseDir: ['.tmp', 'example']
        }


    });

gulp.watch([
    'example/**/*.html',
    'example/scripts/**/*',
    'example/styles/**/*'
]).on('change', reload);

gulp.watch('example/styles/**/*.scss', ['styles']);
gulp.watch('example/scripts/**/*.js', ['scripts']);
gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist'],
        }
        // proxy: {
        //     target: 'http://172.16.134.20',
        //     ws: true,
        //
        // },
        // serveStatic: ['dist'],
    });
})
;

gulp.task('serve:test', ['scripts'], () => {
    browserSync({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/scripts': '.tmp/scripts',
                '/bower_components': 'bower_components'
            }
        }
    });

gulp.watch('app/scripts/**/*.js', ['scripts']);
gulp.watch('test/spec/**/*.js').on('change', reload);
gulp.watch('test/spec/**/*.js', ['lint:test']);
})
;

// inject bower components
gulp.task('wiredep', () => {
    gulp.src('example/*.html')
    .pipe(wiredep({
        ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('example'));
});
gulp.task('copy',()=> {
    return gulp.src(['.tmp/**/ng-sina-emoji.js','.tmp/**/ng-sina-emoji.css'])
        .pipe(gulp.dest('dist'));
})
//univers
gulp.task('build', ['lint', 'scripts', 'styles','copy'], () => {
    return gulp.src(['.tmp/**/ng-sina-emoji.js','.tmp/**/ng-sina-emoji.css'])
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: true})))
        .pipe($.size({title: 'build', gzip: true}))
        .pipe($.replaceName(/\.js/g, '.min.js'))
        .pipe($.replaceName(/\.css/g, '.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean'], () => {
    gulp.start('build');
})
;

gulp.task('asciify',() => {
    return gulp.src('dist/index.html')
        .pipe(require('gulp-asciify')('./app/ascii/ascii.txt'))
        .pipe(gulp.dest('dist/'))
})
