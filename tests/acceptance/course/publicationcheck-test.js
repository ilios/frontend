import { currentRouteName, currentURL, click, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication, getElementText, getText } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Course - Publication Check', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', {
      school,
    });
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('programYear', {
      program,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const term = this.server.create('term', {
      vocabulary,
    });
    const meshDescriptor = this.server.create('meshDescriptor');
    this.fullCourse = this.server.create('course', {
      year: 2013,
      school,
      cohorts: [cohort],
      terms: [term],
      meshDescriptors: [meshDescriptor],
    });
    this.server.create('courseObjective', { course: this.fullCourse });
    this.emptyCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
  });

  test('full course count', async function (assert) {
    await visit('/courses/' + this.fullCourse.id + '/publicationcheck');
    assert.strictEqual(currentRouteName(), 'course.publication_check');
    var items = findAll('.course-publicationcheck table tbody td');
    assert.strictEqual(await getElementText(items[0]), getText('course 0'));
    assert.strictEqual(await getElementText(items[1]), getText('Yes (1)'));
    assert.strictEqual(await getElementText(items[2]), getText('Yes (1)'));
    assert.strictEqual(await getElementText(items[3]), getText('Yes (1)'));
    assert.strictEqual(await getElementText(items[4]), getText('Yes (1)'));
  });

  test('empty course count', async function (assert) {
    await visit('/courses/' + this.emptyCourse.id + '/publicationcheck');
    assert.strictEqual(currentRouteName(), 'course.publication_check');
    var items = findAll('.course-publicationcheck table tbody td');
    assert.strictEqual(await getElementText(items[0]), getText('course 1'));
    assert.strictEqual(await getElementText(items[1]), getText('No'));
    assert.strictEqual(await getElementText(items[2]), getText('No'));
    assert.strictEqual(await getElementText(items[3]), getText('No'));
    assert.strictEqual(await getElementText(items[4]), getText('No'));
  });

  test('unlink icon transitions properly', async function (assert) {
    await visit('/courses/' + this.fullCourse.id + '/publicationcheck');
    await click('.fa-unlink');
    assert.strictEqual(currentURL(), '/courses/1?courseObjectiveDetails=true&details=true');
  });
});
