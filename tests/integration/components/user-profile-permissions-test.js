import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';
import { component } from 'ilios/tests/pages/components/user-profile-permissions';

module('Integration | Component | user-profile-permissions', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.schools = this.server.createList('school', 2);
    this.thisYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('academic-year', { id: this.thisYear - 1 });
    this.server.create('academic-year', { id: this.thisYear });
    this.server.create('academic-year', { id: this.thisYear + 1 });
  });

  test('it renders empty', async function (assert) {
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.title, 'Permissions');
    assert.equal(component.schools.length, 2);
    assert.equal(component.schools[0].text, 'school 0');
    assert.equal(component.schools[1].text, 'school 1');
    assert.equal(component.selectedSchool, '2');

    assert.equal(component.years.length, 3);
    assert.equal(component.years[0].text, `${this.thisYear - 1} - ${this.thisYear}`);
    assert.equal(component.years[1].text, `${this.thisYear} - ${this.thisYear + 1}`);
    assert.equal(component.years[2].text, `${this.thisYear + 1} - ${this.thisYear + 2}`);
    assert.equal(component.selectedYear, this.thisYear);

    assert.equal(component.school.title, 'School (school 1)');
    assert.equal(component.school.director, 'No');
    assert.equal(component.school.administrator, 'No');

    assert.equal(component.programs.title, 'Programs (0)');
    assert.ok(component.programs.notDirecting);

    assert.equal(component.programYears.title, 'Program Years (0)');
    assert.ok(component.programYears.notDirecting);

    assert.equal(component.courses.title, 'Courses (0)');
    assert.ok(component.courses.notDirecting);
    assert.ok(component.courses.notAdministrating);
    assert.ok(component.courses.notInstructing);

    assert.equal(component.sessions.title, 'Sessions (0)');
    assert.ok(component.sessions.notAdministrating);
    assert.ok(component.sessions.notInstructing);
  });

  test('change school', async function (assert) {
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.selectedSchool, '2');
    assert.equal(component.school.title, 'School (school 1)');
    await component.changeSchool(1);
    assert.equal(component.selectedSchool, '1');
    assert.equal(component.school.title, 'School (school 0)');
  });

  test('change year', async function (assert) {
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.selectedYear, this.thisYear);
    await component.changeYear(this.thisYear + 1);
    assert.equal(component.selectedYear, this.thisYear + 1);
  });

  test('it renders with school data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
      directedSchools: [school],
      administeredSchools: [school],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.school.director, 'Yes');
    assert.equal(component.school.administrator, 'Yes');
    assert.ok(component.programs.notDirecting);
    assert.ok(component.programYears.notDirecting);
    assert.ok(component.courses.notDirecting);
    assert.ok(component.courses.notAdministrating);
    assert.ok(component.courses.notInstructing);
    assert.ok(component.sessions.notAdministrating);
    assert.ok(component.sessions.notInstructing);
  });

  test('it renders with program data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
    });
    this.server.create('program', {
      school,
      directors: [user],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.school.director, 'No');
    assert.equal(component.school.administrator, 'No');
    assert.equal(component.programs.title, 'Programs (1)');
    assert.equal(component.programs.directors.length, 1);
    assert.equal(component.programs.directors[0].text, 'program 0');

    assert.ok(component.courses.notDirecting);
    assert.ok(component.courses.notAdministrating);
    assert.ok(component.courses.notInstructing);
    assert.ok(component.sessions.notAdministrating);
    assert.ok(component.sessions.notInstructing);
  });

  test('it renders with program year data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
    });
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
      directors: [user]
    });
    this.server.create('cohort', { programYear });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.school.director, 'No');
    assert.equal(component.school.administrator, 'No');
    assert.ok(component.programs.notDirecting);
    assert.equal(component.programYears.title, 'Program Years (1)');
    assert.equal(component.programYears.directors.length, 1);
    assert.equal(component.programYears.directors[0].text, 'program 0 cohort 0');

    assert.ok(component.courses.notDirecting);
    assert.ok(component.courses.notAdministrating);
    assert.ok(component.courses.notInstructing);
    assert.ok(component.sessions.notAdministrating);
    assert.ok(component.sessions.notInstructing);
  });

  test('it renders with course and session data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
    });
    const course = this.server.create('course', {
      school,
      directors: [user],
      administrators: [user],
      year: this.thisYear,
    });
    const session = this.server.create('session', {
      course,
      administrators: [user],
    });
    this.server.create('ilmSession', {
      session,
      instructors: [user]
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfilePermissions @user={{this.user}} />`);

    assert.equal(component.school.director, 'No');
    assert.equal(component.school.administrator, 'No');
    assert.ok(component.programs.notDirecting);
    assert.ok(component.programYears.notDirecting);

    assert.equal(component.courses.title, 'Courses (3)');
    assert.ok(component.courses.directors.length, 1);
    assert.ok(component.courses.directors[0].text, 'course 0');
    assert.ok(component.courses.administrators.length, 1);
    assert.ok(component.courses.administrators[0].text, 'course 0');
    assert.ok(component.courses.instructors.length, 1);
    assert.ok(component.courses.instructors[0].text, 'course 0');
    assert.equal(component.sessions.title, 'Sessions (2)');
    assert.ok(component.sessions.administrators.length, 1);
    assert.ok(component.sessions.administrators[0].text, 'course 0');
    assert.ok(component.sessions.instructors.length, 1);
    assert.ok(component.sessions.instructors[0].text, 'course 0');
  });
});
