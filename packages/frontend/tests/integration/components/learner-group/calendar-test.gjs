import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/learner-group/calendar';
import { DateTime } from 'luxon';
import Calendar from 'frontend/components/learner-group/calendar';

module('Integration | Component | learner-group/calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const today = DateTime.fromObject({ hour: 8 });
    const course1 = this.server.create('course');
    const course2 = this.server.create('course', {
      publishedAsTbd: true,
      published: true,
    });
    const session1 = this.server.create('session', { course: course1 });
    const session2 = this.server.create('session', {
      course: course2,
      publishedAsTbd: true,
      published: true,
    });
    const offering1 = this.server.create('offering', {
      startDate: today.toJSON(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      location: '123',
      session: session1,
    });
    const offering2 = this.server.create('offering', {
      startDate: today.toJSON(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      location: '123',
      session: session2,
    });
    const learnerGroup1 = this.server.create('learner-group', {
      offerings: [offering1],
    });
    const learnerGroup2 = this.server.create('learner-group', {
      offerings: [offering2],
      parent: learnerGroup1,
    });
    this.learnerGroup1 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup1.id);
    this.learnerGroup2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup2.id);
  });

  test('shows events', async function (assert) {
    this.set('learnerGroup', this.learnerGroup1);
    await render(<template><Calendar @learnerGroup={{this.learnerGroup}} /></template>);
    assert.strictEqual(component.calendar.events.length, 1);
  });

  test('shows subgroup events', async function (assert) {
    this.set('learnerGroup', this.learnerGroup1);
    await render(<template><Calendar @learnerGroup={{this.learnerGroup}} /></template>);
    assert.strictEqual(component.calendar.events.length, 1);
    await component.showSubgroups.toggle.click();
    assert.strictEqual(component.calendar.events.length, 2);
  });

  test('in-draft event is indicated as such', async function (assert) {
    this.set('learnerGroup', this.learnerGroup1);
    await render(<template><Calendar @learnerGroup={{this.learnerGroup}} /></template>);
    assert.strictEqual(component.calendar.events.length, 1);
    assert.ok(component.calendar.events[0].isDraft);
  });

  test('scheduled event is indicated as such', async function (assert) {
    this.set('learnerGroup', this.learnerGroup2);
    await render(<template><Calendar @learnerGroup={{this.learnerGroup}} /></template>);
    assert.strictEqual(component.calendar.events.length, 1);
    assert.ok(component.calendar.events[0].isScheduled);
  });
});
