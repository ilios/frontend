import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/assign-students/root';
import { DateTime } from 'luxon';
import Root from 'frontend/components/assign-students/root';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | assign-students/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const thisYear = DateTime.now().year;
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program = this.server.create('program', { school: school1 });
    const programYear1 = this.server.create('program-year', {
      program,
      startYear: thisYear,
    });
    const programYear2 = this.server.create('program-year', {
      program,
      startYear: thisYear + 1,
    });
    const programYear3 = this.server.create('program-year', {
      program,
      startYear: thisYear + 2,
    });
    this.server.create('cohort', {
      programYear: programYear1,
    });
    this.server.create('cohort', {
      programYear: programYear2,
    });
    this.server.create('cohort', {
      programYear: programYear3,
    });
    const user1 = this.server.create('user', {
      school: school1,
      displayName: 'Alpha',
    });
    const user2 = this.server.create('user', {
      school: school1,
      displayName: 'Beta',
    });
    const user3 = this.server.create('user', {
      school: school1,
      displayName: 'Gamma',
    });
    const user4 = this.server.create('user', {
      school: school2,
      displayName: 'Eins',
    });
    const user5 = this.server.create('user', {
      school: school2,
      displayName: 'Zwei',
    });

    const store = this.owner.lookup('service:store');
    this.school1 = await store.findRecord('school', school1.id);
    this.school2 = await store.findRecord('school', school2.id);
    this.user1 = await store.findRecord('user', user1.id);
    this.user2 = await store.findRecord('user', user2.id);
    this.user3 = await store.findRecord('user', user3.id);
    this.user4 = await store.findRecord('user', user4.id);
    this.user5 = await store.findRecord('user', user5.id);
    // ensure that the store is pre-populated with programs, program-years, and cohorts
    await store.findAll('program');
    await store.findAll('program-year');
    await store.findAll('cohort');
  });

  test('it renders', async function (assert) {
    this.set('model', {
      primarySchool: this.school1,
      schools: [this.school1, this.school2],
      unassignedStudents: [this.user1, this.user2, this.user3, this.user4, this.user5],
    });
    await render(
      <template>
        <Root @model={{this.model}} @setSchoolId={{(noop)}} @setQuery={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.titleFilter.value, '');
    assert.strictEqual(component.schoolFilter.options.length, 2);
    assert.strictEqual(component.schoolFilter.options[0].text, 'school 0');
    assert.strictEqual(component.schoolFilter.options[1].text, 'school 1');
    assert.strictEqual(component.schoolFilter.selectedSchool, this.school1.id);
    assert.strictEqual(component.manager.cohorts.label, 'Assign 0 selected users to:');
    assert.notOk(component.manager.cohorts.isDisabled);
    assert.strictEqual(component.manager.cohorts.options.length, 3);
    assert.strictEqual(component.manager.cohorts.options[0].text, 'program 0 cohort 0');
    assert.strictEqual(component.manager.cohorts.options[1].text, 'program 0 cohort 1');
    assert.strictEqual(component.manager.cohorts.options[2].text, 'program 0 cohort 2');
    assert.notOk(component.manager.cohorts.options[0].isSelected);
    assert.notOk(component.manager.cohorts.options[1].isSelected);
    assert.ok(component.manager.cohorts.options[2].isSelected);
    assert.notOk(component.manager.isToggleAllDisabled);
    assert.strictEqual(component.manager.students.length, 3);
    assert.strictEqual(component.manager.students[0].userNameInfo.fullName, 'Alpha');
    assert.strictEqual(component.manager.students[1].userNameInfo.fullName, 'Beta');
    assert.strictEqual(component.manager.students[2].userNameInfo.fullName, 'Gamma');
    assert.notOk(component.manager.students[0].isToggleDisabled);
    assert.notOk(component.manager.students[1].isToggleDisabled);
    assert.notOk(component.manager.students[2].isToggleDisabled);
    assert.notOk(component.manager.noResult.isVisible);
  });

  test('given school id overrides primary school in selector ', async function (assert) {
    this.set('model', {
      primarySchool: this.school2,
      schools: [this.school1, this.school2],
      unassignedStudents: [this.user1, this.user2, this.user3, this.user4, this.user5],
    });
    this.set('schoolId', this.school2.id);
    await render(
      <template>
        <Root
          @model={{this.model}}
          @schoolId={{this.schoolId}}
          @setSchoolId={{(noop)}}
          @setQuery={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.schoolFilter.options.length, 2);
    assert.strictEqual(component.schoolFilter.options[0].text, 'school 0');
    assert.strictEqual(component.schoolFilter.options[1].text, 'school 1');
    assert.strictEqual(component.schoolFilter.selectedSchool, this.school2.id);
    assert.strictEqual(
      component.manager.cohorts.noCohorts.text,
      'There are no cohorts available for student assignment in this school.',
    );
    assert.strictEqual(component.manager.students.length, 2);
    assert.strictEqual(component.manager.students[0].userNameInfo.fullName, 'Eins');
    assert.strictEqual(component.manager.students[1].userNameInfo.fullName, 'Zwei');
  });

  test('given text filter applies', async function (assert) {
    this.set('model', {
      primarySchool: this.school1,
      schools: [this.school1, this.school2],
      unassignedStudents: [this.user1, this.user2, this.user3, this.user4, this.user5],
    });
    this.set('query', 'alp');
    await render(
      <template>
        <Root
          @model={{this.model}}
          @query={{this.query}}
          @setSchoolId={{(noop)}}
          @setQuery={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.manager.students.length, 1);
    assert.strictEqual(component.manager.students[0].userNameInfo.fullName, 'Alpha');
  });

  test('change school', async function (assert) {
    this.set('model', {
      primarySchool: this.school1,
      schools: [this.school1, this.school2],
      unassignedStudents: [this.user1, this.user2, this.user3, this.user4, this.user5],
    });
    this.set('setSchoolId', (schoolId) => {
      assert.step('setSchoolId called');
      assert.strictEqual(schoolId, this.school2.id);
    });
    await render(
      <template>
        <Root @model={{this.model}} @setSchoolId={{this.setSchoolId}} @setQuery={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.schoolFilter.selectedSchool, this.school1.id);
    await component.schoolFilter.set(this.school2.id);
    assert.verifySteps(['setSchoolId called']);
  });

  test('change text filter', async function (assert) {
    const filter = 'lorem';
    this.set('model', {
      primarySchool: this.school1,
      schools: [this.school1, this.school2],
      unassignedStudents: [this.user1, this.user2, this.user3, this.user4, this.user5],
    });
    this.set('setQuery', (query) => {
      assert.step('setQuery called');
      assert.strictEqual(filter, query);
    });
    await render(
      <template>
        <Root @model={{this.model}} @setSchoolId={{(noop)}} @setQuery={{this.setQuery}} />
      </template>,
    );
    assert.strictEqual(component.titleFilter.value, '');
    await component.titleFilter.set(filter);
    assert.verifySteps(['setQuery called']);
  });

  test('save', async function (assert) {
    this.set('model', {
      primarySchool: this.school1,
      schools: [this.school1, this.school2],
      unassignedStudents: [this.user1, this.user2, this.user3, this.user4, this.user5],
    });
    await render(
      <template>
        <Root @model={{this.model}} @setSchoolId={{(noop)}} @setQuery={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.manager.students.length, 3);
    assert.notOk(component.manager.students[0].isToggleChecked);
    assert.notOk(component.manager.students[1].isToggleChecked);
    assert.notOk(component.manager.students[2].isToggleChecked);
    assert.strictEqual(this.server.db.users[0].primaryCohortId, null);
    assert.strictEqual(this.server.db.users[1].primaryCohortId, null);
    assert.strictEqual(this.server.db.users[2].primaryCohortId, null);
    assert.strictEqual(component.manager.cohorts.value, '3');
    await component.manager.students[0].toggle();
    await component.manager.students[2].toggle();
    await component.manager.save();
    assert.strictEqual(this.server.db.users[0].primaryCohortId, '3');
    assert.strictEqual(this.server.db.users[1].primaryCohortId, null);
    assert.strictEqual(this.server.db.users[2].primaryCohortId, '3');
  });
});
