import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';

moduleForComponent('learnergroup-calendar', 'Integration | Component | learnergroup calendar', {
  integration: true,
});

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
  this.render(hbs`{{learnergroup-calendar learnerGroup=learnerGroup}}`);
  const events = '.ilios-calendar-event';
  await wait();

  assert.equal(this.$(events).length, 1);
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
  this.render(hbs`{{learnergroup-calendar learnerGroup=learnerGroup}}`);
  const events = '.ilios-calendar-event';
  const subgroupEventsToggle = '[data-test-learnergroup-calendar-toggle-subgroup-events] label:eq(0)';
  await wait();

  this.$(subgroupEventsToggle).click();
  await wait();
  assert.equal(this.$(events).length, 2);
});
