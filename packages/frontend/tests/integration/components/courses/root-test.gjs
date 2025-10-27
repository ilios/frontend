import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/courses/root';
import Root from 'frontend/components/courses/root';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | courses/root', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const year1 = this.server.create('academic-year', { id: 2022 });
    const year2 = this.server.create('academic-year', { id: 2023 });
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    this.server.create('course', {
      title: 'Alpha',
      school: school1,
      year: 2022,
    });
    this.server.create('course', {
      title: 'Beta',
      school: school1,
      year: 2022,
    });
    this.server.create('course', {
      title: 'Omega',
      school: school2,
      year: 2023,
    });
    this.year1 = await this.owner.lookup('service:store').findRecord('academic-year', year1.id);
    this.year2 = await this.owner.lookup('service:store').findRecord('academic-year', year2.id);
    this.school1 = await this.owner.lookup('service:store').findRecord('school', school1.id);
    this.school2 = await this.owner.lookup('service:store').findRecord('school', school2.id);
    this.permissionCheckerMock = class extends Service {
      async canUpdateCourse() {
        return true;
      }
      async canUnlockCourse() {
        return true;
      }
      async canDeleteCourse() {
        return true;
      }
      async canCreateCourse() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
  });

  test('it renders - school 1, 2022', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year1.id);
    this.set('schoolId', this.school1.id);
    this.set('sortCoursesBy', 'title');
    this.set('titleFilter', '');
    this.set('userCoursesOnly', false);
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.yearFilters.length, 2);
    assert.strictEqual(component.yearFilters[0].value, '2023');
    assert.notOk(component.yearFilters[0].selected);
    assert.strictEqual(component.yearFilters[1].value, '2022');
    assert.ok(component.yearFilters[1].selected);
    assert.strictEqual(component.schoolFilters.length, 2);
    assert.strictEqual(component.schoolFilters[0].text, 'school 0');
    assert.ok(component.schoolFilters[0].selected);
    assert.strictEqual(component.schoolFilters[1].text, 'school 1');
    assert.notOk(component.schoolFilters[1].selected);
    assert.strictEqual(component.list.courses.length, 2);
    assert.strictEqual(component.list.courses[0].title, 'Alpha');
    assert.strictEqual(component.list.courses[1].title, 'Beta');
    assert.ok(component.list.isSortedByTitleAscending);
  });

  test('it renders - school 2, 2023', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year2.id);
    this.set('schoolId', this.school2.id);
    this.set('sortCoursesBy', '');
    this.set('titleFilter', '');
    this.set('userCoursesOnly', false);
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.yearFilters.length, 2);
    assert.strictEqual(component.yearFilters[0].value, '2023');
    assert.ok(component.yearFilters[0].selected);
    assert.strictEqual(component.yearFilters[1].value, '2022');
    assert.notOk(component.yearFilters[1].selected);
    assert.strictEqual(component.schoolFilters.length, 2);
    assert.strictEqual(component.schoolFilters[0].text, 'school 0');
    assert.notOk(component.schoolFilters[0].selected);
    assert.strictEqual(component.schoolFilters[1].text, 'school 1');
    assert.ok(component.schoolFilters[1].selected);
    assert.strictEqual(component.list.courses.length, 1);
    assert.strictEqual(component.list.courses[0].title, 'Omega');
  });

  test('set sort courses by', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year2.id);
    this.set('schoolId', this.school2.id);
    this.set('sortCoursesBy', 'title');
    this.set('titleFilter', '');
    this.set('userCoursesOnly', false);
    this.set('setSortCoursesBy', (value) => {
      assert.step('setSortCoursesBy called');
      assert.strictEqual(value, 'title:desc');
    });
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{this.setSortCoursesBy}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    await component.list.sortByTitle();
    assert.verifySteps(['setSortCoursesBy called']);
  });

  test('title filter applies', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year1.id);
    this.set('schoolId', this.school1.id);
    this.set('sortCoursesBy', '');
    this.set('titleFilter', 'Beta');
    this.set('userCoursesOnly', false);
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.list.courses.length, 1);
    assert.strictEqual(component.list.courses[0].title, 'Beta');
  });

  test('change title filter', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year1.id);
    this.set('schoolId', this.school1.id);
    this.set('sortCoursesBy', '');
    this.set('titleFilter', 'Beta');
    this.set('userCoursesOnly', false);
    this.set('changeTitleFilter', (value) => {
      assert.step('changeTitleFilter called');
      assert.strictEqual(value, 'lorem ipsum');
    });
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{this.changeTitleFilter}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    await component.filterByTitle('lorem ipsum');
    assert.verifySteps(['changeTitleFilter called']);
  });

  test('change selected year', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year1.id);
    this.set('schoolId', this.school1.id);
    this.set('sortCoursesBy', '');
    this.set('titleFilter', 'Beta');
    this.set('userCoursesOnly', false);
    this.set('changeSelectedYear', (value) => {
      assert.step('changeSelectedYear called');
      assert.strictEqual(value, '2022');
    });
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{this.changeSelectedYear}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    await component.filterByYear('2022');
    assert.verifySteps(['changeSelectedYear called']);
  });

  test('change selected school', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year1.id);
    this.set('schoolId', this.school1.id);
    this.set('sortCoursesBy', '');
    this.set('titleFilter', 'Beta');
    this.set('userCoursesOnly', false);
    this.set('changeSelectedSchool', (value) => {
      assert.step('changeSelectedSchool called');
      assert.strictEqual(value, this.school2.id);
    });
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{this.changeSelectedSchool}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{(noop)}}
        />
      </template>,
    );
    await component.filterBySchool(this.school2.id);
    assert.verifySteps(['changeSelectedSchool called']);
  });

  test('toggle user courses only', async function (assert) {
    this.set('schools', [this.school1, this.school2]);
    this.set('primarySchool', this.school1);
    this.set('years', [this.year1, this.year2]);
    this.set('year', this.year1.id);
    this.set('schoolId', this.school1.id);
    this.set('sortCoursesBy', '');
    this.set('titleFilter', 'Beta');
    this.set('userCoursesOnly', false);
    this.set('toggleUserCoursesOnly', (value) => {
      assert.step('toggleUserCoursesOnly called');
      assert.ok(value);
    });
    await render(
      <template>
        <Root
          @schools={{this.schools}}
          @primarySchool={{this.primarySchool}}
          @years={{this.years}}
          @year={{this.year}}
          @changeSelectedYear={{(noop)}}
          @schoolId={{this.schoolId}}
          @changeSelectedSchool={{(noop)}}
          @sortCoursesBy={{this.sortCoursesBy}}
          @setSortCoursesBy={{(noop)}}
          @titleFilter={{this.titleFilter}}
          @changeTitleFilter={{(noop)}}
          @userCoursesOnly={{this.userCoursesOnly}}
          @toggleUserCoursesOnly={{this.toggleUserCoursesOnly}}
        />
      </template>,
    );
    await component.filterByMyCourses();
    assert.verifySteps(['toggleUserCoursesOnly called']);
  });
});
