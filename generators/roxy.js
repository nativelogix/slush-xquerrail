/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, common, modules) {

gulp.task('roxy', function (done) {
    var prompts = [{
        name: 'roxyVersion',
        message: 'Roxy version?',
        default: common.deployer.roxy.version
    }, {
        type: 'list',
        name: 'marklogicVersion',
        message: 'MarkLogic version?',
        choices: ['7', '8'],
        default: '8'
    }, {
        name: 'markLogicHost',
        message: 'Marklogic host?'
    }, {
        name: 'roxyApplicationName',
        message: 'Application name?',
        default: common.package.name
    }, {
        name: 'roxyApplicationPort',
        message: 'Application port?'
    }, {
        name: 'roxyBootstrapUser',
        message: 'Bootstrap user?',
        default: 'admin'
    }, {
        type: 'password',
        name: 'roxyBootstrapPassword',
        message: 'Bootstrap password?'
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
            answers.roxyInstallXcc = true;
            answers.roxyXccPort = Number.parseInt(answers.roxyApplicationPort) + 1;
            common.deployer.roxy.setup(answers, done);
        });
});
  return gulp;
}