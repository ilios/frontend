import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1?sessionTaxonomyDetails=true';
module('Acceptance: Session - Terms', {
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

    server.create('course', {
      school: 1,
      sessions: [1],
    });

    server.create('sessionType');

    fixtures.terms = [];
    fixtures.terms.pushObject(server.create('term', {
      sessions: [1],
      vocabulary: 1
    }));
    fixtures.terms.pushObject(server.create('term', {
      vocabulary: 1
    }));
    fixtures.session = server.create('session', {
      course: 1,
      terms: [1],
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list terms', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-taxonomies');
    var items = find('ul.selected-taxonomy-terms li', container);
    assert.equal(items.length, fixtures.session.terms.length);
    assert.equal(getElementText(items.eq(0)), getText('term 0'));
  });
});

test('manage terms', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.taxonomy-manager');
    click(find('.actions button', container));
    andThen(function() {
      assert.equal(getElementText(find('.removable-list li:eq(0)', container)), getText('term 0'));
      assert.equal(getElementText(find('.selectable-terms-list li:eq(0)', container)), getText('term 0'));
      assert.equal(getElementText(find('.selectable-terms-list li:eq(1)', container)), getText('term 1'));
      /**
       * SHAMEFUL KLUDGE!
       * Turns out, the test errors out in 'afterEach()' with the following message:
       * "Error: Assertion Failed: Cannot call get with 'vocabularies' on an undefined object."
       * This exception is raised in the course::assignableVocabularies() method.
       * After stepping through the code, my best guess is that not all calls have been completed by the time
       * the application is being destroyed.
       * In other words, the test completes "too fast" for it's own good.
       * My ham-fisted workaround is to simulate an additional user interaction,
       * which does nothing else but stall for time.
       * Lame, but seems to do the trick.
       * [ST 2016/03/01]
       */
      click('button.bigcancel', container);
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
