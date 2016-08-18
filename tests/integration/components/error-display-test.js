import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('error-display', 'Integration | Component | error display', {
  integration: true,

  beforeEach() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('the detail link toggles properly', function(assert) {
  assert.expect(2);

  const errors = [{
    message: 'this is an error'
  }];

  this.set('errors', errors);

  this.render(hbs`{{error-display content=errors}}`);

  assert.equal(this.$('.error-detail-action').text(), 'Show Details');

  this.$('.error-detail-action').click();

  assert.equal(this.$('.error-detail-action').text(), 'Hide Details');
});
