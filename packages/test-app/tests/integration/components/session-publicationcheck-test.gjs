import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios-common/page-objects/components/session-publicationcheck';
import SessionPublicationcheck from 'ilios-common/components/session-publicationcheck';

module('Integration | Component | session-publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it shows unlink icon', async function (assert) {
    const courseObjective = this.server.create('course-objective');
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    this.server.create('session-objective', { session });

    await setupAuthentication({ school, administeredSchools: [school] });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('model', sessionModel);
    await render(<template><SessionPublicationcheck @session={{this.model}} /></template>);
    assert.ok(component.unlink.isPresent);
  });

  test('it does not shows unlink icon', async function (assert) {
    const courseObjective = this.server.create('course-objective');
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    this.server.create('session-objective', {
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
