import { test } from 'qunit';
import moduleForAcceptance from 'ilios/tests/helpers/module-for-acceptance';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from 'ilios/tests/helpers/destroy-app';

moduleForAcceptance('Acceptance | assign students', {
  beforeEach: function() {
    setupAuthentication(this.application);
    server.createList('school', 2);
  }
});

test('visiting /admin/assignstudents', function(assert) {
  visit('/admin/assignstudents');

  andThen(function() {
    assert.equal(getElementText('#school-selection'), getText('school 0'));

    assert.equal(currentURL(), '/admin/assignstudents');
  });
});
