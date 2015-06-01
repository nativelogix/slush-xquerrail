/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, install, conflict, template, rename, _, inflection, inquirer, path) {

// var common = require('./common')(gulp);
var path = require('path');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    var xqNamespace, xqCollation;
    xqNamespace = common.configuration.get('application:namespace') || 'http://xquerrail.com/app';
    xqCollation = common.configuration.get('application:collation') || 'http://marklogic.com/collation/codepoint';

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        xqNamespace: xqNamespace,
        xqCollation: xqCollation
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your project?',
        default: defaults.appName
    }, {
        name: 'appDescription',
        message: 'What is the description?'
    }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'xquerrailNamespace',
        message: 'What is the application namespace of your project?',
        default: defaults.xqNamespace
    }, {
        name: 'xquerrailCollation',
        message: 'What is the application collation?',
        default: defaults.xqCollation
    }, {
        name: 'authorName',
        message: 'What is the author name?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'What is the author email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What is the github username?',
        default: defaults.userName
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            common.configuration.set('application:namespace', answers['xquerrailNamespace']);
            common.configuration.set('application:collation', answers['xquerrailCollation']);
            common.configuration.save(common.path);
            gulp.src(__dirname + '/../templates/app/**')
                .pipe(template(answers))
                // .pipe(rename(function (file) {
                //     if (file.basename[0] === '_') {
                //         file.basename = '.' + file.basename.slice(1);
                //     }
                // }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function () {
                    done();
                });
        });
});
  return gulp;
}