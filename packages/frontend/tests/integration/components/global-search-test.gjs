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
        <GlobalSearch @setQuery={{(noop)}} @setPage={{(noop)}} @setSelectedYear={{(noop)}} />
      </template>,
    );
    assert.dom('[data-test-global-search-box]').exists({ count: 1 });
  });

  test('handles empty and non-empty query', async function (assert) {
    assert.expect(4);
    this.server.get('api/search/v2/curriculum', (schema, { queryParams: { q, onlySuggest } }) => {
      assert.strictEqual(q, 'hello world');
      assert.notOk(onlySuggest);
      return {
        results: {
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
          @setPage={{(noop)}}
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
    assert.expect(1);
    this.set('query', (value) => assert.strictEqual(value, 'typed it'));
    await render(
      <template>
        <GlobalSearch @setQuery={{this.query}} @setPage={{(noop)}} @setSelectedYear={{(noop)}} />
      </template>,
    );
    await component.searchBox.input('typed it');
    await component.searchBox.clickIcon();
  });

  test('academic year filter works properly', async function (assert) {
    assert.expect(26);

    this.server.create('academic-year', { id: 2019 });
    this.server.create('academic-year', { id: 2020 });
    this.server.create('academic-year', { id: 2021 });
    const testYears = (years) => {
      this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
        const queryYears = queryParams.years ? queryParams.years.split('-').map(Number) : [];
        assert.deepEqual(queryYears.sort(), years);
        return {
          results: {
            courses: [],
            totalCourses: 0,
            didYouMean: [],
          },
        };
      });
    };

    this.set('query', 'hello world');
    this.set('years', [2019, 2020, 2021]);
    testYears([2019, 2020, 2021]);
    await render(
      <template>
        <GlobalSearch
          @page="1"
          @query={{this.query}}
          @setQuery={{(noop)}}
          @setPage={{(noop)}}
          @selectedYears={{this.years}}
          @setYears={{set this "years"}}
        />
      </template>,
    );
    assert.strictEqual(component.yearFilters.length, 3);
    assert.strictEqual(component.yearFilters[0].year, '2021');
    assert.ok(component.yearFilters[0].isSelected);
    assert.strictEqual(component.yearFilters[1].year, '2020');
    assert.ok(component.yearFilters[1].isSelected);
    assert.strictEqual(component.yearFilters[2].year, '2019');
    assert.ok(component.yearFilters[2].isSelected);

    testYears([2019, 2021]);
    await component.yearFilters[1].toggle();
    assert.ok(component.yearFilters[0].isSelected);
    assert.notOk(component.yearFilters[1].isSelected);
    assert.ok(component.yearFilters[2].isSelected);

    testYears([2019]);
    await component.yearFilters[0].toggle();
    assert.notOk(component.yearFilters[0].isSelected);
    assert.notOk(component.yearFilters[1].isSelected);
    assert.ok(component.yearFilters[2].isSelected);

    testYears([]);
    await component.yearFilters[2].toggle();
    assert.notOk(component.yearFilters[0].isSelected);
    assert.notOk(component.yearFilters[1].isSelected);
    assert.notOk(component.yearFilters[2].isSelected);

    testYears([2021]);
    await component.yearFilters[0].toggle();
    testYears([2020, 2021]);
    await component.yearFilters[1].toggle();
    testYears([2019, 2020, 2021]);
    await component.yearFilters[2].toggle();

    assert.ok(component.yearFilters[0].isSelected);
    assert.ok(component.yearFilters[1].isSelected);
    assert.ok(component.yearFilters[2].isSelected);
  });

  test('school filter works properly', async function (assert) {
    assert.expect(26);

    this.server.createList('school', 3);
    const testSchools = (schools) => {
      this.server.get('api/search/v2/curriculum', (schema, { queryParams }) => {
        const querySchools = queryParams.schools ? queryParams.schools.split('-').map(Number) : [];
        assert.deepEqual(querySchools, schools);
        return {
          results: {
            courses: [],
            totalCourses: 0,
            didYouMean: [],
          },
        };
      });
    };

    this.set('query', 'hello world');
    this.set('schools', ['1', '2', '3']);
    testSchools([1, 2, 3]);
    await render(
      <template>
        <GlobalSearch
          @page="1"
          @query={{this.query}}
          @setQuery={{(noop)}}
          @setPage={{(noop)}}
          @selectedSchools={{this.schools}}
          @setSchools={{set this "schools"}}
        />
      </template>,
    );
    assert.strictEqual(component.schoolFilters.length, 3);
    assert.strictEqual(component.schoolFilters[0].school, 'school 0');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.strictEqual(component.schoolFilters[1].school, 'school 1');
    assert.ok(component.schoolFilters[1].isSelected);
    assert.strictEqual(component.schoolFilters[2].school, 'school 2');
    assert.ok(component.schoolFilters[2].isSelected);

    testSchools([1, 3]);
    await component.schoolFilters[1].toggle();
    assert.ok(component.schoolFilters[0].isSelected);
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.ok(component.schoolFilters[2].isSelected);

    testSchools([3]);
    await component.schoolFilters[0].toggle();
    assert.notOk(component.schoolFilters[0].isSelected);
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.ok(component.schoolFilters[2].isSelected);

    testSchools([]);
    await component.schoolFilters[2].toggle();
    assert.notOk(component.schoolFilters[0].isSelected);
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.notOk(component.schoolFilters[2].isSelected);

    testSchools([1]);
    await component.schoolFilters[0].toggle();
    testSchools([1, 2]);
    await component.schoolFilters[1].toggle();
    testSchools([1, 2, 3]);
    await component.schoolFilters[2].toggle();

    assert.ok(component.schoolFilters[0].isSelected);
    assert.ok(component.schoolFilters[1].isSelected);
    assert.ok(component.schoolFilters[2].isSelected);
  });

  test('if only one school in system no school filter', async function (assert) {
    assert.expect(1);
    this.server.create('school');

    this.server.get('api/search/v2/curriculum', () => {
      return {
        results: {
          courses: [],
          totalCourses: 0,
          didYouMean: [],
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
          @setPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
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
          @setPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.searchIsRunning);
    this.set('query', 'hello world');
    assert.ok(component.searchIsRunning);
    resolveTestPromise();
  });

  test('did you mean only shows up if score is high enough', async function (assert) {
    assert.expect(2);
    this.server.get('api/search/v2/curriculum', () => {
      return {
        results: {
          courses: [],
          didYouMean: {
            score: 0.03,
            highlighted: '',
            didYouMean: '',
          },
        },
      };
    });

    this.set('query', 'jasper');
    await render(
      <template>
        <GlobalSearch
          @query={{this.query}}
          @page="1"
          @setQuery={{(noop)}}
          @setPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.noResultsIsVisible);
    assert.notOk(component.didYouMean.isVisible);
  });

  test('did you mean works', async function (assert) {
    assert.expect(4);
    this.server.get('api/search/v2/curriculum', () => {
      return {
        results: {
          courses: [],
          didYouMean: {
            score: 0.05,
            highlighted: '<span class="highlight">Jackson</span>',
            didYouMean: 'Jackson',
          },
        },
      };
    });

    await render(
      <template>
        <GlobalSearch
          @query="jayden"
          @page="1"
          @setQuery={{(noop)}}
          @setPage={{(noop)}}
          @setSelectedYear={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.noResultsIsVisible);
    assert.ok(component.didYouMean.isVisible);
    assert.strictEqual(component.didYouMean.text, 'Did you mean Jackson?');
    assert.ok(component.didYouMean.url.includes('Jackson'));
  });
});
