import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios-common/page-objects/components/session-publicationcheck';

module('Integration | Component | session-publicationcheck', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it shows unlink icon', async function (assert) {
    const courseObjective = this.server.create('courseObjective');
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    this.server.create('session-objective', { session });

    await setupAuthentication({ school, administeredSchools: [school] });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('model', sessionModel);
    await render(hbs`<SessionPublicationcheck @session={{this.model}} />`);
    assert.ok(component.unlink.isPresent);
  });

  test('it does not shows unlink icon', async function (assert) {
    const courseObjective = this.server.create('courseObjective');
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
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('model', sessionModel);
    await render(hbs`<SessionPublicationcheck @session={{this.model}} />`);
    assert.notOk(component.unlink.isPresent);
  });
});
