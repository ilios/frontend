import destroyApp from '../../helpers/destroy-app';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/curriculum-inventory-reports/1';
module('Acceptance: Curriculum Inventory: Report', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
    server.create('school');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('create new sequence block Issue #2108', async function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    id: 1,
    users: [4136],
    title: 'developer',
  });
  server.create('program');
  server.create('curriculumInventoryReport');
  server.create('curriculumInventorySequence');

  const sequenceBlockList = '.curriculum-inventory-sequence-block-list';
  const addSequenceBlock = `${sequenceBlockList} .expand-button`;
  const newBlockForm = '.new-curriculum-inventory-sequence-block';
  const newFormTitle = `${newBlockForm} .new-result-title`;

  await visit(url);
  assert.equal(currentPath(), 'curriculumInventoryReport.index');
  assert.equal(find(newBlockForm).length, 0);
  assert.equal(find(newFormTitle).length, 0);
  await click(addSequenceBlock);
  assert.equal(find(newBlockForm).length, 1);
  assert.equal(find(newFormTitle).length, 1);
  assert.equal(getElementText(newFormTitle), getText('New Sequence Block'));
});


test('rollover hidden from instructors', async function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('program', {
    id: 1,
    'title': 'Doctor of Medicine',
  });
  server.create('userRole', {
    id: 1,
    users: [4136],
    title: 'instructor'
  });
  server.create('curriculumInventoryReport', {
    year: 2013,
    name: 'foo bar',
    description: 'lorem ipsum',
    program: 1,
  });
  await visit(url);
  const container = '.curriculum-inventory-report-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'curriculumInventoryReport.index');
  assert.equal(find(rollover).length, 0);
});

test('rollover visible to developers', async function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    id: 1,
    users: [4136],
    title: 'developer',
  });
  server.create('program', {
    id: 1,
    'title': 'Doctor of Medicine',
  });
  server.create('curriculumInventoryReport', {
    year: 2013,
    name: 'foo bar',
    description: 'lorem ipsum',
    program: 1,
  });
  await visit(url);
  const container = '.curriculum-inventory-report-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'curriculumInventoryReport.index');
  assert.equal(find(rollover).length, 1);
});

test('rollover not visible to course directors', async function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    id: 1,
    users: [4136],
    title: 'course director'
  });
  server.create('program', {
    id: 1,
    'title': 'Doctor of Medicine',
  });
  server.create('curriculumInventoryReport', {
    year: 2013,
    name: 'foo bar',
    description: 'lorem ipsum',
    program: 1,
  });
  await visit(url);
  const container = '.curriculum-inventory-report-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'curriculumInventoryReport.index');
  assert.equal(find(rollover).length, 0);
});

test('rollover hidden on rollover route', async function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    id: 1,
    users: [4136],
    title: 'course director'
  });
  server.create('program', {
    id: 1,
    'title': 'Doctor of Medicine',
  });
  server.create('curriculumInventoryReport', {
    year: 2013,
    name: 'foo bar',
    description: 'lorem ipsum',
    program: 1,
  });
  await visit(`${url}/rollover`);
  const container = '.curriculum-inventory-report-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'curriculumInventoryReport.rollover');
  assert.equal(find(rollover).length, 0);
});
