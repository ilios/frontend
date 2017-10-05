import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('new-programyear', 'Integration | Component | new programyear', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  this.set('nothing', parseInt);

  this.render(hbs`{{new-programyear save=(action nothing) cancel=(action nothing)}}`);

  assert.ok(this.$().text().search(/New Program Year/) === 0);
});
