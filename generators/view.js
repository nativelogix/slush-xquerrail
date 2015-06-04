/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

gulp.task('view', function (done) {
    var modelName = this.args[0];
    if (!modelName) {
        console.log('******    Incorrect usage of the sub-generator!!     ******');
        console.log('******    Try slush xquerrail:view <model-name>      ******');
        console.log('******    Ex: slush xquerrail:view article           ******');
        return done();
    }
    var prompts = [{
        type: 'input',
        name: 'actionName',
        message: 'Action name in view?'
    }, {
        type: 'list',
        name: 'viewFormat',
        message: 'Format in view?',
        choices: ['xml', 'json']
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    modules.inquirer.prompt(prompts,
        function (answers) {
            console.log(answers);
            if (!answers.moveon) {
                return done();
            }
            // answers.modelName = modelName;
            // answers.controllerName = modules.inflection.pluralize(modelName);
            // answers.modelDisplayName = modules.inflection.humanize(modelName);
            // answers.appNamespace = common.configuration.get('application:namespace');
            // gulp.src(__dirname + '/../templates/controller/**')
            //     .pipe(modules.template(answers))
            //     .pipe(modules.rename(function (file) {
            //         if (modules['_.string'].endsWith(modules.path.basename(file.basename), '-controller')) {
            //             file.basename = answers.controllerName + file.basename;
            //         }
            //     }))
            //     .pipe(modules.conflict('./'))
            //     .pipe(gulp.dest('./'))
            //     .on('end', function () {
            //         done();
            //     });
        });
    });
    return gulp;
}