import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/session/header';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import Header from 'ilios-common/components/session/header';

module('Integration | Component | session/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible when not editable', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      <template>
        <Header @session={{this.session}} @editable={{false}} @hideCheckLink={{true}} />
      </template>,
    );
    assert.notOk(component.title.isEditable);
    assert.strictEqual(component.title.value, 'session 0');
    assert.notOk(component.publicationMenu.isPresent);
    assert.strictEqual(component.publicationStatus.title.text, 'Not Published');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible when editable', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      <template>
        <Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />
      </template>,
    );
    assert.ok(component.title.isEditable);
    assert.strictEqual(component.title.title, 'session 0');
    assert.notOk(component.title.hasError);
    assert.ok(component.publicationMenu.isPresent);
    assert.strictEqual(component.publicationMenu.text, 'Not Published');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('change title', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      <template>
        <Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />
      </template>,
    );
    assert.strictEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('new title');
    await component.title.save();
    assert.strictEqual(component.title.title, 'new title');
    assert.strictEqual(this.server.db.sessions[0].title, 'new title');
  });

  test('cancel change title', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      <template>
        <Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />
      </template>,
    );
    assert.strictEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('new title');
    await component.title.cancel();
    assert.strictEqual(component.title.title, 'session 0');
    assert.strictEqual(this.server.db.sessions[0].title, 'session 0');
  });

  test('validate too short', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      <template>
        <Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />
      </template>,
    );
    assert.strictEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('a');
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too short (minimum is 3 characters)');

    assert.strictEqual(this.server.db.sessions[0].title, 'session 0');
  });

  test('validate too long', async function (assert) {
    this.set('session', this.server.create('session'));
    await render(
      <template>
        <Header @session={{this.session}} @editable={{true}} @hideCheckLink={{true}} />
      </template>,
    );
    assert.strictEqual(component.title.title, 'session 0');
    await component.title.edit();
    await component.title.set('new title'.repeat(100));
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 200 characters)');

    assert.strictEqual(this.server.db.sessions[0].title, 'session 0');
  });
});
