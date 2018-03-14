import { currentRouteName, findAll, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

module('Acceptance: Program Year - Publication Check', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.fullProgram = this.server.create('program', {
      startYear: 2013,
      schoolId: 1,
    });
    this.emptyProgram = this.server.create('program', {
      startYear: 2013,
      schoolId: 1
    });
    this.server.create('programYear', { programId: 1});
    this.server.create('cohort', { programYearId: 1});
  });

  test('full program count', async function(assert) {
    await visit('/programs/' + this.fullProgram.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'program.publicationCheck');
    var items = findAll('.program-publication-check .detail-content table tbody td');
    assert.equal(await getElementText(items[0]), getText('program 0'));
    assert.equal(await getElementText(items[1]), getText('short_0'));
    assert.equal(await getElementText(items[2]), 4);
    assert.equal(await getElementText(items[3]), getText('Yes (1)'));
  });

  test('empty program count', async function(assert) {
    await visit('/programs/' + this.emptyProgram.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'program.publicationCheck');
    var items = findAll('.program-publication-check .detail-content table tbody td');
    assert.equal(await getElementText(items[0]), getText('program 1'));
    assert.equal(await getElementText(items[1]), getText('short_1'));
    assert.equal(await getElementText(items[2]), 4);
    assert.equal(await getElementText(items[3]), getText('No'));
  });
});
