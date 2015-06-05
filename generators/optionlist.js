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

function validateOptionListName(input) {
    var required = common.validation.required(input);
    if (required === true) {
        var domain = common.domain.find(_answers['domainName'])
        if (modules['_.string'].contains(domain.optionlists, input)) {
            return 'OptionList name must be unique.'
        } else {
            return true
        }
    } else {
        return required;
    }
};

var validateAndCapture = function(input, key) {
    var required = common.validation.required(input);
    if (required === true) {
        _answers[key] = input
    }
    return required;
};

var listValues = function(answers) {
    return answers['optionListValues'].split(',');
};

gulp.task('optionlist', function (done) {
    var prompts = [{
        name: 'domainName',
        type: 'list',
        message: 'What is the domain model?',
        choices: common.domain.list,
        default: common.domain.default,
        when: function() {return false;},
        filter: function(input) { validateAndCapture(input, 'domainName'); return input;}
    }, {
        name: 'optionListName',
        message: 'OptionList name?',
        choices: listControllers,
        validate: validateOptionListName
    }, {
        name: 'optionListValues',
        message: 'List the option values (comma separated)?',
        validate: common.validation.required
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
            answers.optionListValues = listValues(answers);
            common.domain.optionlist.build(
                answers,
                done
            );
        });
    });
    return gulp;
}