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
    this.server.logging = true;
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
});
