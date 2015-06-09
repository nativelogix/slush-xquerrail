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
    '_': require('lodash'),
    'gulpif': require('gulp-if'),
    'inject': require('gulp-inject'),
    'path': require('path'),
    'install': require('gulp-install'),
    'conflict': require('gulp-conflict'),
    'template': require('gulp-template'),
    'rename': require('gulp-rename'),
    'inject-string': require('gulp-inject-string'),
    '_.string': require('underscore.string'),
    'inflection': require('inflection'),
    'inquirer': require('inquirer')
};

var common = require('./generators/common')(gulp, modules);

// load generators
gulp = require('./generators/app')(gulp, common, modules);
gulp = require('./generators/roxy')(gulp, common, modules);
gulp = require('./generators/controller')(gulp, common, modules);
gulp = require('./generators/model')(gulp, common, modules);
gulp = require('./generators/view')(gulp, common, modules);
gulp = require('./generators/optionlist')(gulp, common, modules);
