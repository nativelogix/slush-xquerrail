/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp) {

    var fs = require('fs'),
        nconf = require('nconf');
    var PATH = './xquerrail.json';
    return {
        "configuration": nconf.file(PATH),
        "path": PATH
    }
}