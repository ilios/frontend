import { currentRouteName, visit, findAll } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Course - Publication Check', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    this.server.create('school');
    this.server.create('vocabulary');
    this.server.create('cohort');
    this.server.create('objective');
    this.server.create('term', {
      vocabularyId: 1,
    });
    this.server.create('meshDescriptor');
    this.fullCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
      objectiveIds: [1],
      termIds: [1],
      meshDescriptorIds: [1],
    });
    this.emptyCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1
    });
  });

  test('full course count', async function(assert) {
    await visit('/courses/' + this.fullCourse.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'course.publicationCheck');
    var items = findAll('.course-publicationcheck table tbody td');
    assert.equal(await getElementText(items[0]), getText('course 0'));
    assert.equal(await getElementText(items[1]), getText('Yes (1)'));
    assert.equal(await getElementText(items[2]), getText('Yes (1)'));
    assert.equal(await getElementText(items[3]), getText('Yes (1)'));
    assert.equal(await getElementText(items[4]), getText('Yes (1)'));
  });

  test('empty course count', async function(assert) {
    await visit('/courses/' + this.emptyCourse.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'course.publicationCheck');
    var items = findAll('.course-publicationcheck table tbody td');
    assert.equal(await getElementText(items[0]), getText('course 1'));
    assert.equal(await getElementText(items[1]), getText('No'));
    assert.equal(await getElementText(items[2]), getText('No'));
    assert.equal(await getElementText(items[3]), getText('No'));
    assert.equal(await getElementText(items[4]), getText('No'));
  });
});
