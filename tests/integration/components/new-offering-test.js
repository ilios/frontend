import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

module('Integration | Component | new offering', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };
  });

  test('it renders', async function(assert) {
    this.set('nothing', parseInt);
    this.set('today', new Date());
    this.set('cohorts', []);
    await render(hbs`{{new-offering
      session=session
      cohorts=cohorts
      courseStartDate=today
      courseEndDate=today
      close=(action nothing)
    }}`);

    assert.equal(this.$('.new-offering-title:eq(0)').text().trim(), 'New Offering');
  });
});