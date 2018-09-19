import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | new offering', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('nothing', parseInt);
    this.set('today', new Date());
    this.set('cohorts', []);
    await render(hbs`{{new-offering
      session=session
      cohorts=cohorts
      courseStartDate=today
      courseEndDate=today
      close=(action nothing)
    }}`);

    assert.dom('.new-offering-title').hasText('New Offering');
  });
});
