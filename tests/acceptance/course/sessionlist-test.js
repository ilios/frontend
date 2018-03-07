import { click, fillIn, findAll, currentPath, find, visit } from '@ember/test-helpers';
import destroyApp from '../../helpers/destroy-app';
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
var url = '/courses/1';

module('Acceptance: Course - Session List', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application, {id: 4136});
    this.server.create('school');
    fixtures.sessionTypes = [server.create('sessionType', {schoolId: 1})];
    this.server.create('course', {
      schoolId: 1,
      directorIds: [4136]
    });
    fixtures.sessions = [];
    fixtures.sessions.pushObject(server.create('session', {
      courseId: 1,
      sessionTypeId: 1
    }));
    fixtures.sessions.pushObject(server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
      title: 'session3\\'
    }));
    let today = moment().hour(8);
    fixtures.offerings = [];
    fixtures.offerings.pushObject(server.create('offering', {
      sessionId: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      sessionId: 1,
      startDate: today.clone().add(1, 'day').add(1, 'hour').format(),
      endDate: today.clone().add(1, 'day').add(4, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      sessionId: 1,
      startDate: today.clone().add(2, 'days').format(),
      endDate: today.clone().add(3, 'days').add(1, 'hour').format(),
    }));
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('session list', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const firstTitle = `${rows}:eq(0) td:eq(1)`;
    const firstType = `${rows}:eq(0) td:eq(2)`;
    const firstOfferingCount = `${rows}:eq(0) td:eq(5)`;
    const secondTitle = `${rows}:eq(1) td:eq(1)`;
    const secondType = `${rows}:eq(1) td:eq(2)`;
    const secondOfferingCount = `${rows}:eq(1) td:eq(5)`;
    const thirdTitle = `${rows}:eq(2) td:eq(1)`;
    const thirdType = `${rows}:eq(2) td:eq(2)`;
    const thirdOfferingCount = `${rows}:eq(2) td:eq(5)`;
    const fourthTitle = `${rows}:eq(3) td:eq(1)`;
    const fourthType = `${rows}:eq(3) td:eq(2)`;
    const fourthOfferingCount = `${rows}:eq(3) td:eq(5)`;

    assert.equal(findAll(rows).length, 4);
    assert.equal(getElementText(firstTitle), getText('session0'));
    assert.equal(getElementText(firstType), getText('sessiontype0'));
    assert.equal(getElementText(firstOfferingCount), getText('3'));
    assert.equal(getElementText(secondTitle), getText('session1'));
    assert.equal(getElementText(secondType), getText('sessiontype0'));
    assert.equal(getElementText(secondOfferingCount), getText('0'));
    assert.equal(getElementText(thirdTitle), getText('session2'));
    assert.equal(getElementText(thirdType), getText('sessiontype0'));
    assert.equal(getElementText(thirdOfferingCount), getText('0'));
    assert.equal(getElementText(fourthTitle), getText('session3\\'));
    assert.equal(getElementText(fourthType), getText('sessiontype0'));
    assert.equal(getElementText(fourthOfferingCount), getText('0'));
  });

  test('expanded offering', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const expandFirstSession = `${rows}:eq(0) td:eq(0) .clickable`;
    const dateBlocks = `${rows}:eq(1) .offering-block`;
    const firstBlockDayOfWeek = `${dateBlocks}:eq(0) .offering-block-date-dayofweek`;
    const firstBlockDayOfMonth = `${dateBlocks}:eq(0) .offering-block-date-dayofmonth`;
    const firstBlockStartTime = `${dateBlocks}:eq(0) .offering-block-time-time-starttime`;
    const firstBlockEndTime = `${dateBlocks}:eq(0) .offering-block-time-time-endtime`;
    const secondBlockDayOfWeek = `${dateBlocks}:eq(1) .offering-block-date-dayofweek`;
    const secondBlockDayOfMonth = `${dateBlocks}:eq(1) .offering-block-date-dayofmonth`;
    const secondBlockStartTime = `${dateBlocks}:eq(1) .offering-block-time-time-starttime`;
    const secondBlockEndTime = `${dateBlocks}:eq(1) .offering-block-time-time-endtime`;
    const thirdBlockDayOfWeek = `${dateBlocks}:eq(2) .offering-block-date-dayofweek`;
    const thirdBlockDayOfMonth = `${dateBlocks}:eq(2) .offering-block-date-dayofmonth`;
    const thirdBlockDateAndTime = `${dateBlocks}:eq(2) .multiday-offering-block-time-time`;

    await click(expandFirstSession);
    assert.equal(findAll(dateBlocks).length, 3);
    const offering1StartDate = moment(server.db.offerings[0].startDate);
    const offering1EndDate = moment(server.db.offerings[0].endDate);
    const offering2StartDate = moment(server.db.offerings[1].startDate);
    const offering2EndDate = moment(server.db.offerings[1].endDate);
    const offering3StartDate = moment(server.db.offerings[2].startDate);
    const offering3EndDate = moment(server.db.offerings[2].endDate);

    assert.equal(getElementText(firstBlockDayOfWeek), getText(offering1StartDate.format('dddd')));
    assert.equal(getElementText(firstBlockDayOfMonth), getText(offering1StartDate.format('MMMM Do')));
    assert.equal(getElementText(firstBlockStartTime), getText('Starts: ' + offering1StartDate.format('LT')));
    assert.equal(getElementText(firstBlockEndTime), getText('Ends: ' + offering1EndDate.format('LT')));

    assert.equal(getElementText(secondBlockDayOfWeek), getText(offering2StartDate.format('dddd')));
    assert.equal(getElementText(secondBlockDayOfMonth), getText(offering2StartDate.format('MMMM Do')));
    assert.equal(getElementText(secondBlockStartTime), getText('Starts: ' + offering2StartDate.format('LT')));
    assert.equal(getElementText(secondBlockEndTime), getText('Ends: ' + offering2EndDate.format('LT')));



    assert.equal(getElementText(thirdBlockDayOfWeek), getText(offering3StartDate.format('dddd')));
    assert.equal(getElementText(thirdBlockDayOfMonth), getText(offering3StartDate.format('MMMM Do')));
    const expectedText = 'Multiday' +
      'Starts' + offering3StartDate.format('dddd MMMM Do [@] LT') +
      'Ends' + offering3EndDate.format('dddd MMMM Do [@] LT');
    assert.equal(getElementText(thirdBlockDateAndTime), getText(expectedText));
  });

  test('no offerings', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const expandSecondSession = `${rows}:eq(1) td:eq(0) .clickable`;
    const expandedContent = `${rows}:eq(2)`;

    await click(expandSecondSession);
    assert.equal(getElementText(expandedContent), getText('This session has no offerings'));
  });

  test('close offering details', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const expandSecondSession = `${rows}:eq(1) td:eq(0) .clickable`;

    assert.equal(findAll(rows).length, 4);
    await click(expandSecondSession);
    assert.equal(findAll(rows).length, 5);
    await click(expandSecondSession);
    assert.equal(findAll(rows).length, 4);
  });

  test('new session', async function(assert) {
    const container = '.course-sessions';
    const expandButton = `${container} .expand-button`;
    const input = `${container} .new-session input`;
    const saveButton = `${container} .new-session .done`;
    const savedLink = `${container} .save-result a`;
    const newSession =  '.session-table table tbody tr:eq(3)';
    const newSessionTitle =  `${newSession} td:eq(1)`;
    const newSessionOfferingCount =  `${newSession} td:eq(5)`;

    await visit(url);
    await click(expandButton);
    await fillIn(input, 'session 5');
    await click(saveButton);

    assert.equal(find(savedLink).textContent.trim(), 'session 5', 'link is visible');
    assert.equal(find(newSessionTitle).textContent.trim(), 'session 5', 'session is correct');
    assert.equal(find(newSessionOfferingCount).textContent.trim(), '0', 'number of groups is correct');
  });

  test('cancel session', async function(assert) {
    assert.expect(4);
    const container = '.course-sessions';
    const expandButton = `${container} .expand-button`;
    const input = `${container} .new-session input`;
    const cancelButton = `${container} .new-session .cancel`;
    const table = `${container} .session-table table`;
    const rows = `${table} tbody tr`;

    await visit(url);
    assert.equal(findAll(rows).length, 4);
    await click(expandButton);
    assert.equal(findAll(input).length, 1);
    await fillIn(input, 'test');
    await click(cancelButton);
    assert.equal(findAll(rows).length, 4, 'no new sessions were added.');
    assert.equal(findAll(input).length, 0, 'new session input is not visible.');
  });


  test('new session goes away when we navigate #643', async function(assert) {
    const container = '.course-sessions';
    const expandButton = `${container} .expand-button`;
    const input = `${container} .new-session input`;
    const saveButton = `${container} .new-session .done`;
    const savedLink = `${container} .save-result a`;
    const backtosessionlink = '.backtosessionlink a';
    const newTitle = 'new session title, woohoo';

    await visit(url);
    await click(expandButton);
    await fillIn(input, newTitle);
    await click(saveButton);

    assert.equal(find(savedLink).textContent.trim(), newTitle, 'link is visible');
    await click(savedLink);
    assert.equal(currentPath(), 'course.session.index');
    await click(backtosessionlink);
    assert.equal(currentPath(), 'course.index');
    assert.equal(findAll(savedLink).length, 0);
  });

  test('first offering is updated when offering is updated #1276', async function(assert) {
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const title = `${rows}:eq(0) td:eq(1)`;
    const manageSessionLink = `${title} a`;
    const offeringCount = `${rows}:eq(0) td:eq(5)`;
    const firstOffering = `${rows}:eq(0) td:eq(4)`;
    const currentStartDate = this.server.db.offerings[0].startDate;
    const newStartDate = moment(currentStartDate).year(2010).day(4).month(6).toDate();
    const offeringBlocks = '.offering-manager';
    const editOffering = `${offeringBlocks}:eq(0) .offering-manager-actions .edit`;
    const offeringManager = '.offering-manager';
    const startDateInput = `${offeringManager} .start-date input`;
    const doneButton = `${offeringManager} .done`;
    const backtosessionlink = '.backtosessionlink a';

    await visit(url);

    assert.equal(findAll(rows).length, 4);
    assert.equal(getElementText(title), getText('session0'));
    assert.equal(getElementText(offeringCount), getText('3'));
    assert.equal(find(firstOffering).textContent.trim(), moment(currentStartDate).format('L LT'));

    await click(manageSessionLink);
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(findAll(offeringBlocks).length, 3);
    await click(editOffering);

    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(newStartDate);
    await click(doneButton);
    await click(backtosessionlink);
    assert.equal(currentPath(), 'course.index');
    assert.equal(find(firstOffering).textContent.trim(), moment(newStartDate).format('L LT'));
  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(4);
    const block = '.course-sessions';
    const sessions = `${block} tbody tr`;
    const firstSessionTitle = `${sessions}:eq(0) td:eq(1)`;
    const titleFilter = `${block} .filter input`;
    await visit(url);
    assert.equal(findAll(sessions).length, 4);
    assert.equal(getElementText(firstSessionTitle), getText('session 0'));
    await fillIn(titleFilter, '\\');
    assert.equal(findAll(sessions).length, 1);
    assert.equal(getElementText(firstSessionTitle), getText('session3\\'));

  });

  test('delete session', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const firstTitle = `${rows}:eq(0) td:eq(1)`;
    const secondTitle = `${rows}:eq(1) td:eq(1)`;
    const deleteAction = `${rows}:eq(0) td:eq(7) i.fa-trash`;
    const confirmDelete = `.confirm-removal button.remove`;

    assert.equal(findAll(rows).length, 4);
    assert.equal(getElementText(firstTitle), getText('session0'));
    assert.equal(getElementText(secondTitle), getText('session1'));
    await click(deleteAction);
    await click(confirmDelete);

    assert.equal(findAll(rows).length, 3);
    assert.equal(getElementText(firstTitle), getText('session1'));
  });
});
