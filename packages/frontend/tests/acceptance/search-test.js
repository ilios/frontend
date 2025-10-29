import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/search';
import dashboardPage from 'frontend/tests/pages/dashboard';
import percySnapshot from '@percy/ember';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

module('Acceptance | search', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school }, true);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
          apiVersion,
        },
      };
    });
  });

  test('visiting /search', async function (assert) {
    const input = 'hello';

    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.step('API called');
      assert.ok(queryParams.q);
      assert.strictEqual(queryParams.q, input);

      return {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
        },
      };
    });

    await page.visit();
    assert.strictEqual(currentURL(), '/search');
    await page.globalSearch.searchBox.input(input);
    assert.strictEqual(currentURL(), '/search', 'entering input value does not update query param');
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchBox.inputValue, input);
    assert.strictEqual(currentURL(), `/search?q=${input}`, 'triggering search updates query param');
    assert.verifySteps(['API called']);
  });

  test('visiting /search?q', async function (assert) {
    const test = 'hello';
    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.step('API called');
      assert.ok(queryParams.q);
      assert.strictEqual(queryParams.q, test);

      return {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
        },
      };
    });

    await page.visit({ q: test });
    assert.strictEqual(page.globalSearch.searchBox.inputValue, test);
    assert.verifySteps(['API called']);
  });

  test('search with special chars #4752', async function (assert) {
    const input = 'H&L+foo=bar';

    this.server.get('api/search/v2/curriculum', () => {
      assert.step('API called');
      return {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
        },
      };
    });

    await page.visit();
    assert.strictEqual(currentURL(), '/search');
    await page.globalSearch.searchBox.input(input);
    assert.strictEqual(currentURL(), '/search', 'entering input value does not update query param');
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(currentURL(), `/search?q=${encodeURIComponent(input)}`);
    assert.strictEqual(page.globalSearch.searchBox.inputValue, input);
    assert.verifySteps(['API called']);
  });

  test('search with special chars from dashboard #4752', async function (assert) {
    const input = 'H&L+foo=bar';

    this.server.get('api/search/v2/curriculum', () => {
      assert.step('API called');
      return {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
        },
      };
    });
    await dashboardPage.visit();
    assert.strictEqual(currentURL(), '/dashboard/week');
    await dashboardPage.iliosHeader.searchBox.input(input);
    await dashboardPage.iliosHeader.searchBox.clickIcon();
    assert.strictEqual(
      currentURL(),
      `/search?q=${encodeURIComponent(input)}&schools=1&years=${currentAcademicYear()}-${currentAcademicYear() - 1}`,
    );
    assert.strictEqual(page.globalSearch.searchBox.inputValue, input);
    assert.verifySteps(['API called']);
  });

  test('clicking back from course to search works #4768', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('course', 25, { school });
    const year = currentAcademicYear();
    const courses = [];
    for (let i = 1; i < 25; i++) {
      courses.push({
        id: i,
        title: `course ${i}`,
        year,
        school: school.title,
        sessions: [],
      });
    }
    const firstInput = 'first';

    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.step('API called');
      assert.ok(queryParams.size);
      assert.ok(queryParams.from);
      const from = Number(queryParams.from);
      const size = Number(queryParams.size);
      return {
        results: {
          courses: courses.slice(from, from + size),
          totalCourses: courses.length,
          didYouMean: [],
        },
      };
    });
    await page.visit();
    assert.strictEqual(currentURL(), '/search', 'url is correct');
    await page.globalSearch.searchBox.input(firstInput);
    await page.globalSearch.searchBox.clickIcon();
    await page.paginationLinks.pageLinks[1].click();
    assert.strictEqual(
      page.globalSearch.searchResults.length,
      10,
      'search result count is correct',
    );
    assert.strictEqual(
      page.globalSearch.searchResults[0].courseTitle,
      `${year} course 11`,
      'first result title is correct',
    );
    assert.strictEqual(
      page.globalSearch.searchBox.inputValue,
      firstInput,
      'search input value maintained after pagination change',
    );
    assert.strictEqual(currentURL(), `/search?page=2&q=${firstInput}`, 'url is correct');
    await page.globalSearch.searchResults[0].clickCourse();
    assert.strictEqual(currentURL(), `/courses/11`, 'course url is correct');
    await page.visit({
      page: 2,
      q: firstInput,
    });
    assert.strictEqual(
      page.globalSearch.searchResults.length,
      10,
      'search result count is still correct',
    );
    assert.strictEqual(
      page.globalSearch.searchResults[0].courseTitle,
      `${year} course 11`,
      'first result title is still correct',
    );
    assert.verifySteps(Array(3).fill('API called'));
  });

  test('clicking back on search updates results and input #4759', async function (assert) {
    const firstInput = 'first';
    const secondInput = 'second';

    let searchRun = 0;
    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.step('API called');
      const rhett = {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
        },
      };
      assert.ok(searchRun <= 2);
      let input, message;
      switch (searchRun) {
        case 0:
          input = firstInput;
          message = 'first time, first input';
          break;
        case 1:
          input = secondInput;
          message = 'second time, second input';
          break;
        case 2:
          input = firstInput;
          message = 'third time, first input';
          break;
      }
      assert.strictEqual(queryParams.q, input, message);
      searchRun++;
      return rhett;
    });
    await page.visit();
    assert.strictEqual(currentURL(), '/search');
    await page.globalSearch.searchBox.input(firstInput);
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchBox.inputValue, firstInput);
    assert.strictEqual(currentURL(), `/search?q=${firstInput}`);
    await page.globalSearch.searchBox.input(secondInput);
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchBox.inputValue, secondInput);
    assert.strictEqual(currentURL(), `/search?q=${secondInput}`);
    await page.visit({ q: firstInput });
    assert.strictEqual(currentURL(), `/search?q=${firstInput}`);
    assert.strictEqual(page.globalSearch.searchBox.inputValue, firstInput);
    assert.strictEqual(searchRun, 3, 'search was run three times');
    assert.verifySteps(Array(3).fill('API called'));
  });

  test('school filter in query param', async function (assert) {
    this.server.createList('school', 2);
    const schools = this.server.schema.schools.all().models;
    const courses = [];
    const year = currentAcademicYear();
    for (let i = 0; i < 3; i++) {
      courses.push({
        title: `Course ${i}`,
        year,
        school: schools[i].title,
        sessions: [],
      });
    }

    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.step('API called');
      assert.ok(queryParams.schools);
      const schoolIds = queryParams.schools.split('-').map(Number);
      assert.deepEqual(schoolIds, [2]);
      return {
        results: {
          courses: courses.slice(1, 2),
          totalCourses: courses.length,
          didYouMean: [],
        },
      };
    });

    await page.visit({
      q: 'something',
      schools: '2',
    });
    await percySnapshot(assert);
    assert.strictEqual(page.globalSearch.searchResults.length, 1);
    assert.strictEqual(page.globalSearch.searchResults[0].courseTitle, `${year} Course 1`);
    assert.strictEqual(page.globalSearch.schoolFilters.length, 3);
    assert.strictEqual(page.globalSearch.schoolFilters[0].school, 'school 0');
    assert.notOk(page.globalSearch.schoolFilters[0].isSelected);
    assert.strictEqual(page.globalSearch.schoolFilters[1].school, 'school 1');
    assert.ok(page.globalSearch.schoolFilters[1].isSelected);
    assert.strictEqual(page.globalSearch.schoolFilters[2].school, 'school 2');
    assert.notOk(page.globalSearch.schoolFilters[2].isSelected);
    assert.verifySteps(['API called']);
  });

  test('year filter in query param', async function (assert) {
    this.server.create('academic-year', { id: 2025, title: '2025' });
    this.server.create('academic-year', { id: 2024, title: '2024' });
    this.server.create('academic-year', { id: 2023, title: '2023' });

    this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
      assert.step('API called');
      assert.ok(queryParams.years);
      const years = queryParams.years.split('-').map(Number);
      assert.deepEqual(years, [2024]);
      return {
        results: {
          courses: [
            {
              title: 'course 2',
              year: 2024,
              school: 'school 1',
              sessions: [],
            },
          ],
          totalCourses: 1,
          didYouMean: [],
        },
      };
    });

    await page.visit({
      q: 'something',
      years: '2024',
    });
    assert.strictEqual(page.globalSearch.searchResults.length, 1);
    assert.strictEqual(page.globalSearch.searchResults[0].courseTitle, '2024 course 2');
    assert.strictEqual(page.globalSearch.yearFilters.length, 3);
    assert.strictEqual(page.globalSearch.yearFilters[0].year, '2025');
    assert.notOk(page.globalSearch.yearFilters[0].isSelected);
    assert.strictEqual(page.globalSearch.yearFilters[1].year, '2024');
    assert.ok(page.globalSearch.yearFilters[1].isSelected);
    assert.strictEqual(page.globalSearch.yearFilters[2].year, '2023');
    assert.notOk(page.globalSearch.yearFilters[2].isSelected);
    assert.verifySteps(['API called']);
  });
});
