var gulp = require('gulp');
var gutil = require('gulp-util');

var fs = require('fs');
var pkg = require('./package.json');
var es   = require('event-stream')
var xray = require('gulp-xray-runner')
var argv = require('yargs').argv;
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

var ml;
try {
  ml = require('./ml.json')
} catch (e) {
  ml = argv.ml;
}
var version = pkg.version;
var lastCommit;

module.exports.ml = ml;

gulp.task('xray', function (cb) {
  var options = {
    /* https://github.com/mikeal/request#http-authentication */
    auth: {
      username: ml.user,
      password: ml.password,
      sendImmediately: false
    },
    url: 'http://' + ml.host + ':' + ml.port + '/xray',
    testDir: 'test',
    files: ['test/**/*.xqy']
  };
  xray(options, cb);
});

gulp.task('mocha', function (cb) {
  var mochaOptions = {
    timeout: 15000,
    reporter: 'spec'
  };
  gulp.src('src/test/mocha/test/*.js')
    .pipe(mocha(mochaOptions))
    .on('end', function() {
      cb();
    });
});

gulp.task('test', function(cb) {
  runSequence('xray', 'mocha', function() {
    cb();
  });
});

gulp.task('build', function(cb) {
  cb();
});

gulp.task('default', function() {
    runSequence('test', 'build', function() {
        console.log('Build completed.');
    });
});
