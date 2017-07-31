import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: FourOhFour', {
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

test('visiting /four-oh-four', async function(assert) {
  await visit('/four-oh-four');

  assert.equal(currentPath(), 'fourOhFour');
  assert.equal(getElementText(find('.full-screen-error')), getText("Rats! I couldn't find that. Please check your page address, and try again.Back to Dashboard"));
});

test('visiting /nothing', async function(assert) {
  await visit('/nothing');

  assert.equal(currentPath(), 'fourOhFour');
});
