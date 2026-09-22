import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'frontend/tests/msw';
import { setupAuthentication } from 'frontend/tests/helpers';
import { component } from 'frontend/tests/pages/components/session-publicationcheck';
import SessionPublicationcheck from 'frontend/components/session-publicationcheck';

module('Integration | Component | session-publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it shows unlink icon', async function (assert) {
    const courseObjective = await this.server.create('course-objective');
    const school = await this.server.create('school');
    const course = await this.server.create('course', { school });
    const session = await this.server.create('session', { course });
    await this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    await this.server.create('session-objective', { session });

    await setupAuthentication({ school, administeredSchools: [school] });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('model', sessionModel);
    await render(<template><SessionPublicationcheck @session={{this.model}} /></template>);
    assert.ok(component.unlink.isPresent);
  });

  test('it does not shows unlink icon', async function (assert) {
    const courseObjective = await this.server.create('course-objective');
    const school = await this.server.create('school');
    const course = await this.server.create('course', { school });
    const session = await this.server.create('session', { course });
    await this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    await this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    await setupAuthentication({ school, administeredSchools: [school] });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('model', sessionModel);
    await render(<template><SessionPublicationcheck @session={{this.model}} /></template>);
    assert.notOk(component.unlink.isPresent);
  });
});
