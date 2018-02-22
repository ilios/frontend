import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
var url = '/courses/1?details=true&courseTaxonomyDetails=true';

module('Acceptance: Course - Terms', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('vocabulary', {
      schoolId: 1,
      active: true,
    });
    server.create('academicYear', {id: 2013});

    fixtures.terms = [];
    fixtures.terms.pushObject(server.create('term', {
      vocabularyId: 1,
      active: true
    }));
    fixtures.terms.pushObject(server.create('term', {
      vocabularyId: 1,
      active: true
    }));

    fixtures.course = server.create('course', {
      year: 2013,
      schoolId: 1,
      termIds: [1]
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('taxonomy summary', async function(assert) {
    assert.expect(7);
    await visit('/courses/1?details=true');
    var container = find('.collapsed-taxonomies');
    var title = find('.title', container);
    assert.equal(title.text().trim(), 'Terms (' + fixtures.course.terms.length + ')');
    assert.equal(find('tr:eq(0) th:eq(0)', container).text().trim(), 'Vocabulary');
    assert.equal(find('tr:eq(0) th:eq(1)', container).text().trim(), 'School');
    assert.equal(find('tr:eq(0) th:eq(2)', container).text().trim(), 'Assigned Terms');

    assert.equal(find('tr:eq(1) td:eq(0)', container).text().trim(), 'Vocabulary 1');
    assert.equal(find('tr:eq(1) td:eq(1)', container).text().trim(), 'school 0');
    assert.equal(find('tr:eq(1) td:eq(2)', container).text().trim(), fixtures.course.terms.length);
  });

  test('list terms', async function(assert) {
    assert.expect(2);
    await visit(url);
    var container = find('.detail-taxonomies');
    var items = find('ul.selected-taxonomy-terms li', container);
    assert.equal(items.length, fixtures.course.terms.length);
    assert.equal(getElementText(items.eq(0)), getText('term 0'));
  });

  test('manage terms', async function(assert) {
    assert.expect(3);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    assert.equal(getElementText(find('.removable-list li:eq(0)', container)), getText('term 0'));
    assert.equal(getElementText(find('.selectable-terms-list li:eq(0)', container)), getText('term 0'));
    assert.equal(getElementText(find('.selectable-terms-list li:eq(1)', container)), getText('term 1'));
  });

  test('save term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find('.removable-list li:eq(0)', container));
    await click(find('.selectable-terms-list li:eq(1) > div', container));
    await click('button.bigadd', container);
    assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 1'));
  });

  test('cancel term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find('.removable-list li:eq(0)', container));
    await click(find('.selectable-terms-list li:eq(1) > div', container));
    await click('button.bigcancel', container);
    assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 0'));
  });
});