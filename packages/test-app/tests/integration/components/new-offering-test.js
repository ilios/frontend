import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | new offering', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('today', new Date());
    this.set('cohorts', []);
    await render(hbs`<NewOffering
  @session={{this.session}}
  @cohorts={{this.cohorts}}
  @courseStartDate={{this.today}}
  @courseEndDate={{this.today}}
  @close={{(noop)}}
/>`);

    assert.dom('.new-offering-title').hasText('New Offering');
  });
});
