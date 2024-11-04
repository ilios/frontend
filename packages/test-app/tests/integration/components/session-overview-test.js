import { module, test } from 'qunit';
import { settled, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios-common/page-objects/components/session-overview';

module('Integration | Component | session-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.server.create('academic-year');
    this.course = this.server.create('course', {
      school: this.school,
    });
    this.sessionTypes = this.server.createList('session-type', 2, {
      school: this.school,
    });
  });

  test('validate description', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: '',
    });
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(hbs`<SessionOverview @session={{this.session}} @editable={{true}} />`);
    assert.strictEqual(component.sessionDescription.value, 'Click to edit');
    await component.sessionDescription.edit();
    assert.notOk(component.sessionDescription.hasError);
    assert.notOk(component.sessionDescription.savingIsDisabled);
    await component.sessionDescription.set('a'.repeat(65000));
    await settled();
    assert.ok(component.sessionDescription.hasError);
    assert.ok(component.sessionDescription.savingIsDisabled);
    await component.sessionDescription.set('lorem ipsum');
    await settled();
    assert.notOk(component.sessionDescription.hasError);
    assert.notOk(component.sessionDescription.savingIsDisabled);
  });

  test('validate instructional notes', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      instructionalNotes: '',
    });
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(hbs`<SessionOverview @session={{this.session}} @editable={{true}} />`);
    assert.strictEqual(component.instructionalNotes.value, 'Click to edit');
    await component.instructionalNotes.edit();
    assert.notOk(component.instructionalNotes.hasError);
    assert.notOk(component.instructionalNotes.savingIsDisabled);
    await component.instructionalNotes.set('a'.repeat(65000));
    await settled();
    assert.ok(component.instructionalNotes.hasError);
    assert.ok(component.instructionalNotes.savingIsDisabled);
    await component.instructionalNotes.set('lorem ipsum');
    await settled();
    assert.notOk(component.instructionalNotes.hasError);
    assert.notOk(component.instructionalNotes.savingIsDisabled);
  });
});
