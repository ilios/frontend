import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/sessions-grid-header';
import SessionsGridHeader from 'ilios-common/components/sessions-grid-header';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | sessions-grid-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(
      <template><SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{(noop)}} /></template>,
    );
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
      <template>
        <SessionsGridHeader
          @toggleExpandAll={{this.expandCollapse}}
          @showExpandAll={{true}}
          @setSortBy={{(noop)}}
        />
      </template>,
    );
    await component.expandCollapse.toggle.click();
  });

  test('sort by title', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'title');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.title.click();
  });

  test('sort by session type', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'sessionTypeTitle');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.sessionType.click();
  });

  test('sort by learner group count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'learnerGroupCount');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.learnerGroupCount.click();
  });

  test('sort by objective count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'objectiveCount');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.objectiveCount.click();
  });

  test('sort by term count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'termCount');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.termCount.click();
  });

  test('sort by first offering', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'firstOfferingDate');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.firstOffering.click();
  });

  test('sort by offering count', async function (assert) {
    assert.expect(1);
    this.set('setSortBy', (value) => {
      assert.strictEqual(value, 'offeringCount');
    });
    await render(
      <template>
        <SessionsGridHeader @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.offeringCount.click();
  });
});
