'use strict';

var xquerrailCommon = require('./xquerrailCommon');
var api = require('./<%= controllerName %>');
var _ = require('lodash');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe('<%= controllerName %> controller API', function() {

  before(function(done) {
    xquerrailCommon.initialize(function(error, response, body) {
      expect(error).to.be.null;
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('should invoke custom-action in xml format', function(done) {
    api.customAction(
      function(error, response, entity) {
        expect(response.statusCode).to.equal(200);
        expect(entity).to.have.string('custom-action');
        done();
      },
      'xml'
    );
  });

  it('should invoke custom-action in json format', function(done) {
    api.customAction(
      function(error, response, entity) {
        expect(response.statusCode).to.equal(200);
        expect(entity).to.have.property('custom-action');
        done();
      },
      'json'
    );
  });

});
