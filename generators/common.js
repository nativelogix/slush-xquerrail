/*
 * slush-xquerrail
 * https://github.com/rlouapre/slush-xquerrail
 *
 * Copyright (c) 2015, Richard Louapre
 * Licensed under the MIT license.
 */

module.exports = function(gulp, modules) {

    var XQUERRAIL_VERSION = "0.0.12";
    var ROXY_VERSION = "1.7.2";
    var DEFAULT_DOMAIN = 'content';
    var DEFAULT_COLLATION = 'http://marklogic.com/collation/codepoint';
    var DEFAULT_APPLICATION_NAMESPACE = {
        'prefix': 'application',
        'uri': 'http://xquerrail.com/application'
    };
    var DEFAULT_CONTENT_NAMESPACE = {
        'prefix': 'content', 
        'uri': 'http://xquerrail.com/content'
    };
    var XQUERRAIL_JSON = './xquerrail.json';
    var PACKAGE_JSON = './package.json';
    var TYPE_MAPPINGS = {
        "s": "string",
        "dc": "decimal",
        "db": "double",
        "f": "float",
        "l": "long",
        "i": "integer",
        "b": "boolean",
        "dt": "date",
        "dtm": "dateTime",
        "id": "identity",
        "iri": "iri",
        "ct": "create-timestamp",
        "cu": "create-user",
        "ut": "update-timestamp",
        "uu": "update-user",
        "tr": "triple",
        "ref": "reference"
    }
    var CONTROLLER_FUNCTIONS = [
        "create",
        "update",
        "get",
        "delete",
        "list",
        "search",
        "put",
        "patch",
        "post",
        "binary",
        "index",
        "new",
        "edit",
        "remove",
        "save",
        "details",
        "show",
        "lookup",
        "fields",
        "suggest"
     ];

    var fs = require('fs'),
        exec = require('child_process').exec,
        nconf = require('nconf'),
        xpath = require('xpath'), 
        dom = require('xmldom').DOMParser
        xml2js = require('xml2js');
    var builder = new xml2js.Builder();
    var _configuration = nconf.file(XQUERRAIL_JSON);
    if (!_configuration.get('application')) {
        _configuration.set('application:domains', []);
    }

    var _package = undefined;

    try {
      _package = JSON.parse(fs.readFileSync(PACKAGE_JSON));
    } catch (e) {
        // console.error(e);
    }

    var buildControllerXml = function(answers) {
        var controller = {'$': {}};
        controller['$']['name'] = answers.controllerName;
        if (answers.modelName) {
            controller['$']['model'] = answers.modelName;
            controller['$']['label'] = modules.inflection.humanize(answers.controllerName);
        }
        return new xml2js.Builder({'rootName': 'controller', 'headless': true}).buildObject(controller);
    };

    var buildControllerDefinition = function(answers, cb) {
        var path = './src/main/*/domains/' + answers.domainName + '-domain.xml';
        gulp
            .src(path)
            .pipe(
                modules['inject-string'].after(
                    '<!-- controllers -->',
                    '\n' + buildControllerXml(answers) + '\n'
                )
            )
            .pipe(gulp.dest(function(file) {
                return file.base;
            }))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var addControllerFile = function(answers, cb) {
        gulp
            .src(__dirname + '/../templates/controller/src/main/**')
            .pipe(modules.template(answers))
            .pipe(modules.rename(function (file) {
                file.dirname = modules['_'].template(file.dirname)(answers);
                file.basename = modules['_'].template(file.basename)(answers);
            }))
            // .pipe(modules.rename(function (file) {
            //     if (modules['_.string'].endsWith(modules.path.basename(file.basename), '-controller')) {
            //         file.basename = answers.controllerName + file.basename;
            //     }
            // }))
            .pipe(modules.conflict('./src/main/'))
            .pipe(gulp.dest('./src/main/'))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var updateControllerConfiguration = function (answers, cb) {
        var domains = _configuration.get('application:domains');
        var domain;
        domains.forEach(function(d) {
            if (d.name === answers.domainName) {
                domain = d;
            }
        });
        var controllers = domain.controllers || [];
        controllers.push(answers.controllerName);
        domain.controllers = controllers;
        _configuration.set('application:domains', domains);
        _configuration.save();
        if (cb) cb();
    };

    var buildControllerMochaTest = function(answers, cb) {
        if (! answers.controllerIncludeTests) {
            if (cb) cb();
        } else {
            gulp
                .src(__dirname + '/../templates/controller/src/test/**')
                .pipe(modules.template(answers))
                .pipe(modules.rename(function (file) {
                    file.dirname = modules['_'].template(file.dirname)(answers);
                    file.basename = modules['_'].template(file.basename)(answers);
                }))
                .pipe(modules.conflict('./src/test/'))
                .pipe(gulp.dest('./src/test/'))
                .on('end', function () {
                    if (cb) cb();
                });
        }
    };

    var parseModelField = function(fieldName) {
        var field = undefined;
        for (var prefix in TYPE_MAPPINGS) {
            if (modules['_.string'].endsWith(fieldName, '[' + prefix + ']')) {
                field = {
                  'type': TYPE_MAPPINGS[prefix],
                  'name': fieldName.substring(0, fieldName.length - ('[' + prefix + ']').length)
                };
                break;
            }
        }
        if (!field) {
            field = {
                'name': fieldName,
                'type': 'string'
            }
        }
        field.label = modules.inflection.humanize(field.name)
        return field;
    };

    var buildModelXml = function(answers) {
        var model = {'$': {}, 'element': []};
        model['$']['name'] = answers.modelName;
        model['$']['persistence'] = answers.modelPersistence;
        if (answers.modelPersistence === 'directory') {
            model[answers.modelPersistence] = '/' + answers.modelName + '/';
        } else if (answers.modelPersistence === 'document') {
            model[answers.modelPersistence] = '/' + answers.modelName + '.xml';
        }
        model['$']['label'] = answers.modelDisplayName;
        model['$']['namespace'] = answers.modelNamespace;
        if (answers.modelExtends) {
            model['$']['extends'] = answers.modelExtends;
        }
        model['$']['key'] = parseModelField(answers.modelKey).name;
        model['$']['keyLabel'] = parseModelField(answers.modelKeyLabel).name;
        answers.modelFields.forEach(function(name) {
            var field = parseModelField(name);
            if (field.name == model['$']['key']) {
                field["identity"] = true;
            }
            model['element'].push({
                '$' : field
            });
        });
        return new xml2js.Builder({'rootName': 'model', 'headless': true}).buildObject(model);
    };

    var buildModelDefinition = function(answers, cb) {
        var path = './src/main/*/domains/' + answers.domainName + '-domain.xml';
        gulp
            .src(path)
            .pipe(
                modules['inject-string'].after(
                    '<!-- models -->',
                    '\n' + buildModelXml(answers) + '\n'
                )
            )
            .pipe(gulp.dest(function(file) {
                return file.base;
            }))
            .on('end', function () {
                if (cb) cb();
            });
    };
    
    var buildModelXrayTest = function(answers, cb) {
        if (! answers.modelIncludeTests) {
            if (cb) cb();
        } else {
            gulp
                .src(__dirname + '/../templates/model/src/test/**')
                .pipe(modules.template(answers))
                .pipe(modules.rename(function (file) {
                    file.dirname = modules['_'].template(file.dirname)(answers);
                    file.basename = modules['_'].template(file.basename)(answers);
                }))
                .pipe(modules.conflict('./src/test/'))
                .pipe(gulp.dest('./src/test/'))
                .on('end', function () {
                    if (cb) cb();
                });
        }
    };

    var addModelFile = function (answers, cb) {
        gulp.src(__dirname + '/../templates/model/src/main/**')
            .pipe(modules.template(answers))
            .pipe(modules.rename(function (file) {
                file.dirname = modules['_'].template(file.dirname)(answers);
                file.basename = modules['_'].template(file.basename)(answers);
            }))
            .pipe(modules.conflict('./src/main/'))
            .pipe(gulp.dest('./src/main/'))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var updateModelConfiguration = function (answers, cb) {
        var domains = _configuration.get('application:domains');
        var domain;
        domains.forEach(function(d){
            if (d.name === answers.domainName) {
                domain = d;
            }
        });
        var models = domain.models || [];
        models.push(answers.modelName);
        domain.models = models;
        _configuration.set('application:domains', domains);
        _configuration.save();
        if (cb) cb();
    };

    var addViewFile = function(answers, cb) {
        var extension;
        if (answers.viewFormat.length === 1) {
            extension = answers.viewFormat
        } else {
            extension = '{' + answers.viewFormat.join() + '}';
        }
        var path = __dirname + '/../templates/view/**/*.' + extension + '.xqy';
        gulp
            .src(path)
            .pipe(modules.template(answers))
            .pipe(modules.rename(function (file) {
                file.dirname = modules['_'].template(file.dirname)(answers);
                file.basename = modules['_'].template(file.basename)(answers);
            }))
            .pipe(modules.conflict('./'))
            .pipe(gulp.dest('./'))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var updateViewConfiguration = function (answers, cb) {
        var domains = _configuration.get('application:domains');
        var domain;
        domains.forEach(function(d){
            if (d.name === answers.domainName) {
                domain = d;
            }
        });
        var views = domain.views || [];
        var view;
        views.some(function(v) {
            if (v.controller === answers.controllerName) {
                view = v;
                return true;
            }
        });
        if (!view) {
            view = {
                'controller': answers.controllerName,
                'actions': [{
                    'name': answers.actionName,
                    'formats': answers.viewFormat
                }]
            }
            views.push(view);
        } else {
            var action;
            view.actions.some(function(a) {
                if (a.name === answers.actionName) {
                    action = a;
                    return true;
                }
            });
            if (!action) {
                view.actions.push({
                    'name': answers.actionName,
                    'formats': answers.viewFormat
                })
            } else {
                action.formats.push(answers.viewFormat);
            }
        }
        domain.views = views;
        _configuration.set('application:domains', domains);
        _configuration.save();
        if (cb) cb();
    };

    var viewFormat = function() {
        var glob = require("glob"),
            path = require("path");
        var extensions = [];
        glob.sync(__dirname + '/../templates/view/**/*.xqy').forEach(function(file) {
            extensions.push(path.extname(path.basename(file, path.extname(file))).substring(1));
        })
        return extensions;
    };

    var buildOptionListXml = function(answers) {
        var optionlist = {'$': {}, 'option': []};
        optionlist['$']['name'] = answers.optionListName;
        answers.optionListValues.forEach(function(value) {
            optionlist['option'].push(value);
        });
        return new xml2js.Builder({'rootName': 'optionlist', 'headless': true}).buildObject(optionlist);
    };

    var buildOptionListDefinition = function(answers, cb) {
        var path = './src/main/*/domains/' + answers.domainName + '-domain.xml';
        gulp
            .src(path)
            .pipe(
                modules['inject-string'].after(
                    '<!-- optionlists -->',
                    '\n' + buildOptionListXml(answers) + '\n'
                )
            )
            .pipe(gulp.dest(function(file) {
                return file.base;
            }))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var updateOptionListConfiguration = function (answers, cb) {
        var domains = _configuration.get('application:domains');
        var domain;
        domains.forEach(function(d){
            if (d.name === answers.domainName) {
                domain = d;
            }
        });
        var optionlists = domain.optionlists || [];
        optionlists.push(answers.optionListName);
        domain.optionlists = optionlists;
        _configuration.set('application:domains', domains);
        _configuration.save();
        if (cb) cb();
    };

    var installXray = function(answers, cb) {
        var Download = require('download');
        new Download({mode: '755', extract: true, strip: 1})
            .get('https://github.com/robwhitby/xray/archive/master.zip')
            .dest('./src/xray')
            .run(
                function() {
                    if (cb) cb();
                }
            );
    };

    var installRoxy = function(answers, cb) {
        var Download = require('download');
        new Download({mode: '755', extract: true, strip: 1})
            .get('https://github.com/marklogic/roxy/releases/download/v' + answers.roxyVersion + '/roxy-' + answers.roxyVersion + '.zip')
            .dest('./roxy')
            .run(
                function() {
                    if (cb) cb();
                }
            );
    };

    var roxyBaseCommand = 'ruby -C./roxy -Ideploy -Ideploy/lib deploy/lib/ml.rb ';
    
    var initRoxy = function(answers, cb) {
        var arguments = [
            'init',
            answers.roxyApplicationName,
            '--server-version=' + answers.marklogicVersion
        ]
        var cmd = roxyBaseCommand + arguments.join(' ');
        exec(cmd, function (err, stdout, stderr) {
            console.log(stdout);
            if (stderr) {console.log(stderr);}
            if (err) {console.log(err);}
            if (cb) {cb();}
        });
    };


    var createMlJson = function(answers, cb) {
        var path = __dirname + '/../templates/roxy/ml.json';
        gulp
            .src(path)
            // .pipe(modules.template(answers, modules['_'].templateSettings))
            .pipe(modules.template(answers))
            .pipe(modules.conflict('./'))
            .pipe(gulp.dest('./'))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var createRoxyEnvironment = function(answers, cb) {
        var path = __dirname + '/../templates/roxy/**/*.properties';
        gulp
            .src(path)
            .pipe(modules.template(answers, modules['_'].templateSettings))
            // .pipe(modules.template(answers))
            .pipe(modules.conflict('./'))
            .pipe(gulp.dest('./'))
            .on('end', function () {
                if (cb) cb();
            });
    };

    var xquerrailRoleXml = function(answers) {
        return fs.readFileSync(__dirname + '/../templates/roxy/roxy/deploy/xquerrail-role-ml-config.xml');
    };

    var xquerrailUserRoleXml = function(answers) {
        return fs.readFileSync(__dirname + '/../templates/roxy/roxy/deploy/xquerrail-user-ml-config.xml');
    };

    var updateRoxyConfig = function(answers, cb) {
        var path = './roxy/deploy/ml-config.xml';
        gulp
            .src(path)
            .pipe(
                modules['inject-string'].after(
                    '<role-names>\n        <role-name>@ml.app-role</role-name>\n',
                    xquerrailUserRoleXml(answers)
                )
            )
            .pipe(
                modules['inject-string'].after(
                    '<roles xmlns="http://marklogic.com/xdmp/security">\n',
                    xquerrailRoleXml(answers)
                )
            )
            .pipe(gulp.dest(function(file) {
                return file.base;
            }))
            .on('end', function () {
                if (cb) cb();
            });
    };

    return {
        "package": _package,
        "configuration": _configuration,
        "default": {
            "xquerrail": {
                "version": XQUERRAIL_VERSION
            },
            "collation": DEFAULT_COLLATION,
            "namespaces": {
                "application": DEFAULT_APPLICATION_NAMESPACE,
                "content": DEFAULT_CONTENT_NAMESPACE
            }
        },
        "domain": {
            "default": DEFAULT_DOMAIN,
            "namespaces": function () {
                var namespaces = [];
                _configuration.get('application:domains').forEach(
                    function(domain) {
                        namespaces.push(domain.namespace.uri);
                    }
                );
                return namespaces;
            },
            "list": function() {
                var domains = [];
                _configuration.get('application:domains').forEach(
                    function(domain) {
                        domains.push(domain.name);
                    }
                );
                return domains;
            },
            "find": function(name) {
                var domain;
                _configuration.get('application:domains').forEach(
                    function(d) {
                        if(d.name === name) {
                            domain = d;
                        }
                    }
                );
                return domain;
            },
            "controller": {
                "functions": CONTROLLER_FUNCTIONS,
                "build": function(answers, cb) {
                    buildControllerDefinition(
                        answers,
                        function() {
                            addControllerFile(
                                answers, 
                                function() {
                                    updateControllerConfiguration(
                                        answers,
                                        function() {
                                            buildControllerMochaTest(
                                                answers,
                                                function () {
                                                    if (cb) cb();
                                                }
                                            )
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            },
            "model": {
                "build": function(answers, cb) {
                    buildModelDefinition(
                        answers,
                        function() {
                            addModelFile(
                                answers, 
                                function() {
                                    updateModelConfiguration(
                                        answers,
                                        function() {
                                            buildModelXrayTest(
                                                answers,
                                                function() {
                                                    if (cb) cb();
                                                }
                                            )
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            },
            "view": {
                "formats": viewFormat(),
                "build": function(answers, cb) {
                    addViewFile(
                        answers, 
                        function() {
                            updateViewConfiguration(
                                answers,
                                function() {
                                    if (cb) cb();
                                }
                            )
                        }
                    )
                }
            },
            "optionlist": {
                "build": function(answers, cb) {
                    buildOptionListDefinition(
                        answers,
                        function() {
                            updateOptionListConfiguration(
                                answers,
                                function() {
                                    if (cb) cb();
                                }
                            )
                        }
                    )
                }
            }
        },
        "validation": {
            "required": function(input) {
                if (!input) {
                    return 'Input is required.';
                } else {
                    return true;
                }
            }
        },
        "dependencies": {
            "xray": {
                "setup": function(answers, cb) {
                    installXray(answers, cb);
                }
            }
        },
        "deployer": {
            "roxy": {
                "version": ROXY_VERSION,
                "setup": function(answers, cb) {
                    installRoxy(
                        answers,
                        function() {
                            initRoxy(
                                answers,
                                function() {
                                    createRoxyEnvironment(
                                        answers,
                                        function() {
                                            createMlJson(
                                                answers,
                                                function() {
                                                    updateRoxyConfig(
                                                        answers,
                                                        cb
                                                    )
                                                }
                                            )
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            }
        }
    }
}