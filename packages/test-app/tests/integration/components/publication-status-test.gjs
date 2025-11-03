import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/publication-status';
import PublicationStatus from 'ilios-common/components/publication-status';

module('Integration | Component | publication-status', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders published and is accessible in text-mode', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: false });
    await render(
      <template>
        <PublicationStatus @item={{this.item}} @showIcon={{true}} @showText={{true}} />
      </template>,
    );
    assert.ok(component.icon.isVisible);
    assert.notOk(component.icon.hasTitle);
    assert.strictEqual(component.title.text, 'Published');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders schedule and is accessible in text-mode', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: true });
    await render(
      <template>
        <PublicationStatus @item={{this.item}} @showIcon={{true}} @showText={{true}} />
      </template>,
    );
    assert.strictEqual(component.title.text, 'Scheduled');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders not published and is accessible in text-mode', async function (assert) {
    this.set('item', { isPublished: false, isScheduled: false });
    await render(
      <template>
        <PublicationStatus @item={{this.item}} @showIcon={{true}} @showText={{true}} />
      </template>,
    );
    assert.strictEqual(component.title.text, 'Not Published');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders published and is accessible in icon-mode', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: false });
    await render(
      <template>
        <PublicationStatus @item={{this.item}} @showIcon={{true}} @showText={{false}} />
      </template>,
    );
    assert.ok(component.icon.isVisible);
    assert.strictEqual(component.icon.title, 'Published');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders schedule and is accessible in icon-mode', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: true });
    await render(
      <template>
        <PublicationStatus @item={{this.item}} @showIcon={{true}} @showText={{false}} />
      </template>,
    );
    assert.strictEqual(component.icon.title, 'Scheduled');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders not published and is accessible in icon-mode', async function (assert) {
    this.set('item', { isPublished: false, isScheduled: false });
    await render(
      <template>
        <PublicationStatus @item={{this.item}} @showIcon={{true}} @showText={{false}} />
      </template>,
    );
    assert.strictEqual(component.icon.title, 'Not Published');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
