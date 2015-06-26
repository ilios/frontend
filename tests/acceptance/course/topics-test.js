import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/courses/1?details=true';
module('Acceptance: Course - Topics', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school', {
      disciplines: [1,2]
    });
    server.create('educationalYear', {id: 2013});

    fixtures.topics = [];
    fixtures.topics.pushObject(server.create('discipline', {
      courses: [1],
      owningSchool: 1
    }));
    fixtures.topics.pushObject(server.create('discipline', {
      owningSchool: 1
    }));

    fixtures.course = server.create('course', {
      year: 2013,
      owningSchool: 1,
      disciplines: [1]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list topics', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    var items = find('ul.columnar-list li', container);
    assert.equal(items.length, fixtures.course.disciplines.length);
    assert.equal(getElementText(items.eq(0)), getText('topic 0'));
  });
});

test('manage topics', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions button', container));
    andThen(function(){
      assert.equal(getElementText(find('.removable-list li', container)), getText('topic 0'));
      assert.equal(getElementText(find('.selectable-list li', container)), getText('topic 1'));
    });
  });
});

test('save topic chages', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list li:eq(1)', container)).then(function(){
          click('button.bigadd', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.columnar-list li', container)), getText('topic 1'));
      });
    });
  });
});

test('cancel topic chages', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list li:eq(1)', container)).then(function(){
          click('button.bigcancel', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.columnar-list li', container)), getText('topic 0'));
      });
    });
  });
});
