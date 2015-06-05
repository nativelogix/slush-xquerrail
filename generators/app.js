/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

var COLLATION = 'http://marklogic.com/collation/codepoint';
var APPLICATION_NAMESPACE = 'application:http://xquerrail.com/application';
var CONTENT_NAMESPACE = 'content:http://xquerrail.com/content';

function validateNamespace(namespace) {
    if (! modules['_.string'].contains(namespace, ':')) {
        return 'Invalid namespace [' + namespace + ']. Must have the format prefix:namespace-uri';
    } else
        return true;
};

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

    var applicationNamespace, contentNamespace, collation;
    if (common.configuration.get('application:domains:application:namespace')) {
        applicationNamespace = common.configuration.get('application:domains:application:namespace').prefix + ':' + common.configuration.get('application:domains:application:namespace').uri;
    } else {
        applicationNamespace = APPLICATION_NAMESPACE;
    }
    
    if (common.configuration.get('application:domains:content:namespace')) {
        contentNamespace = common.configuration.get('application:domains:content:namespace').prefix + ':' + common.configuration.get('application:domains:content:namespace').uri;
    } else {
        contentNamespace = CONTENT_NAMESPACE;
    }

    collation = common.configuration.get('application:collation') || COLLATION;

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        xquerrail: {
            applicationNamespace: applicationNamespace,
            contentNamespace: contentNamespace,
            collation: collation
        }
    };
})();

gulp.task('default', function (done) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your application?',
        default: defaults.appName
    }, {
        name: 'appDescription',
        message: 'What is the description?'
    }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'xquerrailApplicationNamespace',
        message: 'What is the application namespace? Supported format {prefix}:{namespace}',
        default: defaults.xquerrail.applicationNamespace,
        validate: validateNamespace
    }, {
        name: 'xquerrailContentNamespace',
        message: 'What is the content namespace? Supported format {prefix}:{namespace}',
        default: defaults.xquerrail.contentNamespace,
        validate: validateNamespace
    }, {
        name: 'xquerrailCollation',
        message: 'What is the application collation?',
        default: defaults.xquerrail.collation
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
            answers.xquerrail = {};
            answers.xquerrail.applicationNamespace = {
                'prefix': answers.xquerrailApplicationNamespace.substring(0, answers.xquerrailApplicationNamespace.indexOf(':')),
                'uri': answers.xquerrailApplicationNamespace.substring(answers.xquerrailApplicationNamespace.indexOf(':') + 1)
            };
            delete answers.xquerrailApplicationNamespace;
            answers.xquerrail.contentNamespace = {
                'prefix': answers.xquerrailContentNamespace.substring(0, answers.xquerrailContentNamespace.indexOf(':')),
                'uri': answers.xquerrailContentNamespace.substring(answers.xquerrailContentNamespace.indexOf(':') + 1)
            };
            delete answers.xquerrailContentNamespace;
            answers.xquerrail.collation = answers.xquerrailCollation;
            delete answers.xquerrailCollation;
            gulp.src(__dirname + '/../templates/app/**')
                .pipe(modules.template(answers))
                .pipe(modules.conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(modules.install())
                .on('end', function () {
                    done();
                });
        });
});
  return gulp;
}