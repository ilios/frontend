import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';

moduleForComponent('recently-updated-display', 'Unit | Component | recently updated display', {
  unit: true
});

test('`recentlyUpdated` computed property works', function(assert) {
  const lastModified = moment().subtract(5, 'day');
  const attrs = { lastModified };
  const component = this.subject({ attrs });

  assert.ok(component.get('recentlyUpdated'), 'last modified within 5 days');

  component.set('attrs.lastModified', moment().subtract(7, 'day'));
  assert.notOk(component.get('recentlyUpdated'), 'last modified more than 5 days');
});
