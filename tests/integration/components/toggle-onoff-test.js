import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('toggle-onoff', 'Integration | Component | toggle onoff', {
  integration: true,
  beforeEach() {
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('helper:t', tHelper);
  }
});

test('toggle on/off works as intended on click events', function(assert) {
  assert.expect(7);

  this.set('value', true);
  this.render(hbs`{{toggle-onoff on=value label='general.location' action='clicked'}}`);

  assert.equal(this.$().text().trim(), 'Location:');
  assert.ok(this.$('input').prop('checked'));

  this.set('value', false);
  assert.ok(!this.$('input').prop('checked'));

  let value = false;
  this.on('clicked', () => {
    assert.ok(true, 'click was triggered and sends primary action');

    value = !value;
    this.set('value', value);
  });
  this.$('label').click();
  assert.ok(this.$('input').prop('checked'));

  this.$('label').click();
  assert.ok(!this.$('input').prop('checked'));
});
