/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

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
    modules.inquirer.prompt(prompts,
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
                .pipe(modules.template(answers))
                .pipe(modules.rename(function (file) {
                    if (_.endsWith(modules.path.basename(file.basename), '-controller')) {
                        file.basename = answers.controllerName + file.basename;
                    }
                }))
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
                .on('end', function () {
                    done();
                });
        });
    });
    return gulp;
}