import { click, fillIn, findAll, currentRouteName, find, visit } from '@ember/test-helpers';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const url = '/courses/1';
module('Acceptance: Course - Session List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    server.create('sessionType', { school: this.school });
    this.course = this.server.create('course', {
      school: this.school,
      directorIds: [this.user.id]
    });
    server.create('session', {
      courseId: 1,
      sessionTypeId: 1
    });
    server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
    });
    server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
    });
    server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
      title: 'session3\\'
    });
    let today = moment().hour(8);
    server.create('offering', {
      sessionId: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    server.create('offering', {
      sessionId: 1,
      startDate: today.clone().add(1, 'day').add(1, 'hour').format(),
      endDate: today.clone().add(1, 'day').add(4, 'hour').format(),
    });
    server.create('offering', {
      sessionId: 1,
      startDate: today.clone().add(2, 'days').format(),
      endDate: today.clone().add(3, 'days').add(1, 'hour').format(),
    });
  });

  test('session list', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const firstTitle = `${rows}:nth-of-type(1) td:nth-of-type(2)`;
    const firstType = `${rows}:nth-of-type(1) td:nth-of-type(3)`;
    const firstOfferingCount = `${rows}:nth-of-type(1) td:nth-of-type(6)`;
    const secondTitle = `${rows}:nth-of-type(2) td:nth-of-type(2)`;
    const secondType = `${rows}:nth-of-type(2) td:nth-of-type(3)`;
    const secondOfferingCount = `${rows}:nth-of-type(2) td:nth-of-type(6)`;
    const thirdTitle = `${rows}:nth-of-type(3) td:nth-of-type(2)`;
    const thirdType = `${rows}:nth-of-type(3) td:nth-of-type(3)`;
    const thirdOfferingCount = `${rows}:nth-of-type(3) td:nth-of-type(6)`;
    const fourthTitle = `${rows}:nth-of-type(4) td:nth-of-type(2)`;
    const fourthType = `${rows}:nth-of-type(4) td:nth-of-type(3)`;
    const fourthOfferingCount = `${rows}:nth-of-type(4) td:nth-of-type(6)`;

    assert.equal(findAll(rows).length, 4);
    assert.equal(await getElementText(firstTitle), getText('session0'));
    assert.equal(await getElementText(firstType), getText('sessiontype0'));
    assert.equal(await getElementText(firstOfferingCount), getText('3'));
    assert.equal(await getElementText(secondTitle), getText('session1'));
    assert.equal(await getElementText(secondType), getText('sessiontype0'));
    assert.equal(await getElementText(secondOfferingCount), getText('0'));
    assert.equal(await getElementText(thirdTitle), getText('session2'));
    assert.equal(await getElementText(thirdType), getText('sessiontype0'));
    assert.equal(await getElementText(thirdOfferingCount), getText('0'));
    assert.equal(await getElementText(fourthTitle), getText('session3\\'));
    assert.equal(await getElementText(fourthType), getText('sessiontype0'));
    assert.equal(await getElementText(fourthOfferingCount), getText('0'));
  });

  test('expanded offering', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const expandFirstSession = `${rows}:nth-of-type(1) td:nth-of-type(1) .clickable`;
    const dateBlocks = `${rows}:nth-of-type(2) .offering-block`;
    const firstBlockDayOfWeek = `${dateBlocks}:nth-of-type(1) .offering-block-date-dayofweek`;
    const firstBlockDayOfMonth = `${dateBlocks}:nth-of-type(1) .offering-block-date-dayofmonth`;
    const firstBlockStartTime = `${dateBlocks}:nth-of-type(1) .offering-block-time-time-starttime`;
    const firstBlockEndTime = `${dateBlocks}:nth-of-type(1) .offering-block-time-time-endtime`;
    const secondBlockDayOfWeek = `${dateBlocks}:nth-of-type(2) .offering-block-date-dayofweek`;
    const secondBlockDayOfMonth = `${dateBlocks}:nth-of-type(2) .offering-block-date-dayofmonth`;
    const secondBlockStartTime = `${dateBlocks}:nth-of-type(2) .offering-block-time-time-starttime`;
    const secondBlockEndTime = `${dateBlocks}:nth-of-type(2) .offering-block-time-time-endtime`;
    const thirdBlockDayOfWeek = `${dateBlocks}:nth-of-type(3) .offering-block-date-dayofweek`;
    const thirdBlockDayOfMonth = `${dateBlocks}:nth-of-type(3) .offering-block-date-dayofmonth`;
    const thirdBlockDateAndTime = `${dateBlocks}:nth-of-type(3) .multiday-offering-block-time-time`;

    await click(expandFirstSession);
    assert.equal(findAll(dateBlocks).length, 3);
    const offering1StartDate = moment(server.db.offerings[0].startDate);
    const offering1EndDate = moment(server.db.offerings[0].endDate);
    const offering2StartDate = moment(server.db.offerings[1].startDate);
    const offering2EndDate = moment(server.db.offerings[1].endDate);
    const offering3StartDate = moment(server.db.offerings[2].startDate);
    const offering3EndDate = moment(server.db.offerings[2].endDate);

    assert.equal(await getElementText(firstBlockDayOfWeek), getText(offering1StartDate.format('dddd')));
    assert.equal(await getElementText(firstBlockDayOfMonth), getText(offering1StartDate.format('MMMM Do')));
    assert.equal(await getElementText(firstBlockStartTime), getText('Starts: ' + offering1StartDate.format('LT')));
    assert.equal(await getElementText(firstBlockEndTime), getText('Ends: ' + offering1EndDate.format('LT')));

    assert.equal(await getElementText(secondBlockDayOfWeek), getText(offering2StartDate.format('dddd')));
    assert.equal(await getElementText(secondBlockDayOfMonth), getText(offering2StartDate.format('MMMM Do')));
    assert.equal(await getElementText(secondBlockStartTime), getText('Starts: ' + offering2StartDate.format('LT')));
    assert.equal(await getElementText(secondBlockEndTime), getText('Ends: ' + offering2EndDate.format('LT')));



    assert.equal(await getElementText(thirdBlockDayOfWeek), getText(offering3StartDate.format('dddd')));
    assert.equal(await getElementText(thirdBlockDayOfMonth), getText(offering3StartDate.format('MMMM Do')));
    const expectedText = 'Multiday' +
      'Starts' + offering3StartDate.format('dddd MMMM Do [@] LT') +
      'Ends' + offering3EndDate.format('dddd MMMM Do [@] LT');
    assert.equal(await getElementText(thirdBlockDateAndTime), getText(expectedText));
  });

  test('no offerings', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const expandSecondSession = `${rows}:nth-of-type(2) td:nth-of-type(1) .clickable`;
    const expandedContent = `${rows}:nth-of-type(3)`;

    await click(expandSecondSession);
    assert.equal(await getElementText(expandedContent), getText('This session has no offerings'));
  });

  test('close offering details', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const expandSecondSession = `${rows}:nth-of-type(2) td:nth-of-type(1) .clickable`;

    assert.equal(findAll(rows).length, 4);
    await click(expandSecondSession);
    assert.equal(findAll(rows).length, 5);
    await click(expandSecondSession);
    assert.equal(findAll(rows).length, 4);
  });

  test('expanded all sessions', async function(assert) {
    await visit(url);

    const table = '.session-table table';
    const expandAllSessions = `${table} thead tr:nth-of-type(1) th:nth-of-type(1)`;
    const expandedSessionOfferings = `${table} .session-offerings-list`;
    const expandedSessionNoOfferings = `${table} .no-offerings`;

    assert.equal(findAll(expandedSessionOfferings).length, 0);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
    await click(expandAllSessions);
    assert.equal(findAll(expandedSessionOfferings).length, 1);
    assert.equal(findAll(expandedSessionNoOfferings).length, 3);
    await click(expandAllSessions);
    assert.equal(findAll(expandedSessionOfferings).length, 0);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
  });

  test('expanded all sessions with one session expanded already', async function(assert) {
    await visit(url);

    const table = '.session-table table';
    const expandAllSessions = `${table} thead tr:nth-of-type(1) th:nth-of-type(1)`;
    const expandedSessionOfferings = `${table} .session-offerings-list`;
    const expandedSessionNoOfferings = `${table} .no-offerings`;
    const expandFirstSession = `${table} tbody tr:nth-of-type(1) td:nth-of-type(1) .clickable`;

    assert.equal(findAll(expandedSessionOfferings).length, 0);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
    await click(expandFirstSession);
    assert.equal(findAll(expandedSessionOfferings).length, 1);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
    await click(expandAllSessions);
    assert.equal(findAll(expandedSessionOfferings).length, 1);
    assert.equal(findAll(expandedSessionNoOfferings).length, 3);
    await click(expandAllSessions);
    assert.equal(findAll(expandedSessionOfferings).length, 0);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
  });

  test('expanded sessions one at a time and collapse all', async function(assert) {
    await visit(url);

    const table = '.session-table table';
    const expandAllSessions = `${table} thead tr:nth-of-type(1) th:nth-of-type(1)`;
    const expandedSessionOfferings = `${table} .session-offerings-list`;
    const expandedSessionNoOfferings = `${table} .no-offerings`;
    const rows = `${table} tbody tr`;
    const expandFirstSession = `${rows}:nth-of-type(1) td:nth-of-type(1) .clickable`;
    const expandSecondSession = `${rows}:nth-of-type(2) td:nth-of-type(1) .clickable`;
    const expandThirdSession = `${rows}:nth-of-type(3) td:nth-of-type(1) .clickable`;
    const expandFourthSession = `${rows}:nth-of-type(4) td:nth-of-type(1) .clickable`;

    assert.equal(findAll(expandedSessionOfferings).length, 0);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
    await click(expandFourthSession);
    await click(expandThirdSession);
    await click(expandSecondSession);
    await click(expandFirstSession);
    assert.equal(findAll(expandedSessionOfferings).length, 1);
    assert.equal(findAll(expandedSessionNoOfferings).length, 3);
    await click(expandAllSessions);
    assert.equal(findAll(expandedSessionOfferings).length, 0);
    assert.equal(findAll(expandedSessionNoOfferings).length, 0);
  });

  test('new session', async function(assert) {
    const container = '.course-sessions';
    const expandButton = `${container} .expand-button`;
    const input = `${container} .new-session input`;
    const saveButton = `${container} .new-session .done`;
    const savedLink = `${container} .save-result a`;
    const newSession =  '.session-table table tbody tr:nth-of-type(4)';
    const newSessionTitle =  `${newSession} td:nth-of-type(2)`;
    const newSessionOfferingCount =  `${newSession} td:nth-of-type(6)`;

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
    assert.equal(currentRouteName(), 'session.index');
    await click(backtosessionlink);
    assert.equal(currentRouteName(), 'course.index');
    assert.equal(findAll(savedLink).length, 0);
  });

  test('first offering is updated when offering is updated #1276', async function(assert) {
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const title = `${rows}:nth-of-type(1) td:nth-of-type(2)`;
    const manageSessionLink = `${title} a`;
    const offeringCount = `${rows}:nth-of-type(1) td:nth-of-type(6)`;
    const firstOffering = `${rows}:nth-of-type(1) td:nth-of-type(5)`;
    const currentStartDate = this.server.db.offerings[0].startDate;
    const newStartDate = moment(currentStartDate).year(2010).day(4).month(6).toDate();
    const offeringBlocks = '.offering-manager';
    const editOffering = `${offeringBlocks}:nth-of-type(1) .offering-manager-actions .edit`;
    const offeringManager = '.offering-manager';
    const startDateInput = `${offeringManager} .start-date input`;
    const doneButton = `${offeringManager} .done`;
    const backtosessionlink = '.backtosessionlink a';

    await visit(url);

    assert.equal(findAll(rows).length, 4);
    assert.equal(await getElementText(title), getText('session0'));
    assert.equal(await getElementText(offeringCount), getText('3'));
    assert.equal(find(firstOffering).textContent.trim(), moment(currentStartDate).format('L LT'));

    await click(manageSessionLink);
    assert.equal(currentRouteName(), 'session.index');
    assert.equal(findAll(offeringBlocks).length, 3);
    await click(editOffering);

    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(newStartDate);
    await click(doneButton);
    await click(backtosessionlink);
    assert.equal(currentRouteName(), 'course.index');
    assert.equal(find(firstOffering).textContent.trim(), moment(newStartDate).format('L LT'));
  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(4);
    const block = '.course-sessions';
    const sessions = `${block} tbody tr`;
    const firstSessionTitle = `${sessions}:nth-of-type(1) td:nth-of-type(2)`;
    const titleFilter = `${block} .filter input`;
    await visit(url);
    assert.equal(findAll(sessions).length, 4);
    assert.equal(await getElementText(firstSessionTitle), getText('session 0'));
    await fillIn(titleFilter, '\\');
    assert.equal(findAll(sessions).length, 1);
    assert.equal(await getElementText(firstSessionTitle), getText('session3\\'));

  });

  test('delete session', async function(assert) {
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const firstTitle = `${rows}:nth-of-type(1) td:nth-of-type(2)`;
    const secondTitle = `${rows}:nth-of-type(2) td:nth-of-type(2)`;
    const deleteAction = `${rows}:nth-of-type(1) td:nth-of-type(8) i.fa-trash`;
    const confirmDelete = `.confirm-removal button.remove`;

    assert.equal(findAll(rows).length, 4);
    assert.equal(await getElementText(firstTitle), getText('session0'));
    assert.equal(await getElementText(secondTitle), getText('session1'));
    await click(deleteAction);
    await click(confirmDelete);

    assert.equal(findAll(rows).length, 3);
    assert.equal(await getElementText(firstTitle), getText('session1'));
  });

  test('back and forth #3771', async function (assert) {
    const sessions = 50;
    server.createList('session', sessions, {
      course: this.course,
      sessionTypeId: 1
    });
    await visit(url);
    const table = '.session-table table';
    const rows = `${table} tbody tr`;
    const back = '[data-test-back-to-sessions] a';

    assert.equal(findAll(rows).length, sessions + 4);
    for (let i = 1; i < 10; i++) {
      await click(`${rows}:nth-of-type(${i}) td:nth-of-type(2) a`);
      await click(back);
      assert.equal(findAll(rows).length, sessions + 4);
    }
  });
});
