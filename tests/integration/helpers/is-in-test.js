
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:is-in', function(hooks) {
  setupRenderingTest(hooks);

  test('it calculates array membership correctly and updates live', async function(assert) {
    this.set('value', '42');
    this.set('array', ['42']);
    await render(hbs`{{if (is-in array value) 'true' 'false'}}`);

    assert.equal(this.$().text().trim(), 'true');

    this.set('value', 42);
    assert.equal(this.$().text().trim(), 'false');

    this.set('array', [42]);
    assert.equal(this.$().text().trim(), 'true');
    const obj = {};
    this.set('array', [obj]);
    this.set('value', obj);
    assert.equal(this.$().text().trim(), 'true');

    this.set('value', {});
    assert.equal(this.$().text().trim(), 'false');

  });
});
