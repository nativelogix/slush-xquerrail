/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, install, conflict, template, rename, _, inflection, inquirer, path) {

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

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || ''
    };
})();

gulp.task('controller', function (done) {
    var modelName = this.args[0];
    if (!modelName) {
        console.log('******    Incorrect usage of the sub-generator!!           ******');
        console.log('******    Try slush xquerrail:controller <model-name>      ******');
        console.log('******    Ex: slush xquerrail:controller article           ******');
        return done();
    }
    var prompts = [{
        type: 'confirm',
        name: 'includeModel',
        message: 'Import model module in controller?'
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            console.log(answers);
            if (!answers.moveon) {
                return done();
            }
            answers.modelName = modelName;
            answers.controllerName = inflection.pluralize(modelName);
            answers.modelDisplayName = inflection.humanize(modelName);
            answers.appNamespace = common.configuration.get('application:namespace');
            gulp.src(__dirname + '/../templates/controller/**')
                .pipe(template(answers))
                .pipe(rename(function (file) {
                    console.log(file);
                    if (_.endsWith(path.basename(file.basename), '-controller')) {
                        file.basename = answers.controllerName + file.basename;
                    }
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                // .pipe(install())
                .on('end', function () {
                    done();
                });
        });
});
  return gulp;
}