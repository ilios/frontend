import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click } from '@ember/test-helpers';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';

module('Integration | Component | expand collapse button', function (hooks) {
  setupRenderingTest(hooks);

  test('renders with default value false', async function (assert) {
    this.set('action', () => {});
    await render(<template><ExpandCollapseButton @action={{this.action}} /></template>);
    assert.dom('svg').hasClass('fa-plus');
  });

  test('clicking changes the icon and sends the action', async function (assert) {
    this.collapseButtonLabel = 'Collapse';
    this.expandButtonLabel = 'Expand';
    this.set('value', false);
    this.set('click', () => {
      assert.step('click called');
      this.set('value', !this.value);
    });
    await render(
      <template>
        <ExpandCollapseButton
          @value={{this.value}}
          @action={{this.click}}
          @collapseButtonLabel={{this.collapseButtonLabel}}
          @expandButtonLabel={{this.expandButtonLabel}}
        />
      </template>,
    );
    assert.dom('svg').hasClass('fa-plus');

    await click('svg');
    assert.dom('svg').hasClass('fa-minus');

    await click('svg');
    assert.dom('svg').hasClass('fa-plus');
    assert.verifySteps(['click called', 'click called']);
  });
});
