import { click, currentRouteName, currentURL, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication, getElementText, getText } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const url = '/courses/1/sessions/1/publicationcheck';
module('Acceptance | Session - Publication Check', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', {
      school,
    });
    this.course = this.server.create('course', { school });
    this.sessionTypes = this.server.createList('sessionType', 2, {
      school,
    });
    this.term = this.server.create('term', { vocabulary });
    this.meshDescriptor = this.server.create('meshDescriptor');
  });

  test('full session count', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
    });
    this.server.create('sessionObjective', { session });
    this.server.create('offering', { session });
    await visit(url);
    assert.strictEqual(currentRouteName(), 'session.publication_check');
    const items = findAll('.session-publicationcheck table tbody td');
    assert.strictEqual(await getElementText(items[0]), getText('session 0'));
    assert.strictEqual(await getElementText(items[1]), getText('Yes (1)'));
    assert.strictEqual(await getElementText(items[2]), getText('Yes (1)'));
    assert.strictEqual(await getElementText(items[3]), getText('Yes (1)'));
    assert.strictEqual(await getElementText(items[4]), getText('Yes (1)'));
  });

  test('empty session count', async function (assert) {
    //create 2 because the second one is empty
    this.server.createList('session', 2, {
      course: this.course,
    });
    this.server.db.courses.update(1, { sessionIds: [1, 2] });
    await visit('/courses/1/sessions/2/publicationcheck');
    assert.strictEqual(currentRouteName(), 'session.publication_check');
    const items = findAll('.session-publicationcheck table tbody td');
    assert.strictEqual(await getElementText(items[0]), getText('session 1'));
    assert.strictEqual(await getElementText(items[1]), getText('No'));
    assert.strictEqual(await getElementText(items[2]), getText('No'));
    assert.strictEqual(await getElementText(items[3]), getText('No'));
    assert.strictEqual(await getElementText(items[4]), getText('No'));
  });

  test('unlink icon transitions properly', async function (assert) {
    const session = this.server.create('session', { course: this.course });
    this.server.create('sessionObjective', { session });
    await visit(url);
    await click('.fa-unlink');
    assert.strictEqual(
      currentURL(),
      '/courses/1/sessions/1?addOffering=false&courseCompetencyDetails=false&courseLeadershipDetails=false&courseManageLeadership=false&courseObjectiveDetails=false&courseTaxonomyDetails=false&details=false&sessionLeadershipDetails=false&sessionManageLeadership=false&sessionObjectiveDetails=true&sessionTaxonomyDetails=false'
    );
  });
});
