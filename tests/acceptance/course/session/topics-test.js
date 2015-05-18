import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Topics', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('sessionType');
    server.create('school', {
      disciplines: [1,2]
    });
    server.create('course', {
      owningSchool: 1
    });

    fixtures.topics = [];
    fixtures.topics.pushObject(server.create('discipline', {
      sessions: [1],
      owningSchool: 1
    }));
    fixtures.topics.pushObject(server.create('discipline', {
      owningSchool: 1
    }));

    fixtures.session =
    server.create('session', {
      course: 1,
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
    var items = find('ul.inline-list li', container);
    assert.equal(items.length, fixtures.session.disciplines.length);
    assert.equal(getElementText(items.eq(0)), getText('topic 0'));
  });
});

test('manage topics', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions .add', container));
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
    click(find('.detail-actions .add', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list li:eq(1)', container)).then(function(){
          click('button.bigadd', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.inline-list li', container)), getText('topic 1'));
      });
    });
  });
});

test('cancel topic chages', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions .add', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list li:eq(1)', container)).then(function(){
          click('button.bigcancel', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.inline-list li', container)), getText('topic 0'));
      });
    });
  });
});
