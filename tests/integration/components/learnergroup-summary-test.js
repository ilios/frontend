import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | learnergroup summary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    this.programYear = this.server.create('programYear', { program });
    this.cohort = this.server.create('cohort', { programYear: this.programYear });
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
      .find('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @sortUsersBy="fullName"
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultLocation = '[data-test-overview] .defaultlocation span:nth-of-type(1)';
    const instructors = '[data-test-overview] [data-test-assigned-instructor]';
    const coursesList = '[data-test-overview] .associatedcourses ul';

    assert.dom(defaultLocation).hasText('test location');
    assert.dom(instructors).exists({ count: 2 });
    assert.dom(`${instructors}:nth-of-type(1) [data-test-fullname]`).hasText('Aardvark');
    assert.dom(`${instructors}:nth-of-type(1) [data-test-info]`).exists();
    assert
      .dom(`${instructors}:nth-of-type(2) [data-test-fullname]`)
      .hasText('Walther v. Vogelweide');
    assert.dom(`${instructors}:nth-of-type(2) [data-test-info]`).doesNotExist();
    assert.dom(coursesList).hasText('course 0 course 1');
  });

  test('Needs accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: true,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{true}}
    />`);
    assert
      .dom('[data-test-needs-accommodation] [data-test-toggle-yesno]')
      .hasAria('checked', 'true');
  });

  test('Does not need accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: false,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{true}}
    />`);
    assert
      .dom('[data-test-needs-accommodation] [data-test-toggle-yesno]')
      .hasAria('checked', 'false');
  });

  test('Read-only: Needs accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: true,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{false}}
    />`);
    assert
      .dom('[data-test-needs-accommodation]')
      .hasText('Accommodation is required for learners in this group: Yes');
  });

  test('Read-only: Does not need accommodation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: false,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{false}}
    />`);
    assert
      .dom('[data-test-needs-accommodation]')
      .hasText('Accommodation is required for learners in this group: No');
  });

  test('Toggle needs accommodations', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      needsAccommodation: false,
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);
    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
      @canUpdate={{true}}
    />`);
    assert
      .dom('[data-test-needs-accommodation] [data-test-toggle-yesno]')
      .hasAria('checked', 'false');
    assert.notOk(learnerGroupModel.needsAccommodation);
    await click('[data-test-needs-accommodation] [data-test-toggle-yesno]');
    assert.ok(learnerGroupModel.needsAccommodation);
    assert
      .dom('[data-test-needs-accommodation] [data-test-toggle-yesno]')
      .hasAria('checked', 'true');
  });

  test('Update location', async function (assert) {
    assert.expect(2);

    const learnerGroup = this.server.create('learner-group', {
      location: 'test location',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultLocation = '[data-test-overview] .defaultlocation span:nth-of-type(1)';
    const editLocation = `${defaultLocation} .editable`;
    const input = `${defaultLocation} input`;
    const save = `${defaultLocation} .done`;
    assert.dom(defaultLocation).hasText('test location');
    await click(editLocation);
    await fillIn(input, 'new location name');
    await click(save);
    assert.dom(defaultLocation).hasText('new location name');
  });

  test('Default location can be blank', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      location: 'test location',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultLocation = '[data-test-overview] .defaultlocation span:nth-of-type(1)';
    const editLocation = `${defaultLocation} .editable`;
    const input = `${defaultLocation} input`;
    const save = `${defaultLocation} .done`;
    assert.dom(defaultLocation).hasText('test location');
    await click(editLocation);
    await fillIn(input, '');
    await click(save);
    assert.dom(defaultLocation).hasText('Click to edit');
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
      });
    }

    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);

    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @sortUsersBy="firstName"
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const coursesList = '[data-test-overview] .associatedcourses ul';

    assert.dom(coursesList).hasText('course 0');
  });

  test('Update default URL', async function (assert) {
    assert.expect(2);

    const learnerGroup = this.server.create('learner-group', {
      url: 'https://iliosproject.org/',
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultUrl = '[data-test-overview] .defaulturl span:nth-of-type(1)';
    const editUrl = `${defaultUrl} .editable`;
    const input = `${defaultUrl} input`;
    const save = `${defaultUrl} .done`;
    assert.dom(defaultUrl).hasText('https://iliosproject.org/');
    await click(editUrl);
    await fillIn(input, 'https://github.com/ilios/ilios');
    await click(save);
    assert.dom(defaultUrl).hasText('https://github.com/ilios/ilios');
  });

  test('URL input validation', async function (assert) {
    const learnerGroup = this.server.create('learner-group', {
      cohort: this.cohort,
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupSummary
      @canUpdate={{true}}
      @setIsEditing={{(noop)}}
      @setSortUsersBy={{(noop)}}
      @setIsBulkAssigning={{(noop)}}
      @learnerGroup={{this.learnerGroup}}
      @isEditing={{false}}
      @isBulkAssigning={{false}}
    />`);

    const defaultUrl = '[data-test-overview] .defaulturl span:nth-of-type(1)';
    const editUrl = `${defaultUrl} .editable`;
    const input = `${defaultUrl} input`;
    const save = `${defaultUrl} .done`;
    const errors = `${defaultUrl} .validation-error-message`;
    assert.dom(editUrl).hasText('Click to edit');
    await click(editUrl);
    await fillIn(input, 'thisisnotanurl');
    await click(save);
    assert.dom(errors).hasText('This field must be a valid url');
    await click(save);
    await fillIn(input, 'www.stillnotavalidurlwithoutprotocol.com');
    assert.dom(errors).hasText('This field must be a valid url');
    await fillIn(input, 'h');
    await click(save);
    assert.dom(errors).hasText('This field is too short (minimum is 2 characters)');
    await fillIn(input, 'https://' + '01234567890'.repeat(200) + '.org');
    await click(save);
    assert.dom(errors).hasText('This field is too long (maximum is 2000 characters)');
  });
});
