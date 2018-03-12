import { currentRouteName, find, visit, click, fillIn, currentURL, findAll } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

let url = '/instructorgroups/1';

module('Acceptance: Instructor Group Details', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
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

  test('check fields', async function(assert) {
    await visit(url);
    assert.equal(currentRouteName(), 'instructorGroup');
    let container = find('.instructorgroup-header');
    assert.equal(await getElementText(find('.title .school-title', container)), getText('school 0 > '));
    assert.equal(await getElementText(find('.title .editable', container)), getText('instructor group 0'));
    assert.equal(await getElementText(find('.info')), getText('Members:2'));
    assert.equal(await getElementText(find('.instructorgroup-overview h2')), getText('instructor group 0 Members (2)'));

    let items = findAll('.instructorgroup-overview .instructorgroup-users li');
    assert.equal(items.length, 2);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));

    assert.equal(await getElementText('.instructorgroupcourses li'), getText('course 0 course 1'));
  });

  test('change title', async function(assert) {
    await visit(url);
    let container = find('.instructorgroup-header');
    assert.equal(await getElementText(find('.title .editable', container)), getText('instructor group 0'));
    await click(find('.title .editable', container));
    let input = find('.title .editinplace input', container);
    assert.equal(getText(input.value), getText('instructor group 0'));
    await fillIn(input, 'test new title');
    await click(find('.title .editinplace .actions .done', container));
    assert.equal(await getElementText(find('.title .editable', container)), getText('test new title'));
  });

  test('search instructors', async function(assert) {
    await visit(url);
    const container = '.instructorgroup-overview';
    const search = `${container} .search-box input`;
    const results = `${container} .results li`;

    await fillIn(search, 'guy');
    let searchResults = findAll(results);
    assert.equal(searchResults.length, 6);
    assert.equal(await getElementText(searchResults[0]), getText('5 Results'));
    assert.equal(await getElementText(searchResults[1]), getText('0 guy M. Mc0son user@example.edu'));
    assert.ok(searchResults[1].classList.contains('active'));
    assert.equal(await getElementText(searchResults[2]), getText('1 guy M. Mc1son user@example.edu'));
    assert.ok(!searchResults[2].classList.contains('active'));
    assert.equal(await getElementText(searchResults[3]), getText('2 guy M. Mc2son user@example.edu'));
    assert.ok(!searchResults[3].classList.contains('active'));
    assert.equal(await getElementText(searchResults[4]), getText('3 guy M. Mc3son user@example.edu'));
    assert.ok(searchResults[4].classList.contains('active'));
    assert.equal(await getElementText(searchResults[5]), getText('4 guy M. Mc4son user@example.edu'));
    assert.ok(searchResults[5].classList.contains('active'));
  });

  test('add instructor', async function(assert) {
    await visit(url);

    let container = find('.instructorgroup-overview')[0];
    let items = findAll('.instructorgroup-users li', container);
    assert.equal(items.length, 2);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));

    await fillIn(find('.search-box input', container), 'guy');
    await click(findAll('.results li')[4], container);
    items = findAll('.instructorgroup-users li', container);
    assert.equal(items.length, 3);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));
    assert.equal(await getElementText(items[2]), getText('3 guy M. Mc3son'));
  });

  test('remove default instructor', async function(assert) {
    await visit(url);

    let container = find('.instructorgroup-overview')[0];
    await click(find('.instructorgroup-users li'), container);
    let items = findAll('.instructorgroup-users li', container);
    assert.equal(items.length, 1);
    assert.equal(await getElementText(items[0]), getText('2 guy M. Mc2son'));
  });

  test('follow link to course', async function(assert) {
    await visit(url);
    await click('.instructorgroupcourses li:nth-of-type(1) a');
    assert.equal(currentURL(), '/courses/1');
  });

  test('no associated courses', async function(assert) {
    await visit('/instructorgroups/3');
    assert.equal(await getElementText(find('.instructorgroup-header .title .school-title')),getText('school 0 >'));
    assert.equal(await getElementText(find('.instructorgroup-header .title .editable')),getText('instructorgroup 2'));
    assert.equal(await getElementText(find('.instructorgroupcourses')), getText('Associated Courses: None'));
  });
});
