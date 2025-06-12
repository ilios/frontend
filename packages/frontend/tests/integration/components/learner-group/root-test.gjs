import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/learner-group/root';
import Root from 'frontend/components/learner-group/root';
import noop from 'ilios-common/helpers/noop';
import set from 'ember-set-helper/helpers/set';

module('Integration | Component | learner-group/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.programYear = this.server.create('program-year', { program });
    this.cohort = this.server.create('cohort', { programYear: this.programYear });

    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
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
      users: [user3, user4],
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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.defaultLocation.text, 'Default Location: test location');
    assert.strictEqual(component.instructorsList.assignedInstructors.length, 2);
    assert.strictEqual(
      component.instructorsList.assignedInstructors[0].userNameInfo.fullName,
      'Aardvark',
    );
    assert.ok(component.instructorsList.assignedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorsList.assignedInstructors[1].userNameInfo.fullName,
      'Walther v. Vogelweide',
    );
    assert.notOk(component.instructorsList.assignedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.associatedCourses.courses.length, 2);
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

    await render(
      <template>
        <Root
          @canUpdate={{false}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.ok(component.actions.buttons.toggle.isVisible);
    assert.notOk(component.actions.buttons.bulkAssignment.isVisible);
    assert.notOk(component.actions.buttons.manageUsers.isVisible);
    assert.notOk(component.actions.buttons.close.isVisible);
    assert.strictEqual(component.actions.title, 'Members (0)');
  });

  test('renders associated courses display with single course year if calendar year boundary IS NOT crossed', async function (assert) {
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
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: false,
          apiVersion,
        },
      };
    });

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.associatedCourses.courses[0].text, 'course 0 (2013)');
    assert.strictEqual(component.associatedCourses.courses[1].text, 'course 1 (2013)');
  });

  test('renders associated courses display with course year range if calendar year boundary IS crossed', async function (assert) {
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
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.associatedCourses.courses[0].text, 'course 0 (2013 - 2014)');
    assert.strictEqual(component.associatedCourses.courses[1].text, 'course 1 (2013 - 2014)');
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
    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
          @canUpdate={{true}}
        />
      </template>,
    );
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
    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
          @canUpdate={{true}}
        />
      </template>,
    );
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
    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
          @canUpdate={{false}}
        />
      </template>,
    );
    assert.strictEqual(
      component.needsAccommodation.text,
      'Accommodation is required for learners in this group: Yes',
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
    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
          @canUpdate={{false}}
        />
      </template>,
    );
    assert.strictEqual(
      component.needsAccommodation.text,
      'Accommodation is required for learners in this group: No',
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
    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
          @canUpdate={{true}}
        />
      </template>,
    );
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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

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

    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="firstName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.associatedCourses.courses.length, 1);
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

    await render(
      <template>
        <Root
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="firstName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.associatedCourses.courses.length, 2);
    assert.strictEqual(component.associatedCourses.courses[0].linksTo, '/courses/1');
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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(
      component.defaultUrl.text,
      'Default Virtual Learning Link: https://iliosproject.org/',
    );
    await component.defaultUrl.edit();
    await component.defaultUrl.set('https://github.com/ilios/ilios');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.text,
      'Default Virtual Learning Link: https://github.com/ilios/ilios',
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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.defaultUrl.text, 'Default Virtual Learning Link: Click to edit');
    await component.defaultUrl.edit();
    assert.strictEqual(component.defaultUrl.value, 'https://');
    assert.notOk(component.defaultUrl.hasError);
    await component.defaultUrl.set('thisisnotanurl');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.error,
      'Default Virtual Learning Link must be a valid url',
    );
    await component.defaultUrl.set('www.stillnotavalidurlwithoutprotocol.com');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.error,
      'Default Virtual Learning Link must be a valid url',
    );
    await component.defaultUrl.set('https://' + 'abcdefghij'.repeat(200) + '.org');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.error,
      'Default Virtual Learning Link is too long (maximum is 2000 characters)',
    );
    await component.defaultUrl.set('https://abcdefghij.org');
    await component.defaultUrl.save();
    assert.strictEqual(
      component.defaultUrl.text,
      'Default Virtual Learning Link: https://abcdefghij.org',
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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{true}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

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

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{set this "isBulkAssigning" true}}
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{this.isBulkAssigning}}
        />
      </template>,
    );
    await component.actions.buttons.bulkAssignment.click();
    assert.notOk(component.actions.buttons.toggle.isVisible);
    assert.notOk(component.actions.buttons.bulkAssignment.isVisible);
    assert.notOk(component.actions.buttons.manageUsers.isVisible);
    assert.ok(component.actions.buttons.close.isVisible);
    assert.ok(component.bulkAssignment.isVisible);
    assert.strictEqual(component.actions.title, 'Upload Group Assignments');
  });

  test('sub-groups list not visible if learner group has no sub-groups', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );

    assert.notOk(component.subgroups.list.isVisible);
  });

  test('toggling between instructor manager and instructor view mode', async function (assert) {
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
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );
    assert.notOk(component.instructorManager.isVisible);
    assert.strictEqual(component.instructorsList.title, 'Default Instructors (3)');
    assert.strictEqual(component.instructorsList.assignedInstructors.length, 3);
    assert.strictEqual(
      component.instructorsList.assignedInstructors[0].userNameInfo.fullName,
      'aardvark',
    );
    assert.ok(component.instructorsList.assignedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorsList.assignedInstructors[1].userNameInfo.fullName,
      'test person',
    );
    assert.notOk(component.instructorsList.assignedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorsList.assignedInstructors[2].userNameInfo.fullName,
      'test person2',
    );
    assert.notOk(component.instructorsList.assignedInstructors[2].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.instructorsList.manage.text, 'Manage Instructors');
    await component.instructorsList.manage.click();
    assert.notOk(component.instructorsList.isVisible);
    assert.strictEqual(component.instructorManager.title, 'Manage Default Instructors');
    assert.strictEqual(component.instructorManager.selectedInstructors.length, 2);
    assert.strictEqual(
      component.instructorManager.selectedInstructors[0].userNameInfo.fullName,
      'aardvark',
    );
    assert.ok(component.instructorManager.selectedInstructors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorManager.selectedInstructors[1].userNameInfo.fullName,
      'test person',
    );
    assert.notOk(component.instructorManager.selectedInstructors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.instructorManager.selectedInstructorGroups.length, 1);
    assert.strictEqual(component.instructorManager.selectedInstructorGroups[0].title, 'test group');
    assert.strictEqual(
      component.instructorManager.selectedInstructorGroups[0].membersList.users.length,
      1,
    );
    assert.strictEqual(
      component.instructorManager.selectedInstructorGroups[0].membersList.users[0].userNameInfo
        .fullName,
      'test person2',
    );
    await component.instructorManager.cancel.click();
    assert.notOk(component.instructorManager.isVisible);
    await component.instructorsList.manage.click();
    assert.notOk(component.instructorsList.isVisible);
    await component.instructorManager.save.click();
    assert.notOk(component.instructorManager.isVisible);
    assert.ok(component.instructorsList.isVisible);
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
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.instructorsList.assignedInstructors.length, 2);
    await component.instructorsList.manage.click();
    assert.strictEqual(component.instructorManager.selectedInstructors.length, 2);
    await component.instructorManager.selectedInstructors[0].remove();
    assert.strictEqual(component.instructorManager.selectedInstructors.length, 1);
    await component.instructorManager.cancel.click();
    assert.strictEqual(component.instructorsList.assignedInstructors.length, 2);
  });

  test('edit and save', async function (assert) {
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
    const instructorGroup = this.server.create('instructor-group', {
      title: 'test group',
      users: [instructor3],
    });
    const instructorGroup2 = this.server.create('instructor-group', { title: 'test group 2' });
    const learnerGroup = this.server.create('learner-group', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [instructor, instructor2],
      instructorGroups: [instructorGroup, instructorGroup2],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{false}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.instructorsList.assignedInstructors.length, 3);
    await component.instructorsList.manage.click();
    assert.strictEqual(component.instructorManager.selectedInstructors.length, 2);
    await component.instructorManager.selectedInstructors[0].remove();
    assert.strictEqual(component.instructorManager.selectedInstructorGroups.length, 2);
    await component.instructorManager.selectedInstructorGroups[0].remove();
    assert.strictEqual(component.instructorManager.selectedInstructors.length, 1);
    assert.strictEqual(component.instructorManager.selectedInstructorGroups.length, 1);
    await component.instructorManager.save.click();
    assert.strictEqual(component.instructorsList.assignedInstructors.length, 1);
  });

  test('filter applies', async function (assert) {
    const learnerGroup = this.server.create('learner-group', { id: 1 });
    const subgroup = this.server.create('learner-group', { id: 2, parent: learnerGroup });
    this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      email: 'jasper.dog@example.edu',
      learnerGroups: [learnerGroup],
    });
    this.server.create('user', {
      firstName: 'Jayden',
      lastName: 'Pup',
      displayName: 'Just Jayden',
      email: 'jayden@example.edu',
      learnerGroups: [learnerGroup],
    });
    this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      email: 'jackson.doggy@example.edu',
      learnerGroups: [subgroup],
    });
    this.server.create('user', {
      firstName: 'Beetlejuice',
      lastName: 'Beetlejuice',
      displayName: 'Beet',
      email: 'beet@example.edu',
      learnerGroups: [subgroup],
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);
    await render(
      <template>
        <Root
          @canUpdate={{true}}
          @setIsEditing={{(noop)}}
          @setSortUsersBy={{(noop)}}
          @setIsBulkAssigning={{(noop)}}
          @sortUsersBy="fullName"
          @learnerGroup={{this.learnerGroup}}
          @isEditing={{true}}
          @isBulkAssigning={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(
      component.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog',
    );
    assert.strictEqual(
      component.userManager.usersInCurrentGroup[1].name.userNameInfo.fullName,
      'Just Jayden',
    );
    assert.strictEqual(component.userManager.usersNotInCurrentGroup.length, 2);
    assert.strictEqual(
      component.userManager.usersNotInCurrentGroup[0].name.userNameInfo.fullName,
      'Beet',
    );
    assert.strictEqual(
      component.userManager.usersNotInCurrentGroup[1].name.userNameInfo.fullName,
      'Jackson M. Doggy',
    );

    await component.actions.filter('dog');
    assert.strictEqual(component.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      component.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      'Jasper M. Dog',
    );
    assert.strictEqual(component.userManager.usersNotInCurrentGroup.length, 1);
    assert.strictEqual(
      component.userManager.usersNotInCurrentGroup[0].name.userNameInfo.fullName,
      'Jackson M. Doggy',
    );
  });
});
