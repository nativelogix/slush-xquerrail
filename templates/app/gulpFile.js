var gulp = require('gulp');
var gutil = require('gulp-util');

var fs = require('fs');
var pkg = require('./package.json');
var es   = require('event-stream')
var xray = require('gulp-xray-runner')
var argv = require('yargs').argv;
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var exec = require('child_process').exec;

var ml;
try {
  ml = require('./ml.json')
} catch (e) {
  ml = argv.ml;
}

if (!ml) {
  ml = {};
}

if (!ml.roxy) {
  ml['roxy'] = {
    "base": "./roxy",
    "environment": "local"
  }
};

var version = pkg.version;
var lastCommit;

module.exports.ml = ml;

var roxyCommand = 'ruby -C' + ml.roxy.base + ' -Ideploy -Ideploy/lib deploy/lib/ml.rb ' + ml.roxy.environment;
var executeRoxy = function(arg, cb) {
  var cmd = roxyCommand + ' ' + arg.cmd;
  if (arg.arg) {
    cmd += ' ' + arg.arg;
  }
  exec(cmd, function (err, stdout, stderr) {
    console.log(stdout);
    if (stderr) {console.log(stderr);}
    if (err) {console.log(err);}
    if (cb) {cb();}
  })
};

gulp.task('roxy', function(cb) {executeRoxy(argv, cb)});

gulp.task('roxy:bootstrap', function(cb) {
  argv['cmd'] = 'bootstrap';
  executeRoxy(argv, cb)
});

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
