import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: Program Year - Publication Check', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    fixtures.fullProgram = server.create('program', {
      startYear: 2013,
      schoolId: 1,
    });
    fixtures.emptyProgram = server.create('program', {
      startYear: 2013,
      schoolId: 1
    });
    server.create('programYear', { programId: 1});
    server.create('cohort', { programYearId: 1});
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('full program count', async function(assert) {
    await visit('/programs/' + fixtures.fullProgram.id + '/publicationcheck');
    assert.equal(currentPath(), 'program.publicationCheck');
    var items = find('.program-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('program 0'));
    assert.equal(getElementText(items.eq(1)), getText('short_0'));
    assert.equal(getElementText(items.eq(2)), 4);
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
  });

  test('empty program count', async function(assert) {
    await visit('/programs/' + fixtures.emptyProgram.id + '/publicationcheck');
    assert.equal(currentPath(), 'program.publicationCheck');
    var items = find('.program-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('program 1'));
    assert.equal(getElementText(items.eq(1)), getText('short_1'));
    assert.equal(getElementText(items.eq(2)), 4);
    assert.equal(getElementText(items.eq(3)), getText('No'));
  });
});
