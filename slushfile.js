/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp');

var modules = {
    'gulpif': require('gulp-if'),
    'inject': require('gulp-inject'),
    'path': require('path'),
    'install': require('gulp-install'),
    'conflict': require('gulp-conflict'),
    'template': require('gulp-template'),
    'rename': require('gulp-rename'),
    '_.string': require('underscore.string'),
    'inflection': require('inflection'),
    'inquirer': require('inquirer')
};

var common = require('./generators/common')(gulp, modules);

// load generators
gulp = require('./generators/app')(gulp, common, modules);
gulp = require('./generators/controller')(gulp, common, modules);
gulp = require('./generators/model')(gulp, common, modules);
