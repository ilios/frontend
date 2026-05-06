import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/search';
import dashboardPage from 'frontend/tests/pages/dashboard';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

module('Acceptance | search', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
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

    this.server.get('api/search/v2/curriculum', ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), input);

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
    const input = 'hello';
    this.server.get('api/search/v2/curriculum', ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), input);

      return {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
        },
      };
    });

    await page.visit({ q: input });
    assert.strictEqual(page.globalSearch.searchBox.inputValue, input);
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
    const school = await this.server.create('school');
    await this.server.createList('course', 25, { school });
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

    const callback = ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('size'));
      assert.ok(searchParams.has('from'));
      const from = Number(searchParams.get('from'));
      const size = Number(searchParams.get('size'));
      return {
        results: {
          courses: courses.slice(from, from + size),
          totalCourses: courses.length,
          didYouMean: [],
        },
      };
    };

    this.server.get('api/search/v2/curriculum', callback);
    await page.visit();
    assert.strictEqual(currentURL(), '/search', 'url is correct');
    this.server.get('api/search/v2/curriculum', callback);
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
    this.server.get('api/search/v2/curriculum', callback);
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
    const callbackRhett = {
      results: {
        courses: [],
        totalCourses: 0,
        didYouMean: [],
      },
    };

    this.server.get('api/search/v2/curriculum', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.step('API called');
      assert.strictEqual(searchParams.get('q'), firstInput, 'first time, first input');
      return callbackRhett;
    });
    await page.visit();
    assert.strictEqual(currentURL(), '/search');
    await page.globalSearch.searchBox.input(firstInput);
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchBox.inputValue, firstInput);
    assert.strictEqual(currentURL(), `/search?q=${firstInput}`);

    this.server.get('api/search/v2/curriculum', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.step('API called');
      assert.strictEqual(searchParams.get('q'), secondInput, 'second time, second input');
      return callbackRhett;
    });
    await page.globalSearch.searchBox.input(secondInput);
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchBox.inputValue, secondInput);
    assert.strictEqual(currentURL(), `/search?q=${secondInput}`);

    this.server.get('api/search/v2/curriculum', ({ request }) => {
      const { searchParams } = new URL(request.url);
      assert.step('API called');
      assert.strictEqual(searchParams.get('q'), firstInput, 'third time, first input');
      return callbackRhett;
    });
    await page.visit({ q: firstInput });
    assert.strictEqual(currentURL(), `/search?q=${firstInput}`);
    assert.strictEqual(page.globalSearch.searchBox.inputValue, firstInput);
    assert.verifySteps(Array(3).fill('API called'));
  });

  test('school filter in query param', async function (assert) {
    await this.server.createList('school', 2);
    const schools = await this.server.db.school.all();
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

    this.server.get('api/search/v2/curriculum', ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('schools'));
      const schoolIds = searchParams.get('schools').split('-').map(Number);
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
    await takeScreenshot(assert);
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
    await this.server.create('academic-year', { id: '2025', title: '2025' });
    await this.server.create('academic-year', { id: '2024', title: '2024' });
    await this.server.create('academic-year', { id: '2023', title: '2023' });

    this.server.get('api/search/v2/curriculum', ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.ok(searchParams.has('years'));
      const years = searchParams.get('years').split('-').map(Number);
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
