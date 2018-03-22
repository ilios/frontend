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
    assert.ok(this.element.textContent.includes('Week at a Glance'));
    assert.ok(this.element.textContent.includes('Activities'));
    assert.ok(this.element.textContent.includes('Materials'));
    assert.ok(this.element.textContent.includes('Calendar'));
  });
});
