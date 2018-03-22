import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | common dashboard', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{common-dashboard
      show='week'
      setShow=(action nothing)
    }}`);
    assert.ok(this.$().text().includes('Week at a Glance'));
    assert.ok(this.$().text().includes('Activities'));
    assert.ok(this.$().text().includes('Materials'));
    assert.ok(this.$().text().includes('Calendar'));
  });
});
