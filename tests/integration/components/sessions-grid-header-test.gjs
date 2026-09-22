import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/sessions-grid-header-row';
import SessionsGridHeaderRow from 'frontend/components/sessions-grid-header-row';
import noop from 'frontend/helpers/noop';

module('Integration | Component | sessions-grid-header-row', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{(noop)}} />
      </template>,
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
    this.set('expandCollapse', () => {
      assert.step('expandCollapse called');
    });
    await render(
      <template>
        <SessionsGridHeaderRow
          @toggleExpandAll={{this.expandCollapse}}
          @showExpandAll={{true}}
          @setSortBy={{(noop)}}
        />
      </template>,
    );
    await component.expandCollapse.toggle.click();
    assert.verifySteps(['expandCollapse called']);
  });

  test('sort by title', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'title');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.title.click();
    assert.verifySteps(['setSortBy called']);
  });

  test('sort by session type', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'sessionTypeTitle');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.sessionType.click();
    assert.verifySteps(['setSortBy called']);
  });

  test('sort by learner group count', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'learnerGroupCount');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.learnerGroupCount.click();
    assert.verifySteps(['setSortBy called']);
  });

  test('sort by objective count', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'objectiveCount');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.objectiveCount.click();
    assert.verifySteps(['setSortBy called']);
  });

  test('sort by term count', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'termCount');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.termCount.click();
    assert.verifySteps(['setSortBy called']);
  });

  test('sort by first offering', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'firstOfferingDate');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.firstOffering.click();
    assert.verifySteps(['setSortBy called']);
  });

  test('sort by offering count', async function (assert) {
    this.set('setSortBy', (value) => {
      assert.step('setSortBy called');
      assert.strictEqual(value, 'offeringCount');
    });
    await render(
      <template>
        <SessionsGridHeaderRow @toggleExpandAll={{(noop)}} @setSortBy={{this.setSortBy}} />
      </template>,
    );
    await component.offeringCount.click();
    assert.verifySteps(['setSortBy called']);
  });
});
