
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('browser-timezone', 'helper:browser-timezone', {
  integration: true
});

test('it renders current timezone as guessed by moment', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{browser-timezone}}`);

  assert.equal(this.$().text().trim(), moment.tz.guess());
});

