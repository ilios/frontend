import { currentRouteName, visit, findAll } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const url = '/courses/1/sessions/1/publicationcheck';
module('Acceptance: Session - Publication Check', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    const school = this.server.create('school');
    this.server.create('course', { school });
    this.server.create('vocabulary', {
      school,
    });
    this.server.createList('sessionType', 2, {
      school
    });
    this.server.create('sessionDescription');
    this.server.create('objective');
    this.server.create('term', {
      vocabularyId: 1,
    });
    this.server.create('meshDescriptor');
  });

  test('full session count', async function (assert) {
    this.server.create('session', {
      courseId: 1,
      objectiveIds: [1],
      termIds: [1],
      meshDescriptorIds: [1],
      sessionTypeId: 1,
      sessionDescriptionId: 1
    });
    this.server.create('offering', {
      sessionId: 1
    });
    await visit(url);
    assert.equal(currentRouteName(), 'session.publicationCheck');
    let items = findAll('.session-publicationcheck table tbody td');
    assert.equal(await getElementText(items[0]), getText('session 0'));
    assert.equal(await getElementText(items[1]), getText('Yes (1)'));
    assert.equal(await getElementText(items[2]), getText('Yes (1)'));
    assert.equal(await getElementText(items[3]), getText('Yes (1)'));
    assert.equal(await getElementText(items[4]), getText('Yes (1)'));
  });

  test('empty session count', async function(assert) {
    //create 2 because the second one is empty
    this.server.createList('session', 2, {
      courseId: 1
    });
    this.server.db.courses.update(1, {sessionIds: [1, 2]});
    await visit('/courses/1/sessions/2/publicationcheck');
    assert.equal(currentRouteName(), 'session.publicationCheck');
    let items = findAll('.session-publicationcheck table tbody td');
    assert.equal(await getElementText(items[0]), getText('session 1'));
    assert.equal(await getElementText(items[1]), getText('No'));
    assert.equal(await getElementText(items[2]), getText('No'));
    assert.equal(await getElementText(items[3]), getText('No'));
    assert.equal(await getElementText(items[4]), getText('No'));
  });
});
