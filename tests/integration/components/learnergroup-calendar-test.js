import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | learnergroup calendar', function(hooks) {
  setupRenderingTest(hooks);

  test('shows events', async function(assert) {
    assert.expect(1);
    const today = moment().hour(8);
    const course = EmberObject.create({
      title: 'course title'
    });
    const session = EmberObject.create({
      title: 'session title',
      course: resolve(course)
    });

    const offering1 = EmberObject.create({
      id: 1,
      startDate: today.format(),
      endDate: today.clone().add('1', 'hour').format(),
      location: 123,
      session: resolve(session)
    });
    const offering2 = EmberObject.create({
      id: 2,
      startDate: today.format(),
      endDate: today.clone().add('1', 'hour').format(),
      location: 123,
      session: resolve(session)
    });
    const subGroup = EmberObject.create({
      id: 1,
      offerings: resolve([offering2]),
      allDescendants: resolve([])
    });
    const learnerGroup = EmberObject.create({
      id: 1,
      offerings: resolve([offering1]),
      allDescendants: resolve([subGroup])
    });
    this.set('learnerGroup', learnerGroup);
    await render(hbs`{{learnergroup-calendar learnerGroup=learnerGroup}}`);
    const events = '.ilios-calendar-event';
    await settled();

    assert.equal(findAll(events).length, 1);
  });

  test('shows subgroup events', async function(assert) {
    assert.expect(1);
    const today = moment().hour(8);
    const course = EmberObject.create({
      title: 'course title'
    });
    const session = EmberObject.create({
      title: 'session title',
      course: resolve(course)
    });

    const offering1 = EmberObject.create({
      id: 1,
      startDate: today.format(),
      endDate: today.clone().add('1', 'hour').format(),
      location: 123,
      session: resolve(session)
    });
    const offering2 = EmberObject.create({
      id: 2,
      startDate: today.format(),
      endDate: today.clone().add('1', 'hour').format(),
      location: 123,
      session: resolve(session)
    });
    const subGroup = EmberObject.create({
      id: 1,
      offerings: resolve([offering2]),
      allDescendants: resolve([])
    });
    const learnerGroup = EmberObject.create({
      id: 1,
      offerings: resolve([offering1]),
      allDescendants: resolve([subGroup])
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`{{learnergroup-calendar learnerGroup=learnerGroup}}`);
    const events = '.ilios-calendar-event';
    const subgroupEventsToggle = '[data-test-learnergroup-calendar-toggle-subgroup-events] label:nth-of-type(1)';
    await settled();

    await click(subgroupEventsToggle);
    await settled();
    assert.equal(findAll(events).length, 2);
  });
});
