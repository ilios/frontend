import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';

module('Unit | Component | recently updated display', function(hooks) {
  setupTest(hooks);

  test('`recentlyUpdated` computed property works', function(assert) {
    const lastModified = moment().subtract(5, 'day');
    const component = this.owner.factoryFor('component:recently-updated-display').create({ lastModified });

    assert.ok(component.get('recentlyUpdated'), 'last modified within 5 days');

    component.set('lastModified', moment().subtract(7, 'day'));
    assert.notOk(component.get('recentlyUpdated'), 'last modified more than 5 days');
  });
});
