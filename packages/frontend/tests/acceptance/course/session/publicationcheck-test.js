import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session-publication-check';
import percySnapshot from '@percy/ember';

module('Acceptance | Session - Publication Check', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication({}, true);
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', {
      school,
    });
    this.course = this.server.create('course', { school });
    this.sessionTypes = this.server.createList('session-type', 2, {
      school,
    });
    this.term = this.server.create('term', { vocabulary });
    this.meshDescriptor = this.server.create('mesh-descriptor');
  });

  test('full session count', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
    });
    this.server.create('session-objective', { session });
    this.server.create('offering', { session });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'session.publication-check');
    assert.strictEqual(page.sessionTitle, 'session 0');
    assert.strictEqual(page.offerings, 'Yes (1)');
    assert.strictEqual(page.terms, 'Yes (1)');
    assert.strictEqual(page.objectives, 'Yes (1)');
    assert.strictEqual(page.mesh, 'Yes (1)');
  });

  test('empty session count', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    assert.strictEqual(page.sessionTitle, 'session 0');
    assert.strictEqual(page.offerings, 'No');
    assert.strictEqual(page.terms, 'No');
    assert.strictEqual(page.objectives, 'No');
    assert.strictEqual(page.mesh, 'No');
  });

  test('unlink icon transitions properly', async function (assert) {
    const session = this.server.create('session', { course: this.course });
    this.server.create('session-objective', { session });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    await page.unlink.click();
    assert.ok(currentURL().startsWith('/courses/1/sessions/1'));
    assert.ok(currentURL().includes('sessionObjectiveDetails=true'));
  });
});
