import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/header';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'test-app/tests/test-support/mirage';

module('Integration | Component | session/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible when not editable', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      hbs`<Session::Header @session={{this.session}} @editable={{false}} @hideCheckLink={{true}} />`,
    );
    assert.notOk(component.title.isEditable);
    assert.deepEqual(component.title.value, 'session 0');
    assert.notOk(component.publicationMenu.isPresent);
    assert.deepEqual(component.publicationStatus.value, 'Not Published');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible when editable', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      hbs`<Session::Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />`,
    );
    assert.ok(component.title.isEditable);
    assert.deepEqual(component.title.title, 'session 0');
    assert.deepEqual(component.title.validationErrors.length, 0);
    assert.ok(component.publicationMenu.isPresent);
    assert.deepEqual(component.publicationMenu.text, 'Not Published');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('change title', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      hbs`<Session::Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />`,
    );
    assert.deepEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('new title');
    await component.title.save();
    assert.deepEqual(component.title.title, 'new title');
    assert.deepEqual(this.server.db.sessions[0].title, 'new title');
  });

  test('cancel change title', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      hbs`<Session::Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />`,
    );
    assert.deepEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('new title');
    await component.title.cancel();
    assert.deepEqual(component.title.title, 'session 0');
    assert.deepEqual(this.server.db.sessions[0].title, 'session 0');
  });

  test('validate too short', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      hbs`<Session::Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />`,
    );
    assert.deepEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('a');
    await component.title.save();
    assert.deepEqual(component.title.validationErrors.length, 1);
    assert.deepEqual(
      component.title.validationErrors[0].text,
      'Title is too short (minimum is 3 characters)',
    );

    assert.deepEqual(this.server.db.sessions[0].title, 'session 0');
  });

  test('validate too long', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      hbs`<Session::Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />`,
    );
    assert.deepEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('new title'.repeat(100));
    await component.title.save();
    assert.deepEqual(component.title.validationErrors.length, 1);
    assert.deepEqual(
      component.title.validationErrors[0].text,
      'Title is too long (maximum is 200 characters)',
    );

    assert.deepEqual(this.server.db.sessions[0].title, 'session 0');
  });
});
