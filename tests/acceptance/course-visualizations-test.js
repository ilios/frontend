import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import page from 'ilios-common/page-objects/course-visualizations';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | course visualizations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');

    this.server.create('course', {
      year: 2021,
      school: this.school,
    });
  });

  test('visiting /data/courses/1', async function (assert) {
    await page.visit({ courseId: 1 });
    assert.strictEqual(currentURL(), '/data/courses/1');
    assert.ok(page.visualizations.objectives.isVisible);
    assert.ok(page.visualizations.sessionTypes.isVisible);
    assert.ok(page.visualizations.vocabularies.isVisible);
    assert.ok(page.visualizations.instructors.isVisible);
  });
});
