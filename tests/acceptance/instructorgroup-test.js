import { click, fillIn, currentURL, currentPath, findAll, find, visit } from '@ember/test-helpers';
import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/instructorgroups/1';

module('Acceptance: Instructor Group Details', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    this.server.create('school');
    setupAuthentication(application, {id: 4136, schoolId: 1});
    this.server.createList('user', 4);
    this.server.createList('course', 2, {
      schoolId: 1
    });
    this.server.create('session', {
      courseId: 1,
    });
    this.server.create('session', {
      courseId: 2,
    });
    this.server.create('instructorGroup', {
      schoolId: 1,
      userIds: [2,3],
    });
    this.server.create('instructorGroup', {
      schoolId: 1,
    });
    this.server.create('instructorGroup', {
      schoolId: 1
    });
    this.server.create('offering', {
      sessionId: 1,
      instructorGroupIds: [1]
    });
    this.server.create('offering', {
      sessionId: 2,
      instructorGroupIds: [2]
    });
    this.server.create('offering', {
      sessionId: 2,
      instructorGroupIds: [1]
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('check fields', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'instructorGroup');
    let container = find('.instructorgroup-header');
    assert.equal(getElementText(find('.title .school-title', container)), getText('school 0 > '));
    assert.equal(getElementText(find('.title .editable', container)), getText('instructor group 0'));
    assert.equal(getElementText(find('.info')), getText('Members:2'));
    assert.equal(getElementText(find('.instructorgroup-overview h2')), getText('instructor group 0 Members (2)'));

    let items = find('.instructorgroup-overview .instructorgroup-users li');
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));

    let courses = find('.instructorgroupcourses li');
    assert.equal(getElementText(courses), getText('course 0 course 1'));
  });

  test('change title', async function(assert) {
    await visit(url);
    let container = find('.instructorgroup-header');
    assert.equal(getElementText(find('.title .editable', container)), getText('instructor group 0'));
    await click(find('.title .editable', container));
    let input = find('.title .editinplace input', container);
    assert.equal(getText(input.val()), getText('instructor group 0'));
    await fillIn(input, 'test new title');
    await click(find('.title .editinplace .actions .done', container));
    assert.equal(getElementText(find('.title .editable', container)), getText('test new title'));
  });

  test('search instructors', async function(assert) {
    await visit(url);
    const container = '.instructorgroup-overview';
    const search = `${container} .search-box input`;
    const results = `${container} .results li`;

    await fillIn(search, 'guy');
    let searchResults = find(results);
    assert.equal(searchResults.length, 6);
    assert.equal(getElementText(searchResults.eq(0)), getText('5 Results'));
    assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son user@example.edu'));
    assert.ok(searchResults.eq(1).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(2)), getText('1 guy M. Mc1son user@example.edu'));
    assert.ok(!searchResults.eq(2).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(3)), getText('2 guy M. Mc2son user@example.edu'));
    assert.ok(!searchResults.eq(3).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(4)), getText('3 guy M. Mc3son user@example.edu'));
    assert.ok(searchResults.eq(4).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(5)), getText('4 guy M. Mc4son user@example.edu'));
    assert.ok(searchResults.eq(5).hasClass('active'));
  });

  test('add instructor', async function(assert) {
    await visit(url);

    let container = find('.instructorgroup-overview').eq(0);
    let items = find('.instructorgroup-users li', container);
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));

    await fillIn(find('.search-box input', container), 'guy');
    await click(findAll('.results li')[4], container);
    items = find('.instructorgroup-users li', container);
    assert.equal(items.length, 3);
    assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));
  });

  test('remove default instructor', async function(assert) {
    await visit(url);

    let container = find('.instructorgroup-overview').eq(0);
    await click(find('.instructorgroup-users li'), container);
    let items = find('.instructorgroup-users li', container);
    assert.equal(items.length, 1);
    assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
  });

  test('follow link to course', async function(assert) {
    await visit(url);
    await click('.instructorgroupcourses li:eq(0) a');
    assert.equal(currentURL(), '/courses/1');
  });

  test('no associated courses', async function(assert) {
    await visit('/instructorgroups/3');
    assert.equal(getElementText(find('.instructorgroup-header .title .school-title')),getText('school 0 >'));
    assert.equal(getElementText(find('.instructorgroup-header .title .editable')),getText('instructorgroup 2'));
    assert.equal(getElementText(find('.instructorgroupcourses')), getText('Associated Courses: None'));
  });
});
