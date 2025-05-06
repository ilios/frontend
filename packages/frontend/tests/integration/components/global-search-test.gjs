import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/global-search';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import Service from '@ember/service';
import GlobalSearch from 'frontend/components/global-search';
import noop from 'ilios-common/helpers/noop';
import set from 'ember-set-helper/helpers/set';

module('Integration | Component | global-search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);

    await render(
      <template>
        <GlobalSearch @setQuery={{(noop)}} @onSelectPage={{(noop)}} @setSelectedYear={{(noop)}} />
      </template>,
    );
    assert.dom('[data-test-global-search-box]').exists({ count: 1 });
  });

  test('handles empty and non-empty query', async function (assert) {
    assert.expect(4);
    this.server.get('api/search/v1/curriculum', (schema, { queryParams: { q, onlySuggest } }) => {
      assert.strictEqual(q, 'hello world');
      assert.notOk(onlySuggest);
      return {
        results: {
          autocomplete: [],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              sessions: [],
              school: 'Medicine',
            },
          ],
        },
      };
    });

    this.set('query', '');
    await render(
      <template>
        <GlobalSearch
          @query={{this.query}}
          @page="1"
          @setQuery={{(noop)}}
          @onSelectPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.noResultsIsVisible);
    this.set('query', 'hello world');
    await settled();
    assert.notOk(component.noResultsIsVisible);
  });

  test('bubbles action properly', async function (assert) {
    assert.expect(3);
    this.server.get('api/search/v1/curriculum', (schema, { queryParams: { q, onlySuggest } }) => {
      assert.strictEqual(q, 'typed it');
      assert.ok(onlySuggest);
      return {
        results: {
          autocomplete: [],
          courses: [],
        },
      };
    });

    this.set('query', (value) => assert.strictEqual(value, 'typed it'));
    await render(
      <template>
        <GlobalSearch
          @setQuery={{this.query}}
          @onSelectPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    await component.searchBox.input('typed it');
    await component.searchBox.clickIcon();
  });

  test('academic year filter works properly', async function (assert) {
    assert.expect(28);
    this.server.create('school', { title: 'Medicine' });
    this.server.create('school', { title: 'Pharmacy' });
    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              sessions: [],
              school: 'Medicine',
            },
            {
              title: 'Course 2',
              year: 2020,
              sessions: [],
              school: 'Pharmacy',
            },
            {
              title: 'Course 3',
              year: 2021,
              sessions: [],
              school: 'Pharmacy',
            },
            {
              title: 'Course 4',
              year: 2021,
              sessions: [],
              school: 'Medicine',
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    this.set('selectedYear', null);
    await render(
      <template>
        <GlobalSearch
          @page="1"
          @query={{this.query}}
          @setQuery={{(noop)}}
          @onSelectPage={{(noop)}}
          @selectedYear={{this.selectedYear}}
          @setSelectedYear={{set this "selectedYear"}}
        />
      </template>,
    );
    assert.strictEqual(component.academicYear, '');
    assert.strictEqual(
      component.academicYearOptions,
      'All Academic Years 2021 - 2022 2020 - 2021 2019 - 2020',
    );
    assert.strictEqual(component.searchResults.length, 4);
    assert.strictEqual(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(component.searchResults[1].courseTitle, '2020 Course 2');
    assert.strictEqual(component.searchResults[2].courseTitle, '2021 Course 3');
    assert.strictEqual(component.searchResults[3].courseTitle, '2021 Course 4');
    assert.strictEqual(component.schoolFilters.length, 2);
    assert.strictEqual(component.schoolFilters[0].school, 'Medicine (2)');
    assert.strictEqual(component.schoolFilters[1].school, 'Pharmacy (2)');
    await component.selectAcademicYear('2021');
    assert.strictEqual(component.searchResults.length, 2);
    assert.strictEqual(component.searchResults[0].courseTitle, '2021 Course 3');
    assert.strictEqual(component.searchResults[1].courseTitle, '2021 Course 4');
    assert.strictEqual(component.schoolFilters.length, 2);
    assert.strictEqual(component.schoolFilters[0].school, 'Medicine (1)');
    assert.strictEqual(component.schoolFilters[1].school, 'Pharmacy (1)');
    await component.selectAcademicYear('2020');
    assert.strictEqual(component.academicYear, '2020');
    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].courseTitle, '2020 Course 2');
    assert.strictEqual(component.schoolFilters.length, 2);
    assert.strictEqual(component.schoolFilters[0].school, 'Medicine (0)');
    assert.strictEqual(component.schoolFilters[1].school, 'Pharmacy (1)');
    await component.selectAcademicYear('2019');
    assert.strictEqual(component.academicYear, '2019');
    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(component.schoolFilters.length, 2);
    assert.strictEqual(component.schoolFilters[0].school, 'Medicine (1)');
    assert.strictEqual(component.schoolFilters[1].school, 'Pharmacy (0)');
  });

  test('school filter works properly', async function (assert) {
    assert.expect(51);
    this.server.create('school', { title: 'Medicine' });
    this.server.create('school', { title: 'Dentistry' });
    this.server.create('school', { title: 'Pharmacy' });

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              school: 'Medicine',
              sessions: [],
            },
            {
              title: 'Course 2',
              year: 2020,
              school: 'Medicine',
              sessions: [],
            },
            {
              title: 'Course 3',
              year: 2021,
              school: 'Pharmacy',
              sessions: [],
            },
            {
              title: 'Course 4',
              year: 2021,
              school: 'Dentistry',
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    this.set('ignoredSchoolIds', []);
    await render(
      <template>
        <GlobalSearch
          @page="1"
          @query={{this.query}}
          @setQuery={{(noop)}}
          @onSelectPage={{(noop)}}
          @ignoredSchoolIds={{this.ignoredSchoolIds}}
          @setIgnoredSchoolIds={{set this "ignoredSchoolIds"}}
        />
      </template>,
    );
    assert.strictEqual(component.searchResults.length, 4);
    assert.strictEqual(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(component.searchResults[1].courseTitle, '2020 Course 2');
    assert.strictEqual(component.searchResults[2].courseTitle, '2021 Course 3');
    assert.strictEqual(component.searchResults[3].courseTitle, '2021 Course 4');
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.strictEqual(component.schoolFilters[1].school, 'Medicine (2)');
    assert.ok(component.schoolFilters[1].isSelected);
    assert.strictEqual(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);

    await component.schoolFilters[1].toggle();

    assert.strictEqual(component.searchResults.length, 2);
    assert.strictEqual(component.searchResults[0].courseTitle, '2021 Course 3');
    assert.strictEqual(component.searchResults[1].courseTitle, '2021 Course 4');
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.strictEqual(component.schoolFilters[1].school, 'Medicine (2)');
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.strictEqual(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);

    await component.schoolFilters[0].toggle();

    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].courseTitle, '2021 Course 3');
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.notOk(component.schoolFilters[0].isSelected);
    assert.strictEqual(component.schoolFilters[1].school, 'Medicine (2)');
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.strictEqual(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);

    await component.schoolFilters[2].toggle();

    assert.strictEqual(component.searchResults.length, 0);
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.notOk(component.schoolFilters[0].isSelected);
    assert.strictEqual(component.schoolFilters[1].school, 'Medicine (2)');
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.strictEqual(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.notOk(component.schoolFilters[2].isSelected);

    await component.schoolFilters[0].toggle();
    await component.schoolFilters[1].toggle();
    await component.schoolFilters[2].toggle();

    assert.strictEqual(component.searchResults.length, 4);
    assert.strictEqual(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(component.searchResults[1].courseTitle, '2020 Course 2');
    assert.strictEqual(component.searchResults[2].courseTitle, '2021 Course 3');
    assert.strictEqual(component.searchResults[3].courseTitle, '2021 Course 4');
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.strictEqual(component.schoolFilters[1].school, 'Medicine (2)');
    assert.ok(component.schoolFilters[1].isSelected);
    assert.strictEqual(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);
  });

  test('all schools show up in filter', async function (assert) {
    assert.expect(9);
    this.server.createList('school', 3);

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              school: 'school 1',
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    await render(
      <template>
        <GlobalSearch
          @page="1"
          @query={{this.query}}
          @setQuery={{(noop)}}
          @onSelectPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'school 0 (0)');
    assert.ok(component.schoolFilters[0].isDisabled);
    assert.strictEqual(component.schoolFilters[1].school, 'school 1 (1)');
    assert.notOk(component.schoolFilters[1].isDisabled);
    assert.strictEqual(component.schoolFilters[2].school, 'school 2 (0)');
    assert.ok(component.schoolFilters[2].isDisabled);
  });

  test('if only one school in system no school filter', async function (assert) {
    assert.expect(3);
    this.server.create('school');

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              school: 'school 1',
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    await render(
      <template>
        <GlobalSearch
          @page="1"
          @query={{this.query}}
          @setQuery={{(noop)}}
          @onSelectPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.strictEqual(component.schoolFilters.length, 0);
  });

  test('shows search spinner while running', async function (assert) {
    assert.expect(2);
    let resolveTestPromise;
    const p = new Promise((r) => {
      resolveTestPromise = r;
    });
    class SearchMock extends Service {
      forCurriculum() {
        return p;
      }
    }
    this.owner.register('service:search', SearchMock);

    this.set('query', '');
    await render(
      <template>
        <GlobalSearch
          @query={{this.query}}
          @page="1"
          @setQuery={{(noop)}}
          @onSelectPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.searchIsRunning);
    this.set('query', 'hello world');
    assert.ok(component.searchIsRunning);
    resolveTestPromise();
  });
});
