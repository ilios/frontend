import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/learner-group/instructor-manager';
import InstructorManager from 'frontend/components/learner-group/instructor-manager';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | learner-group/instructor-manager', function (hooks) {
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
    const instructor1 = this.server.create('user', {
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
      instructors: [instructor1, instructor2],
      instructorGroups: [instructorGroup],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    const instructorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor1.id);
    const instructorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor2.id);
    this.set('learnerGroup', learnerGroupModel);
    this.set('instructors', [instructorModel1, instructorModel2]);
    this.set('instructorGroups', [instructorGroupModel]);
    this.set('availableInstructorGroups', [instructorGroupModel]);
    await render(
      <template>
        <InstructorManager
          @learnerGroup={{this.learnerGroup}}
          @instructors={{this.instructors}}
          @instructorGroups={{this.instructorGroups}}
          @availableInstructorGroups={{this.availableInstructorGroups}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'Manage Default Instructors');
    assert.strictEqual(component.selectedInstructors.length, 2);
    assert.strictEqual(component.selectedInstructors[0].userNameInfo.fullName, 'aardvark');
    assert.notOk(component.selectedInstructors[0].userStatus.accountIsDisabled);
    assert.ok(component.selectedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedInstructors[1].userNameInfo.fullName, 'test person');
    assert.ok(component.selectedInstructors[1].userStatus.accountIsDisabled);
    assert.notOk(component.selectedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedInstructorGroups.length, 1);
    assert.strictEqual(component.selectedInstructorGroups[0].title, 'test group');
    assert.strictEqual(component.selectedInstructorGroups[0].membersList.users.length, 1);
    assert.strictEqual(
      component.selectedInstructorGroups[0].membersList.users[0].userNameInfo.fullName,
      'test person2',
    );
  });

  test('no selected instructors', async function (assert) {
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
        <InstructorManager
          @learnerGroup={{this.learnerGroup}}
          @instructors={{(array)}}
          @instructorGroups={{(array)}}
          @availableInstructorGroups={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedInstructors.length, 0);
    assert.strictEqual(component.selectedInstructorGroups.length, 0);
  });

  test('cancel', async function (assert) {
    assert.expect(1);
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
    this.set('cancel', () => {
      assert.ok(true, 'cancel() fired.');
    });
    await render(
      <template>
        <InstructorManager
          @learnerGroup={{this.learnerGroup}}
          @instructors={{(array)}}
          @instructorGroups={{(array)}}
          @availableInstructorGroups={{(array)}}
          @save={{(noop)}}
          @cancel={{this.cancel}}
        />
      </template>,
    );
    await component.cancel.click();
  });

  test('save', async function (assert) {
    assert.expect(8);
    const instructor1 = this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      middleName: '',
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
    const instructorGroup1 = this.server.create('instructor-group', {
      title: 'test group',
      users: [instructor3],
    });
    const instructorGroup2 = this.server.create('instructor-group', { title: 'test group 2' });
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor1, instructor2],
      instructorGroups: [instructorGroup1, instructorGroup2],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const instructorGroupModel1 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup1.id);
    const instructorGroupModel2 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup2.id);
    const instructorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor1.id);
    const instructorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor2.id);
    this.set('learnerGroup', learnerGroupModel);
    this.set('instructors', [instructorModel1, instructorModel2]);
    this.set('instructorGroups', [instructorGroupModel1, instructorGroupModel2]);
    this.set('availableInstructorGroups', [instructorGroupModel1, instructorGroupModel2]);
    this.set('save', (users, groups) => {
      assert.strictEqual(users.length, 1);
      assert.strictEqual(groups.length, 1);
      assert.strictEqual(users[0].get('fullName'), 'test person');
      assert.strictEqual(groups[0].get('title'), 'test group 2');
    });
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <InstructorManager
          @learnerGroup={{this.learnerGroup}}
          @instructors={{this.instructors}}
          @instructorGroups={{this.instructorGroups}}
          @availableInstructorGroups={{this.availableInstructorGroups}}
          @save={{this.save}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedInstructors.length, 2);
    await component.selectedInstructors[0].remove();
    assert.strictEqual(component.selectedInstructorGroups.length, 2);
    await component.selectedInstructorGroups[0].remove();
    assert.strictEqual(component.selectedInstructors.length, 1);
    assert.strictEqual(component.selectedInstructorGroups.length, 1);
    await component.save.click();
  });

  test('search and add instructor group', async function (assert) {
    const instructorGroup = this.server.create('instructor-group', {
      title: 'test group',
      school: this.school,
    });
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    this.set('availableInstructorGroup', [instructorGroupModel]);
    await render(
      <template>
        <InstructorManager
          @learnerGroup={{this.learnerGroup}}
          @instructors={{(array)}}
          @instructorGroups={{(array)}}
          @availableInstructorGroups={{this.availableInstructorGroup}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedInstructorGroups.length, 0);
    await component.search('test group');
    await component.searchResults[0].add();
    assert.strictEqual(component.selectedInstructorGroups.length, 1);
    assert.strictEqual(component.selectedInstructorGroups[0].text, 'test group');
  });

  test('search and add instructor', async function (assert) {
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });

    this.server.create('user', { firstName: 'test', lastName: 'person', middleName: '' });
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
        <InstructorManager
          @learnerGroup={{this.learnerGroup}}
          @instructors={{(array)}}
          @instructorGroups={{(array)}}
          @availableInstructorGroups={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedInstructors.length, 0);
    await component.search('test group');
    await component.searchResults[0].add();
    assert.strictEqual(component.selectedInstructors.length, 1);
    assert.strictEqual(component.selectedInstructors[0].userNameInfo.fullName, 'test person');
  });
});
