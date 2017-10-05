import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('toggle-yesno', 'Integration | Component | toggle yesno', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(2);
  const state = 'input';

  this.set('value', true);
  this.render(hbs`{{toggle-yesno yes=value action='clicked'}}`);

  assert.ok(this.$(state).prop('checked'));

  this.set('value', false);
  assert.notOk(this.$(state).prop('checked'));

});

test('click', function(assert) {
  assert.expect(5);
  const state = 'input';
  const element = 'span:eq(0)';
  this.set('value', true);
  this.set('toggle', (val) => {
    const value = this.get('value');
    assert.equal(!value, val);
    this.set('value', val);
  });
  this.render(hbs`{{toggle-yesno yes=value toggle=(action toggle)}}`);
  assert.ok(this.$(state).prop('checked'));
  this.$(element).click();

  assert.notOk(this.$(state).prop('checked'));
  this.$(element).click();
  assert.ok(this.$(state).prop('checked'));
});
