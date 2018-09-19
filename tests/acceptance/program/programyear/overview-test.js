import {
  click,
  fillIn,
  find,
  findAll,
  currentRouteName,
  visit
} from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
const url = '/programs/1/programyears/1';

module('Acceptance | Program Year - Overview', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.createList('user', 5);
    this.server.create('program', { school: this.school });
    this.server.create('programYear', {
      programId: 1,
      directorIds: [2, 3, 4]
    });
    this.server.create('cohort', {
      programYearId: 1
    });
  });

  test('list directors', async function(assert) {
    await visit(url);

    assert.equal(currentRouteName(), 'programYear.index');
    var items = findAll('.programyear-overview .directors li');
    assert.equal(items.length, 3);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));
    assert.equal(await getElementText(items[2]), getText('3 guy M. Mc3son'));
  });

  test('list directors with privileges', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.equal(currentRouteName(), 'programYear.index');
    var items = findAll('.programyear-overview .removable-directors li');
    assert.equal(items.length, 3);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));
    assert.equal(await getElementText(items[2]), getText('3 guy M. Mc3son'));
  });

  test('search directors', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.equal(currentRouteName(), 'programYear.index');
    await fillIn(find('.programyear-overview .search-box input'), 'guy');
    var searchResults = findAll('.programyear-overview .results li');
    assert.equal(searchResults.length, 7);
    assert.equal(await getElementText(searchResults[0]), getText('6 Results'));
    assert.equal(await getElementText(searchResults[1]), getText('0 guy M. Mc0son user@example.edu'));
    assert.dom(searchResults[1]).hasClass('active');
    assert.equal(await getElementText(searchResults[2]), getText('1 guy M. Mc1son user@example.edu'));
    assert.dom(searchResults[2]).hasClass('inactive');
    assert.equal(await getElementText(searchResults[3]), getText('2 guy M. Mc2son user@example.edu'));
    assert.dom(searchResults[3]).hasClass('inactive');
    assert.equal(await getElementText(searchResults[4]), getText('3 guy M. Mc3son user@example.edu'));
    assert.dom(searchResults[4]).hasClass('inactive');
    assert.equal(await getElementText(searchResults[5]), getText('4 guy M. Mc4son user@example.edu'));
    assert.dom(searchResults[5]).hasClass('active');
    assert.equal(await getElementText(searchResults[6]), getText('5 guy M. Mc5son user@example.edu'));
    assert.dom(searchResults[6]).hasClass('active');
  });

  test('add director', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.equal(currentRouteName(), 'programYear.index');
    let items = findAll('.programyear-overview .removable-directors li');
    assert.equal(items.length, 3);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));
    assert.equal(await getElementText(items[2]), getText('3 guy M. Mc3son'));

    await fillIn(find('.programyear-overview .search-box input'), 'guy');
    await click(findAll('.programyear-overview .results li')[6]);
    items = findAll('.programyear-overview .removable-directors li');
    assert.equal(items.length, 4);
    assert.equal(await getElementText(items[0]), getText('1 guy M. Mc1son'));
    assert.equal(await getElementText(items[1]), getText('2 guy M. Mc2son'));
    assert.equal(await getElementText(items[2]), getText('3 guy M. Mc3son'));
    assert.equal(await getElementText(items[3]), getText('5 guy M. Mc5son'));
  });

  test('remove director', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.equal(currentRouteName(), 'programYear.index');
    await click(find('.programyear-overview .removable-directors li'));
    var items = findAll('.programyear-overview .removable-directors li');
    assert.equal(items.length, 2);
    assert.equal(await getElementText(items[0]), getText('2 guy M. Mc2son'));
    assert.equal(await getElementText(items[1]), getText('3 guy M. Mc3son'));
  });

  test('first director added is disabled #2770', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    this.server.create('programYear', {
      programId: 1,
      directorIds: []
    });
    this.server.create('cohort', {
      programYearId: 2
    });
    const overview = '.programyear-overview';
    const directors = `${overview} .removable-directors li`;
    const search = `${overview} [data-test-user-search]`;
    const input = `${search} input`;
    const results = `${search} .results li`;
    const firstResult = `${results}:nth-of-type(2)`;

    await visit('/programs/1/programyears/2');

    assert.equal(currentRouteName(), 'programYear.index');
    assert.dom(directors).doesNotExist('no directors initially');
    await fillIn(input, 'guy');
    assert.dom(firstResult).hasNoClass('inactive', 'the first user is active now');
    await click(firstResult);
    assert.dom(directors).exists({ count: 1 }, 'director is selected');
    assert.dom(firstResult).hasClass('inactive', 'the first user is now marked as inactive');

  });
});
