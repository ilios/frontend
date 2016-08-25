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
module('Acceptance: Course - Terms', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school', {
      vocabularies: [1],
      courses: [1]
    });
    server.create('vocabulary', {
      terms: [1, 2],
      school: 1,
    });
    server.create('academicYear', {id: 2013});

    fixtures.terms = [];
    fixtures.terms.pushObject(server.create('term', {
      courses: [1],
      vocabulary: 1
    }));
    fixtures.terms.pushObject(server.create('term', {
      vocabulary: 1
    }));

    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      terms: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('taxonomy summary', function(assert) {
  assert.expect(7);
  visit('/courses/1?details=true');
  andThen(function() {
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
});

test('list terms', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-taxonomies');
    var items = find('ul.selected-taxonomy-terms li', container);
    assert.equal(items.length, fixtures.course.terms.length);
    assert.equal(getElementText(items.eq(0)), getText('term 0'));
  });
});

test('manage terms', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function(){
      assert.equal(getElementText(find('.removable-list li:eq(0)', container)), getText('term 0'));
      assert.equal(getElementText(find('.selectable-terms-list li:eq(0)', container)), getText('term 0'));
      assert.equal(getElementText(find('.selectable-terms-list li:eq(1)', container)), getText('term 1'));
    });
  });
});

test('save term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-terms-list li:eq(1) > div', container)).then(function(){
          click('button.bigadd', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 1'));
      });
    });
  });
});

test('cancel term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-terms-list li:eq(1) > div', container)).then(function(){
          click('button.bigcancel', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 0'));
      });
    });
  });
});
