import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar day', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);
    let date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('nothing', parseInt);
    await render(hbs`{{ilios-calendar-day date=date selectEvent=(action nothing)}}`);
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.equal(this.element.textContent.trim().search(/^Wednesday/), 0);
    assert.equal(this.element.querySelectorAll('.event').length, 0);
  });
});
