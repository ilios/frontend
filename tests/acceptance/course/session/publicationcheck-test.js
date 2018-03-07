import { run } from '@ember/runloop';
import destroyApp from '../../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import { settled, click, fillIn, findAll, currentPath, visit } from '@ember/test-helpers';
let application;
let url = '/courses/1/sessions/1/publicationcheck';

module('Acceptance: Session - Publication Check', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    this.server.create('course');
    this.server.create('vocabulary', {
      schoolId: 1,
    });
    this.server.createList('sessionType', 2, {
      schoolId: 1
    });
    this.server.create('sessionDescription');
    this.server.create('objective');
    this.server.create('term', {
      vocabularyId: 1,
    });
    this.server.create('meshDescriptor');
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('full session count', async function (assert) {
    this.server.create('session', {
      courseId: 1,
      objectiveIds: [1],
      termIds: [1],
      meshDescriptorIds: [1],
      sessionTypeId: 1,
      sessionDescriptionId: 1
    });
    this.server.create('offering', {
      sessionId: 1
    });
    await visit(url);
    assert.equal(currentPath(), 'course.session.publicationCheck');
    let items = find('.session-publicationcheck table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('session 0'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });

  test('empty session count', async function(assert) {
    //create 2 because the second one is empty
    this.server.createList('session', 2, {
      courseId: 1
    });
    this.server.db.courses.update(1, {sessionIds: [1, 2]});
    await visit('/courses/1/sessions/2/publicationcheck');
    assert.equal(currentPath(), 'course.session.publicationCheck');
    let items = find('.session-publicationcheck table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('session 1'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });

  //also test all the session overview fields (Issue #496)
  test('check fields', async function(assert) {
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
      sessionDescriptionId: 1,
    });
    await visit(url);

    assert.equal(currentPath(), 'course.session.publicationCheck');
    let container = find('.session-overview');
    assert.equal(getElementText(find('.sessiontype .editable', container)), getText('session type 0'));
    assert.equal(getElementText(find('.sessiondescription .content', container)), getText('session description 0'));
    assert.equal(findAll('.sessionilmhours', container).length, 0);
  });

  test('check remove ilm', async function(assert) {
    let ilmSession = this.server.create('ilmSession');
    this.server.create('session', {
      courseId: 1,
      ilmSessionId: 1
    });
    await visit(url);

    assert.equal(currentPath(), 'course.session.publicationCheck');
    let container = find('.session-overview');
    assert.equal(findAll('.sessionilmhours', container).length, 1);
    assert.equal(findAll('.sessionilmduedate', container).length, 1);
    let dueDate = moment(ilmSession.dueDate).format('L');
    assert.equal(getElementText(find('.sessionilmhours .content', container)), ilmSession.hours);
    assert.equal(getElementText(find('.sessionilmduedate .editable', container)), dueDate);
    await click(find('.independentlearningcontrol .toggle-yesno', container));
    assert.equal(findAll('.sessionilmhours', container).length, 0);
    assert.equal(findAll('.sessionilmduedate', container).length, 0);
  });

  test('check add ilm', async function(assert) {
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
      description: 'some text',
    });
    await visit(url);

    assert.equal(currentPath(), 'course.session.publicationCheck');
    let container = find('.session-overview');
    await click(find('.independentlearningcontrol .toggle-yesno', container));
    assert.equal(findAll('.sessionilmhours', container).length, 1);
    assert.equal(findAll('.sessionilmduedate', container).length, 1);
    assert.equal(getElementText(find('.sessionilmhours .content', container)), 1);
  });

  test('change ilm hours', async function(assert) {
    let ilmSession = this.server.create('ilmSession');
    this.server.create('session', {
      courseId: 1,
      ilmSessionId: 1
    });
    await visit(url);

    assert.equal(currentPath(), 'course.session.publicationCheck');
    assert.equal(findAll('.sessionilmhours', container).length, 1);
    let container = find('.session-overview .sessionilmhours');
    assert.equal(getElementText(find('.content', container)), ilmSession.hours);
    await click(find('.editable', container));
    let input = find('.editinplace input', container);
    assert.equal(getText(input.val()), ilmSession.hours);
    await fillIn(input, 23);
    await click(find('.editinplace .actions .done', container));
    assert.equal(getElementText(find('.content', container)), 23);
  });

  test('change ilm due date', async function(assert) {
    let ilmSession = this.server.create('ilmSession');
    this.server.create('session', {
      courseId: 1,
      ilmSessionId: 1
    });
    await visit(url);
    let container = find('.session-overview .sessionilmduedate');
    let dueDate = moment(ilmSession.dueDate).format('L');
    assert.equal(getElementText(find('.editable', container)), dueDate);
    await click(find('.editable', container));
    let input = find('.editinplace input', container);
    assert.equal(getText(input.val()), getText(dueDate));
    let interactor = openDatepicker(find('input', container));
    assert.equal(interactor.selectedYear(), moment(ilmSession.dueDate).format('YYYY'));
    let newDate = moment(ilmSession.dueDate).add(1, 'year').add(1, 'month');
    interactor.selectDate(newDate.toDate());
    await click(find('.editinplace .actions .done', container));
    assert.equal(getElementText(find('.editable', container)), newDate.format('L'));
  });

  test('change title', async function(assert) {
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 1
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
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 2
    });
    await visit(url);
    let container = find('.session-overview');
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
    this.server.create('user', {
      id: 4136
    });
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 2
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSupplemental',
      value: true
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSpecialAttireRequired',
      value: true
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSpecialEquipmentRequired',
      value: true
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionAttendanceRequired',
      value: true
    });
    this.server.db.schools.update(1, {
      configurationIds: [1, 2, 3, 4]
    });
    const sessionOverview = '.session-overview';
    const supplementalToggle = `${sessionOverview} .sessionsupplemental .toggle-yesno`;
    const specialAttireToggle = `${sessionOverview} .sessionspecialattire .toggle-yesno`;
    const specialEquiptmentToggle = `${sessionOverview} .sessionspecialequipment .toggle-yesno`;
    const attendanceRequiredToggle = `${sessionOverview} .sessionattendancerequired .toggle-yesno`;

    await visit(url);
    assert.equal(findAll(supplementalToggle).length, 1, 'control hidden');
    assert.equal(findAll(specialAttireToggle).length, 1, 'control hidden');
    assert.equal(findAll(specialEquiptmentToggle).length, 1, 'control hidden');
    assert.equal(findAll(attendanceRequiredToggle).length, 1, 'control hidden');
  });

  test('session attributes are hidden by school config', async assert => {
    assert.expect(4);
    this.server.create('user', {
      id: 4136
    });
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 2
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSupplemental',
      value: false
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSpecialAttireRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionSpecialEquipmentRequired',
      value: false
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: 'showSessionAttendanceRequired',
      value: false
    });
    this.server.db.schools.update(1, {
      configurationIds: [1, 2, 3, 4]
    });
    const sessionOverview = '.session-overview';
    const supplementalToggle = `${sessionOverview} .sessionsupplemental .toggle-yesno`;
    const specialAttireToggle = `${sessionOverview} .sessionspecialattire .toggle-yesno`;
    const specialEquiptmentToggle = `${sessionOverview} .sessionspecialequipment .toggle-yesno`;
    const attendanceRequiredToggle = `${sessionOverview} .sessionattendancerequired .toggle-yesno`;

    await visit(url);
    assert.equal(findAll(supplementalToggle).length, 0, 'control hidden');
    assert.equal(findAll(specialAttireToggle).length, 0, 'control hidden');
    assert.equal(findAll(specialEquiptmentToggle).length, 0, 'control hidden');
    assert.equal(findAll(attendanceRequiredToggle).length, 0, 'control hidden');
  });

  test('session attributes are hidden when there is no school config', async assert => {
    assert.expect(4);
    this.server.create('user', {
      id: 4136
    });
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 2
    });

    const sessionOverview = '.session-overview';
    const supplementalToggle = `${sessionOverview} .sessionsupplemental .toggle-yesno`;
    const specialAttireToggle = `${sessionOverview} .sessionspecialattire .toggle-yesno`;
    const specialEquiptmentToggle = `${sessionOverview} .sessionspecialequipment .toggle-yesno`;
    const attendanceRequiredToggle = `${sessionOverview} .sessionattendancerequired .toggle-yesno`;

    await visit(url);
    assert.equal(findAll(supplementalToggle).length, 0, 'control hidden');
    assert.equal(findAll(specialAttireToggle).length, 0, 'control hidden');
    assert.equal(findAll(specialEquiptmentToggle).length, 0, 'control hidden');
    assert.equal(findAll(attendanceRequiredToggle).length, 0, 'control hidden');
  });

  let testAttributeToggle = async function(assert, schoolVariableName, domclass){
    assert.expect(3);
    this.server.create('user', {
      id: 4136
    });
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 2
    });
    this.server.create('schoolConfig', {
      schoolId: 1,
      name: schoolVariableName,
      value: true
    });
    this.server.db.schools.update(1, {
      configurationIds: [1]
    });
    const sessionOverview = '.session-overview';
    const toggle = `${sessionOverview} .${domclass} .toggle-yesno`;
    const toggleValue = `${toggle} input`;

    await visit(url);
    assert.equal(findAll(toggleValue).length, 1, 'control exists');
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
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
      sessionDescriptionId: 1
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
    await settled();
  });

  test('add description', async function(assert) {
    this.server.create('session', {
      courseId: 1,
      sessionTypeId: 1
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
    await settled();
  });
});
