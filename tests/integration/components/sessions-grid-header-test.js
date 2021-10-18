import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/sessions-grid-header';

module('Integration | Component | sessions-grid-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{(noop)}} />`);
    assert.equal(component.title.text, 'Title');
    assert.equal(component.sessionType.text, 'Type');
    assert.equal(component.learnerGroupCount.text, 'Groups');
    assert.equal(component.objectiveCount.text, 'Objectives');
    assert.equal(component.termCount.text, 'Terms');
    assert.equal(component.firstOffering.text, 'First Offering');
    assert.equal(component.offeringCount.text, 'Offerings');
    assert.equal(component.status.text, 'Status');
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
      assert.equal(value, 'title');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.title.click();
  });

  test('sort by session type', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.equal(value, 'sessionTypeTitle');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.sessionType.click();
  });

  test('sort by learner group count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.equal(value, 'learnerGroupCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.learnerGroupCount.click();
  });

  test('sort by objective count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.equal(value, 'objectiveCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.objectiveCount.click();
  });

  test('sort by term count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.equal(value, 'termCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.termCount.click();
  });

  test('sort by first offering', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.equal(value, 'firstOfferingDate');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.firstOffering.click();
  });

  test('sort by offering count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.equal(value, 'offeringCount');
    });
    await render(
      hbs`<SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />`
    );
    await component.offeringCount.click();
  });
});
