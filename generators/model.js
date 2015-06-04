/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

function validateRequired(input) {
    if (!input) {
        return 'Input is required.';
    } else {
        return true;
    }
};

function validateModelName(input) {
    var required = validateRequired(input);
    if (required === true) {
        if (modules['_.string'].contains(common.configuration.get('domain:models'), input)) {
            return 'Model name must be unique.'
        } else {
            return true
        }
    } else {
        return required;
    }
};

function listFields(answers) {
    return answers['modelFields'].split(',');
};

function showControllerName(answers) {
    return answers['controllerIncludeModel'];
};

function defaultControllerName(answers) {
    return modules.inflection.pluralize(answers['modelName'])
};

gulp.task('model', function (done) {
    var prompts = [{
        name: 'modelName',
        type: 'input',
        message: 'What is the model name?',
        validate: validateModelName
    }, {
        name: 'modelPersistence',
        type: 'list',
        message: 'What is the model persistence?',
        choices: ['abstract','directory','document'],
        default: 'directory'
    }, {
        name: 'modelExtends',
        message: 'What is the base class?'
    }, {
        name: 'modelNamespace',
        type: 'list',
        message: 'What is the model namespace?',
        choices: [common.configuration.get('domain:applicationNamespace:uri'), common.configuration.get('domain:contentNamespace:uri')],
        default: common.configuration.get('domain:contentNamespace:uri')
    }, {
        name: 'modelCollation',
        message: 'What is the model collation?',
        default: common.configuration.get('domain:collation')
    }, {
        name: 'modelFields',
        message: 'List the field names (comma separated)?',
        validate: validateRequired
    }, {
        name: 'modelKey',
        type: 'list',
        message: 'What is the key field?',
        choices: listFields,
        validate: validateRequired
    }, {
        name: 'modelKeyLabel',
        type: 'list',
        message: 'What is the key label field?',
        choices: listFields,
        validate: validateRequired
    }, {
        name: 'controllerIncludeModel',
        type: 'confirm',
        message: 'Create controller?'
    }, {
        name: 'controllerName',
        message: 'Controller name?',
        when: showControllerName,
        default: defaultControllerName
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
            answers.modelFields = listFields(answers);
            answers.modelDisplayName = modules.inflection.humanize(answers.modelName);
            common.domain.addModelFile(
                answers,
                function() {
                    common.domain.buildModel(
                        answers, 
                        function() {
                            if (answers.controllerIncludeModel) {
                                common.domain.addControllerFile(
                                    answers, 
                                    common.domain.addModelToConfiguration(answers, done)
                                )
                            } else {
                                common.domain.addModelToConfiguration(answers, done);
                            }
                        }
                    )
                }
            );
        });
    });
    return gulp;
}