import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | error display', function(hooks) {
  setupRenderingTest(hooks);

  test('the detail link toggles properly', async function(assert) {
    assert.expect(3);

    const errors = [{
      message: 'this is an error'
    }];

    this.set('errors', errors);
    this.set('nothing', parseInt);
    await render(hbs`{{error-display errors=errors clearErrors=(action nothing)}}`);

    assert.equal(this.$('.error-detail-action').text().trim(), 'Hide Details');

    let iso8601 = new RegExp(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})[+-](\d{2}):(\d{2})/);
    assert.ok(this.$('.timestamp').text().trim().match(iso8601), 'Current datetime is visible');

    this.$('.error-detail-action').click();

    assert.equal(this.$('.error-detail-action').text().trim(), 'Show Details');
  });

  test('clicking clear button fires action', async function(assert) {
    assert.expect(1);

    const errors = [{
      message: 'this is an error'
    }];

    this.set('errors', errors);
    this.set('clearErrors', () => {
      assert.ok(true, 'action was fired');
    });
    await render(hbs`{{error-display errors=errors clearErrors=(action clearErrors)}}`);
    this.$('.clear-errors button').click();
  });
});