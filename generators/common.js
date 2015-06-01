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
        nconf = require('nconf');
    var _configuration = nconf.file(PATH);
    var includeController = function(filepath) {
        var modelName = modules.path.basename(filepath)
        modelName = modelName.substring(0, modelName.length - 10);
        var controllerName = modules.inflection.pluralize(modelName);
        var modelDisplayName = modules.inflection.humanize(modelName);
        var controller = '<controller name="' + controllerName + '" model="' + modelName +'" label="' + modelDisplayName + '"/>'
        // console.log('Add model ' + controller + '\n' + filepath);
        return controller;
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
            }
        }
    }
}