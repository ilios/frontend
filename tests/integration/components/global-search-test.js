import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/global-search';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | global-search', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [{
            title: 'Course 1',
            year: 2019,
            sessions: []
          }, {
            title: 'Course 2',
            year: 2020,
            sessions: []
          }, {
            title: 'Course 3',
            year: 2021,
            sessions: []
          }, {
            title: 'Course 4',
            year: 2021,
            sessions: []
          }]
        }
      };
    });
  });

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(hbs`{{global-search}}`);
    assert.dom('[data-test-global-search-box]').exists({ count: 1 });
  });

  test('handles empty and non-empty query', async function(assert) {
    assert.expect(2);

    this.set('query', '');
    await render(hbs`{{global-search query=this.query}}`);
    assert.ok(component.noResultsIsVisible);
    this.set('query', 'hello world');
    assert.notOk(component.noResultsIsVisible);
  });

  test('bubbles action properly', async function(assert) {
    assert.expect(1);

    this.set('query', (value) => assert.equal(value, 'typed it'));
    await render(hbs`{{global-search onQuery=(action this.query)}}`);
    await component.input('typed it');
    await component.clickIcon();
  });

  test('academic year filter works properly', async function(assert) {
    assert.expect(16);

    this.set('query', 'hello world');
    await render(hbs`{{global-search page=1 query=this.query}}`);
    assert.equal(component.academicYear, '');
    assert.equal(component.academicYearOptions, 'All Academic Years 2021 - 2022 2020 - 2021 2019 - 2020');
    assert.equal(component.courseTitleLinks.length, 4);
    assert.equal(component.courseTitleLinks.objectAt(0).text, 'Course 1');
    assert.equal(component.courseTitleLinks.objectAt(1).text, 'Course 2');
    assert.equal(component.courseTitleLinks.objectAt(2).text, 'Course 3');
    assert.equal(component.courseTitleLinks.objectAt(3).text, 'Course 4');
    await component.selectAcademicYear('2021');
    assert.equal(component.courseTitleLinks.length, 2);
    assert.equal(component.courseTitleLinks.objectAt(0).text, 'Course 3');
    assert.equal(component.courseTitleLinks.objectAt(1).text, 'Course 4');
    await component.selectAcademicYear('2020');
    assert.equal(component.academicYear, '2020');
    assert.equal(component.courseTitleLinks.length, 1);
    assert.equal(component.courseTitleLinks.objectAt(0).text, 'Course 2');
    await component.selectAcademicYear('2019');
    assert.equal(component.academicYear, '2019');
    assert.equal(component.courseTitleLinks.length, 1);
    assert.equal(component.courseTitleLinks.objectAt(0).text, 'Course 1');
  });
});
