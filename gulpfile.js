var gulp         = require('gulp'),
    browserSync  = require('browser-sync').create(),
    sass         = require('gulp-sass'),
    react        = require('gulp-react');
    reload       = browserSync.reload;

var path = {
  LH_APP_PATH:   ['~/workspace'],
  LH_DIST_PATH:  [],
  ALL:           ['app/js/*.js', 'app/js/**/*.js', 'app/index.html'],
  SERVER_DIR:    [],
  HTML:          ['app/*.html'],
  JS:            ['app/js/*.js', 'app/js/**/*.js'],
  CSS:           ["app/styles/**/*.scss","app/styles/**/*.sass"],
  MINIFIED_OUT:  'ui.base.min.js',
  DEST_SRC:      'dist/src',
  DEST_BUILD:    'dist/build',
  DEST:          'dist'
};

gulp.task('default', ['serve']);

// DEV SERVER:
gulp.task('serve', ['serve-css','serve-js','serve-html'], function() {
  browserSync.init({
    online: false,
    open: false,
    port: 3100,
    ui: { port: 3200 },
    server: {
      baseDir: ['.tmp'],
      routes: {
        "/ui": ".tmp"
      }
    }
  });

  gulp.watch(path.HTML, ['serve-html']);
  gulp.watch(path.JS,   ['serve-js']);
  gulp.watch(path.CSS,  ['serve-css']);
});

gulp.task('serve-html', function () {
  return gulp.src(path.HTML)
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}))
    .on('error',function(error){
      console.error('' + error);
    });
});

gulp.task('serve-css', function () {
  return gulp.src(path.CSS)
    .pipe(sass())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.stream())
    .on('error',function(error){
      console.error('' + error);
    });
});

gulp.task('serve-js', function(){
  gulp.src(path.JS)
    .pipe(react())
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({stream: true}))
    .on('error',function(error){
      console.error('' + error);
    });
});

//gulp.task('serve-stylus', function () {
//  return gulp.src(cssFiles)
//    .pipe(stylus({use: [nib()]}))
//    .pipe(gulp.dest('.tmp/styles'))
//    .pipe(reload({stream:true}))
//    .on('error',function(error){
//      console.error('' + error);
//    });
//});
//

//gulp.task('serve-browserify', function () {
//  return gulp.src(jsFiles)
//    .pipe(browserify())
//    .pipe(gulp.dest('.tmp/js'))
//    .pipe(reload({stream:true}))
//    .on('error',function(error){
//      console.error('' + error);
//    });
//});

// BUILD TASK:
//gulp.task('build',['build-bower','build-js','build-css','html']);

//gulp.task('build-js',function(){
//  gulp.src(jsFiles)
//    .pipe(browserify())
//    .pipe(gulp.dest('./release/js'));
//});

//gulp.task('build-css',function(){
//  gulp.src(cssFiles)
//    .pipe(stylus({use: [nib()]}))
//    .pipe(gulp.dest('./release/styles'));
//});

//gulp.task('html',function(){
//  gulp.src(htmlFiles)
//    .pipe(gulp.dest('./release'));
//})

//gulp.task('build-bower', function() {
//    gulp.src(mainBowerFiles(), { base: 'app/bower_components' })
//        .pipe(gulp.dest('./release/bower_components'))
//});


// Workaround for https://github.com/gulpjs/gulp/issues/71
// Seems gulp 4 will fix it!
var origSrc = gulp.src;
gulp.src = function () {
    return fixPipe(origSrc.apply(this, arguments));
};
function fixPipe(stream) {
    var origPipe = stream.pipe;
    stream.pipe = function (dest) {
        arguments[0] = dest.on('error', function (error) {
            var nextStreams = dest._nextStreams;
            if (nextStreams) {
                nextStreams.forEach(function (nextStream) {
                    nextStream.emit('error', error);
                });
            } else if (dest.listeners('error').length === 1) {
                throw error;
            }
        });
        var nextStream = fixPipe(origPipe.apply(this, arguments));
        (this._nextStreams || (this._nextStreams = [])).push(nextStream);
        return nextStream;
    };
    return stream;
}

