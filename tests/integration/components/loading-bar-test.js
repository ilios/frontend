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
  // we need to give the bar a moment to actually change state and we
  // cannot use wait here because the task actually keeps running forever preventing
  // any kind of settled state
  later(() => {
    assert.ok(this.$(bar).attr('value').trim() > 0);
    this.set('isLoading', false);
    later(() => {
      assert.equal(this.$(bar).attr('value').trim(), 0);
    }, 2000);
  }, 1000);
  await wait();
});
