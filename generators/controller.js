/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

gulp.task('controller', function (done) {
    function validateRequired(input) {
        if (!input) {
            return 'Input is required.';
        } else {
            return true;
        }
    };

    function listModelNames(answers) {
        var models = common.configuration.get('domain:models').slice(0);
        models.unshift('');
        return models;
    };

    function showModelList(answers) {
        return answers['controllerIncludeModel'];
    };

    function showControllerName(answers) {
        return !answers['controllerIncludeModel'];
    };
    
    function validateControllerName(input) {
        var required = validateRequired(input);
        if (required === true) {
            if (modules['_.string'].contains(common.configuration.get('domain:controllers'), input)) {
                return 'Controller name must be unique.'
            } else {
                return true
            }
        } else {
            return required;
        }
    };

    function showControllerFunctions(answers) {
        return answers['controllerOverrideFunctions'];
    };

    var prompts = [{
        name: 'domainName',
        type: 'list',
        message: 'What is the domain model?',
        choices: common.domain.list,
        default: 'content',
        when: function() {return false;},
        validate: validateRequired
    }, {
        type: 'confirm',
        name: 'controllerIncludeModel',
        message: 'Import model module in controller?'
    }, {
        type: 'list',
        name: 'modelName',
        choices: listModelNames,
        message: 'Model name?',
        when: showModelList
    }, {
        name: 'controllerName',
        message: 'Controller name?',
        when: showControllerName,
        validate: validateControllerName
    }, {
        type: 'confirm',
        name: 'controllerOverrideFunctions',
        message: 'Override functions?'
    }, {
        type: 'checkbox',
        name: 'controllerFunctions',
        choices: common.domain.controller.functions,
        message: 'Select function to override?',
        when: showControllerFunctions
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
            if (!answers.domainName) {
                answers.domainName = 'content';
            }
            if (answers.modelName) {
                answers.controllerName = modules.inflection.pluralize(answers.modelName);
                answers.modelDisplayName = modules.inflection.humanize(answers.modelName);
            }
            if (!answers.modelNamespace) {
                answers.modelNamespace = common.domain.find('application').namespace.uri;
            }
            common.domain.controller.build(
                answers,
                done
            );
        });
    });
    return gulp;
}