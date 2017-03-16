import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/instructorgroups/1';
module('Acceptance: Instructor Group Details', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.createList('user', 2, {
      instructorGroups: [1]
    });
    server.createList('user', 2);
    server.create('course', {
      sessions: [1]
    });
    server.create('course', {
      sessions: [2]
    });
    server.create('session', {
      course: 1,
      offerings: [1]
    });
    server.create('session', {
      course: 2,
      offerings: [2,3]
    });
    server.create('sessionType');
    server.create('offering', {
      session: 1,
      instructorGroups: [1]
    });
    server.create('offering', {
      session: 2,
      instructorGroups: [2]
    });
    server.create('offering', {
      session: 2,
      instructorGroups: [1]
    });
    server.create('school', {
      instructorGroups: [1,2,3]
    });
    server.create('instructorGroup', {
      school: 1,
      users: [2,3],
      offerings: [1,3]
    });
    server.create('instructorGroup', {
      school: 1,
      offerings: [2]
    });
    server.create('instructorGroup', {
      school: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'instructorGroup');
    let container = find('.instructorgroup-header');
    assert.equal(getElementText(find('.title .school-title', container)), getText('school 0 > '));
    assert.equal(getElementText(find('.title .editable', container)), getText('instructor group 0'));
    assert.equal(getElementText(find('.info')), getText('Members:2'));
    assert.equal(getElementText(find('.instructorgroup-overview h2')), getText('instructor group 0 Members (2)'));

    let items = find('.instructorgroup-overview-content .removable-list li');
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));

    let courses = find('.instructorgroupcourses li');
    assert.equal(getElementText(courses), getText('course 0 course 1'));
  });
});

test('change title', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.instructorgroup-header');
    assert.equal(getElementText(find('.title .editable', container)), getText('instructor group 0'));
    click(find('.title .editable', container));
    andThen(function(){
      let input = find('.title .editinplace input', container);
      assert.equal(getText(input.val()), getText('instructor group 0'));
      fillIn(input, 'test new title');
      click(find('.title .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.title .editable', container)), getText('test new title'));
      });
    });
  });
});

test('search instructors', function(assert) {
  visit(url);
  const container = '.instructorgroup-overview-content';
  const search = `${container} .search-box input`;
  const results = `${container} .results li`;

  fillIn(search, 'guy');
  andThen(function() {
    let searchResults = find(results);
    assert.equal(searchResults.length, 6);
    assert.equal(getElementText(searchResults.eq(0)), getText('5 Results'));
    assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son'));
    assert.ok(searchResults.eq(1).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(2)), getText('1 guy M. Mc1son'));
    assert.ok(!searchResults.eq(2).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(3)), getText('2 guy M. Mc2son'));
    assert.ok(!searchResults.eq(3).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(4)), getText('3 guy M. Mc3son'));
    assert.ok(!searchResults.eq(4).hasClass('active'), 'class 4 is active');
    assert.equal(getElementText(searchResults.eq(5)), getText('4 guy M. Mc4son'));
    assert.ok(searchResults.eq(5).hasClass('active'), 'class 5 is active');
  });
});

test('add instructor', function(assert) {
  visit(url);

  andThen(function() {
    let container = find('.instructorgroup-overview').eq(0);
    let items = find('.removable-list li', container);
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));

    fillIn(find('.search-box input', container), 'guy').then(function(){
      click('.results li:eq(4)', container).then(function(){
        items = find('.removable-list li', container);
        assert.equal(items.length, 3);
        assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
        assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
        assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));
      });
    });
  });
});

test('remove default instructor', function(assert) {
  visit(url);

  andThen(function() {
    let container = find('.instructorgroup-overview').eq(0);
    click('.removable-list li:eq(0)', container).then(function(){
      let items = find('.removable-list li', container);
      assert.equal(items.length, 1);
      assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
    });
  });
});

test('follow link to course', function(assert) {
  visit(url);
  andThen(function() {
    click('.instructorgroupcourses li:eq(0) a');
    andThen(()=>{
      assert.equal(currentURL(), '/courses/1');
    });
  });
});

test('no associated courses', function(assert) {
  visit('/instructorgroups/3');
  andThen(function() {
    assert.equal(getElementText(find('.instructorgroup-header .title .school-title')),getText('school 0 >'));
    assert.equal(getElementText(find('.instructorgroup-header .title .editable')),getText('instructorgroup 2'));
    assert.equal(getElementText(find('.instructorgroupcourses')), getText('Associated Courses: None'));
  });
});
