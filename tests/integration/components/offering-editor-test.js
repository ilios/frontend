import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { isEmpty, isPresent } = Ember;

moduleForComponent('offering-editor', 'Integration | Component | offering editor', {
  integration: true,

  beforeEach() {
    this.container.lookup('service:i18n').set('locale', 'en');
  }
});

test('`toggleMultiDay` action triggers properly', function(assert) {
  assert.expect(3);

  const endDateInput = '.offering-enddate';
  const toggleSlider = '.switch-input';

  this.render(hbs`{{offering-editor}}`);
  assert.ok(isEmpty(this.$(endDateInput)), 'end date input is not visible');

  this.$(toggleSlider).click();
  assert.ok(isPresent(this.$(endDateInput)), 'end date input is visible');

  this.$(toggleSlider).click();
  assert.ok(isEmpty(this.$(endDateInput)), 'end date input is not visible');
});

test('`create` actions bubble up (to create learnergroup and close editor)', function(assert) {
  assert.expect(2);

  const flashMessages = {
    clearMessages() {}
  };

  this.set('flashMessages', flashMessages);

  this.render(hbs`{{offering-editor addSingleOffering='addSingleOffering' closeEditor='closeEditor' flashMessages=flashMessages}}`);

  this.on('addSingleOffering', () => {
    assert.ok(true, 'action bubbles up to create learnergroup');
  });

  this.on('closeEditor', () => {
    assert.ok(true, 'action bubbles up to close editor');
  });

  this.$('.done').click();
});


test('`cancel` action bubbles up', function(assert) {
  assert.expect(1);

  const flashMessages = {
    clearMessages() {}
  };

  this.set('flashMessages', flashMessages);

  this.render(hbs`{{offering-editor closeEditor='closeEditor' flashMessages=flashMessages}}`);

  this.on('closeEditor', () => {
    assert.ok(true, 'action bubbles up to close editor');
  });

  this.$('.cancel').click();
});
