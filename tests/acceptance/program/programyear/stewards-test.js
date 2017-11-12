import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/programs/1/programyears/1?pyStewardDetails=true';
module('Acceptance: Program Year - Stewards', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.createList('school', 2);
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', { programId: 1});
    server.create('department', {
      schoolId: 1,
    });
    server.create('department', {
      schoolId: 1
    });
    server.create('department', {
      schoolId: 2,
    });
    server.create('department', {
      schoolId: 3
    });
    server.createList('department', 5, {
      schoolId: 1
    });
    server.create('programYearSteward', {
      programYearId: 1,
      schoolId: 1,
      departmentId: 1
    });
    server.create('programYearSteward', {
      programYearId: 1,
      schoolId: 2,
      departmentId: 3
    });
    server.create('programYearSteward', {
      programYearId: 1,
      schoolId: 3
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list', async function(assert) {
  assert.expect(2);
  const container = '.detail-stewards';
  const title = `${container} .title`;
  const list = `${container} .static-list`;

  await visit(url);
  assert.equal(getElementText(title), getText('Stewarding Schools and Departments (3)'));
  assert.equal(getElementText(list), getText('school 0 department 0 school 1 department 2 school 2'));

});

test('save', async function(assert) {
  assert.expect(5);
  const container = '.detail-stewards';
  const manage = `${container} .actions button`;
  const save = `${container} .bigadd`;
  const selected = `${container} .remove-list`;
  const available = `${container} .add-list`;
  const department1 = `${available} li:eq(0) ul li:eq(0)`;
  const department0 = `${selected} li:eq(0) ul li:eq(0)`;
  const list = `${container} .static-list`;

  await visit(url);
  await click(manage);
  assert.equal(getElementText(available), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 0 school 1 department 2 school 2'));
  await click(department1);
  await click(department0);
  assert.equal(getElementText(available), getText('school 0 department 0 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 1 school 1 department 2 school 2'));
  await click(save);
  assert.equal(getElementText(list), getText('school 0 department 1 school 1 department 2 school 2'));

});

test('select school and all departments', async function(assert) {
  assert.expect(3);
  const container = '.detail-stewards';
  const manage = `${container} .actions button`;
  const save = `${container} .bigadd`;
  const selected = `${container} .remove-list`;
  const available = `${container} .add-list`;
  const school0 = `${available} li:eq(0) .clickable`;
  const list = `${container} .static-list`;
  await visit(url);
  await click(manage);
  await click(school0);
  assert.equal(getElementText(available), getText('school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
  await click(save);
  assert.equal(getElementText(list), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
});

test('select all departments but not school', async function(assert) {
  assert.expect(3);
  const container = '.detail-stewards';
  const manage = `${container} .actions button`;
  const save = `${container} .bigadd`;
  const selected = `${container} .remove-list`;
  const available = `${container} .add-list`;
  const departments = `${available} li:eq(0) ul li`;
  const department1 = `${departments}:eq(0)`;
  const department4 = `${departments}:eq(0)`;
  const department5 = `${departments}:eq(0)`;
  const department6 = `${departments}:eq(0)`;
  const department7 = `${departments}:eq(0)`;
  const department8 = `${departments}:eq(0)`;
  const list = `${container} .static-list`;
  await visit(url);
  await click(manage);
  await click(department1);
  await click(department4);
  await click(department5);
  await click(department6);
  await click(department7);
  await click(department8);
  assert.equal(getElementText(available), getText('school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
  await click(save);
  assert.equal(getElementText(list), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
});

test('remove solo school with no departments', async function(assert) {
  assert.expect(3);
  const container = '.detail-stewards';
  const manage = `${container} .actions button`;
  const save = `${container} .bigadd`;
  const selected = `${container} .remove-list`;
  const available = `${container} .add-list`;
  const school2 = `${selected} ul:eq(0)>li:eq(2) .removable`;
  const list = `${container} .static-list`;
  await visit(url);
  await click(manage);
  await click(school2);
  assert.equal(getElementText(available), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 0 school 1 department 2'));
  await click(save);
  assert.equal(getElementText(list), getText('school 0 department 0 school 1 department 2'));
});

test('cancel', async function(assert) {
  assert.expect(6);
  const container = '.detail-stewards';
  const manage = `${container} .actions button`;
  const cancel = `${container} .bigcancel`;
  const selected = `${container} .remove-list`;
  const available = `${container} .add-list`;
  const department0 = `${selected} li:eq(0) ul li:eq(0)`;
  const department1 = `${available} li:eq(0) ul li:eq(0)`;
  const list = `${container} .static-list`;
  await visit(url);
  assert.equal(getElementText(list), getText('school 0 department 0 school 1 department 2 school 2'));
  await click(manage);
  assert.equal(getElementText(available), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 0 school 1 department 2 school 2'));
  await click(department1);
  await click(department0);
  assert.equal(getElementText(available), getText('school 0 department 0 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
  assert.equal(getElementText(selected), getText('school 0 department 1 school 1 department 2 school 2'));
  await click(cancel);
  assert.equal(getElementText(list), getText('school 0 department 0 school 1 department 2 school 2'));
});
