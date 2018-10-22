import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

const mockRoutingService = Service.extend({
  hasRoute(value) {
    return ('dashboard' === value);
  }
});

module('Integration | Helper | has-route', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:-routing', mockRoutingService);
  });

  test('route exists', async function(assert) {
    this.set('value', 'dashboard');
    await render(hbs`{{if (has-route value) 'true' 'false'}}`);
    assert.equal(this.element.textContent.trim(), 'true');
  });

  test('route does not exist', async function(assert) {
    this.set('value', 'courses');
    await render(hbs`{{if (has-route value) 'true' 'false'}}`);
    assert.equal(this.element.textContent.trim(), 'false');
  });
});
