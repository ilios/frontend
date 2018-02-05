import { test } from 'qunit';
import setupAuthentication from '../helpers/setup-authentication';
import moduleForAcceptance from '../helpers/module-for-acceptance';
import page from '../pages/learner-group';
import wait from 'ember-test-helpers/wait';

moduleForAcceptance('Acceptance | learner group bulk assign', {
  beforeEach() {
    const school = server.create('school', {
      title: 'school 0'
    });
    setupAuthentication(this.application, {
      id: 1,
      schoolId: 1
    });

    const program = server.create('program', {
      title: 'program 0',
      school,
    });
    const programYear = server.create('program-year', {
      program,
    });
    const cohort =server.create('cohort', {
      title: 'class of this year',
      programYear,
    });
    const group1 = server.create('learner-group', {
      title: 'group 1',
      cohort,
    });
    server.create('learnerGroup', {
      title: 'group 1 child 0',
      cohort,
      parent: group1,
    });
    server.create('learnerGroup', {
      title: 'group 1 child 1',
      cohort,
      parent: group1,
    });
  }
});

let createFile = function(users){
  let file;
  let lines = users.map(arr => {
    return arr.join("\t");
  });

  let contents = lines.join("\n");
  file = new Blob([contents], { type: 'text/plain' });

  file.mime = 'text/plain';
  file.name = 'test.txt';
  return file;
};

let triggerUpload = async function(users, inputElement){
  let file = createFile(users);
  inputElement.triggerHandler({
    type: 'change',
    target: {
      files: {
        0: file,
        length: 1,
        item() { return file; }
      }
    }
  });
  await wait();
  await wait();
  await wait();
};

test('upload users', async function (assert) {
  await page.visit({ learnerGroupId: 1 });
  await page.activateBulkAssign();
  const input = await find('[data-test-user-upload]');
  server.create('user', {
    firstName: 'jasper',
    lastName: 'johnson',
    campusId: '1234567890',
    cohortIds: [1],
  });
  server.create('user', {
    firstName: 'jackson',
    lastName: 'johnson',
    campusId: '12345',
    cohortIds: [1],
  });
  let users = [
    ['jasper', 'johnson', '1234567890', '123Test'],
    ['jackson', 'johnson', '12345'],
  ];
  await triggerUpload(users, input);
  assert.equal(page.bulkAssign.validUploadedUsers().count, 2);
  assert.equal(page.bulkAssign.validUploadedUsers(0).firstName, 'jasper');
  assert.equal(page.bulkAssign.validUploadedUsers(0).lastName, 'johnson');
  assert.equal(page.bulkAssign.validUploadedUsers(0).campusId, '1234567890');
  assert.equal(page.bulkAssign.validUploadedUsers(0).smallGroupName, '123Test');
  assert.equal(page.bulkAssign.validUploadedUsers(1).firstName, 'jackson');
  assert.equal(page.bulkAssign.validUploadedUsers(1).lastName, 'johnson');
  assert.equal(page.bulkAssign.validUploadedUsers(1).campusId, '12345');
  assert.equal(page.bulkAssign.validUploadedUsers(1).smallGroupName, '');

  assert.ok(page.bulkAssign.showConfirmUploadButton);
});

test('upload user errors', async function (assert) {
  await page.visit({ learnerGroupId: 1 });
  await page.activateBulkAssign();
  const input = await find('[data-test-user-upload]');
  server.create('user', {
    firstName: 'jasper',
    lastName: 'johnson',
    campusId: '1234567890',
    cohortIds: [1],
  });
  server.create('user', {
    firstName: 'jackson',
    lastName: 'johnson',
    campusId: '12345',
    cohortIds: [1],
  });
  server.create('user', {
    firstName: 'mrs',
    lastName: 'maisel',
    campusId: '123456',
  });
  let users = [
    ['j', 'johnson', '1234567890', '123Test'],
    ['jackson', 'j', '12345'],
    ['', 'johnson', '12345', '123Test'],
    ['Magick', '', '12345'],
    ['Missing', 'Person', 'abcd'],
    ['mrs', 'maisel', '123456'],
  ];
  await triggerUpload(users, input);

  assert.equal(page.bulkAssign.invalidUploadedUsers().count, 6);
  assert.equal(page.bulkAssign.invalidUploadedUsers(0).errors, 'First Name does not match user record: jasper');
  assert.equal(page.bulkAssign.invalidUploadedUsers(1).errors, 'Last Name does not match user record: johnson');
  assert.equal(page.bulkAssign.invalidUploadedUsers(2).errors, 'First Name is required');
  assert.equal(page.bulkAssign.invalidUploadedUsers(3).errors, 'Last Name is required');
  assert.equal(page.bulkAssign.invalidUploadedUsers(4).errors, 'Could not find a user with the campusId abcd');
  assert.equal(page.bulkAssign.invalidUploadedUsers(5).errors, "User is not in this group's cohort: class of this year");
  assert.notOk(page.bulkAssign.showConfirmUploadButton);
});

test('choose small group match', async function (assert) {
  await page.visit({ learnerGroupId: 1 });
  await page.activateBulkAssign();
  const input = await find('[data-test-user-upload]');
  server.create('user', {
    firstName: 'jasper',
    lastName: 'johnson',
    campusId: '1234567890',
    cohortIds: [1],
  });
  server.create('user', {
    firstName: 'jackson',
    lastName: 'johnson',
    campusId: '12345',
    cohortIds: [1],
  });
  let users = [
    ['jasper', 'johnson', '1234567890', '123Test'],
    ['jackson', 'johnson', '12345', '123Test'],
  ];
  await triggerUpload(users, input);
  assert.equal(page.bulkAssign.validUploadedUsers().count, 2);
  await page.bulkAssign.confirmUploadedUsers();
  assert.equal(page.bulkAssign.groupsToMatch().count, 1);
  await page.bulkAssign.groupsToMatch(0).chooseGroup('group 1 child 1');
});

test('finalize and save', async function (assert) {
  assert.expect(16);
  server.create('user', {
    firstName: 'jasper',
    lastName: 'johnson',
    campusId: '1234567890',
    cohortIds: [1],
  });
  server.create('user', {
    firstName: 'jackson',
    lastName: 'johnson',
    campusId: '12345',
    cohortIds: [1],
  });
  let users = [
    ['jasper', 'johnson', '1234567890'],
    ['jackson', 'johnson', '12345', '123Test'],
  ];
  await page.visit({ learnerGroupId: 1 });
  await page.activateBulkAssign();
  const input = await find('[data-test-user-upload]');

  await triggerUpload(users, input);
  assert.equal(page.bulkAssign.validUploadedUsers().count, 2);
  await page.bulkAssign.confirmUploadedUsers();
  assert.equal(page.bulkAssign.groupsToMatch().count, 1);
  await page.bulkAssign.groupsToMatch(0).chooseGroup('group 1 child 1');

  assert.equal(page.bulkAssign.finalData().count, 2);
  assert.equal(page.bulkAssign.finalData(0).name, 'jasper M. johnson');
  assert.equal(page.bulkAssign.finalData(0).campusId, '1234567890');
  assert.equal(page.bulkAssign.finalData(0).groupName, 'group 1');
  assert.equal(page.bulkAssign.finalData(1).name, 'jackson M. johnson');
  assert.equal(page.bulkAssign.finalData(1).campusId, '12345');
  assert.equal(page.bulkAssign.finalData(1).groupName, 'group 1 child 1');
  assert.ok(page.bulkAssign.canSubmitFinalData);
  assert.equal( server.db.learnerGroups[0].userIds, null);
  assert.equal( server.db.learnerGroups[1].userIds, null);
  assert.equal( server.db.learnerGroups[2].userIds, null);

  await page.bulkAssign.submitFinalData();
  assert.deepEqual( server.db.learnerGroups[0].userIds, ['2', '3']);
  assert.deepEqual( server.db.learnerGroups[1].userIds, null);
  assert.deepEqual( server.db.learnerGroups[2].userIds, ['3']);
});

test('catch user already in group and do not save', async function (assert) {
  assert.expect(11);
  server.create('user', {
    firstName: 'jasper',
    lastName: 'johnson',
    campusId: '1234567890',
    cohortIds: [1],
    learnerGroupIds: [1],
  });
  server.create('user', {
    firstName: 'jackson',
    lastName: 'johnson',
    campusId: '12345',
    cohortIds: [1],
    learnerGroupIds: [3],
  });
  let users = [
    ['jasper', 'johnson', '1234567890'],
    ['jackson', 'johnson', '12345', '123Test'],
  ];
  await page.visit({ learnerGroupId: 1 });
  await page.activateBulkAssign();
  const input = await find('[data-test-user-upload]');

  await triggerUpload(users, input);
  assert.equal(page.bulkAssign.validUploadedUsers().count, 2);
  await page.bulkAssign.confirmUploadedUsers();
  assert.equal(page.bulkAssign.groupsToMatch().count, 1);
  await page.bulkAssign.groupsToMatch(0).chooseGroup('group 1 child 1');

  assert.equal(page.bulkAssign.finalData().count, 0);

  assert.equal(page.bulkAssign.finalErrorData().count, 2);
  assert.equal(page.bulkAssign.finalErrorData(0).name, 'jasper M. johnson');
  assert.equal(page.bulkAssign.finalErrorData(0).campusId, '1234567890');
  assert.equal(page.bulkAssign.finalErrorData(0).error, 'Already in the group 1 group. Please remove them and try again.');
  assert.equal(page.bulkAssign.finalErrorData(1).name, 'jackson M. johnson');
  assert.equal(page.bulkAssign.finalErrorData(1).campusId, '12345');
  assert.equal(page.bulkAssign.finalErrorData(1).error, 'Already in the group 1 group. Please remove them and try again.');

  assert.notOk(page.bulkAssign.canSubmitFinalData);

});

test('create a new group when requested', async function (assert) {
  assert.expect(14);
  server.create('user', {
    firstName: 'jackson',
    lastName: 'johnson',
    campusId: '12345',
    cohortIds: [1],
  });
  let users = [
    ['jackson', 'johnson', '12345', '123Test'],
  ];
  await page.visit({ learnerGroupId: 1 });
  await page.activateBulkAssign();
  const input = await find('[data-test-user-upload]');

  await triggerUpload(users, input);
  assert.equal(page.bulkAssign.validUploadedUsers().count, 1);
  await page.bulkAssign.confirmUploadedUsers();
  assert.equal(page.bulkAssign.groupsToMatch().count, 1);
  assert.equal( server.db.learnerGroups.length, 3);
  assert.equal(server.db.learnerGroups[0].userIds, null);
  await page.bulkAssign.groupsToMatch(0).createNewGroup();
  assert.equal( server.db.learnerGroups.length, 4);
  assert.equal( server.db.learnerGroups[3].userIds, null);

  assert.equal(page.bulkAssign.finalData().count, 1);
  assert.equal(page.bulkAssign.finalData(0).groupName, '123Test');
  assert.ok(page.bulkAssign.canSubmitFinalData);


  await page.bulkAssign.submitFinalData();
  assert.deepEqual( server.db.learnerGroups[0].userIds, ['2']);
  assert.equal( server.db.learnerGroups[1].userIds, null);
  assert.equal( server.db.learnerGroups[2].userIds, null);
  assert.equal( server.db.learnerGroups[3].title, '123Test');
  assert.deepEqual( server.db.learnerGroups[3].userIds, ['2']);
});
