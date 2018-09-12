import { currentRouteName, findAll, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

module('Acceptance | Program - Publication Check', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const user = await setupAuthentication({ school });
    this.server.create('school');
    this.server.create('objective');
    this.server.create('term');
    this.server.create('competency', { school });
    this.server.create('program', { school });
    this.fullProgramYear = this.server.create('programYear', {
      startYear: 2013,
      programId: 1,
      directors: [user],
      objectiveIds: [1],
      termIds: [1],
      competencyIds: [1],
    });
    this.emptyProgramYear = this.server.create('programYear', {
      startYear: 2013,
      programId: 1
    });
    this.server.createList('cohort', 2);
  });

  test('full program count', async function(assert) {
    await visit('/programs/1/programyears/' + this.fullProgramYear.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'programYear.publicationCheck');
    var items = findAll('.programyear-publication-check .detail-content table tbody td');
    assert.equal(await getElementText(items[0]), getText('2013 - 2014'));
    assert.equal(await getElementText(items[1]), getText('Yes (1)'));
    assert.equal(await getElementText(items[2]), getText('Yes (1)'));
    assert.equal(await getElementText(items[3]), getText('Yes (1)'));
    assert.equal(await getElementText(items[4]), getText('Yes (1)'));
  });

  test('empty program count', async function(assert) {
    await visit('/programs/1/programyears/' + this.emptyProgramYear.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'programYear.publicationCheck');
    var items = findAll('.programyear-publication-check .detail-content table tbody td');
    assert.equal(await getElementText(items[0]), getText('2013 - 2014'));
    assert.equal(await getElementText(items[1]), getText('No'));
    assert.equal(await getElementText(items[2]), getText('No'));
    assert.equal(await getElementText(items[3]), getText('No'));
    assert.equal(await getElementText(items[4]), getText('No'));
  });
});
