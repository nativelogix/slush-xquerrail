/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

gulp.task('model', function (done) {
    var modelName = this.args[0];
    if (!modelName) {
        console.log('******    Incorrect usage of the sub-generator!!      ******');
        console.log('******    Try slush xquerrail:model <model-name>      ******');
        console.log('******    Ex: slush xquerrail:model article           ******');
        return done();
    }
    var prompts = [{
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
            answers.modelName = modelName;
            answers.modelDisplayName = modules.inflection.humanize(modelName);
            answers.appNamespace = common.configuration.get('application:namespace');
            gulp.src(__dirname + '/../templates/model/**')
                .pipe(modules.template(answers))
                .pipe(modules.rename(function (file) {
                    if (modules['_.string'].endsWith(modules.path.basename(file.basename), '-model')) {
                        file.basename = answers.modelName + file.basename;
                    }
                }))
                .pipe(modules.conflict('./'))
                .pipe(gulp.dest('./'))
                .on('end', function () {
                    var models = common.configuration.get('application:models') || [];
                    models.push(answers.modelName);
                    common.configuration.set('application:models', models);
                    common.configuration.save();
                    common.domain.buildControllers(done);
                    // done();
                    // gulp.src('./src/**/application-domain.xml')
                    //     .pipe(//modules.gulpif(
                    //         //function(file) {return modules.path.basename(file.path) === 'application-domain.xml';}, 
                    //         modules.inject(
                    //             gulp.src(['./src/**/models/*-model.xqy'], {read: false}), {
                    //                 name: 'controllers',
                    //                 transform: common.domain.includeController
                    //             }
                    //         )
                    //     )//)
                    //     .pipe(gulp.dest('./src'))
                    //     .on('end', function () {
                    //         done();
                    //     });
                });
        });
    });
    return gulp;
}