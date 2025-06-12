import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/learner-group/instructors-list';
import InstructorsList from 'frontend/components/learner-group/instructors-list';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learner-group/instructors-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.school = school;
  });

  test('it renders', async function (assert) {
    const instructor = this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      middleName: '',
      enabled: false,
    });
    const instructor2 = this.server.create('user', {
      firstName: 'zeb',
      lastName: 'z00ber',
      displayName: 'aardvark',
    });
    const instructor3 = this.server.create('user', {
      firstName: 'test',
      lastName: 'person2',
      middleName: '',
    });
    const instructorGroup = this.server.create('instructor-group', {
      title: 'test group',
      users: [instructor3],
    });
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
      instructorGroups: [instructorGroup],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <InstructorsList
          @learnerGroup={{this.learnerGroup}}
          @manage={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'Default Instructors (3)');
    assert.strictEqual(component.assignedInstructors.length, 3);
    assert.strictEqual(component.assignedInstructors[0].userNameInfo.fullName, 'aardvark');
    assert.notOk(component.assignedInstructors[0].userStatus.accountIsDisabled);
    assert.ok(component.assignedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.assignedInstructors[1].userNameInfo.fullName, 'test person');
    assert.ok(component.assignedInstructors[1].userStatus.accountIsDisabled);
    assert.notOk(component.assignedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.assignedInstructors[2].userNameInfo.fullName, 'test person2');
    assert.notOk(component.assignedInstructors[2].userStatus.accountIsDisabled);
    assert.notOk(component.assignedInstructors[2].userNameInfo.hasAdditionalInfo);
  });

  test('no assigned instructors', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <InstructorsList
          @learnerGroup={{this.learnerGroup}}
          @manage={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Default Instructors (0)');
    assert.strictEqual(component.assignedInstructors.length, 0);
  });

  test('clicking manage button fires', async function (assert) {
    assert.expect(1);
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    this.set('manage', () => {
      assert.ok(true, 'Manage event fired.');
    });
    await render(
      <template>
        <InstructorsList
          @learnerGroup={{this.learnerGroup}}
          @manage={{this.manage}}
          @canUpdate={{true}}
        />
      </template>,
    );
    await component.manage.click();
  });

  test('read-only mode', async function (assert) {
    const instructor = this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      middleName: '',
    });
    const instructor2 = this.server.create('user', {
      firstName: 'zeb',
      lastName: 'z00ber',
      displayName: 'aardvark',
    });
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <InstructorsList
          @learnerGroup={{this.learnerGroup}}
          @manage={{(noop)}}
          @canUpdate={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.assignedInstructors.length, 2);
    assert.notOk(component.manage.isVisible);
  });
});
