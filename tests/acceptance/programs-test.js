import { click, fillIn, find, findAll, currentURL, currentPath, visit } from '@ember/test-helpers';
import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Programs', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application, false);
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('visiting /programs', async function(assert) {
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    await visit('/programs');
    assert.equal(currentPath(), 'programs');
  });

  test('filters by title', async function(assert) {
    assert.expect(19);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    let firstProgram = this.server.create('program', {
      title: 'specialfirstprogram',
      schoolId: 1,
    });
    let secondProgram = this.server.create('program', {
      title: 'specialsecondprogram',
      schoolId: 1
    });
    let regularProgram = this.server.create('program', {
      title: 'regularprogram',
      schoolId: 1
    });
    let regexProgram = this.server.create('program', {
      title: '\\yoo hoo',
      schoolId: 1
    });
    await visit('/programs');
    assert.equal(4, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regexProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(regularProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(2) td'))),getText(firstProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(3) td'))),getText(secondProgram.title));

    await fillIn('.titlefilter input', 'first');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(firstProgram.title));
    await fillIn('.titlefilter input', 'second');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(secondProgram.title));
    await fillIn('.titlefilter input', 'special');
    assert.equal(2, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(firstProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(secondProgram.title));
    await fillIn('.titlefilter input', '\\');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regexProgram.title));

    await fillIn('.titlefilter input', '');
    assert.equal(4, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regexProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(regularProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(2) td'))),getText(firstProgram.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(3) td'))),getText(secondProgram.title));

  });

  test('filters options', async function(assert) {
    assert.expect(4);
    this.server.createList('school', 2);
    this.server.create('permission', {
      tableName: 'school',
      tableRowId: 1,
    });
    this.server.create('user', {id: 4136, permissionIds: [1], schoolId: 2});

    const schoolSelect = '.schoolsfilter select';
    const schools = `${schoolSelect} option`;

    await visit('/programs');
    let schoolOptions = find(schools);
    assert.equal(schoolOptions.length, 2);
    assert.equal(getElementText(schoolOptions.eq(0)), 'school0');
    assert.equal(getElementText(schoolOptions.eq(1)), 'school1');
    assert.equal(find(schoolSelect).value, '2');
  });

  test('add new program', async function(assert) {
    assert.expect(3);

    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});

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
      return find(`tbody tr td:eq(${i})`).textContent.trim();
    }

    assert.equal(find(savedLink).textContent.trim(), 'Test Title', 'link is visisble');
    assert.equal(getContent(0), 'Test Title', 'program is correct');
    assert.equal(getContent(1), 'school 0', 'school is correct');
  });

  test('remove program', async function(assert) {
    assert.expect(4);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    await visit('/programs');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('program 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    await click('.confirm-buttons .remove');
    assert.equal(findAll('.flash-messages').length, 1);
    assert.equal(0, findAll('.list tbody tr').length);
  });

  test('cancel remove program', async function(assert) {
    assert.expect(4);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    await visit('/programs');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('program 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    await click('.confirm-buttons .done');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('program 0'));
  });

  test('click edit takes you to program route', async function(assert) {
    assert.expect(1);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    await visit('/programs');
    var edit = find('.list tbody tr:eq(0) td:eq(3) .edit');
    await click(edit);
    assert.equal(currentURL(), '/programs/1');
  });

  test('click title takes you to program route', async function(assert) {
    assert.expect(1);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    await visit('/programs');
    await click('.list tbody tr:eq(0) td:eq(0) a');
    assert.equal(currentURL(), '/programs/1');
  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(4);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      title: 'yes\\no',
      schoolId: 1,
    });

    const programs = '.list tbody tr';
    const firstProgramTitle = `${programs}:eq(0) td:eq(0)`;
    const filter = '.titlefilter input';
    await visit('/programs');

    assert.equal(findAll(programs).length, 1);
    assert.equal(getElementText(firstProgramTitle), 'yes\\no');
    await fillIn(filter, '\\');
    assert.equal(findAll(programs).length, 1);
    assert.equal(getElementText(firstProgramTitle), 'yes\\no');
  });
});
