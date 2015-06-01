'use strict';

var argv = require('yargs').argv;
var path = require('path');
var request = require('request').defaults({jar: true});
var assert = require('chai').assert;
var expect = require('chai').expect;

var xquerrailCommon = (function() {
  var settings = {};
  var ml;
  try {
    ml = require('../../../../gulpfile.js').ml;
    if(ml === undefined) {
      throw new Error();
    }
  } catch(e) {
    console.log('Could find global ml try different location ./ml.json');
    ml = require('./ml.json');
  }

  ml = ml || {};

  ml.user = argv.user || process.env['ml.user'] || ml.user;
  ml.password = argv.password || process.env['ml.password'] || ml.password;
  ml.host = argv.host || process.env['ml.host'] || ml.host || 'localhost';
  ml.port = argv.port || process.env['ml.port'] || ml.port;

  settings.urlBase = 'http://' + ml.host + ":" + ml.port;
  settings.username = ml.user;
  settings.password = ml.password;
  settings.currentUser = ml.currentUser || random('dummy-user');
  console.log('Using XQuerrail: %j', settings)

  function random(prefix) {
    return ((prefix)? prefix + '-': '') + Date.now()
  };

  function getApplicationConfig(filename) {
    var configurationPath;
    if (filename === undefined) {
      // configurationPath = '/main/_config';
      return
    } else {
      configurationPath = getApplicationConfigPath(filename)
    }
    return '<application xmlns="http://xquerrail.com/config"><base>/main/node_modules/xquerrail2.framework/dist</base><config>'+configurationPath+'</config></application>'
  }

  function getApplicationConfigPath(filename) {
    var configurationPath = filename.substring(0, filename.length - path.extname(filename).length);
    configurationPath = configurationPath.replace(/\\/g, '/');
    configurationPath = configurationPath.substring(configurationPath.indexOf('xquerrail2.framework/src') + 'xquerrail2.framework/src'.length);
    return configurationPath += '/_config';
  }

  function initialize(callback, configuration) {
    var applicationConfiguration = getApplicationConfig(configuration);
    var options = {
      url: settings.urlBase + '/initialize',
      followRedirect: true,
      headers: {'Content-Type': 'text/xml'}
    };

    if (applicationConfiguration === undefined) {
      options.method = 'GET';
    } else {
      options.method = 'POST';
      options.body = getApplicationConfig(configuration);
    }
    request(options, function(error, response, body) {setTimeout(function(){callback(error, response, body)}, 100)});
  };

  function login(callback) {
    var options = {
      method: 'POST',
      url: settings.urlBase + '/login',
      form: {
        username: settings.username,
        password: settings.password
      },
      followRedirect: true
    };

    request(options, callback);
  };

  function logout(callback) {
    var options = {
      method: 'GET',
      url: settings.urlBase + '/logout',
      followRedirect: true
    };

    request(options, callback);
  };

  function httpMethod(method, model, action, data, qs, callback, format) {
    format = (format === undefined? '.json': format);
    var json = (format === '.json');
    var headers = {
      'userId': settings.currentUser
    };
    if (json) {
      headers['content-type'] = 'application/json';
    }
    var options = {
      method: method,
      url: xquerrailCommon.urlBase + '/' + model + '/' + action + (format === undefined? '.json': format),
      headers: headers,
      json: data,
      qs: qs,
      followRedirect: true
    };
    request(options, function(error, response) {
      return parseResponse(model, error, response, callback);
    });
  };

  function parseResponse(model, error, response, callback) {
    var body; 
    try {
      body = JSON.parse(response.body);
    } catch(e) {
      body = response.body;
    }
    if (response.statusCode === 500) {
      console.dir(body)
      error = parseError(body);
    }
    // var entity = body;
    if (callback !== undefined) {
      callback(error, response, body);
    }
    
  };

  function parseError(body) {
    return {
      code: body.error.code,
      message: body.error.message,
      description: body.error['format_string'],
      data: body.error.data,
      stack: body.error.stack
    }
  };

  return {
    urlBase: settings.urlBase,
    username: settings.username,
    password: settings.password,
    currentUser: settings.currentUser,
    initialize: initialize,
    login: login,
    logout: logout,
    random: random,
    httpMethod: httpMethod
  };
})();

module.exports = xquerrailCommon;
