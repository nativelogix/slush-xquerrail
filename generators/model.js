/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

var _answers = {
    'domainName': common.domain.default
};

var validateAndCapture = function(input, key) {
    var required = common.validation.required(input);
    if (required === true) {
        _answers[key] = input
    }
    return required;
};

function validateModelName(input) {
    var required = common.validation.required(input);
    if (required === true) {
        var domain = common.domain.find(_answers['domainName'])
        if (modules['_.string'].contains(domain.models, input)) {
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
        name: 'domainName',
        type: 'list',
        message: 'What is the domain model?',
        choices: common.domain.list,
        default: common.domain.default,
        when: function() {return false;},
        validate: common.validation.required
    }, {
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
        choices: common.domain.namespaces,
        when: function() {return false;},
        default: common.domain.find('application').namespace.uri
    }, {
        name: 'modelCollation',
        message: 'What is the model collation?',
        default: common.configuration.get('domain:collation')
    }, {
        name: 'modelFields',
        message: 'List the field names (comma separated)?',
        validate: common.validation.required
    }, {
        name: 'modelKey',
        type: 'list',
        message: 'What is the key field?',
        choices: listFields,
        validate: common.validation.required
    }, {
        name: 'modelKeyLabel',
        type: 'list',
        message: 'What is the key label field?',
        choices: listFields,
        validate: common.validation.required
    }, {
        type: 'confirm',
        name: 'modelIncludeTests',
        message: 'Create Xray tests?'
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
        name: 'controllerIncludeTests',
        message: 'Create Mocha tests?',
        when: showControllerName
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
            if (!answers.domainName) {
                answers.domainName = 'content';
            }
            if (!answers.modelNamespace) {
                answers.modelNamespace = common.domain.find('application').namespace.uri;
            }
            answers.modelFields = listFields(answers);
            answers.modelDisplayName = modules.inflection.humanize(answers.modelName);
            answers.controllerNamespace = answers.modelNamespace;
            answers.controllerFunctions = [];
            common.domain.model.build(
                answers, 
                function() {
                    if (answers.controllerIncludeModel) {
                        common.domain.controller.build(
                            answers,
                            done
                        )
                    }
                }
            )
        });
    });
    return gulp;
}