/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, modules) {

    var PATH = './xquerrail.json';
    var fs = require('fs'),
        nconf = require('nconf'),
        xml2js = require('xml2js');
    var builder = new xml2js.Builder();
    var _configuration = nconf.file(PATH);

    var includeController = function(filepath) {
        var modelName = modules.path.basename(filepath)
        modelName = modelName.substring(0, modelName.length - 10);
        var controllerName = modules.inflection.pluralize(modelName);
        var modelDisplayName = modules.inflection.humanize(modelName);
        var controller = '<controller name="' + controllerName + '" model="' + modelName +'" label="' + modelDisplayName + '"/>'
        return controller;
    };

    var buildModel = function(answers) {
        var model = {'$': {}, 'element': []};
        model['$']['name'] = answers.modelName;
        model['$']['persistence'] = answers.modelPersistence;
        if (answers.modelPersistence !== 'directory') {
            model[answers.modelPersistence] = '/' + answers.modelName + '/';
        } else if (answers.modelPersistence !== 'document') {
            model[answers.modelPersistence] = '/' + answers.modelName + '.xml';
        }
        model['$']['label'] = answers.modelDisplayName;
        model['$']['namespace'] = answers.modelNamespace;
        if (answers.modelExtends) {
            model['$']['extends'] = answers.modelExtends;
        }
        model['$']['key'] = answers.modelKey;
        model['$']['keyLabel'] = answers.modelKeyLabel;
        answers.modelFields.forEach(function(field) {
            model['element'].push({
                '$' : {
                    'name': field,
                    'type': 'string',
                    'label': modules.inflection.humanize(field)
                }
            });
        });
        return new xml2js.Builder({'rootName': 'model', 'headless': true}).buildObject(model);
    };

    return {
        "configuration": _configuration,
        "domain": {
            "buildControllers": function(cb) {
                gulp
                    .src('./src/main/*/domains/application-domain.xml')
                    .pipe(
                        modules.inject(
                            gulp.src(['./src/main/*/models/*-model.xqy'], {read: false}), {
                                name: 'controllers',
                                transform: includeController
                            }
                        )
                    )
                    .pipe(gulp.dest(function(file) {
                        return file.base;
                    }))
                    .on('end', function () {
                        if (cb) cb();
                    });
            },
            "addControllerFile": function(answers, cb) {
                gulp.src(__dirname + '/../templates/controller/**')
                    .pipe(modules.template(answers))
                    .pipe(modules.rename(function (file) {
                        if (modules['_.string'].endsWith(modules.path.basename(file.basename), '-controller')) {
                            file.basename = answers.controllerName + file.basename;
                        }
                    }))
                    .pipe(modules.conflict('./'))
                    .pipe(gulp.dest('./'))
                    .on('end', function () {
                        if (cb) cb();
                    });
            },
            "buildModel": function(model, cb) {
                gulp
                    .src('./src/main/*/domains/application-domain.xml')
                    .pipe(
                        modules['inject-string'].after(
                            '<!-- model -->',
                            // modules['_'].template('\n\t<model name="${model.modelName}" namespace="${model.modelNamespace}"></model>\n')({'model': model})
                            '\n' + buildModel(model) + '\n'
                        )
                    )
                    .pipe(gulp.dest(function(file) {
                        return file.base;
                    }))
                    .on('end', function () {
                        if (cb) cb();
                    });
                // return modules['_'].template('<model name="${model.modelName}" namespace="${model.modelNamespace}"></model>')(model);
            },
            "addModelFile": function (answers, cb) {
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
                        if (cb) cb();
                    });
            },
            "addModelToConfiguration": function (answers, cb) {
                var models = _configuration.get('domain:models') || [];
                models.push(answers.modelName);
                _configuration.set('domain:models', models);
                _configuration.save();
                if (cb) cb();
            }
        }
    }
}