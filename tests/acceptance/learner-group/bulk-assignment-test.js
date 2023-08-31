import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { triggerEvent, waitFor } from '@ember/test-helpers';
import { setupAuthentication } from 'ilios-common';
import page from '../../pages/learner-group';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import percySnapshot from '@percy/ember';

module('Acceptance | learner-group/bulk-assignment', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ id: 1, school, administeredSchools: [school] });

    const program = this.server.create('program', {
      title: 'program 0',
      school,
    });
    const programYear = this.server.create('program-year', {
      program,
    });
    const cohort = this.server.create('cohort', {
      title: 'class of this year',
      programYear,
    });
    const group1 = this.server.create('learner-group', {
      title: 'group 1',
      cohort,
    });
    this.server.create('learnerGroup', {
      title: 'group 1 child 0',
      cohort,
      parent: group1,
    });
    this.server.create('learnerGroup', {
      title: 'group 1 child 1',
      cohort,
      parent: group1,
    });
  });

  const createFile = function (users) {
    const lines = users.map((arr) => {
      return arr.join('\t');
    });

    const contents = lines.join('\n');
    const file = new Blob([contents], { type: 'text/plain' });

    file.mime = 'text/plain';
    file.name = 'test.txt';
    return file;
  };

  const triggerUpload = async function (users) {
    const file = createFile(users);
    await triggerEvent('[data-test-user-upload]', 'change', { files: [file] });
  };

  test('upload users', async function (assert) {
    assert.expect(12);
    await page.visit({ learnerGroupId: 1 });
    await percySnapshot(assert);
    await page.root.actions.buttons.bulkAssignment.click();
    this.server.create('user', {
      firstName: 'jasper',
      lastName: 'johnson',
      campusId: '1234567890',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'jackson',
      lastName: 'johnson',
      campusId: '12345',
      cohortIds: [1],
    });
    const users = [
      ['jasper', 'johnson', '1234567890', '123Test'],
      ['jackson', 'johnson', '12345'],
    ];
    await triggerUpload(users);
    await waitFor('[data-test-upload-data-valid-users]');
    await percySnapshot(assert);

    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers.length, 2);
    assert.ok(page.root.bulkAssignment.validUploadedUsers[0].isValid);
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].firstName, 'jasper');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].lastName, 'johnson');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].campusId, '1234567890');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].smallGroupName, '123Test');
    assert.ok(page.root.bulkAssignment.validUploadedUsers[1].isValid);
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].firstName, 'jackson');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].lastName, 'johnson');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].campusId, '12345');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].smallGroupName, '');

    assert.ok(page.root.bulkAssignment.showConfirmUploadButton);
  });

  test('upload user warnings', async function (assert) {
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();
    this.server.create('user', {
      firstName: 'jasper',
      lastName: 'johnson',
      campusId: '1234567890',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'jackson',
      lastName: 'johnson',
      campusId: '12345',
      cohortIds: [1],
    });
    const users = [
      ['jasper J', 'johnson', '1234567890', '123Test'],
      ['jackson', 'johnson the seconds', '12345'],
    ];
    await triggerUpload(users);
    await waitFor('[data-test-upload-data-valid-users]');

    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers.length, 2);
    assert.ok(page.root.bulkAssignment.validUploadedUsers[0].hasWarning);
    assert.strictEqual(
      page.root.bulkAssignment.validUploadedUsers[0].firstName,
      'jasper (jasper J)',
    );
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].lastName, 'johnson');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].campusId, '1234567890');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[0].smallGroupName, '123Test');
    assert.ok(page.root.bulkAssignment.validUploadedUsers[1].hasWarning);
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].firstName, 'jackson');
    assert.strictEqual(
      page.root.bulkAssignment.validUploadedUsers[1].lastName,
      'johnson (johnson the seconds)',
    );
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].campusId, '12345');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers[1].smallGroupName, '');

    assert.ok(page.root.bulkAssignment.showConfirmUploadButton);
  });

  test('upload user errors', async function (assert) {
    assert.expect(8);
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();
    this.server.create('user', {
      firstName: 'jasper',
      lastName: 'johnson',
      campusId: '1234567890',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'jackson',
      lastName: 'johnson',
      campusId: '12345',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'jebediah',
      lastName: 'johnson',
      campusId: '666666',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'magick',
      lastName: 'johnson',
      campusId: '101010',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'mrs',
      lastName: 'maisel',
      campusId: '123456',
    });
    this.server.create('user', {
      firstName: 'dabney',
      lastName: 'middlefield',
      campusId: '232323',
      cohortIds: [1],
      learnerGroupIds: [1],
    });
    const users = [
      ['j', 'johnson', '1234567890', '123Test'],
      ['jackson', 'j', '12345'],
      ['', 'johnson', '666666', '123Test'],
      ['Magick', '', '101010'],
      ['Missing', 'Person', 'abcd'],
      ['mrs', 'maisel', '123456'],
      ['j', 'johnson', '1234567890', 'anothergroup'],
      ['dabney', 'middlefield', '232323'],
    ];
    await triggerUpload(users);
    await waitFor('[data-test-upload-data-invalid-users]');

    assert.strictEqual(page.root.bulkAssignment.invalidUploadedUsers.length, 6);
    assert.strictEqual(
      page.root.bulkAssignment.invalidUploadedUsers[0].errors,
      'First Name is required',
    );
    assert.strictEqual(
      page.root.bulkAssignment.invalidUploadedUsers[1].errors,
      'Last Name is required',
    );
    assert.strictEqual(
      page.root.bulkAssignment.invalidUploadedUsers[2].errors,
      'Could not find a user with the campusId abcd',
    );
    assert.strictEqual(
      page.root.bulkAssignment.invalidUploadedUsers[3].errors,
      "User is not in this group's cohort: class of this year",
    );
    assert.strictEqual(
      page.root.bulkAssignment.invalidUploadedUsers[4].errors,
      'This user already exists in the upload.',
    );
    assert.strictEqual(
      page.root.bulkAssignment.invalidUploadedUsers[5].errors,
      'User already exists in top-level group group 1 or one of its subgroups.',
    );
    assert.notOk(page.root.bulkAssignment.showConfirmUploadButton);
    await percySnapshot(assert);
  });

  test('choose small group match', async function (assert) {
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();
    this.server.create('user', {
      firstName: 'jasper',
      lastName: 'johnson',
      campusId: '1234567890',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'jackson',
      lastName: 'johnson',
      campusId: '12345',
      cohortIds: [1],
    });
    const users = [
      ['jasper', 'johnson', '1234567890', '123Test'],
      ['jackson', 'johnson', '12345', '123Test'],
    ];
    await triggerUpload(users);
    await waitFor('[data-test-upload-data-valid-users]');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers.length, 2);
    await page.root.bulkAssignment.confirmUploadedUsers();
    assert.strictEqual(page.root.bulkAssignment.groupsToMatch.length, 1);
    await page.root.bulkAssignment.groupsToMatch[0].chooseGroup('3');
    assert.strictEqual(page.root.bulkAssignment.groupsToMatch[0].selected, 'group 1 child 1');
    await page.root.bulkAssignment.groupsToMatch[0].chooseGroup('2');
    assert.strictEqual(page.root.bulkAssignment.groupsToMatch[0].selected, 'group 1 child 0');
  });

  test('finalize and save', async function (assert) {
    assert.expect(18);
    this.server.create('user', {
      firstName: 'jasper',
      lastName: 'johnson',
      campusId: '1234567890',
      cohortIds: [1],
    });
    this.server.create('user', {
      firstName: 'jackson',
      lastName: 'johnson',
      displayName: 'Jackson McFly',
      campusId: '12345',
      cohortIds: [1],
    });
    const users = [
      ['jasper', 'johnson', '1234567890'],
      ['jackson', 'johnson', '12345', '123Test'],
    ];
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();

    await triggerUpload(users);
    await waitFor('[data-test-upload-data-valid-users]');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers.length, 2);
    await page.root.bulkAssignment.confirmUploadedUsers();
    assert.strictEqual(page.root.bulkAssignment.groupsToMatch.length, 1);
    await page.root.bulkAssignment.groupsToMatch[0].chooseGroup('3');

    assert.strictEqual(page.root.bulkAssignment.finalData.length, 2);
    assert.strictEqual(
      page.root.bulkAssignment.finalData[0].user.userNameInfo.fullName,
      'jasper M. johnson',
    );
    assert.notOk(page.root.bulkAssignment.finalData[0].user.userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.root.bulkAssignment.finalData[0].campusId, '1234567890');
    assert.strictEqual(page.root.bulkAssignment.finalData[0].groupName, 'group 1');
    assert.strictEqual(
      page.root.bulkAssignment.finalData[1].user.userNameInfo.fullName,
      'Jackson McFly',
    );
    assert.ok(page.root.bulkAssignment.finalData[1].user.userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.root.bulkAssignment.finalData[1].campusId, '12345');
    assert.strictEqual(page.root.bulkAssignment.finalData[1].groupName, 'group 1 child 1');
    assert.ok(page.root.bulkAssignment.canSubmitFinalData);
    assert.strictEqual(this.server.db.learnerGroups[0].userIds, null);
    assert.strictEqual(this.server.db.learnerGroups[1].userIds, null);
    assert.strictEqual(this.server.db.learnerGroups[2].userIds, null);
    await percySnapshot(assert);

    await page.root.bulkAssignment.submitFinalData();
    assert.deepEqual(this.server.db.learnerGroups[0].userIds, ['2', '3']);
    assert.deepEqual(this.server.db.learnerGroups[1].userIds, null);
    assert.deepEqual(this.server.db.learnerGroups[2].userIds, ['3']);
    await percySnapshot(assert);
  });

  test('create a new group when requested', async function (assert) {
    assert.expect(14);
    this.server.create('user', {
      firstName: 'jackson',
      lastName: 'johnson',
      campusId: '12345',
      cohortIds: [1],
    });
    const users = [['jackson', 'johnson', '12345', '123Test']];
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();

    await triggerUpload(users);
    await waitFor('[data-test-upload-data-valid-users]');
    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers.length, 1);
    await page.root.bulkAssignment.confirmUploadedUsers();
    assert.strictEqual(page.root.bulkAssignment.groupsToMatch.length, 1);
    assert.strictEqual(this.server.db.learnerGroups.length, 3);
    assert.strictEqual(this.server.db.learnerGroups[0].userIds, null);
    await page.root.bulkAssignment.groupsToMatch[0].createNewGroup();
    assert.strictEqual(this.server.db.learnerGroups.length, 4);
    assert.strictEqual(this.server.db.learnerGroups[3].userIds, null);

    assert.strictEqual(page.root.bulkAssignment.finalData.length, 1);
    assert.strictEqual(page.root.bulkAssignment.finalData[0].groupName, '123Test');
    assert.ok(page.root.bulkAssignment.canSubmitFinalData);

    await page.root.bulkAssignment.submitFinalData();
    assert.deepEqual(this.server.db.learnerGroups[0].userIds, ['2']);
    assert.strictEqual(this.server.db.learnerGroups[1].userIds, null);
    assert.strictEqual(this.server.db.learnerGroups[2].userIds, null);
    assert.strictEqual(this.server.db.learnerGroups[3].title, '123Test');
    assert.deepEqual(this.server.db.learnerGroups[3].userIds, ['2']);
  });

  test('small group matches are trimmed', async function (assert) {
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();
    const users = this.server.createList('user', 4, {
      cohortIds: [1],
    });
    const data = users.map((obj) => {
      return [obj.firstName, obj.lastName, obj.campusId];
    });
    data[0].push('group 1 child 0');
    data[1].push('group 1 child 1');
    data[2].push('group 1 child 1 ');
    data[3].push(' group 1 child 1');
    await triggerUpload(data);
    await waitFor('[data-test-upload-data-valid-users]');
    await page.root.bulkAssignment.confirmUploadedUsers();
    assert.strictEqual(page.root.bulkAssignment.groupsToMatch.length, 2);
  });

  test('ignore blank lines #3684', async function (assert) {
    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.bulkAssignment.click();
    this.server.create('user', {
      firstName: 'jasper',
      lastName: 'johnson',
      campusId: '1234567890',
      cohortIds: [1],
    });
    const users = [
      ['jasper', 'johnson', '1234567890', '123Test'],
      [' ', '   ', '', '  '],
      [' ', '  ', '', ' '],
      [' ', '   ', '', '  '],
      ['', '   ', '', '  '],
    ];
    await triggerUpload(users);
    await waitFor('[data-test-upload-data-valid-users]');

    assert.strictEqual(page.root.bulkAssignment.validUploadedUsers.length, 1);
    assert.ok(page.root.bulkAssignment.validUploadedUsers[0].isValid);
    assert.strictEqual(page.root.bulkAssignment.invalidUploadedUsers.length, 0);
    assert.ok(page.root.bulkAssignment.showConfirmUploadButton);
  });
});
