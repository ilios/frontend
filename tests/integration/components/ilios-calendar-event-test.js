import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar event', function(hooks) {
  setupRenderingTest(hooks);

  //@todo needs some real tests JJ 6/2017
  skip('it renders', function(assert) {
    this.render(hbs`{{ilios-calendar-event}}`);

    assert.equal(this.$().text().trim(), '');
  });

  skip('it calculates recentlyUpdated correctly', function(assert) {
    this.render(hbs`{{ilios-calendar-event}}`);

    assert.equal(this.$().text().trim(), '');
  });
});
