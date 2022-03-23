import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program-year';

module('Acceptance | Program Year - Overview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const director1 = this.server.create('user');
    const director2 = this.server.create('user', { displayName: 'Zeppelin' });
    const users = this.server.createList('user', 3);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', {
      program,
      directors: [director1, director2, users[0]],
    });
    this.server.create('cohort', {
      programYear,
    });
    this.program = program;
    this.programYear = programYear;
  });

  test('list directors', async function (assert) {
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    assert.strictEqual(currentRouteName(), 'programYear.index');
    assert.strictEqual(page.overview.directors.length, 3);
    assert.strictEqual(page.overview.directors[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.notOk(page.overview.directors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.overview.directors[1].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.notOk(page.overview.directors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.overview.directors[2].userNameInfo.fullName, 'Zeppelin');
    assert.ok(page.overview.directors[2].userNameInfo.hasAdditionalInfo);
  });

  test('list directors with privileges', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    assert.strictEqual(currentRouteName(), 'programYear.index');
    assert.strictEqual(page.overview.directors.length, 3);
    assert.strictEqual(page.overview.directors[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.overview.directors[1].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(page.overview.directors[2].userNameInfo.fullName, 'Zeppelin');
  });

  test('search directors', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    assert.strictEqual(currentRouteName(), 'programYear.index');
    await page.overview.search.searchBox.set('guy');
    assert.strictEqual(page.overview.search.results.items.length, 6);
    assert.strictEqual(
      page.overview.search.results.items[0].text,
      '0 guy M. Mc0son user@example.edu'
    );
    assert.ok(page.overview.search.results.items[0].isActive);
    assert.strictEqual(
      page.overview.search.results.items[1].text,
      '1 guy M. Mc1son user@example.edu'
    );
    assert.notOk(page.overview.search.results.items[1].isActive);
    assert.strictEqual(
      page.overview.search.results.items[2].text,
      '3 guy M. Mc3son user@example.edu'
    );
    assert.notOk(page.overview.search.results.items[2].isActive);
    assert.strictEqual(
      page.overview.search.results.items[3].text,
      '4 guy M. Mc4son user@example.edu'
    );
    assert.ok(page.overview.search.results.items[3].isActive);
    assert.strictEqual(
      page.overview.search.results.items[4].text,
      '5 guy M. Mc5son user@example.edu'
    );
    assert.ok(page.overview.search.results.items[4].isActive);
    assert.strictEqual(page.overview.search.results.items[5].text, 'Zeppelin user@example.edu');
    assert.notOk(page.overview.search.results.items[5].isActive);
  });

  test('add director', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    assert.strictEqual(currentRouteName(), 'programYear.index');
    assert.strictEqual(page.overview.directors.length, 3);
    assert.strictEqual(page.overview.directors[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.overview.directors[1].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(page.overview.directors[2].userNameInfo.fullName, 'Zeppelin');
    await page.overview.search.searchBox.set('guy');
    await page.overview.search.results.items[4].click();
    assert.strictEqual(page.overview.directors.length, 4);
    assert.strictEqual(page.overview.directors[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.overview.directors[1].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(page.overview.directors[2].userNameInfo.fullName, '5 guy M. Mc5son');
    assert.strictEqual(page.overview.directors[3].userNameInfo.fullName, 'Zeppelin');
  });

  test('remove director', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    assert.strictEqual(currentRouteName(), 'programYear.index');
    assert.strictEqual(page.overview.directors.length, 3);
    assert.strictEqual(page.overview.directors[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.overview.directors[1].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(page.overview.directors[2].userNameInfo.fullName, 'Zeppelin');
    await page.overview.directors[0].remove();
    assert.strictEqual(page.overview.directors.length, 2);
    assert.strictEqual(page.overview.directors[0].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(page.overview.directors[1].userNameInfo.fullName, 'Zeppelin');
  });

  test('first director added is disabled #2770', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', {
      program: this.program,
      directors: [],
    });
    this.server.create('cohort', {
      programYear,
    });
    await page.visit({ programId: this.program.id, programYearId: programYear.id });
    assert.strictEqual(currentRouteName(), 'programYear.index');
    assert.strictEqual(page.overview.directors.length, 0);
    await page.overview.search.searchBox.set('guy');
    assert.strictEqual(page.overview.search.results.items.length, 6);
    assert.ok(page.overview.search.results.items[0].isActive);
    await page.overview.search.results.items[0].click();
    assert.strictEqual(page.overview.directors.length, 1);
    assert.notOk(page.overview.search.results.items[0].isActive);
  });
});
