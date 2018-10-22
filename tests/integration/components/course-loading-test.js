import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

const mockRoutingService = Service.extend({
  hasRoute() {
    return false;
  }
});

module('Integration | Component | course loading', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:-routing', mockRoutingService);
  });

  test('it renders', async function(assert) {
    await render(hbs`{{course-loading}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
