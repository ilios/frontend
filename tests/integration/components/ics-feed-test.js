import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ics feed', function(hooks) {
  setupRenderingTest(hooks);

  test('it show instructions', async function(assert) {
    assert.expect(1);
    const instructions = 'SOME TEST INS';
    const element = 'p:eq(0)';
    this.set('instructions', instructions);

    await render(hbs`{{ics-feed instructions=instructions}}`);

    assert.equal(this.$(element).text().trim(), instructions);
  });
});
