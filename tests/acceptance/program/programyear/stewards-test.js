import { click, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
const url = '/programs/1/programyears/1?pyStewardDetails=true';

module('Acceptance: Program Year - Stewards', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.create('school');
    this.server.create('program', {
      school: this.school,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programId: 1});
    this.server.create('department', {
      school: this.school,
    });
    this.server.create('department', {
      school: this.school,
    });
    this.server.create('department', {
      schoolId: 2,
    });
    this.server.create('department', {
      schoolId: 3
    });
    this.server.createList('department', 5, {
      school: this.school,
    });
    this.server.create('programYearSteward', {
      programYearId: 1,
      school: this.school,
      departmentId: 1
    });
    this.server.create('programYearSteward', {
      programYearId: 1,
      schoolId: 2,
      departmentId: 3
    });
    this.server.create('programYearSteward', {
      programYearId: 1,
      schoolId: 3
    });
  });

  test('list', async function(assert) {
    assert.expect(2);
    const container = '.detail-stewards';
    const title = `${container} .title`;
    const list = `${container} .static-list`;

    await visit(url);
    assert.equal(await getElementText(title), getText('Stewarding Schools and Departments (3)'));
    assert.equal(await getElementText(list), getText('school 0 department 0 school 1 department 2 school 2'));

  });

  test('save', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    const container = '.detail-stewards';
    const manage = `${container} .actions button`;
    const save = `${container} .bigadd`;
    const selected = `${container} .remove-list`;
    const available = `${container} .add-list`;
    const department1 = `${available} li:nth-of-type(1) ul li:nth-of-type(1)`;
    const department0 = `${selected} li:nth-of-type(1) ul li:nth-of-type(1)`;
    const list = `${container} .static-list`;

    await visit(url);
    await click(manage);
    assert.equal(await getElementText(available), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 0 school 1 department 2 school 2'));
    await click(department1);
    await click(department0);
    assert.equal(await getElementText(available), getText('school 0 department 0 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 1 school 1 department 2 school 2'));
    await click(save);
    assert.equal(await getElementText(list), getText('school 0 department 1 school 1 department 2 school 2'));

  });

  test('select school and all departments', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    const container = '.detail-stewards';
    const manage = `${container} .actions button`;
    const save = `${container} .bigadd`;
    const selected = `${container} .remove-list`;
    const available = `${container} .add-list`;
    const school0 = `${available} li:nth-of-type(1) .clickable`;
    const list = `${container} .static-list`;
    await visit(url);
    await click(manage);
    await click(school0);
    assert.equal(await getElementText(available), getText('school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
    await click(save);
    assert.equal(await getElementText(list), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
  });

  test('select all departments but not school', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    const container = '.detail-stewards';
    const manage = `${container} .actions button`;
    const save = `${container} .bigadd`;
    const selected = `${container} .remove-list`;
    const available = `${container} .add-list`;
    const departments = `${available} li:nth-of-type(1) ul li`;
    const department1 = `${departments}:nth-of-type(1)`;
    const department4 = `${departments}:nth-of-type(1)`;
    const department5 = `${departments}:nth-of-type(1)`;
    const department6 = `${departments}:nth-of-type(1)`;
    const department7 = `${departments}:nth-of-type(1)`;
    const department8 = `${departments}:nth-of-type(1)`;
    const list = `${container} .static-list`;
    await visit(url);
    await click(manage);
    await click(department1);
    await click(department4);
    await click(department5);
    await click(department6);
    await click(department7);
    await click(department8);
    assert.equal(await getElementText(available), getText('school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
    await click(save);
    assert.equal(await getElementText(list), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
  });

  test('remove solo school with no departments', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    const container = '.detail-stewards';
    const manage = `${container} .actions button`;
    const save = `${container} .bigadd`;
    const selected = `${container} .remove-list`;
    const available = `${container} .add-list`;
    const school2 = `${selected} ul:nth-of-type(1)>li:nth-of-type(3) .removable`;
    const list = `${container} .static-list`;
    await visit(url);
    await click(manage);
    await click(school2);
    assert.equal(await getElementText(available), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 0 school 1 department 2'));
    await click(save);
    assert.equal(await getElementText(list), getText('school 0 department 0 school 1 department 2'));
  });

  test('cancel', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(6);
    const container = '.detail-stewards';
    const manage = `${container} .actions button`;
    const cancel = `${container} .bigcancel`;
    const selected = `${container} .remove-list`;
    const available = `${container} .add-list`;
    const department0 = `${selected} li:nth-of-type(1) ul li:nth-of-type(1)`;
    const department1 = `${available} li:nth-of-type(1) ul li:nth-of-type(1)`;
    const list = `${container} .static-list`;
    await visit(url);
    assert.equal(await getElementText(list), getText('school 0 department 0 school 1 department 2 school 2'));
    await click(manage);
    assert.equal(await getElementText(available), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 0 school 1 department 2 school 2'));
    await click(department1);
    await click(department0);
    assert.equal(await getElementText(available), getText('school 0 department 0 department 4 department 5 department 6 department 7 department 8 school 2 department 3'));
    assert.equal(await getElementText(selected), getText('school 0 department 1 school 1 department 2 school 2'));
    await click(cancel);
    assert.equal(await getElementText(list), getText('school 0 department 0 school 1 department 2 school 2'));
  });
});
