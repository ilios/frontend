import { click, findAll, currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

const url = '/curriculum-inventory-reports/1';

module('Acceptance: Curriculum Inventory: Report', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.user = await setupAuthentication( { school } );
  });

  test('create new sequence block Issue #2108', async function(assert) {
    const developer = this.server.create('userRole', {
      title: 'developer'
    });
    this.server.db.users.update(this.user.id, {roles: [developer]});
    const program = this.server.create('program', {schoolId: 1});
    const report = this.server.create('curriculumInventoryReport', {program});
    this.server.create('curriculumInventorySequence', {report});

    const sequenceBlockList = '.curriculum-inventory-sequence-block-list';
    const addSequenceBlock = `${sequenceBlockList} .expand-button`;
    const newBlockForm = '.new-curriculum-inventory-sequence-block';
    const newFormTitle = `${newBlockForm} h2.title`;

    await visit(url);
    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.equal(findAll(newBlockForm).length, 0);
    assert.equal(findAll(newFormTitle).length, 0);
    await click(addSequenceBlock);
    assert.equal(findAll(newBlockForm).length, 1);
    assert.equal(findAll(newFormTitle).length, 1);
    assert.equal(await getElementText(newFormTitle), getText('New Sequence Block'));
  });


  test('rollover hidden from instructors', async function(assert) {
    this.server.create('program', {
      id: 1,
      'title': 'Doctor of Medicine',
    });
    const instructor = this.server.create('userRole', {
      title: 'instructor'
    });
    this.server.db.users.update(this.user.id, {roles: [instructor]});
    this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      programId: 1,
    });
    await visit(url);
    const container = '.curriculum-inventory-report-overview';
    const rollover = `${container} a.rollover`;

    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.equal(findAll(rollover).length, 0);
  });

  test('rollover visible to developers', async function (assert) {
    const developer = this.server.create('userRole', {
      title: 'developer'
    });
    this.server.db.users.update(this.user.id, {roles: [developer]});
    this.server.create('program', {
      id: 1,
      'title': 'Doctor of Medicine',
    });
    this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      programId: 1,
    });
    await visit(url);
    const container = '.curriculum-inventory-report-overview';
    const rollover = `${container} a.rollover`;

    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.equal(findAll(rollover).length, 1);
  });

  test('rollover not visible to course directors', async function(assert) {
    const director = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.db.users.update(this.user.id, {roles: [director]});
    this.server.create('program', {
      id: 1,
      'title': 'Doctor of Medicine',
    });
    this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      programId: 1,
    });
    await visit(url);
    const container = '.curriculum-inventory-report-overview';
    const rollover = `${container} a.rollover`;

    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.equal(findAll(rollover).length, 0);
  });

  test('rollover hidden on rollover route', async function(assert) {
    const director = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.db.users.update(this.user.id, {roles: [director]});
    this.server.create('program', {
      id: 1,
      'title': 'Doctor of Medicine',
    });
    this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      programId: 1,
    });
    await visit(`${url}/rollover`);
    const container = '.curriculum-inventory-report-overview';
    const rollover = `${container} a.rollover`;

    assert.equal(currentRouteName(), 'curriculumInventoryReport.rollover');
    assert.equal(findAll(rollover).length, 0);
  });
});
