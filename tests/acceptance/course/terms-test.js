import { click, find, findAll, visit } from '@ember/test-helpers';
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
    this.server.create('school');
    this.server.create('vocabulary', {
      schoolId: 1,
      active: true,
    });
    this.server.create('academicYear', {id: 2013});

    fixtures.terms = [];
    fixtures.terms.pushObject(server.create('term', {
      vocabularyId: 1,
      active: true
    }));
    fixtures.terms.pushObject(server.create('term', {
      vocabularyId: 1,
      active: true
    }));

    fixtures.course = this.server.create('course', {
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
    assert.equal(find(find('tr:eq(0) th'), container).textContent.trim(), 'Vocabulary');
    assert.equal(find(findAll('tr:eq(0) th')[1], container).textContent.trim(), 'School');
    assert.equal(find(findAll('tr:eq(0) th')[2], container).textContent.trim(), 'Assigned Terms');

    assert.equal(find(find('tr:eq(1) td'), container).textContent.trim(), 'Vocabulary 1');
    assert.equal(find(findAll('tr:eq(1) td')[1], container).textContent.trim(), 'school 0');
    assert.equal(find(findAll('tr:eq(1) td')[2], container).textContent.trim(), fixtures.course.terms.length);
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
    assert.equal(getElementText(find(find('.removable-list li'), container)), getText('term 0'));
    assert.equal(getElementText(find(find('.selectable-terms-list li'), container)), getText('term 0'));
    assert.equal(getElementText(find(findAll('.selectable-terms-list li')[1], container)), getText('term 1'));
  });

  test('save term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find(find('.removable-list li'), container));
    await click(find('.selectable-terms-list li:eq(1) > div', container));
    await click('button.bigadd', container);
    assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 1'));
  });

  test('cancel term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find(find('.removable-list li'), container));
    await click(find('.selectable-terms-list li:eq(1) > div', container));
    await click('button.bigcancel', container);
    assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 0'));
  });
});
