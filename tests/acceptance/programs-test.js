import { click, fillIn, find, findAll, currentURL, currentRouteName, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

module('Acceptance: Programs', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('User in single school with no special permissions', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication({ school: this.school });
    });

    test('visiting /programs', async function(assert) {
      await visit('/programs');
      assert.equal(currentRouteName(), 'programs');
    });

    test('filters by title', async function(assert) {
      assert.expect(19);
      let firstProgram = this.server.create('program', {
        title: 'specialfirstprogram',
        school: this.school,
      });
      let secondProgram = this.server.create('program', {
        title: 'specialsecondprogram',
        school: this.school
      });
      let regularProgram = this.server.create('program', {
        title: 'regularprogram',
        school: this.school
      });
      let regexProgram = this.server.create('program', {
        title: '\\yoo hoo',
        school: this.school
      });
      await visit('/programs');
      assert.equal(4, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(regexProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))),getText(regularProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(3) td'))),getText(firstProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(4) td'))),getText(secondProgram.title));

      await fillIn('.titlefilter input', 'first');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(firstProgram.title));
      await fillIn('.titlefilter input', 'second');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(secondProgram.title));
      await fillIn('.titlefilter input', 'special');
      assert.equal(2, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(firstProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))),getText(secondProgram.title));
      await fillIn('.titlefilter input', '\\');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(regexProgram.title));

      await fillIn('.titlefilter input', '');
      assert.equal(4, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(regexProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))),getText(regularProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(3) td'))),getText(firstProgram.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(4) td'))),getText(secondProgram.title));

    });

    test('add new program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(3);
      const url = '/programs';
      const expandButton = '.expand-button';
      const input = '.new-program input';
      const saveButton = '.new-program .done';
      const savedLink = '.saved-result a';

      await visit(url);
      await click(expandButton);
      await fillIn(input, 'Test Title');
      await click(saveButton);
      function getContent(i) {
        return find(`tbody tr td:nth-of-type(${i + 1})`).textContent.trim();
      }

      assert.equal(find(savedLink).textContent.trim(), 'Test Title', 'link is visisble');
      assert.equal(getContent(0), 'Test Title', 'program is correct');
      assert.equal(getContent(1), 'school 0', 'school is correct');
    });

    test('remove program', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      this.server.create('program', {
        school: this.school,
      });
      await visit('/programs');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('program 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      await click('.confirm-buttons .remove');
      assert.equal(findAll('.flash-messages').length, 1);
      assert.equal(0, findAll('.list tbody tr').length);
    });

    test('cancel remove program', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      this.server.create('program', {
        school: this.school,
      });
      await visit('/programs');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('program 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      await click('.confirm-buttons .done');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('program 0'));
    });

    test('click edit takes you to program route', async function(assert) {
      assert.expect(1);
      this.server.create('program', {
        school: this.school,
      });
      await visit('/programs');
      var edit = find('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .edit');
      await click(edit);
      assert.equal(currentURL(), '/programs/1');
    });

    test('click title takes you to program route', async function(assert) {
      assert.expect(1);
      this.server.create('program', {
        school: this.school,
      });
      await visit('/programs');
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(1) a');
      assert.equal(currentURL(), '/programs/1');
    });

    test('title filter escapes regex', async function(assert) {
      assert.expect(4);
      this.server.create('program', {
        title: 'yes\\no',
        school: this.school,
      });

      const programs = '.list tbody tr';
      const firstProgramTitle = `${programs}:nth-of-type(1) td:nth-of-type(1)`;
      const filter = '.titlefilter input';
      await visit('/programs');

      assert.equal(findAll(programs).length, 1);
      assert.equal(await getElementText(firstProgramTitle), 'yes\\no');
      await fillIn(filter, '\\');
      assert.equal(findAll(programs).length, 1);
      assert.equal(await getElementText(firstProgramTitle), 'yes\\no');
    });

  });

  test('filters options', async function(assert) {
    assert.expect(4);

    const schools = this.server.createList('school', 2);
    const permission = this.server.create('permission', {
      tableName: 'school',
      tableRowId: 1,
      canRead: true
    });
    await setupAuthentication( { school: schools[1], permissions: [permission]} );

    const schoolSelect = '.schoolsfilter select';

    await visit('/programs');
    let schoolOptions = findAll(`${schoolSelect} option`);
    assert.equal(schoolOptions.length, 2);
    assert.equal(await getElementText(schoolOptions[0]), 'school0');
    assert.equal(await getElementText(schoolOptions[1]), 'school1');
    assert.equal(find(schoolSelect).value, '2');
  });
});
