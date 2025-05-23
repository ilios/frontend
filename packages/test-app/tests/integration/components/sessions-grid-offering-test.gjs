import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import SessionsGridOffering from 'ilios-common/components/sessions-grid-offering';
import { component } from 'ilios-common/page-objects/components/sessions-grid-offering';

module('Integration | Component | sessions-grid-offering', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.school = this.server.create('school');
    const course = this.server.create('course', { school: this.school });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.session = this.server.create('session', { course });

    this.intl = this.owner.lookup('service:intl');
  });

  test('it renders', async function (assert) {
    const instructors = this.server.createList('user', 5);
    const learners = this.server.createList('user', 5);
    const learnerGroup1 = this.server.create('learner-group', {
      cohort: this.cohort,
      users: [learners[0], learners[1]],
    });
    const learnerGroup2 = this.server.create('learner-group', {
      cohort: this.cohort,
      users: [learners[2]],
    });
    const instructorGroup1 = this.server.create('instructor-group', {
      school: this.school,
      users: [instructors[0], instructors[1]],
    });
    const instructorGroup2 = this.server.create('instructor-group', {
      school: this.school,
      users: [instructors[2]],
    });
    const offering = this.server.create('offering', {
      session: this.session,
      learnerGroups: [learnerGroup1, learnerGroup2],
      instructors: [instructors[3], instructors[4]],
      instructorGroups: [instructorGroup1, instructorGroup2],
      room: 'Room 101',
    });

    const model = await this.owner.lookup('service:store').findRecord('offering', offering.id);
    this.set('offering', model);
    this.set('startTime', '5:00 PM');
    this.set('durationHours', 2);
    this.set('durationMinutes', 30);
    await render(
      <template>
        <SessionsGridOffering
          @offering={{this.offering}}
          @canUpdate={{true}}
          @firstRow={{true}}
          @even={{true}}
          @span={{1}}
          @startTime={{this.startTime}}
          @durationHours={{this.durationHours}}
          @durationMinutes={{this.durationMinutes}}
          @setHeaderLockedStatus={{false}}
        />
      </template>,
    );
    assert.notOk(component.offeringForm.visible);
    assert.strictEqual(component.startTime, '5:00 PM');
    assert.strictEqual(component.duration, '2 hours 30 minutes');
    assert.strictEqual(component.room.text, 'Room 101');
    assert.strictEqual(component.learners, '(3) 5 guy M. Mc5son, 6 guy...');
    assert.strictEqual(component.learnerGroups, '(2) learner group 0, learn...');
    assert.strictEqual(component.instructors, '(5) 0 guy M. Mc0son, 1 guy...');
    assert.ok(component.edit.isPresent);
  });
});
