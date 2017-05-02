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
module('Acceptance: Course - Session List', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, {id: 4136, directedCourses: [1]});
    server.create('school', {
      sessionTypes: [1]
    });
    fixtures.sessionTypes = server.createList('sessionType', 1, {
      sessions: [1,2,3,4],
    });
    server.create('course', {
      sessions: [1,2,3,4],
      school: 1
    });
    fixtures.sessions = [];
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
      offerings: [1,2,3]
    }));
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
    let today = moment().hour(8);
    fixtures.offerings = [];
    fixtures.offerings.pushObject(server.create('offering', {
      session: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      session: 1,
      startDate: today.clone().add(1, 'day').add(1, 'hour').format(),
      endDate: today.clone().add(1, 'day').add(4, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      session: 1,
      startDate: today.clone().add(2, 'days').format(),
      endDate: today.clone().add(3, 'days').add(1, 'hour').format(),
    }));
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('session list', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.sessions-list');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, fixtures.sessions.length);
    for(let i = 0; i < fixtures.sessions.length; i++){
      assert.equal(getElementText(find('td:eq(0)', rows.eq(i))), getText(fixtures.sessions[i].title));
      assert.equal(getElementText(find('td:eq(1)', rows.eq(i))), getText(fixtures.sessionTypes[fixtures.sessions[i].sessionType - 1].title));
      assert.equal(getElementText(find('td:eq(4)', rows.eq(i))), fixtures.sessions[i].offerings.length);
    }
  });
});

test('expanded offering', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.sessions-list');
    click('tbody tr:eq(0) td:eq(4)', container);
    andThen(()=>{
      let dateBlocks = find('tbody tr:eq(2) .offering-block', container);
      assert.equal(dateBlocks.length, 3);
      //the first two offerings are single date offerings
      for(let i = 0; i < 2; i++){
        let block = dateBlocks.eq(i);
        let offering = fixtures.offerings[i];
        assert.equal(getElementText(find('.offering-block-date-dayofweek', block)), getText(moment(offering.startDate).format('dddd')));
        assert.equal(getElementText(find('.offering-block-date-dayofmonth', block)), getText(moment(offering.startDate).format('MMMM Do')));
        assert.equal(getElementText(find('.offering-block-time-time-starttime', block)), getText('Starts:' + moment(offering.startDate).format('LT')));
        assert.equal(getElementText(find('.offering-block-time-time-endtime', block)), getText('Ends:' + moment(offering.endDate).format('LT')));
      }
      //the third offering is multiday
      for(let i = 2; i < 3; i++){
        let block = dateBlocks.eq(i);
        let offering = fixtures.offerings[i];
        let expectedText = 'Multiday' +
          'Starts' + moment(offering.startDate).format('dddd MMMM Do [@] LT') +
          'Ends' + moment(offering.endDate).format('dddd MMMM Do [@] LT');
        assert.equal(getElementText(find('.multiday-offering-block-time-time', block)), getText(expectedText));
      }
    });
  });
});

test('no offerings', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.sessions-list');
    click('tbody tr:eq(1) td:eq(4)', container);
    andThen(()=>{
      assert.equal(getElementText(find('tbody tr:eq(3)')), getText('This session has no offerings'));
    });
  });
});

test('close offering details by clicking number', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.sessions-list');
    click('tbody tr:eq(0) td:eq(4)', container).then(()=>{
      assert.equal(find('tbody tr', container).length, 6);
      click('tbody tr:eq(0) td:eq(4)', container).then(()=>{
        assert.equal(find('tbody tr', container).length, 4);
      });
    });
  });
});

test('close offering details with close button', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.sessions-list');
    click('tbody tr:eq(0) td:eq(4)', container).then(()=>{
      assert.equal(find('tbody tr', container).length, 6);
      click('tbody tr:eq(1) td:eq(0)', container).then(()=>{
        assert.equal(find('tbody tr', container).length, 4);
      });
    });
  });
});

test('new session', function(assert) {
  const expandButton = '.expand-button';
  const input = '.new-session input';
  const saveButton = '.new-session .done';
  const savedLink = '.saved-result a';

  visit(url);
  click(expandButton);
  fillIn(input, 'session 3');
  click(saveButton);
  andThen(() => {
    function getContent(i) {
      return find(`tbody tr:last td:eq(${i})`).text().trim();
    }

    assert.equal(find(savedLink).text().trim(), 'session 3', 'link is visible');
    assert.equal(getContent(0), 'session 3', 'session is correct');
    assert.equal(getContent(2), '0', 'number of groups is correct');
  });
});

test('cancel session', function(assert) {
  assert.expect(3);
  const expandButton = '.expand-button';
  const input = '.new-session input';
  const cancelButton = '.new-session .cancel';

  visit(url);
  andThen(() => {
    let numSessions = find('tbody tr').length;
    click(expandButton);
    andThen(() => {
      assert.equal(find(input).length, 1, 'new session input is visible.');
      fillIn(input, 'session 3');
      click(cancelButton);
      andThen(() => {
        assert.equal(find('tbody tr').length, numSessions, 'no new sessions were added.');
        assert.equal(find(input).length, 0, 'new session input is not visible.');
      });
    });
  });
});


test('new session goes away when we navigate #643', function(assert) {
  visit(url);
  let newTitle = 'new session title, woohoo';
  andThen(function() {
    let container = find('.sessions-list');
    click('.detail-actions button:eq(0)', container).then(()=> {
      fillIn('.sessions-list .new-session input:eq(0)', newTitle);
      click('.new-session .done', container).then(()=>{
        click('.saved-result a', container).then(()=> {
          assert.equal(currentPath(), 'course.session.index');
          click('.backtosessionlink a');
        });
      });
    });
    andThen(function(){
      assert.equal(currentPath(), 'course.index');
      assert.equal(find('.saved-result').length, 0);
    });
  });

});

test('first offering is updated when offering is updated #1276', function(assert) {
  visit(url);
  const newStartDate = new Date(2010, 6, 4);
  andThen(function() {
    let container = find('.sessions-list');
    assert.equal(getElementText(find('tr:eq(1) td:eq(3)', container), getText), getText(moment(fixtures.offerings[0].startDate).format('MM/DD/YYYY h:mma')));

    click('tr:eq(1) .edit', container).then(()=> {
      assert.equal(currentPath(), 'course.session.index');
      let offerings = find('.offering-block-time-offering');
      assert.equal(offerings.length, 3);
      let offering = find('.offering-block-time-offering').eq(0);
      return click('.offering-block-time-offering-actions .edit', offering).then(function(){
        const offeringManager = '.offering-manager';
        const startDateInput = `${offeringManager} .start-date input`;
        const doneButton = `${offeringManager} .done`;
        let startDateInteractor = openDatepicker(find(startDateInput));
        startDateInteractor.selectDate(newStartDate);
        return click(doneButton).then(() => {
          return click('.backtosessionlink a');
        });
      });

    });
    andThen(function(){
      container = find('.sessions-list');
      assert.equal(currentPath(), 'course.index');
      let actualDateText = getElementText(find('tr:eq(1) td:eq(3)', container), getText);
      let expectedDateText = getText(moment(newStartDate).format('MM/DD/YYYY'));
      assert.equal(actualDateText.indexOf(expectedDateText), 0);
    });
  });

});

test('title filter escapes regex', async function(assert) {
  assert.expect(3);
  const block = '.sessions-list';
  const sessions = `${block} tbody tr`;
  const firstSessionTitle = `${sessions}:eq(0) td:eq(0)`;
  const titleFilter = `${block} .filter input`;
  await visit(url);
  assert.equal(find(sessions).length, fixtures.sessions.length);
  assert.equal(getElementText(firstSessionTitle), getText(fixtures.sessions[0].title));
  await fillIn(titleFilter, '\\');
  assert.equal(find(sessions).length, 1);
});
