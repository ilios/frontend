import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: FourOhFour' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);

    fixtures.schools = [];
    fixtures.schools.pushObjects(server.createList('school', 2));
  },

  afterEach: function() {
    destroyApp(application);
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
