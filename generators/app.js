/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var workingDirName = modules.path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || modules.path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = modules.path.join(homeDir, '.gitconfig');
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
    modules.inquirer.prompt(prompts,
        function (answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = modules['_.string'].slugify(answers.appName);
            answers.common = common;
            gulp.src(__dirname + '/../templates/app/**')
                .pipe(modules.template(answers))
                .pipe(modules.gulpif(
                    function(file) {return modules.path.basename(file.path) === 'application-domain.xml';}, 
                    modules.inject(
                        gulp.src(['./**/models/*-model.xqy'], {read: false}), {
                            name: 'controllers',
                            transform: common.domain.includeController
                        }
                    )
                ))
                .pipe(modules.conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(modules.install())
                .on('end', function () {
                    common.configuration.set('application:namespace', answers['xquerrailNamespace']);
                    common.configuration.set('application:collation', answers['xquerrailCollation']);
                    common.configuration.save();
                    done();
                });
        });
});
  return gulp;
}