import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/publication-status';

module('Integration | Component | publication-status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders published and is accessible', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: false });
    await render(hbs`<PublicationStatus
      @item={{this.item}}
      @showIcon={{true}}
      @showText={{true}}
    />
`);
    assert.strictEqual(component.value, 'Published');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders schedule and is accessible', async function (assert) {
    this.set('item', { isPublished: true, isScheduled: true });
    await render(hbs`<PublicationStatus
      @item={{this.item}}
      @showIcon={{true}}
      @showText={{true}}
    />
`);
    assert.strictEqual(component.value, 'Scheduled');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders not published and is accessible', async function (assert) {
    this.set('item', { isPublished: false, isScheduled: false });
    await render(hbs`<PublicationStatus
      @item={{this.item}}
      @showIcon={{true}}
      @showText={{true}}
    />
`);
    assert.strictEqual(component.value, 'Not Published');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
