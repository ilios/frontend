import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/sessions-grid-header';

module('Integration | Component | sessions-grid-header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{(noop)}} />`);
    assert.strictEqual(component.title.text, 'Title');
    assert.strictEqual(component.sessionType.text, 'Type');
    assert.strictEqual(component.learnerGroupCount.text, 'Groups');
    assert.strictEqual(component.objectiveCount.text, 'Objectives');
    assert.strictEqual(component.termCount.text, 'Terms');
    assert.strictEqual(component.firstOffering.text, 'First Offering');
    assert.strictEqual(component.offeringCount.text, 'Offerings');
    assert.strictEqual(component.status.text, 'Status');
  });

  test('expand all', async function (assert) {
    assert.expect(1);
    this.set('expandCollapse', () => {
      assert.ok(true, 'event fired');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{this.expandCollapse}} @showExpandAll={{true}} @setSortBy={{(noop)}} />`
    );
    await component.expandCollapse.toggle.click();
  });

  test('sort by title', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'title');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.title.click();
  });

  test('sort by session type', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'sessionTypeTitle');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.sessionType.click();
  });

  test('sort by learner group count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'learnerGroupCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.learnerGroupCount.click();
  });

  test('sort by objective count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'objectiveCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.objectiveCount.click();
  });

  test('sort by term count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'termCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.termCount.click();
  });

  test('sort by first offering', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'firstOfferingDate');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.firstOffering.click();
  });

  test('sort by offering count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'offeringCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.offeringCount.click();
  });
});
