import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { component } from 'frontend/tests/pages/components/user-profile-permissions';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import UserProfilePermissions from 'frontend/components/user-profile-permissions';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | user-profile-permissions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.schools = this.server.createList('school', 2);
    this.thisYear = DateTime.now().year;
    this.currentAcademicYear = this.thisYear;
    this.server.create('academic-year', { id: this.thisYear - 1 });
    this.server.create('academic-year', { id: this.thisYear });
    this.server.create('academic-year', { id: this.thisYear + 1 });
  });

  test('it renders empty', async function (assert) {
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfilePermissions @user={{this.user}} @setSchool={{(noop)}} @setYear={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.title, 'Permissions');
    assert.strictEqual(component.schools.length, 2);
    assert.strictEqual(component.schools[0].text, 'school 0');
    assert.strictEqual(component.schools[1].text, 'school 1');
    assert.strictEqual(component.selectedSchool, '2');

    assert.strictEqual(component.years.length, 3);
    assert.strictEqual(component.years[0].text, `${this.thisYear + 1} - ${this.thisYear + 2}`);
    assert.strictEqual(component.years[1].text, `${this.thisYear} - ${this.thisYear + 1}`);
    assert.strictEqual(component.years[2].text, `${this.thisYear - 1} - ${this.thisYear}`);
    assert.strictEqual(parseInt(component.selectedYear, 10), this.currentAcademicYear);

    assert.strictEqual(component.school.title, 'School (school 1)');
    assert.strictEqual(component.school.director, 'No');
    assert.strictEqual(component.school.administrator, 'No');

    assert.strictEqual(component.programs.title, 'Programs (0)');
    assert.strictEqual(component.programs.directors.length, 0);
    assert.notOk(component.programs.canBeToggled);

    assert.strictEqual(component.programYears.title, 'Program Years (0)');
    assert.strictEqual(component.programYears.directors.length, 0);
    assert.notOk(component.programYears.canBeToggled);

    assert.strictEqual(component.courses.title, 'Courses (0)');
    assert.notOk(component.courses.canBeToggled);
    assert.strictEqual(component.courses.directors.length, 0);
    assert.strictEqual(component.courses.administrators.length, 0);
    assert.strictEqual(component.courses.instructors.length, 0);
    assert.strictEqual(component.courses.studentAdvisors.length, 0);

    assert.strictEqual(component.sessions.title, 'Sessions (0)');
    assert.notOk(component.sessions.canBeToggled);
    assert.strictEqual(component.sessions.administrators.length, 0);
    assert.strictEqual(component.sessions.instructors.length, 0);
    assert.strictEqual(component.sessions.studentAdvisors.length, 0);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('change school', async function (assert) {
    assert.expect(3);
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('setSchool', (schoolId) => {
      assert.strictEqual(parseInt(schoolId, 10), 1);
    });
    await render(
      <template>
        <UserProfilePermissions
          @user={{this.user}}
          @setSchool={{this.setSchool}}
          @setYear={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedSchool, '2');
    assert.strictEqual(component.school.title, 'School (school 1)');
    await component.changeSchool(1);
  });

  test('change year', async function (assert) {
    assert.expect(4);
    const user = this.server.create('user', {
      school: this.schools[1],
    });

    this.server.create('course', {
      school: this.schools[1],
      directors: [user],
      year: this.currentAcademicYear,
    });

    this.server.create('course', {
      school: this.schools[1],
      administrators: [user],
      year: this.currentAcademicYear + 1,
    });

    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('setYear', (year) => {
      assert.strictEqual(parseInt(year, 10), this.currentAcademicYear + 1);
    });
    await render(
      <template>
        <UserProfilePermissions
          @user={{this.user}}
          @setSchool={{(noop)}}
          @setYear={{this.setYear}}
        />
      </template>,
    );
    assert.strictEqual(parseInt(component.selectedYear, 10), this.currentAcademicYear);
    assert.strictEqual(component.courses.directors.length, 1);
    assert.ok(component.courses.notAdministrating);
    await component.changeYear(this.currentAcademicYear + 1);
  });

  test('it renders with school data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
      directedSchools: [school],
      administeredSchools: [school],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfilePermissions @user={{this.user}} @setSchool={{(noop)}} @setYear={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.school.director, 'Yes');
    assert.strictEqual(component.school.administrator, 'Yes');
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
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfilePermissions @user={{this.user}} @setSchool={{(noop)}} @setYear={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.programs.title, 'Programs (1)');
    assert.strictEqual(component.programs.ariaExpanded, 'true');
    assert.strictEqual(component.programs.directors.length, 1);
    assert.strictEqual(component.programs.directors[0].text, 'program 0');
    await component.programs.toggle();
    assert.strictEqual(component.programs.ariaExpanded, 'false');
    assert.strictEqual(component.programs.directors.length, 0);
    await component.programs.toggle();
    assert.strictEqual(component.programs.ariaExpanded, 'true');
    assert.strictEqual(component.programs.directors.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
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
      directors: [user],
    });
    this.server.create('cohort', { programYear });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfilePermissions @user={{this.user}} @setSchool={{(noop)}} @setYear={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.programYears.title, 'Program Years (1)');
    assert.strictEqual(component.programYears.ariaExpanded, 'true');
    assert.strictEqual(component.programYears.directors.length, 1);
    assert.strictEqual(component.programYears.directors[0].text, 'program 0 cohort 0');
    await component.programYears.toggle();
    assert.strictEqual(component.programYears.ariaExpanded, 'false');
    assert.strictEqual(component.programYears.directors.length, 0);
    await component.programYears.toggle();
    assert.strictEqual(component.programYears.ariaExpanded, 'true');
    assert.strictEqual(component.programYears.directors.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with course data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
    });
    const course = this.server.create('course', {
      school,
      directors: [user],
      administrators: [user],
      studentAdvisors: [user],
      year: this.currentAcademicYear,
    });
    const session = this.server.create('session', {
      course,
    });
    this.server.create('ilm-session', {
      session,
      instructors: [user],
    });
    const session2 = this.server.create('session', {
      course,
    });
    this.server.create('offering', {
      session: session2,
      instructors: [user],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfilePermissions @user={{this.user}} @setSchool={{(noop)}} @setYear={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.courses.title, 'Courses (4)');
    assert.strictEqual(component.courses.ariaExpanded, 'true');
    assert.strictEqual(component.courses.directors.length, 1);
    assert.strictEqual(component.courses.directors[0].text, `${this.currentAcademicYear} course 0`);
    assert.strictEqual(component.courses.administrators.length, 1);
    assert.strictEqual(
      component.courses.administrators[0].text,
      `${this.currentAcademicYear} course 0`,
    );
    assert.strictEqual(component.courses.instructors.length, 1);
    assert.strictEqual(
      component.courses.instructors[0].text,
      `${this.currentAcademicYear} course 0`,
    );
    assert.strictEqual(component.courses.studentAdvisors.length, 1);
    assert.strictEqual(
      component.courses.studentAdvisors[0].text,
      `${this.currentAcademicYear} course 0`,
    );
    assert.strictEqual(component.sessions.title, 'Sessions (2)');
    assert.ok(component.sessions.notAdministrating);
    assert.strictEqual(component.sessions.instructors.length, 2);
    assert.strictEqual(
      component.sessions.instructors[0].text,
      `${this.currentAcademicYear} course 0 » session 0`,
    );
    assert.strictEqual(
      component.sessions.instructors[1].text,
      `${this.currentAcademicYear} course 0 » session 1`,
    );
    assert.ok(component.sessions.notStudentAdvising);
    await component.courses.toggle();
    assert.strictEqual(component.courses.ariaExpanded, 'false');
    assert.strictEqual(component.courses.administrators.length, 0);
    assert.strictEqual(component.courses.directors.length, 0);
    assert.strictEqual(component.courses.instructors.length, 0);
    assert.strictEqual(component.courses.studentAdvisors.length, 0);
    await component.courses.toggle();
    assert.strictEqual(component.courses.ariaExpanded, 'true');
    assert.strictEqual(component.courses.administrators.length, 1);
    assert.strictEqual(component.courses.directors.length, 1);
    assert.strictEqual(component.courses.instructors.length, 1);
    assert.strictEqual(component.courses.studentAdvisors.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with session data', async function (assert) {
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
    });
    const course = this.server.create('course', {
      school,
      year: this.currentAcademicYear,
    });
    const session = this.server.create('session', {
      course,
      administrators: [user],
      studentAdvisors: [user],
    });
    this.server.create('ilm-session', {
      session,
      instructors: [user],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfilePermissions @user={{this.user}} @setSchool={{(noop)}} @setYear={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.school.director, 'No');
    assert.strictEqual(component.school.administrator, 'No');
    assert.strictEqual(component.courses.title, 'Courses (1)');
    assert.ok(component.courses.notDirecting);
    assert.ok(component.courses.notAdministrating);
    assert.strictEqual(component.courses.instructors.length, 1);
    assert.strictEqual(
      component.courses.instructors[0].text,
      `${this.currentAcademicYear} course 0`,
    );
    assert.ok(component.courses.notStudentAdvising);
    assert.strictEqual(component.sessions.title, 'Sessions (3)');
    assert.strictEqual(component.sessions.administrators.length, 1);
    assert.strictEqual(component.sessions.ariaExpanded, 'true');
    assert.strictEqual(
      component.sessions.administrators[0].text,
      `${this.currentAcademicYear} course 0 » session 0`,
    );
    assert.strictEqual(component.sessions.instructors.length, 1);
    assert.strictEqual(
      component.sessions.instructors[0].text,
      `${this.currentAcademicYear} course 0 » session 0`,
    );
    assert.strictEqual(component.sessions.studentAdvisors.length, 1);
    assert.strictEqual(
      component.sessions.studentAdvisors[0].text,
      `${this.currentAcademicYear} course 0 » session 0`,
    );
    await component.sessions.toggle();
    assert.strictEqual(component.sessions.ariaExpanded, 'false');
    assert.strictEqual(component.sessions.administrators.length, 0);
    assert.strictEqual(component.sessions.instructors.length, 0);
    assert.strictEqual(component.sessions.studentAdvisors.length, 0);
    await component.sessions.toggle();
    assert.strictEqual(component.sessions.ariaExpanded, 'true');
    assert.strictEqual(component.sessions.administrators.length, 1);
    assert.strictEqual(component.sessions.instructors.length, 1);
    assert.strictEqual(component.sessions.studentAdvisors.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('if academic year does not cross year boundaries, and its the first half of the year then last year is selected', async function (assert) {
    freezeDateAt(new Date(`1/1/${this.thisYear}`));
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const currentDate = new Date();
    this.currentAcademicYear = currentDate.getFullYear() - 1;
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('currentDate', currentDate);
    await render(
      <template>
        <UserProfilePermissions
          @user={{this.user}}
          @currentDate={{this.currentDate}}
          @setSchool={{(noop)}}
          @setYear={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(parseInt(component.selectedYear, 10), this.currentAcademicYear);
    unfreezeDate();
  });

  test('academic year shows range as applicable by configuration', async function (assert) {
    freezeDateAt(new Date(`7/1/${this.thisYear}`));
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.schools[0];
    const user = this.server.create('user', {
      school,
    });
    const course = this.server.create('course', {
      school,
      directors: [user],
      administrators: [user],
      studentAdvisors: [user],
      year: this.currentAcademicYear,
    });
    const session = this.server.create('session', {
      course,
      administrators: [user],
      studentAdvisors: [user],
    });
    this.server.create('ilm-session', {
      session,
      instructors: [user],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);

    await render(<template><UserProfilePermissions @user={{this.user}} /></template>);
    assert.strictEqual(component.courses.administrators.length, 1);
    assert.strictEqual(
      component.courses.administrators[0].text,
      `${this.currentAcademicYear} - ${this.currentAcademicYear + 1} course 0`,
    );
    assert.strictEqual(component.courses.instructors.length, 1);
    assert.strictEqual(
      component.courses.instructors[0].text,
      `${this.currentAcademicYear} - ${this.currentAcademicYear + 1} course 0`,
    );
    assert.strictEqual(component.courses.studentAdvisors.length, 1);
    assert.strictEqual(
      component.courses.studentAdvisors[0].text,
      `${this.currentAcademicYear} - ${this.currentAcademicYear + 1} course 0`,
    );
    assert.strictEqual(component.sessions.administrators.length, 1);
    assert.strictEqual(
      component.sessions.administrators[0].text,
      `${this.currentAcademicYear} - ${this.currentAcademicYear + 1} course 0 » session 0`,
    );
    assert.strictEqual(component.sessions.instructors.length, 1);
    assert.strictEqual(
      component.sessions.instructors[0].text,
      `${this.currentAcademicYear} - ${this.currentAcademicYear + 1} course 0 » session 0`,
    );
    assert.strictEqual(component.sessions.studentAdvisors.length, 1);
    assert.strictEqual(
      component.sessions.studentAdvisors[0].text,
      `${this.currentAcademicYear} - ${this.currentAcademicYear + 1} course 0 » session 0`,
    );
    unfreezeDate();
  });

  test('selected year and school as input', async function (assert) {
    const user = this.server.create('user', {
      school: this.schools[1],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    this.set('schoolId', this.schools[1].id);
    this.set('year', this.thisYear + 1);
    await render(
      <template>
        <UserProfilePermissions
          @user={{this.user}}
          @selectedSchoolId={{this.schoolId}}
          @selectedYearId={{this.year}}
          @setSchool={{(noop)}}
          @setYear={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.selectedSchool, this.schools[1].id);
    assert.strictEqual(parseInt(component.selectedYear, 10), this.thisYear + 1);
  });
});
