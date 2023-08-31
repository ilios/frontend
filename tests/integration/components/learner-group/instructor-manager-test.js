import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learner-group/instructor-manager';

module('Integration | Component | learner-group/instructor-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.school = school;
  });

  test('it renders', async function (assert) {
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
    const instructor3 = this.server.create('user', {
      firstName: 'test',
      lastName: 'person2',
      middleName: '',
    });
    const instructorGroup = this.server.create('instructorGroup', {
      title: 'test group',
      users: [instructor3],
    });
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
      instructorGroups: [instructorGroup],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{(noop)}}
      @canUpdate={{true}}
    />`);

    assert.strictEqual(component.title, 'Default Instructors (3)');
    assert.strictEqual(component.assignedInstructors.length, 3);
    assert.strictEqual(component.assignedInstructors[0].userNameInfo.fullName, 'aardvark');
    assert.dom(component.assignedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.assignedInstructors[1].userNameInfo.fullName, 'test person');
    assert.notOk(component.assignedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.assignedInstructors[2].userNameInfo.fullName, 'test person2');
    assert.notOk(component.assignedInstructors[2].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.saveButton.isVisible);
    assert.notOk(component.cancelButton.isVisible);
    assert.strictEqual(component.manageButton.text, 'Manage Instructors');
    await component.manage();
    assert.strictEqual(component.title, 'Manage Default Instructors');
    assert.strictEqual(component.selectedInstructors.length, 2);
    assert.strictEqual(component.selectedInstructors[0].userNameInfo.fullName, 'aardvark');
    assert.dom(component.selectedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedInstructors[1].userNameInfo.fullName, 'test person');
    assert.notOk(component.selectedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.selectedInstructorGroups.length, 1);
    assert.strictEqual(component.selectedInstructorGroups[0].title, 'test group');
    assert.strictEqual(component.selectedInstructorGroups[0].membersList.users.length, 1);
    assert.strictEqual(
      component.selectedInstructorGroups[0].membersList.users[0].userNameInfo.fullName,
      'test person2',
    );
    assert.ok(component.saveButton.isVisible);
    assert.ok(component.cancelButton.isVisible);
    assert.notOk(component.manageButton.isVisible);
  });

  test('no selected instructors', async function (assert) {
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{(noop)}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.title, 'Default Instructors (0)');
    assert.strictEqual(component.selectedInstructors.length, 0);
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
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{(noop)}}
      @canUpdate={{false}}
    />`);
    assert.strictEqual(component.assignedInstructors.length, 2);
    assert.notOk(component.manageButton.isVisible);
  });

  test('edit and cancel', async function (assert) {
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
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
    });

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{(noop)}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.assignedInstructors.length, 2);
    await component.manage();
    assert.strictEqual(component.selectedInstructors.length, 2);
    await component.selectedInstructors[0].remove();
    assert.strictEqual(component.selectedInstructors.length, 1);
    await component.cancel();
    assert.strictEqual(component.assignedInstructors.length, 2);
  });

  test('edit and save', async function (assert) {
    assert.expect(9);
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
    const instructor3 = this.server.create('user', {
      firstName: 'test',
      lastName: 'person2',
      middleName: '',
    });
    const instructorGroup = this.server.create('instructorGroup', {
      title: 'test group',
      users: [instructor3],
    });
    const instructorGroup2 = this.server.create('instructorGroup', { title: 'test group 2' });
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
      instructorGroups: [instructorGroup, instructorGroup2],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);

    this.set('save', (users, groups) => {
      assert.strictEqual(users.length, 1);
      assert.strictEqual(groups.length, 1);
      assert.strictEqual(users[0].get('fullName'), 'test person');
      assert.strictEqual(groups[0].get('title'), 'test group 2');
    });
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{this.save}}
      @canUpdate={{true}}
    />`);

    assert.strictEqual(component.assignedInstructors.length, 3);
    await component.manage();
    assert.strictEqual(component.selectedInstructors.length, 2);
    await component.selectedInstructors[0].remove();
    assert.strictEqual(component.selectedInstructorGroups.length, 2);
    await component.selectedInstructorGroups[0].remove();
    assert.strictEqual(component.selectedInstructors.length, 1);
    assert.strictEqual(component.selectedInstructorGroups.length, 1);
    await component.save();
  });

  test('search and add instructor group', async function (assert) {
    this.server.create('instructorGroup', { title: 'test group', school: this.school });
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{(noop)}}
      @canUpdate={{true}}
    />`);
    await component.manage();
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
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learnerGroup', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::InstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{(noop)}}
      @canUpdate={{true}}
    />`);
    await component.manage();
    assert.strictEqual(component.selectedInstructors.length, 0);
    await component.search('test group');
    await component.searchResults[0].add();
    assert.strictEqual(component.selectedInstructors.length, 1);
    assert.strictEqual(component.selectedInstructors[0].userNameInfo.fullName, 'test person');
  });
});
