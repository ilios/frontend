import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/learner-groups/root';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | learner-groups/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    for (let i = 0; i < 4; i++) {
      const school = this.server.create('school');
      const programs = this.server.createList('program', 2, { school });
      this.server.createList('cohort', 2, {
        programYear: this.server.create('program-year', {
          program: programs[0],
        }),
      });
      this.server.create('cohort', {
        programYear: this.server.create('program-year', {
          program: programs[1],
        }),
      });

      const programYear = this.server.create('program-year', { program: programs[1] });
      const cohort = this.server.create('cohort', { programYear });
      this.server.createList('learner-group', 2, {
        cohort,
      });
    }
    this.schools = await this.owner.lookup('service:store').findAll('school');

    const user = this.server.create('user', { schoolId: 2 });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:currentUser', CurrentUserMock);
  });

  const setupPermissionChecker = function (scope, can) {
    const permissionCheckerMock = class extends Service {
      async canDeleteLearnerGroup() {
        return can;
      }
      async canCreateLearnerGroup() {
        return can;
      }
    };
    scope.owner.register('service:permissionChecker', permissionCheckerMock);
  };

  test('it renders', async function (assert) {
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    await render(hbs`<LearnerGroups::Root @schools={{this.schools}} @sortBy='title' @setSortBy={{(noop)}} />`);
    assert.strictEqual(component.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 2');
    assert.strictEqual(component.list.items[1].title, 'learner group 3');

    assert.strictEqual(component.schoolFilter.schools.length, 4);
    assert.strictEqual(component.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(component.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(component.schoolFilter.schools[2].text, 'school 2');
    assert.strictEqual(component.schoolFilter.schools[3].text, 'school 3');
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');

    assert.strictEqual(component.programFilter.programs.length, 2);
    assert.strictEqual(component.programFilter.programs[0].text, 'program 2');
    assert.strictEqual(component.programFilter.programs[1].text, 'program 3');
    assert.strictEqual(component.programFilter.selectedProgram, '4');

    assert.strictEqual(component.programYearFilter.programYears.length, 2);
    assert.strictEqual(component.programYearFilter.programYears[0].text, 'cohort 7');
    assert.strictEqual(component.programYearFilter.programYears[1].text, 'cohort 6');
    assert.strictEqual(component.programYearFilter.selectedProgramYear, '6');

    await a11yAudit(this.element);
  });

  test('school filter works', async function (assert) {
    assert.expect(14);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setSchoolId', (schoolId) => {
      assert.strictEqual(schoolId, '3');
      this.set('schoolId', schoolId);
    });
    this.set('setProgramId', (programId) => {
      assert.strictEqual(programId, null);
      this.set('programId', programId);
    });
    this.set('setProgramYearId', (programYearId) => {
      assert.strictEqual(programYearId, null);
      this.set('programYearId', programYearId);
    });

    await render(hbs`<LearnerGroups::Root
  @schools={{this.schools}}
  @setSchoolId={{this.setSchoolId}}
  @schoolId={{this.schoolId}}
  @setProgramId={{this.setProgramId}}
  @programId={{this.programId}}
  @setProgramYearId={{this.setProgramYearId}}
  @programYearId={{this.programYearId}}
  @sortBy='title'
  @setSortBy={{(noop)}}
/>`);
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    assert.strictEqual(component.programFilter.selectedProgram, '4');
    assert.strictEqual(component.programYearFilter.selectedProgramYear, '6');
    assert.strictEqual(component.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 2');
    assert.strictEqual(component.list.items[1].title, 'learner group 3');

    await component.schoolFilter.select(3);
    assert.strictEqual(component.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 4');
    assert.strictEqual(component.list.items[1].title, 'learner group 5');
  });

  test('program filter works', async function (assert) {
    assert.expect(12);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setSchoolId', (schoolId) => {
      assert.strictEqual(schoolId, '2');
      this.set('schoolId', schoolId);
    });
    this.set('setProgramId', (programId) => {
      assert.strictEqual(programId, '3');
      this.set('programId', programId);
    });
    this.set('setProgramYearId', (programYearId) => {
      assert.strictEqual(programYearId, null);
      this.set('programYearId', programYearId);
    });

    await render(hbs`<LearnerGroups::Root
  @schools={{this.schools}}
  @setSchoolId={{this.setSchoolId}}
  @schoolId={{this.schoolId}}
  @setProgramId={{this.setProgramId}}
  @programId={{this.programId}}
  @setProgramYearId={{this.setProgramYearId}}
  @programYearId={{this.programYearId}}
  @sortBy='title'
  @setSortBy={{(noop)}}
/>`);
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    assert.strictEqual(component.programFilter.selectedProgram, '4');
    assert.strictEqual(component.programYearFilter.selectedProgramYear, '6');
    assert.strictEqual(component.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 2');
    assert.strictEqual(component.list.items[1].title, 'learner group 3');

    await component.programFilter.select(3);
    assert.strictEqual(component.headerTitle, 'Learner Groups (0)');
    assert.strictEqual(component.list.items.length, 0);
  });

  test('program year filter works', async function (assert) {
    assert.expect(12);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setSchoolId', (schoolId) => {
      assert.strictEqual(schoolId, '2');
      this.set('schoolId', schoolId);
    });
    this.set('setProgramId', (programId) => {
      assert.strictEqual(programId, '4');
      this.set('programId', programId);
    });
    this.set('setProgramYearId', (programYearId) => {
      assert.strictEqual(programYearId, '5');
      this.set('programYearId', programYearId);
    });

    await render(hbs`<LearnerGroups::Root
  @schools={{this.schools}}
  @setSchoolId={{this.setSchoolId}}
  @schoolId={{this.schoolId}}
  @setProgramId={{this.setProgramId}}
  @programId={{this.programId}}
  @setProgramYearId={{this.setProgramYearId}}
  @programYearId={{this.programYearId}}
  @sortBy='title'
  @setSortBy={{(noop)}}
/>`);
    assert.strictEqual(component.schoolFilter.selectedSchool, '2');
    assert.strictEqual(component.programFilter.selectedProgram, '4');
    assert.strictEqual(component.programYearFilter.selectedProgramYear, '6');
    assert.strictEqual(component.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 2');
    assert.strictEqual(component.list.items[1].title, 'learner group 3');

    await component.programYearFilter.select(5);
    assert.strictEqual(component.headerTitle, 'Learner Groups (0)');
    assert.strictEqual(component.list.items.length, 0);
  });

  test('title filter works', async function (assert) {
    assert.expect(8);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('setTitleFilter', (titleFilter) => {
      assert.strictEqual(titleFilter, '3');
      this.set('titleFilter', titleFilter);
    });

    await render(hbs`<LearnerGroups::Root
  @schools={{this.schools}}
  @setTitleFilter={{this.setTitleFilter}}
  @titleFilter={{this.titleFilter}}
  @sortBy='title'
  @setSortBy={{(noop)}}
/>`);
    assert.strictEqual(component.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 2');
    assert.strictEqual(component.list.items[1].title, 'learner group 3');

    await component.setTitleFilter('3');
    assert.strictEqual(component.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(component.list.items.length, 1);
    assert.strictEqual(component.list.items[0].title, 'learner group 3');
  });

  test('sort', async function (assert) {
    assert.expect(6);
    setupPermissionChecker(this, true);
    this.set('schools', this.schools);
    this.set('sortBy', 'title');
    this.set('setSortBy', (sortBy) => {
      assert.strictEqual(sortBy, 'title:desc');
      this.set('sortBy', sortBy);
    });

    await render(hbs`<LearnerGroups::Root
  @schools={{this.schools}}
  @sortBy={{this.sortBy}}
  @setSortBy={{this.setSortBy}}
/>`);

    assert.strictEqual(component.list.items.length, 2);
    assert.strictEqual(component.list.items[0].title, 'learner group 2');
    assert.strictEqual(component.list.items[1].title, 'learner group 3');
    await component.list.header.title.click();
    assert.strictEqual(component.list.items[0].title, 'learner group 3');
    assert.strictEqual(component.list.items[1].title, 'learner group 2');
  });
});
