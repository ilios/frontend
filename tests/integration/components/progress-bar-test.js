import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | progress bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders at default 0%', async function(assert) {
    await render(hbs`{{progress-bar}}`);

    assert.equal(this.element.textContent.trim(), '0%');
  });

  test('changing percentage changes width', async function(assert) {
    
    this.set('passedValue', 42);
    
    await render(hbs`{{progress-bar percentage=passedValue}}`);

    assert.equal(find('.meter').getAttribute('style').trim(), 'width: 42%');
    
    this.set('passedValue', 12);
    assert.equal(find('.meter').getAttribute('style').trim(), 'width: 12%');
  });

  test('changing percentage changes the displayvalue', async function(assert) {
    
    this.set('passedValue', 42);
    
    await render(hbs`{{progress-bar percentage=passedValue}}`);

    assert.equal(this.element.textContent.trim(), '42%');
    
    this.set('passedValue', 11);
    assert.equal(this.element.textContent.trim(), '11%');
    
  });
});
