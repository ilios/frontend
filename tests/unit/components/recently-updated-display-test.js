import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';

moduleForComponent('recently-updated-display', 'Unit | Component | recently updated display', {
  unit: true
});

test('`recentlyUpdated` computed property works', function(assert) {
  const lastModified = moment().subtract(5, 'day');
  const component = this.subject({ lastModified });

  assert.ok(component.get('recentlyUpdated'), 'last modified within 5 days');

  component.set('lastModified', moment().subtract(7, 'day'));
  assert.notOk(component.get('recentlyUpdated'), 'last modified more than 5 days');
});
