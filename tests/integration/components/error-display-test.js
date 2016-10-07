import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('error-display', 'Integration | Component | error display', {
  integration: true,
});

test('the detail link toggles properly', function(assert) {
  assert.expect(2);

  const errors = [{
    message: 'this is an error'
  }];

  this.set('errors', errors);
  this.set('nothing', parseInt);
  this.render(hbs`{{error-display errors=errors clearErrors=(action nothing)}}`);

  assert.equal(this.$('.error-detail-action').text().trim(), 'Hide Details');

  this.$('.error-detail-action').click();

  assert.equal(this.$('.error-detail-action').text().trim(), 'Show Details');
});

test('clicking clear button fires action', function(assert) {
  assert.expect(1);

  const errors = [{
    message: 'this is an error'
  }];

  this.set('errors', errors);
  this.set('clearErrors', () => {
    assert.ok(true, 'action was fired');
  });
  this.render(hbs`{{error-display errors=errors clearErrors=(action clearErrors)}}`);
  this.$('.clear-errors button').click();
});
