import { click, fillIn, find, findAll, currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios-common';
const url = '/programs/1/programyears/1';

module('Acceptance | Program Year - Overview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.create('user');
    this.server.create('user', { displayName: 'Zeppelin' });
    this.server.createList('user', 3);
    this.server.create('program', { school: this.school });
    this.server.create('programYear', {
      programId: 1,
      directorIds: [2, 3, 4],
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
  });

  test('list directors', async function (assert) {
    await visit(url);
    assert.strictEqual(currentRouteName(), 'programYear.index');
    const directors = '.programyear-overview .directors li';
    assert.dom(directors).exists({ count: 3 });
    assert.dom(`${directors}:nth-of-type(1) [data-test-fullname]`).hasText('1 guy M. Mc1son');
    assert.dom(`${directors}:nth-of-type(1) [data-test-info]`).doesNotExist();
    assert.dom(`${directors}:nth-of-type(2) [data-test-fullname]`).hasText('3 guy M. Mc3son');
    assert.dom(`${directors}:nth-of-type(2) [data-test-info]`).doesNotExist();
    assert.dom(`${directors}:nth-of-type(3) [data-test-fullname]`).hasText('Zeppelin');
    assert.dom(`${directors}:nth-of-type(3) [data-test-info]`).exists();
  });

  test('list directors with privileges', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.strictEqual(currentRouteName(), 'programYear.index');
    const directors = '.programyear-overview .removable-directors li';
    assert.dom(directors).exists({ count: 3 });
    assert.dom(`${directors}:nth-of-type(1) [data-test-fullname]`).hasText('1 guy M. Mc1son');
    assert.dom(`${directors}:nth-of-type(2) [data-test-fullname]`).hasText('3 guy M. Mc3son');
    assert.dom(`${directors}:nth-of-type(3) [data-test-fullname]`).hasText('Zeppelin');
  });

  test('search directors', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.strictEqual(currentRouteName(), 'programYear.index');
    await fillIn(find('.programyear-overview .search-box input'), 'guy');
    const searchResults = findAll('.programyear-overview .results li');
    assert.strictEqual(searchResults.length, 7);
    assert.strictEqual(await getElementText(searchResults[0]), getText('6 Results'));
    assert.strictEqual(
      await getElementText(searchResults[1]),
      getText('0 guy M. Mc0son user@example.edu')
    );
    assert.dom(searchResults[1]).hasClass('active');
    assert.strictEqual(
      await getElementText(searchResults[2]),
      getText('1 guy M. Mc1son user@example.edu')
    );
    assert.dom(searchResults[2]).hasClass('inactive');
    assert.strictEqual(
      await getElementText(searchResults[3]),
      getText('3 guy M. Mc3son user@example.edu')
    );
    assert.dom(searchResults[3]).hasClass('inactive');
    assert.strictEqual(
      await getElementText(searchResults[4]),
      getText('4 guy M. Mc4son user@example.edu')
    );
    assert.dom(searchResults[4]).hasClass('active');
    assert.strictEqual(
      await getElementText(searchResults[5]),
      getText('5 guy M. Mc5son user@example.edu')
    );
    assert.dom(searchResults[5]).hasClass('active');
    assert.strictEqual(
      await getElementText(searchResults[6]),
      getText('Zeppelin user@example.edu')
    );
    assert.dom(searchResults[6]).hasClass('inactive');
  });

  test('add director', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.strictEqual(currentRouteName(), 'programYear.index');
    const directors = '.programyear-overview .removable-directors li';
    assert.dom(directors).exists({ count: 3 });
    assert.dom(`${directors}:nth-of-type(1) [data-test-fullname]`).hasText('1 guy M. Mc1son');
    assert.dom(`${directors}:nth-of-type(2) [data-test-fullname]`).hasText('3 guy M. Mc3son');
    assert.dom(`${directors}:nth-of-type(3) [data-test-fullname]`).hasText('Zeppelin');

    await fillIn(find('.programyear-overview .search-box input'), 'guy');
    await click(findAll('.programyear-overview .results li')[5]);

    assert.dom(directors).exists({ count: 4 });
    assert.dom(`${directors}:nth-of-type(1) [data-test-fullname]`).hasText('1 guy M. Mc1son');
    assert.dom(`${directors}:nth-of-type(2) [data-test-fullname]`).hasText('3 guy M. Mc3son');
    assert.dom(`${directors}:nth-of-type(3) [data-test-fullname]`).hasText('5 guy M. Mc5son');
    assert.dom(`${directors}:nth-of-type(4) [data-test-fullname]`).hasText('Zeppelin');
  });

  test('remove director', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.strictEqual(currentRouteName(), 'programYear.index');
    await click(find('.programyear-overview .removable-directors li'));
    const directors = '.programyear-overview .removable-directors li';
    assert.dom(directors).exists({ count: 2 });
    assert.dom(`${directors}:nth-of-type(1) [data-test-fullname]`).hasText('3 guy M. Mc3son');
    assert.dom(`${directors}:nth-of-type(2) [data-test-fullname]`).hasText('Zeppelin');
  });

  test('first director added is disabled #2770', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    this.server.create('programYear', {
      programId: 1,
      directorIds: [],
    });
    this.server.create('cohort', {
      programYearId: 2,
    });
    const overview = '.programyear-overview';
    const directors = `${overview} .removable-directors li`;
    const search = `${overview} [data-test-user-search]`;
    const input = `${search} input`;
    const results = `${search} .results li`;
    const firstResult = `${results}:nth-of-type(2)`;

    await visit('/programs/1/programyears/2');

    assert.strictEqual(currentRouteName(), 'programYear.index');
    assert.dom(directors).doesNotExist('no directors initially');
    await fillIn(input, 'guy');
    assert.dom(firstResult).hasNoClass('inactive', 'the first user is active now');
    await click(firstResult);
    assert.dom(directors).exists({ count: 1 }, 'director is selected');
    assert.dom(firstResult).hasClass('inactive', 'the first user is now marked as inactive');
  });
});
