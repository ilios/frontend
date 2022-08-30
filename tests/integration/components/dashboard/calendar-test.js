import { module, skip } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | dashboard/calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  skip('it renders', function () {
    //since the result of this component is to expose the calendar it is hard to test
    //skipping for now because I'm lazy [JJ 6/2017]
  });
});
