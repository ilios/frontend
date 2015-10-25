import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForComponent('toggle-wide', 'Integration | Component | toggle wide' + testgroup, {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(4);

  this.set('value', true);
  this.render(hbs`{{toggle-wide value=value action='clicked'}}`);
  assert.ok(this.$('input').prop('checked'));
  
  this.set('value', false);
  assert.ok(!this.$('input').prop('checked'));
  
  let value = false;
  this.on('clicked', () => {
    value = !value;
    this.set('value', value);
  });
  this.$('label').click();
  assert.ok(this.$('input').prop('checked'));
  
  this.$('label').click();
  assert.ok(!this.$('input').prop('checked'));
  
});
