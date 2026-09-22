import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import NewOffering from 'frontend/components/new-offering';
import noop from 'frontend/helpers/noop';

module('Integration | Component | new offering', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('today', new Date());
    this.set('cohorts', []);
    await render(
      <template>
        <NewOffering
          @session={{this.session}}
          @cohorts={{this.cohorts}}
          @courseStartDate={{this.today}}
          @courseEndDate={{this.today}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.dom('.new-offering-title').hasText('New Offering');
  });
});
