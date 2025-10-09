import { module, test } from 'qunit';
import { settled, render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import { component } from 'ilios-common/page-objects/components/session/overview';
import Overview from 'ilios-common/components/session/overview';

module('Integration | Component | session/overview', function (hooks) {
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
    await render(<template><Overview @session={{this.session}} @editable={{true}} /></template>);
    assert.strictEqual(component.sessionDescription.text, 'Click to edit');
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
    await render(<template><Overview @session={{this.session}} @editable={{true}} /></template>);
    assert.strictEqual(component.instructionalNotes.text, 'Click to edit');
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

  test('saving empty description and notes sets to null', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: '',
      instructionalNotes: '',
    });
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(<template><Overview @session={{this.session}} @editable={{true}} /></template>);
    assert.strictEqual(sessionModel.description, '');
    assert.strictEqual(sessionModel.instructionalNotes, '');
    assert.strictEqual(component.sessionDescription.text, 'Click to edit');
    assert.strictEqual(component.instructionalNotes.text, 'Click to edit');
    await component.sessionDescription.edit();
    await component.sessionDescription.save();

    await component.instructionalNotes.edit();
    await component.instructionalNotes.save();

    assert.strictEqual(sessionModel.description, null);
    assert.strictEqual(sessionModel.instructionalNotes, null);
  });

  test('can save description when notes is empty string', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: 'not empty',
      instructionalNotes: '',
    });
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(<template><Overview @session={{this.session}} @editable={{true}} /></template>);
    assert.strictEqual(component.sessionDescription.fadeText.displayText.text, 'not empty');
    assert.strictEqual(component.instructionalNotes.text, 'Click to edit');
    await component.sessionDescription.edit();
    await component.sessionDescription.set('still not empty');
    await component.sessionDescription.save();

    assert.strictEqual(sessionModel.description, '<p>still not empty</p>');
  });

  test('can save notes when description is empty string', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      description: '',
      instructionalNotes: 'not empty',
    });
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const sessionModel = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(<template><Overview @session={{this.session}} @editable={{true}} /></template>);
    assert.strictEqual(component.sessionDescription.text, 'Click to edit');
    assert.strictEqual(component.instructionalNotes.fadeText.displayText.text, 'not empty');
    await component.instructionalNotes.edit();
    await component.instructionalNotes.set('still not empty');
    await component.instructionalNotes.save();

    assert.strictEqual(sessionModel.instructionalNotes, '<p>still not empty</p>');
  });
});
