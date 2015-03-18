import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from '<%= dasherizedPackageName %>/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: <%= classifiedModuleName %>', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});

    fixtures.schools = [];
    fixtures.schools.pushObjects(server.createList('schools', 2));
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /<%= dasherizedModuleName %>', function(assert) {
  visit('/<%= dasherizedModuleName %>');

  andThen(function() {
    assert.equal(currentPath(), '<%= dasherizedModuleName %>');
  });
});
