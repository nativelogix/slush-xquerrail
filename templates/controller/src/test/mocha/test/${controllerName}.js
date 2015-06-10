'use strict';

var xquerrailCommon = require('./xquerrailCommon');
var _ = require('lodash');

var <%= controllerName %>API = (function() {

  var getController = function() {
    return '<%= controllerName %>';
  };

  var customAction = function(callback, format) {
    xquerrailCommon.httpMethod('GET', getController(), 'custom-action', undefined, undefined, callback, format);
  };

  return {
    getController: getController,
    customAction: customAction
  };
})();

module.exports = <%= controllerName %>API;
