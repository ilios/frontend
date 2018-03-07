import { currentPath, visit } from '@ember/test-helpers';
import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: Program - Publication Check', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('objective');
    server.create('term');
    server.create('competency');
    server.create('program');
    fixtures.fullProgramYear = server.create('programYear', {
      startYear: 2013,
      schoolId: 1,
      programId: 1,
      directorIds: [4136],
      objectiveIds: [1],
      termIds: [1],
      competencyIds: [1],
    });
    fixtures.emptyProgramYear = server.create('programYear', {
      startYear: 2013,
      schoolId: 1,
      programId: 1
    });
    server.createList('cohort', 2);
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('full program count', async function(assert) {
    await visit('/programs/1/programyears/' + fixtures.fullProgramYear.id + '/publicationcheck');
    assert.equal(currentPath(), 'program.programYear.publicationCheck');
    var items = find('.programyear-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('2013 - 2014'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });

  test('empty program count', async function(assert) {
    await visit('/programs/1/programyears/' + fixtures.emptyProgramYear.id + '/publicationcheck');
    assert.equal(currentPath(), 'program.programYear.publicationCheck');
    var items = find('.programyear-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('2013 - 2014'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });
});
