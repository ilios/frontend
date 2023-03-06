import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';
import page from 'ilios/tests/pages/search';
import dashboardPage from 'ilios/tests/pages/dashboard';

module('Acceptance | search', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication({}, true);
    this.server.get('application/config', function () {
      return {
        config: {
          searchEnabled: true,
        },
      };
    });
  });

  test('visiting /search', async function (assert) {
    assert.expect(8);
    const input = 'hello';

    this.server.get('api/search/v1/curriculum', (schema, { queryParams }) => {
      assert.ok(queryParams.q);
      assert.strictEqual(queryParams.q, input);

      return {
        results: {
          autocomplete: [],
          courses: [],
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
  });

  test('search with special chars #4752', async function (assert) {
    assert.expect(4);

    const input = 'H&L+foo=bar';

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses: [],
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
  });

  test('search with special chars from dashboard #4752', async function (assert) {
    assert.expect(3);

    const input = 'H&L+foo=bar';

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses: [],
        },
      };
    });
    await dashboardPage.visit();
    assert.strictEqual(currentURL(), '/dashboard/week');
    await dashboardPage.iliosHeader.searchBox.input(input);
    await dashboardPage.iliosHeader.searchBox.clickIcon();
    assert.strictEqual(currentURL(), `/search?q=${encodeURIComponent(input)}`);
    assert.strictEqual(page.globalSearch.searchBox.inputValue, input);
  });

  test('clicking back from course to search works #4768', async function (assert) {
    assert.expect(8);

    const school = this.server.create('school');
    this.server.createList('course', 25, { school });
    const courses = [];
    for (let i = 1; i < 25; i++) {
      courses.push({
        id: i,
        title: `course ${i}`,
        year: 2019,
        school: school.title,
        sessions: [],
      });
    }
    const firstInput = 'first';

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses,
        },
      };
    });
    await page.visit();
    assert.strictEqual(currentURL(), '/search');
    await page.globalSearch.searchBox.input(firstInput);
    await page.globalSearch.searchBox.clickIcon();
    await page.paginationLinks.pageLinks[1].click();
    assert.strictEqual(page.globalSearch.searchResults.length, 10);
    assert.strictEqual(page.globalSearch.searchResults[0].courseTitle, '2019 course 11');
    assert.strictEqual(page.globalSearch.searchBox.inputValue, firstInput);
    assert.strictEqual(currentURL(), `/search?page=2&q=${firstInput}`);
    await page.globalSearch.searchResults[0].clickCourse();
    assert.strictEqual(currentURL(), `/courses/11`);
    await page.visit({
      page: 2,
      q: firstInput,
    });
    assert.strictEqual(page.globalSearch.searchResults.length, 10);
    assert.strictEqual(page.globalSearch.searchResults[0].courseTitle, '2019 course 11');
  });

  test('clicking back on search updates results and input #4759', async function (assert) {
    assert.expect(14);

    const firstInput = 'first';
    const secondInput = 'second';

    let searchRun = 0;
    this.server.get('api/search/v1/curriculum', (schema, { queryParams }) => {
      const rhett = {
        results: {
          autocomplete: [queryParams.q],
          courses: [],
        },
      };
      if (queryParams.onlySuggest) {
        // eslint-disable-next-line qunit/no-early-return
        return rhett;
      }
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
    assert.strictEqual(page.globalSearch.searchBox.autocompleteResults.length, 0);
  });

  test('search requires three chars #4769', async function (assert) {
    assert.expect(3);
    const input = 'br';

    await page.visit();
    await page.globalSearch.searchBox.input(input);
    assert.strictEqual(page.globalSearch.searchBox.autocompleteResults.length, 1);
    assert.strictEqual(page.globalSearch.searchBox.autocompleteResults[0].text, 'keep typing...');
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchResults.length, 0);
  });

  test('search requires three chars in URL #4769', async function (assert) {
    assert.expect(2);
    const input = 'br';

    await page.visit({ q: input });
    assert.strictEqual(page.globalSearch.searchBox.inputValue, input);
    await page.globalSearch.searchBox.clickIcon();
    assert.strictEqual(page.globalSearch.searchResults.length, 0);
  });

  test('school filter in query param', async function (assert) {
    assert.expect(9);

    const schools = this.server.createList('school', 3);
    const courses = [];
    for (let i = 0; i < 3; i++) {
      courses.push({
        title: `Course ${i}`,
        year: 2019,
        school: schools[i].title,
        sessions: [],
      });
    }

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses,
        },
      };
    });

    await page.visit({
      q: 'something',
      ignoredSchools: '1-3',
    });
    assert.strictEqual(page.globalSearch.searchResults.length, 1);
    assert.strictEqual(page.globalSearch.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(page.globalSearch.schoolFilters.length, 3);
    assert.strictEqual(page.globalSearch.schoolFilters[0].school, 'school 0 (1)');
    assert.notOk(page.globalSearch.schoolFilters[0].isSelected);
    assert.strictEqual(page.globalSearch.schoolFilters[1].school, 'school 1 (1)');
    assert.ok(page.globalSearch.schoolFilters[1].isSelected);
    assert.strictEqual(page.globalSearch.schoolFilters[2].school, 'school 2 (1)');
    assert.notOk(page.globalSearch.schoolFilters[2].isSelected);
  });

  test('year filter in query param', async function (assert) {
    assert.expect(3);

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: [],
          courses: [
            {
              title: 'course 1',
              year: 2019,
              school: 'school 1',
              sessions: [],
            },
            {
              title: 'course 2',
              year: 2020,
              school: 'school 1',
              sessions: [],
            },
          ],
        },
      };
    });

    await page.visit({
      q: 'something',
      year: '2020',
    });
    assert.strictEqual(page.globalSearch.searchResults.length, 1);
    assert.strictEqual(page.globalSearch.searchResults[0].courseTitle, '2020 course 2');
    assert.strictEqual(page.globalSearch.academicYear, '2020');
  });
});
