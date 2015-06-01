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
    return {
        "configuration": _configuration,
        "domain": {
            "includeController": function(filepath) {
                var modelName = modules.path.basename(filepath)
                modelName = modelName.substring(0, modelName.length - 10);
                var controllerName = modules.inflection.pluralize(modelName);
                var modelDisplayName = modules.inflection.humanize(modelName);
                return '<controller name="' + controllerName + '" model="' + modelName +'" label="' + modelDisplayName + '"/>';
            }
        }
    }
}