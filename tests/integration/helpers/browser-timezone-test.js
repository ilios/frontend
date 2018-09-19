
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('helper:browser-timezone', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders current timezone as guessed by moment', async function(assert) {
    this.set('inputValue', '1234');

    await render(hbs`{{browser-timezone}}`);

    assert.dom(this.element).hasText(moment.tz.guess());
  });
});

