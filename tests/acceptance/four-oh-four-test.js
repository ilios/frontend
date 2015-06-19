import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: FourOhFour', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});

    fixtures.schools = [];
    fixtures.schools.pushObjects(server.createList('school', 2));
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /four-oh-four', function(assert) {
  visit('/four-oh-four');

  andThen(function() {
    assert.equal(currentPath(), 'fourOhFour');
    assert.equal(getElementText(find('.full-screen-error')), getText("Rats! I couldn't find that. Please check your page address, and try again."));
  });
});

test('visiting /nothing', function(assert) {
  visit('/nothing');

  andThen(function() {
    assert.equal(currentPath(), 'fourOhFour');
  });
});
