/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

var listControllers = function(answers) {
    return common.domain.find(answers.domainName || common.domain.default).controllers;
};

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

var validateActionName = function(input) {
    var required = common.validation.required(input);
    if (required === true) {
        var domain = common.domain.find(_answers['domainName'])
        var view;
        var action;
        domain.views.some(function(v) {
            if (v.controller === _answers['controllerName']) {
                view = v;
                return true;
            }
        });
        if (view) {
            view.actions.some(function(a) {
                if (a.name === input && modules['_.string'].contains(a.formats, _answers['viewFormat'])) {
                    action = a;
                    return true;
                }
            });
        }
        if (action) {
            return 'View name [controller-name.action-name.format] must be unique.'
        } else {
            return true
        }
    } else {
        return required;
    }
};

gulp.task('view', function (done) {
    var prompts = [{
        name: 'domainName',
        type: 'list',
        message: 'What is the domain model?',
        choices: common.domain.list,
        default: common.domain.default,
        when: function() {return false;},
        validate: function(input) { return validateAndCapture(input, 'domainName')}
    }, {
        type: 'list',
        name: 'controllerName',
        message: 'Controller name in view?',
        choices: listControllers,
        filter: function(input) { validateAndCapture(input, 'controllerName'); return input;}
    }, {
        type: 'checkbox',
        name: 'viewFormat',
        message: 'Format in view?',
        choices: common.domain.view.formats,
        validate: function(input) { return validateAndCapture(input, 'viewFormat')}
    }, {
        name: 'actionName',
        message: 'Action name?',
        validate: validateActionName
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
            common.domain.view.build(
                answers,
                done
            );
        });
    });
    return gulp;
}