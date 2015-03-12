import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import startServer from 'ilios/tests/helpers/start-server';
import mockCurrentUser from 'ilios/tests/helpers/mock-currentuser';

var application;
var server;

module('Acceptance: Courses', {
  beforeEach: function() {
    mockCurrentUser(4136);
    application = startApp();
    server = startServer();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
    server.shutdown();
  }
});

test('visiting /courses', function(assert) {
  visit('/courses');
  andThen(function() {
    assert.equal(currentPath(), 'courses');
  });
});

test('filters options', function(assert) {
  assert.expect(5);
  visit('/courses');
  andThen(function() {
    var filters = find('#courses .filter');
    assert.equal(filters.length, 4);

    assert.equal(find('#school-selection').eq(0).text().trim(), 'Medicine');
    var yearOptions = find('#yearsfilter ul.dropdown-menu li');
    assert.equal(yearOptions.length, 2);
    assert.equal(yearOptions.eq(0).text().trim(), '2013 - 2014');
    assert.equal(yearOptions.eq(1).text().trim(), '2014 - 2015');
  });
});

test('courses in list', function(assert) {
  assert.expect(8);
  visit('/courses');
  andThen(function() {
    let courseRows = find('.resultslist-list tbody tr');
    assert.equal(courseRows.length, 7);
    let expectedCourseTitles = [
      'Anesthesia110CoreClerkship(2014-15)(Anesthesia110_2014)',
      'BC112',
      'Brain,Mind,andBehavior2014-15(IDS10414-15)',
      'Classof2018(2014-15)(Classof2018(201)',
      'LifeCycle',
      'Mechanisms,MethodsandMalignancies2014-2015(IDS106-M3-2014-201)',
      'Prologue2014-15(IDS101_2014)',
    ];
    for (let i = 0; i < 7; i++){
      assert.equal(getText(find('td:eq(0)', courseRows.eq(i))), expectedCourseTitles[i]);
    }

  });
});
