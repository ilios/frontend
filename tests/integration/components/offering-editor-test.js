import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { isEmpty, isPresent } = Ember;

moduleForComponent('offering-editor', 'Integration | Component | offering editor', {
  integration: true,

  beforeEach() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.container.lookup('component:click-choice-buttons');
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

  this.render(hbs`{{offering-editor addSingleOffering='addSingleOffering' closeEditor='closeEditor'}}`);

  const assertCreate = () => {
    assert.ok(true, 'action bubbles up to create learnergroup');
  };

  const assertCloseEditor = () => {
    assert.ok(true, 'action bubbles up to close editor');
  };

  this.on('addSingleOffering', assertCreate);
  this.on('closeEditor', assertCloseEditor);

  this.$('.done').click();
});


test('`cancel` action bubbles up', function(assert) {
  assert.expect(1);

  this.render(hbs`{{offering-editor closeEditor='closeEditor'}}`);

  const assertCloseEditor = () => {
    assert.ok(true, 'action bubbles up to close editor');
  };

  this.on('closeEditor', assertCloseEditor);

  this.$('.cancel').click();
});
