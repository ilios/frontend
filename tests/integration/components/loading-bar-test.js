import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { later } from '@ember/runloop';
import wait from 'ember-test-helpers/wait';

moduleForComponent('loading-bar', 'Integration | Component | loading bar', {
  integration: true
});

test('it renders', async function (assert) {
  const bar = '.bar';
  this.set('isLoading', true);
  this.render(hbs`{{loading-bar isLoading=isLoading}}`);
  // we need to give the bar a moment to actually change state
  later(() => {
    assert.ok(this.$(bar).attr('value').trim() > 0);
    this.set('isLoading', false);
    later(() => {
      assert.equal(this.$(bar).attr('value').trim(), 0);
    }, 2000);
  }, 500);
  await wait();
});
