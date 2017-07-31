import destroyApp from '../../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

const { run } = Ember;
var application;
let url = '/courses/1/sessions/1/publicationcheck';
module('Acceptance: Session - Publication Check', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('course', {
      sessions: [1]
    });
    server.create('vocabulary', {
      terms: [1],
      school: 1,
    });
    server.createList('sessionType', 2, {
      school: 1
    });
    server.create('sessionDescription', {
      session: 1,
    });
    server.create('school', {
      sessionTypes: [1,2],
      vocabularies: [1],
    });
    server.create('offering', {
      sessions: [1],
    });
    server.create('objective', {
      sessions: [1],
    });
    server.create('term', {
      sessions: [1],
      vocabulary: 1,
    });
    server.create('meshDescriptor', {
      sessions: [1],
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('full session count', async function(assert) {
  server.create('session', {
    course: 1,
    offerings: [1],
    objectives: [1],
    terms: [1],
    meshDescriptors: [1],
    sessionType: 1,
    sessionDescription: 1
  });
  await visit(url);
  assert.equal(currentPath(), 'course.session.publicationCheck');
  var items = find('.session-publicationcheck table tbody td');
  assert.equal(getElementText(items.eq(0)), getText('session 0'));
  assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
  assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
  assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
  assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
});

test('empty session count', async function(assert) {
  //create 2 because the second one is empty
  server.createList('session', 2, {
    course: 1
  });
  server.db.courses.update(1, {sessions: [1, 2]});
  await visit('/courses/1/sessions/2/publicationcheck');
  assert.equal(currentPath(), 'course.session.publicationCheck');
  var items = find('.session-publicationcheck table tbody td');
  assert.equal(getElementText(items.eq(0)), getText('session 1'));
  assert.equal(getElementText(items.eq(1)), getText('No'));
  assert.equal(getElementText(items.eq(2)), getText('No'));
  assert.equal(getElementText(items.eq(3)), getText('No'));
  assert.equal(getElementText(items.eq(4)), getText('No'));
});

//also test all the session overview fields (Issue #496)
test('check fields', async function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1,
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.publicationCheck');
  var container = find('.session-overview');
  assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
  assert.equal(getElementText(find('.sessiondescription .content', container)), getText('session description 0'));
  assert.equal(find('.sessionilmhours', container).length, 0);
});

test('check remove ilm', async function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.publicationCheck');
  var container = find('.session-overview');
  assert.equal(find('.sessionilmhours', container).length, 1);
  assert.equal(find('.sessionilmduedate', container).length, 1);
  var dueDate = moment(ilmSession.dueDate).format('L');
  assert.equal(getElementText(find('.sessionilmhours .content', container)), ilmSession.hours);
  assert.equal(getElementText(find('.sessionilmduedate .editable', container)), dueDate);
  await click(find('.independentlearningcontrol .switch-handle', container));
  assert.equal(find('.sessionilmhours', container).length, 0);
  assert.equal(find('.sessionilmduedate', container).length, 0);
});

test('check add ilm', async function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1,
    description: 'some text',
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.publicationCheck');
  var container = find('.session-overview');
  await click(find('.independentlearningcontrol .switch-handle', container));
  assert.equal(find('.sessionilmhours', container).length, 1);
  assert.equal(find('.sessionilmduedate', container).length, 1);
  assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
});

test('change ilm hours', async function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.publicationCheck');
  assert.equal(find('.sessionilmhours', container).length, 1);
  var container = find('.session-overview .sessionilmhours');
  assert.equal(getElementText(find('.content', container)), ilmSession.hours);
  await click(find('.editable', container));
  var input = find('.editinplace input', container);
  assert.equal(getText(input.val()), ilmSession.hours);
  await fillIn(input, 23);
  await click(find('.editinplace .actions .done', container));
  assert.equal(getElementText(find('.content', container)), 23);
});

test('change ilm due date', async function(assert) {
  var ilmSession = server.create('ilmSession', {
    session: 1
  });
  server.create('session', {
    course: 1,
    ilmSession: 1
  });
  await visit(url);
  var container = find('.session-overview .sessionilmduedate');
  var dueDate = moment(ilmSession.dueDate).format('L');
  assert.equal(getElementText(find('.editable', container)), dueDate);
  await click(find('.editable', container));
  var input = find('.editinplace input', container);
  assert.equal(getText(input.val()), getText(dueDate));
  var interactor = openDatepicker(find('input', container));
  assert.equal(interactor.selectedYear(), moment(ilmSession.dueDate).format('YYYY'));
  var newDate = moment(ilmSession.dueDate).add(1, 'year').add(1, 'month');
  interactor.selectDate(newDate.toDate());
  await click(find('.editinplace .actions .done', container));
  assert.equal(getElementText(find('.editable', container)), newDate.format('L'));
});

test('change title', async function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  await visit(url);
  let container = find('.session-header .title');
  assert.equal(getElementText(container), getText('session 0'));
  await click(find('.editable', container));
  let input = find('.editinplace input', container);
  assert.equal(getText(input.val()), getText('session 0'));
  await fillIn(input, 'test new title');
  await click(find('.done', container));
  assert.equal(getElementText(container), getText('test new title'));
});

test('change type', async function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  await visit(url);
  var container = find('.session-overview');
  assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 1'));
  await click(find('.sessiontype .editable', container));
  let options = find('.sessiontype select option', container);
  assert.equal(options.length, 2);
  assert.equal(getElementText(options.eq(0)), getText('session type 0'));
  assert.equal(getElementText(options.eq(1)), getText('session type 1'));
  await pickOption(find('.sessiontype select', container), 'session type 0', assert);
  await click(find('.sessiontype .actions .done', container));
  assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
});



test('session attributes are shown by school config', async assert => {
  assert.expect(4);
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionSupplemental',
    value: true
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionSpecialAttireRequired',
    value: true
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionSpecialEquipmentRequired',
    value: true
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionAttendanceRequired',
    value: true
  });
  server.db.schools.update(1, {
    configurations: [1, 2, 3, 4]
  });
  const sessionOverview = '.session-overview';
  const supplementalToggle = `${sessionOverview} .sessionsupplemental .switch`;
  const specialAttireToggle = `${sessionOverview} .sessionspecialattire .switch`;
  const specialEquiptmentToggle = `${sessionOverview} .sessionspecialequipment .switch`;
  const attendanceRequiredToggle = `${sessionOverview} .sessionattendancerequired .switch`;

  await visit(url);
  assert.equal(find(supplementalToggle).length, 1, 'control hidden');
  assert.equal(find(specialAttireToggle).length, 1, 'control hidden');
  assert.equal(find(specialEquiptmentToggle).length, 1, 'control hidden');
  assert.equal(find(attendanceRequiredToggle).length, 1, 'control hidden');
});

test('session attributes are hidden by school config', async assert => {
  assert.expect(4);
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionSupplemental',
    value: false
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionSpecialAttireRequired',
    value: false
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionSpecialEquipmentRequired',
    value: false
  });
  server.create('schoolConfig', {
    school: 1,
    name: 'showSessionAttendanceRequired',
    value: false
  });
  server.db.schools.update(1, {
    configurations: [1, 2, 3, 4]
  });
  const sessionOverview = '.session-overview';
  const supplementalToggle = `${sessionOverview} .sessionsupplemental .switch`;
  const specialAttireToggle = `${sessionOverview} .sessionspecialattire .switch`;
  const specialEquiptmentToggle = `${sessionOverview} .sessionspecialequipment .switch`;
  const attendanceRequiredToggle = `${sessionOverview} .sessionattendancerequired .switch`;

  await visit(url);
  assert.equal(find(supplementalToggle).length, 0, 'control hidden');
  assert.equal(find(specialAttireToggle).length, 0, 'control hidden');
  assert.equal(find(specialEquiptmentToggle).length, 0, 'control hidden');
  assert.equal(find(attendanceRequiredToggle).length, 0, 'control hidden');
});

test('session attributes are hidden when there is no school config', async assert => {
  assert.expect(4);
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });

  const sessionOverview = '.session-overview';
  const supplementalToggle = `${sessionOverview} .sessionsupplemental .switch`;
  const specialAttireToggle = `${sessionOverview} .sessionspecialattire .switch`;
  const specialEquiptmentToggle = `${sessionOverview} .sessionspecialequipment .switch`;
  const attendanceRequiredToggle = `${sessionOverview} .sessionattendancerequired .switch`;

  await visit(url);
  assert.equal(find(supplementalToggle).length, 0, 'control hidden');
  assert.equal(find(specialAttireToggle).length, 0, 'control hidden');
  assert.equal(find(specialEquiptmentToggle).length, 0, 'control hidden');
  assert.equal(find(attendanceRequiredToggle).length, 0, 'control hidden');
});

let testAttributeToggle = async function(assert, schoolVariableName, domclass){
  assert.expect(3);
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    course: 1,
    sessionType: 2
  });
  server.create('schoolConfig', {
    school: 1,
    name: schoolVariableName,
    value: true
  });
  server.db.schools.update(1, {
    configurations: [1]
  });
  const sessionOverview = '.session-overview';
  const toggle = `${sessionOverview} .${domclass} .switch`;
  const toggleValue = `${toggle} input`;

  await visit(url);
  assert.equal(find(toggleValue).length, 1, 'control exists');
  assert.ok(find(toggleValue).not(':checked'), 'initiall not checked');
  await click(toggle);
  assert.ok(find(toggleValue).is(':checked'), 'clicking changed state');
};

test('change suplimental', async assert => {
  await testAttributeToggle(assert, 'showSessionSupplemental', 'sessionsupplemental');
});

test('change special attire', async assert => {
  await testAttributeToggle(assert, 'showSessionSpecialAttireRequired', 'sessionspecialattire');
});

test('change special equipment', async assert => {
  await testAttributeToggle(assert, 'showSessionSpecialEquipmentRequired', 'sessionspecialequipment');
});

test('change attendance required', async assert => {
  await testAttributeToggle(assert, 'showSessionAttendanceRequired', 'sessionattendancerequired');
});

test('change description', async function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1,
    sessionDescription: 1
  });
  await visit(url);
  let description = getText('session description 0');
  let container = find('.session-overview .sessiondescription');
  assert.equal(getElementText(find('.content', container)), description);
  await click(find('.editable .clickable', container));
  //wait for the editor to load
  run.later(async ()=>{
    let editor = find('.sessiondescription .fr-box');
    let editorContents = editor.data('froala.editor').$el.text();
    assert.equal(getText(editorContents), description);
    editor.froalaEditor('html.set', 'test new description');
    editor.froalaEditor('events.trigger', 'contentChanged');
    await click(find('.editinplace .actions .done', container));
    assert.equal(getElementText(find('.content', container)), getText('test new description'));
  }, 100);
  await wait();
});

test('add description', async function(assert) {
  server.create('session', {
    course: 1,
    sessionType: 1
  });
  await visit(url);
  let container = find('.session-overview .sessiondescription');
  assert.equal(getElementText(container), getText('Description: Click to edit'));
  await click(find('.editable', container));
  run.later(async () => {
    let editor = find('.sessiondescription .fr-box');
    let editorContents = editor.data('froala.editor').$el.text();
    assert.equal(getText(editorContents), '');
    editor.froalaEditor('html.set', 'test new description');
    editor.froalaEditor('events.trigger', 'contentChanged');
    await click(find('.editinplace .actions .done', container));
    assert.equal(getElementText(container), getText('Description: test new description'));
  });
  await wait();
});
