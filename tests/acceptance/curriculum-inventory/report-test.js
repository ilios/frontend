import { click, findAll, currentPath, visit } from '@ember/test-helpers';
import destroyApp from '../../helpers/destroy-app';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/curriculum-inventory-reports/1';

module('Acceptance: Curriculum Inventory: Report', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    this.server.create('school');
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('create new sequence block Issue #2108', async function(assert) {
    const developer = this.server.create('userRole', {
      title: 'developer'
    });
    this.server.db.users.update(4136, {roles: [developer]});
    const program = this.server.create('program', {schoolId: 1});
    const report = this.server.create('curriculumInventoryReport', {program});
    this.server.create('curriculumInventorySequence', {report});

    const sequenceBlockList = '.curriculum-inventory-sequence-block-list';
    const addSequenceBlock = `${sequenceBlockList} .expand-button`;
    const newBlockForm = '.new-curriculum-inventory-sequence-block';
    const newFormTitle = `${newBlockForm} h2.title`;

    await visit(url);
    assert.equal(currentPath(), 'curriculumInventoryReport.index');
    assert.equal(findAll(newBlockForm).length, 0);
    assert.equal(findAll(newFormTitle).length, 0);
    await click(addSequenceBlock);
    assert.equal(findAll(newBlockForm).length, 1);
    assert.equal(findAll(newFormTitle).length, 1);
    assert.equal(getElementText(newFormTitle), getText('New Sequence Block'));
  });


  test('rollover hidden from instructors', async function(assert) {
    this.server.create('program', {
      id: 1,
      'title': 'Doctor of Medicine',
    });
    const instructor = this.server.create('userRole', {
      title: 'instructor'
    });
    this.server.db.users.update(4136, {roles: [instructor]});
    this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      programId: 1,
    });
    await visit(url);
    const container = '.curriculum-inventory-report-overview';
    const rollover = `${container} a.rollover`;

    assert.equal(currentPath(), 'curriculumInventoryReport.index');
    assert.equal(findAll(rollover).length, 0);
  });

  test('rollover visible to developers', async function (assert) {
    const developer = this.server.create('userRole', {
      title: 'developer'
    });
    this.server.db.users.update(4136, {roles: [developer]});
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

    assert.equal(currentPath(), 'curriculumInventoryReport.index');
    assert.equal(findAll(rollover).length, 1);
  });

  test('rollover not visible to course directors', async function(assert) {
    const director = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.db.users.update(4136, {roles: [director]});
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

    assert.equal(currentPath(), 'curriculumInventoryReport.index');
    assert.equal(findAll(rollover).length, 0);
  });

  test('rollover hidden on rollover route', async function(assert) {
    const director = this.server.create('userRole', {
      title: 'course director'
    });
    this.server.db.users.update(4136, {roles: [director]});
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

    assert.equal(currentPath(), 'curriculumInventoryReport.rollover');
    assert.equal(findAll(rollover).length, 0);
  });
});
