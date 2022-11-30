import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/learner-group/root';

module('Integration | Component | learner-group/root', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.programYear = this.server.create('programYear', { program });
    this.cohort = this.server.create('cohort', { programYear: this.programYear });

    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
      getRolesInSchool() {
        return [];
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);
  });

  test('renders with data', async function (assert) {
    const user1 = this.server.create('user');
    const user2 = this.server.create('user');
    const user3 = this.server.create('user');
    const user4 = this.server.create('user');
    const user5 = this.server.create('user', {
      firstName: 'Walther',
      middleName: 'von der',
      lastName: 'Vogelweide',
    });
    const user6 = this.server.create('user', {
      firstName: 'Zeb',
      lastName: 'Zoober',
      displayName: 'Aardvark',
    });
    const cohort = this.server.create('cohort', {
      title: 'this cohort',
      users: [user1, user2, user3, user4],
      programYear: this.programYear,
    });
    const subGroup = this.server.create('learner-group', {
      title: 'test sub-group',
      cohort,
    });

    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });

    const course2 = this.server.create('course');
    const session2 = this.server.create('session', { course: course2 });
    const ilm = this.server.create('ilm-session', { session: session2 });

    const learnerGroup = this.server.create('learner-group', {
      title: 'test group',
      location: 'test location',
      children: [subGroup],
      instructors: [user5, user6],
      users: [user1, user2],
      offerings: [offering],
      ilmSessions: [ilm],
      cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @sortUsersBy="fullName"
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(component.defaultLocation.text, 'Default Location: test location');
    assert.strictEqual(component.instructorManager.assignedInstructors.length, 2);
    assert.strictEqual(
      component.instructorManager.assignedInstructors[0].userNameInfo.fullName,
      'Aardvark'
    );
    assert.ok(component.instructorManager.assignedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorManager.assignedInstructors[1].userNameInfo.fullName,
      'Walther v. Vogelweide'
    );
    assert.notOk(component.instructorManager.assignedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.associatedCourses.courses.length, 2);
    assert.strictEqual(component.associatedCourses.courses[0].text, 'course 0');
    assert.strictEqual(component.associatedCourses.courses[1].text, 'course 1');
    assert.ok(component.actions.buttons.toggle.isVisible);
    assert.ok(component.actions.buttons.bulkAssignment.isVisible);
    assert.ok(component.actions.buttons.manageUsers.isVisible);
    assert.strictEqual(component.actions.title, 'Members (2)');
    assert.notOk(component.actions.buttons.close.isVisible);
  });

  test('renders with data in read-only mode', async function (assert) {
    const cohort = this.server.create('cohort', {
      title: 'this cohort',
      programYear: this.programYear,
    });
    const learnerGroup = this.server.create('learner-group', {
      title: 'test group',
      location: 'test location',
      cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{false}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @sortUsersBy="fullName"
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.ok(component.actions.buttons.toggle.isVisible);
    assert.notOk(component.actions.buttons.bulkAssignment.isVisible);
    assert.notOk(component.actions.buttons.manageUsers.isVisible);
    assert.notOk(component.actions.buttons.close.isVisible);
    assert.strictEqual(component.actions.title, 'Members (0)');
  });

  test('Needs accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: true,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{true}}
    />
`);
    assert.strictEqual(component.needsAccommodation.toggle.checked, 'true');
  });

  test('Does not need accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: false,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{true}}
    />
`);
    assert.strictEqual(component.needsAccommodation.toggle.checked, 'false');
  });

  test('Read-only: Needs accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: true,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{false}}
    />
`);
    assert.strictEqual(
      component.needsAccommodation.text,
      'Accommodation is required for learners in this group: Yes'
    );
  });

  test('Read-only: Does not need accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: false,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{false}}
    />
`);
    assert.strictEqual(
      component.needsAccommodation.text,
      'Accommodation is required for learners in this group: No'
    );
  });

  test('Toggle needs accommodations', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: false,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{true}}
    />
`);
    assert.strictEqual(component.needsAccommodation.toggle.checked, 'false');
    await component.needsAccommodation.toggle.click();
    assert.strictEqual(component.needsAccommodation.toggle.checked, 'true');
  });

  test('Update location', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      location: 'test location',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(component.defaultLocation.text, 'Default Location: test location');
    await component.defaultLocation.edit();
    await component.defaultLocation.set('new location name');
    await component.defaultLocation.save();
    assert.strictEqual(component.defaultLocation.text, 'Default Location: new location name');
  });

  test('Default location can be blank', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      location: 'test location',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(component.defaultLocation.text, 'Default Location: test location');
    await component.defaultLocation.edit();
    await component.defaultLocation.set('');
    await component.defaultLocation.save();
    assert.strictEqual(component.defaultLocation.text, 'Default Location: Click to edit');
  });

  test('each course is only shown once', async function (assert) {
    const cohort = this.server.create('cohort', {
      title: 'this cohort',
      programYear: this.programYear,
    });
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offerings = this.server.createList('offering', 5, { session });
    const session2 = this.server.create('session', { course });
    const session3 = this.server.create('session', { course });
    const offering1 = this.server.create('offering', { session: session2 });
    const offering2 = this.server.create('offering', { session: session3 });
    const learnerGroup = this.server.create('learner-group', {
      cohort,
      offerings: [offering1, offering2],
    });
    for (let i = 0; i < 3; i++) {
      this.server.create('learner-group', {
        offerings: [offerings[i]],
        parent: learnerGroup,
        cohort,
      });
    }

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @sortUsersBy="firstName"
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(component.associatedCourses.courses.length, 1);
    assert.strictEqual(component.associatedCourses.courses[0].text, 'course 0');
  });

  test('associated courses are linked to course pages', async function (assert) {
    const cohort = this.server.create('cohort', {
      title: 'this cohort',
      programYear: this.programYear,
    });
    const course = this.server.create('course');
    const course2 = this.server.create('course');
    const session = this.server.create('session', { course });
    const session2 = this.server.create('session', { course: course2 });
    const offering1 = this.server.create('offering', { session });
    const offering2 = this.server.create('offering', { session: session2 });
    const learnerGroup = this.server.create('learner-group', {
      cohort,
      offerings: [offering1, offering2],
    });

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @sortUsersBy="firstName"
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(component.associatedCourses.courses.length, 2);
    assert.strictEqual(component.associatedCourses.courses[0].text, 'course 0');
    assert.strictEqual(component.associatedCourses.courses[0].linksTo, '/courses/1');
    assert.strictEqual(component.associatedCourses.courses[1].text, 'course 1');
    assert.strictEqual(component.associatedCourses.courses[1].linksTo, '/courses/2');
  });

  test('Update default URL', async function (assert) {
    assert.expect(2);

    const learnerGroup = this.server.create('learner-group', {
      url: 'https://iliosproject.org/',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(
      component.defaultUrl.text,
      'Default Virtual Learning Link: https://iliosproject.org/'
    );
    await component.defaultUrl.edit();
    await component.defaultUrl.set('https://github.com/ilios/ilios');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.text,
      'Default Virtual Learning Link: https://github.com/ilios/ilios'
    );
  });

  test('URL input validation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.strictEqual(component.defaultUrl.text, 'Default Virtual Learning Link: Click to edit');
    await component.defaultUrl.edit();
    assert.strictEqual(component.defaultUrl.value, 'https://');
    assert.strictEqual(component.defaultUrl.errors.length, 0);
    await component.defaultUrl.set('thisisnotanurl');
    await component.defaultUrl.save();
    assert.strictEqual(component.defaultUrl.errors.length, 1);
    assert.strictEqual(component.defaultUrl.errors[0].text, 'This field must be a valid url');
    await component.defaultUrl.set('www.stillnotavalidurlwithoutprotocol.com');
    await component.defaultUrl.save();
    assert.strictEqual(component.defaultUrl.errors.length, 1);
    assert.strictEqual(component.defaultUrl.errors[0].text, 'This field must be a valid url');
    await component.defaultUrl.set('https://' + 'abcdefghij'.repeat(200) + '.org');
    await component.defaultUrl.save();
    assert.strictEqual(component.defaultUrl.errors.length, 2);
    assert.strictEqual(
      component.defaultUrl.errors[0].text,
      'This field is too long (maximum is 2000 characters)'
    );
    assert.strictEqual(component.defaultUrl.errors[1].text, 'This field must be a valid url');
    await component.defaultUrl.set('https://abcdefghij.org');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.text,
      'Default Virtual Learning Link: https://abcdefghij.org'
    );
  });

  test('learnergroup calendar', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      url: 'https://iliosproject.org/',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />
`);

    assert.notOk(component.calendar.isVisible);
    assert.strictEqual(component.actions.buttons.toggle.firstLabel.text, 'Hide Calendar');
    assert.ok(component.actions.buttons.toggle.firstButton.isChecked);
    assert.strictEqual(component.actions.buttons.toggle.secondLabel.text, 'Show Calendar');
    assert.notOk(component.actions.buttons.toggle.secondButton.isChecked);
    await component.actions.buttons.toggle.secondButton.click();
    assert.ok(component.calendar.isVisible);
  });

  test('manage users', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      url: 'https://iliosproject.org/',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{true}}
      @isBulkAssigning={{false}}
    />
`);

    assert.notOk(component.actions.buttons.toggle.isVisible);
    assert.notOk(component.actions.buttons.bulkAssignment.isVisible);
    assert.notOk(component.actions.buttons.manageUsers.isVisible);
    assert.ok(component.actions.buttons.close.isVisible);
    assert.ok(component.userManager.isVisible);
    assert.strictEqual(component.actions.title, 'Manage Group Membership');
  });

  test('bulk assignment', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      url: 'https://iliosproject.org/',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    this.set('isBulkAssigning', false);

    await render(hbs`<LearnerGroup::Root
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{set this.isBulkAssigning true}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{this.isBulkAssigning}}
    />
`);
    await component.actions.buttons.bulkAssignment.click();
    assert.notOk(component.actions.buttons.toggle.isVisible);
    assert.notOk(component.actions.buttons.bulkAssignment.isVisible);
    assert.notOk(component.actions.buttons.manageUsers.isVisible);
    assert.ok(component.actions.buttons.close.isVisible);
    assert.ok(component.bulkAssignment.isVisible);
    assert.strictEqual(component.actions.title, 'Upload Group Assignments');
  });
});
