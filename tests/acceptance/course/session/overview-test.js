import destroyApp from '../../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Overview', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
    server.create('school');
    server.create('academicYear');
    server.create('course', {
      schoolId: 1
    });
    fixtures.sessionTypes = server.createList('sessionType', 2, {
      schoolId: 1
    });
    fixtures.sessionDescription = server.create('sessionDescription');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', async function(assert) {
  server.create('user', {
    id: 4136,
  });
  server.create('userRole', {
    userIds: [4136],
    title: 'course director'
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1,
    sessionDescriptionId: 1,
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.index');
  var container = find('.session-overview');
  assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
  assert.equal(getElementText(find('.sessiondescription .content', container)), getText(fixtures.sessionDescription.description));
  assert.equal(find('.sessionilmhours', container).length, 0);
});

test('check remove ilm', async function(assert) {
  server.create('user', {
    id: 4136
  });
  var ilmSession = server.create('ilmSession');
  server.create('session', {
    courseId: 1,
    ilmSessionId: 1
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.index');
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
  server.create('user', {
    id: 4136
  });

  server.create('session', {
    courseId: 1,
    sessionTypeId: 1,
    description: 'some text',
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.index');
  var container = find('.session-overview');
  await click(find('.independentlearningcontrol .switch-handle', container));
  assert.equal(find('.sessionilmhours', container).length, 1);
  assert.equal(find('.sessionilmduedate', container).length, 1);
  assert.equal(find('.sessionassociatedgroups', container).length, 0);
  assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
});

test('change ilm hours', async function(assert) {
  server.create('user', {
    id: 4136
  });
  var ilmSession = server.create('ilmSession');
  server.create('session', {
    courseId: 1,
    ilmSessionId: 1
  });
  await visit(url);

  assert.equal(currentPath(), 'course.session.index');
  assert.equal(find('.sessionilmhours', container).length, 1);
  var container = find('.sessionilmhours');
  assert.equal(getElementText(find('.content', container)), ilmSession.hours);
  await click(find('.editable', container));
  var input = find('.editinplace input', container);
  assert.equal(getText(input.val()), ilmSession.hours);
  await fillIn(input, 23);
  await click(find('.editinplace .actions .done', container));
  assert.equal(getElementText(find('.content', container)), 23);
});

test('change ilm due date', async function(assert) {
  server.create('user', {
    id: 4136
  });
  var ilmSession = server.create('ilmSession');
  server.create('session', {
    courseId: 1,
    ilmSessionId: 1
  });
  await visit(url);
  var container = find('.sessionilmduedate');
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
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(url);
  var container = find('.session-header .title');
  assert.equal(getElementText(container), getText('session 0'));
  await click(find('.editable', container));
  var input = find('.editinplace input', container);
  assert.equal(getText(input.val()), getText('session 0'));
  await fillIn(input, 'test new title');
  await click(find('.editinplace .actions .done', container));
  assert.equal(getElementText(container), getText('test new title'));
});

test('change type', async function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(url);
  var container = find('.session-overview');
  assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
  await click(find('.sessiontype .editable', container));

  let options = find('.sessiontype select option', container);
  assert.equal(options.length, 2);
  assert.equal(getElementText(options.eq(0)), getText('session type 0'));
  assert.equal(getElementText(options.eq(1)), getText('session type 1'));
  await pickOption(find('.sessiontype select', container), 'session type 1', assert);
  await click(find('.sessiontype .actions .done', container));
  assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 1'));
});

test('session attributes are shown by school config', async assert => {
  assert.expect(4);
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 2
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionSupplemental',
    value: true
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionSpecialAttireRequired',
    value: true
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionSpecialEquipmentRequired',
    value: true
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionAttendanceRequired',
    value: true
  });
  server.db.schools.update(1, {
    configurationIds: [1, 2, 3, 4]
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
    courseId: 1,
    sessionTypeId: 2
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionSupplemental',
    value: false
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionSpecialAttireRequired',
    value: false
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionSpecialEquipmentRequired',
    value: false
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: 'showSessionAttendanceRequired',
    value: false
  });
  server.db.schools.update(1, {
    configurationIds: [1, 2, 3, 4]
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
    courseId: 1,
    sessionTypeId: 2
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
    courseId: 1,
    sessionTypeId: 2
  });
  server.create('schoolConfig', {
    schoolId: 1,
    name: schoolVariableName,
    value: true
  });
  server.db.schools.update(1, {
    configurationIds: [1]
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
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1,
    sessionDescriptionId: 1
  });
  await visit(url);
  var description = getText(fixtures.sessionDescription.description);
  var container = find('.sessiondescription');
  assert.equal(getElementText(find('.content', container)), description);
  await click(find('.editable', container));
  let editor = find('.sessiondescription .fr-box');
  let editorContents = editor.data('froala.editor').$el.text();
  assert.equal(getText(editorContents), description);
  editor.froalaEditor('html.set', 'test new description');
  editor.froalaEditor('events.trigger', 'contentChanged');
  await click(find('.editinplace .actions .done', container));
  assert.equal(getElementText(find('.content', container)), getText('test new description'));
});

test('add description', async function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(url);
  var container = find('.sessiondescription');
  assert.equal(getElementText(find('.content', container)), getText('Click to edit'));
  await click(find('.editable', container));
  let editor = find('.sessiondescription .fr-box');
  let editorContents = editor.data('froala.editor').$el.text();
  assert.equal(getText(editorContents), '');
  editor.froalaEditor('html.set', 'test new description');
  editor.froalaEditor('events.trigger', 'contentChanged');
  await click(find('.editinplace .actions .done', container));
  assert.equal(getElementText(find('.content', container)), getText('test new description'));
});

test('empty description removes description', async function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  const container = '.sessiondescription';
  const description = `${container} .content`;
  const editorElement = `${container} .fr-box`;
  const edit = `${container} .editable`;
  const save = `${container} .done`;

  await visit(url);
  assert.equal(getElementText(description), getText('Click to edit'));
  await click(edit);
  let editor = find(editorElement);
  assert.equal(editor.data('froala.editor').$el.text(), '');
  editor.froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
  editor.froalaEditor('events.trigger', 'contentChanged');
  await click(save);
  assert.equal(getElementText(description), getText('Click to edit'));
});

test('remove description', async function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1,
    sessionDescriptionId: 1
  });
  const container = '.sessiondescription';
  const description = `${container} .content`;
  const editorElement = `${container} .fr-box`;
  const edit = `${container} .editable`;
  const save = `${container} .done`;

  await visit(url);
  assert.equal(getElementText(description), 'sessiondescription0');
  await click(edit);
  let editor = find(editorElement);
  let editorContents = editor.data('froala.editor').$el.text();
  assert.equal(getText(editorContents), 'sessiondescription0');
  editor.froalaEditor('html.set', '');
  editor.froalaEditor('events.trigger', 'contentChanged');
  await click(save);
  assert.equal(getElementText(description), getText('Click to edit'));
});


test('click copy', async function(assert) {
  server.create('userRole', {
    title: 'course director'
  });
  server.create('user', {
    id: 4136,
    roleIds: [1]
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });

  const copy = '.session-overview a.copy';
  await visit(url);
  await click(copy);

  assert.equal(currentPath(), 'course.session.copy');
});

test('copy hidden from instructors', async function(assert) {
  server.create('userRole', {
    title: 'instructor'
  });
  server.create('user', {
    id: 4136,
    roleIds: [1],
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(url);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  assert.equal(currentPath(), 'course.session.index');
  assert.equal(find(copy).length, 0);
});

test('copy visible to developers', async function(assert) {
  server.create('userRole', {
    userIds: [4136],
    title: 'developer'
  });
  server.create('user', {
    id: 4136,
    roleIds: [1],
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(url);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  assert.equal(currentPath(), 'course.session.index');
  assert.equal(find(copy).length, 1);
});

test('copy visible to course directors', async function(assert) {
  server.create('userRole', {
    userIds: [4136],
    title: 'course director'
  });
  server.create('user', {
    id: 4136,
    roleIds: [1],
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(url);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  assert.equal(currentPath(), 'course.session.index');
  assert.equal(find(copy).length, 1);
});

test('copy hidden on copy route', async function(assert) {
  server.create('userRole', {
    userIds: [4136],
    title: 'course director'
  });
  server.create('user', {
    id: 4136,
    roleIds: [1],
  });
  server.create('session', {
    courseId: 1,
    sessionTypeId: 1
  });
  await visit(`${url}/copy`);
  const container = '.session-overview';
  const copy = `${container} a.copy`;

  assert.equal(currentPath(), 'course.session.copy');
  assert.equal(find(copy).length, 0);
});
