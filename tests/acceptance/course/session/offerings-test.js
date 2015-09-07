/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Offerings', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('school', {
      instructorGroups: [1,2]
    });
    server.create('cohort');
    server.create('course', {
      sessions: [1],
      cohorts: [1],
      school: 1
    });
    server.create('sessionType');

    fixtures.users =  [];
    fixtures.users.pushObject(server.create('user', {id: 4136}));
    //users 2, 3
    fixtures.users.pushObjects(server.createList('user', 2, {
      instructorGroups: [1],
      learnerGroups: [1],
    }));
    //users 4,5
    fixtures.users.pushObjects(server.createList('user', 2, {
      instructorGroups: [2],
      learnerGroups: [2],
    }));
    //users 6,7
    fixtures.users.pushObjects(server.createList('user', 2, {
      instructedOfferings: [1],
      instructorGroups: [1]
    }));
    //users 8,9
    fixtures.users.pushObjects(server.createList('user', 2, {
      instructedOfferings: [1, 2],
    }));

    fixtures.instructorGroups = [];
    fixtures.instructorGroups.pushObject(server.create('instructorGroup', {
      users: [2,3,6,7],
      offerings: [1],
      school: 1
    }));
    fixtures.instructorGroups.pushObject(server.create('instructorGroup', {
      users: [4,5],
      offerings: [1, 2, 3],
      school: 1
    }));
    fixtures.learnerGroups = [];
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      users: [2,3],
      offerings: [1],
      cohort: 1,
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      users: [4,5],
      offerings: [1, 2, 3],
      cohort: 1,
    }));
    fixtures.offerings = [];
    let today = moment().hour(9);
    fixtures.today = today;
    fixtures.offerings.pushObject(server.create('offering', {
      session: 1,
      instructors: [6,7,8,9],
      instructorGroups: [1, 2],
      learnerGroups: [1, 2],
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      session: 1,
      instructors: [8,9],
      instructorGroups: [2],
      learnerGroups: [2],
      startDate:today.clone().add(1, 'day').format(),
      endDate: today.clone().add(1, 'day').add(1, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      session: 1,
      instructorGroups: [2],
      learnerGroups: [2],
      instructors: [],
      startDate: today.clone().add(2, 'days').format(),
      endDate: today.clone().add(3, 'days').add(1, 'hour').format(),
    }));
    fixtures.session = server.create('session', {
      course: 1,
      offerings: [1, 2, 3],
      school: 1
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('basics', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    let container = find('.session-offerings');
    let offeringTitle = 'Offerings (' + fixtures.offerings.length + ')';
    assert.equal(getElementText(find('.detail-title', container)), getText(offeringTitle));
    let dateBlocks = find('.offering-block', container);

    assert.equal(dateBlocks.length, fixtures.offerings.length, 'Date blocks count equals offerings fixtures count');
  });
});

test('single day offering dates', function(assert) {
  assert.expect(8);
  visit(url);
  andThen(function() {
    let dateBlocks = find('.session-offerings .offering-block');

    //the first two offerings are single date offerings
    for(let i = 0; i < 2; i++){
      let block = dateBlocks.eq(i);
      let offering = fixtures.offerings[i];
      assert.equal(getElementText(find('.offering-block-date-dayofweek', block)), getText(moment(offering.startDate).format('dddd')));
      assert.equal(getElementText(find('.offering-block-date-dayofmonth', block)), getText(moment(offering.startDate).format('MMMM Do')));
      assert.equal(getElementText(find('.offering-block-time-time-starttime', block)), getText('Starts:' + moment(offering.startDate).format('LT')));
      assert.equal(getElementText(find('.offering-block-time-time-endtime', block)), getText('Ends:' + moment(offering.endDate).format('LT')));
    }
  });
});

test('multiday offering dates', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let dateBlocks = find('.session-offerings .offering-block');

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

test('learner groups', function(assert) {
  assert.expect(7);
  visit(url);
  andThen(function() {
    let container = find('.session-offerings');
    let dateBlocks = find('.offering-block', container);
    for(let i = 0; i < fixtures.offerings.length; i++){
      let learnerGroups = find('.offering-block-time-offering-learner_groups li', dateBlocks.eq(i));
      let offeringLearnerGroups = fixtures.offerings[i].learnerGroups;
      assert.equal(learnerGroups.length, offeringLearnerGroups.length);
      for(let i = 0; i < offeringLearnerGroups.length; i++){
        let learnerGroup = fixtures.learnerGroups[offeringLearnerGroups[i] - 1];
        assert.equal(getElementText(learnerGroups.eq(i)), getText(learnerGroup.title));
      }
    }
  });
});

test('instructors', function(assert) {
  assert.expect(17);
  visit(url);
  andThen(function() {
    let container = find('.session-offerings');
    let dateBlocks = find('.offering-block', container);
    var extractInstructorsFromOffering = function(offeringId){
      let offering = fixtures.offerings[offeringId];
      let arr = [];
      offering.instructors.forEach(function(id){
        arr.push(id);
      });
      offering.instructorGroups.forEach(function(groupId){
        let instructorGroup = fixtures.instructorGroups[groupId -1];
        instructorGroup.users.forEach(function(id){
          arr.push(id);
        });
      });

      return arr.uniq().sort();
    };
    for(let i = 0; i < fixtures.offerings.length; i++){
      let instructors = find('.offering-block-time-offering-instructors li', dateBlocks.eq(i));
      let offeringInstructors = extractInstructorsFromOffering(i);
      assert.equal(instructors.length, offeringInstructors.length);
      for(let i = 0; i < offeringInstructors.length; i++){
        let instructor = fixtures.users[offeringInstructors[i] - 1];
        let instructorTitle = instructor.firstName + instructor.lastName;
        assert.equal(getElementText(instructors.eq(i)), getText(instructorTitle));
      }
    }
  });
});

test('create new offering', function(assert) {
  assert.expect(13);
  visit(url);
  var container;
  andThen(function() {
    container = find('.session-offerings');
    click('.detail-actions button', container).then(function(){
      return click('.detail-actions li:eq(0)', container).then(function(){
        return click(find('.offering-detail-box span', container).eq(0));
      });
    });
  });
  andThen(function(){
    var interactor = openDatepicker(find('.startdate input', container).eq(0));
    interactor.selectDate(new Date(2011, 8, 11));
    
    let startBoxes = find('.offering-manager .starttime select', container);
    pickOption(startBoxes[0], '2', assert);
    pickOption(startBoxes[1], '15', assert);
    pickOption(startBoxes[2], 'am', assert);
    let endBoxes = find('.offering-manager .endtime select', container);
    pickOption(endBoxes[0], '3', assert);
    pickOption(endBoxes[1], '23', assert);
    pickOption(endBoxes[2], 'pm', assert);
    fillIn(find('.offering-manager .room input', container), 'testing palace');
    click('.offering-manager .learner-groups li:eq(0) ul li:eq(0)', container);
    let input = find('.search-box input', container);
    fillIn(input, 'guy');
    click('span.search-icon', container).then(()=>{
      click('.live-search .results li:eq(0)').then(() => {
        fillIn(input, 'group');
        click('span.search-icon', container).then(()=>{
          click('.live-search .results li:eq(0)').then(()=> {
            click(find('.done', container));
          });
        });
      });
    });
  });
  andThen(function(){
    let block = find('.session-offerings .offering-block:eq(0)');
    assert.equal(getElementText(find('.offering-block-date-dayofweek', block)), getText('Sunday'));
    assert.equal(getElementText(find('.offering-block-date-dayofmonth', block)), getText('September 11th'));
    assert.equal(getElementText(find('.offering-block-time-time-starttime', block)), getText('Starts: 2:15AM'));
    assert.equal(getElementText(find('.offering-block-time-time-endtime', block)), getText('Ends: 3:23AM'));
    assert.equal(getElementText(find('.offering-block-time-offering-location', block)), getText('testing palace'));
    assert.equal(getElementText(find('.offering-block-time-offering-learner_groups li', block)), getText('learnergroup0'));
    assert.equal(getElementText(find('.offering-block-time-offering-instructors li', block)), getText('0guyMc0son1guyMc1son2guyMc2son5guyMc5son6guyMc6son'));
  });
});

test('create new multiday offering', function(assert) {
  assert.expect(10);
  visit(url);
  var container;
  andThen(function() {
    container = find('.session-offerings');
    click('.detail-actions button', container).then(function(){
      return click('.detail-actions li:eq(0)', container).then(function(){
        return click(find('.offering-detail-box span', container).eq(0));
      });
    });
  });
  andThen(function(){
    click('.offering-manager .ismultiday label', container).then(function(){
      var startDateInteractor = openDatepicker(find('.startdate input', container));
      startDateInteractor.selectDate(new Date(2011, 8, 11));

      var endDateInteractor = openDatepicker(find('.enddate input', container));
      endDateInteractor.selectDate(new Date(2011, 8, 12));

      let startBoxes = find('.offering-manager .starttime select', container);
      pickOption(startBoxes[0], '2', assert);
      pickOption(startBoxes[1], '15', assert);
      pickOption(startBoxes[2], 'am', assert);
      let endBoxes = find('.offering-manager .endtime select', container);
      pickOption(endBoxes[0], '12', assert);
      pickOption(endBoxes[1], '23', assert);
      pickOption(endBoxes[2], 'pm', assert);
      fillIn(find('.offering-manager .room input', container), 'testing palace');
      click('.offering-manager .learner-groups li:eq(0) ul li:eq(0)', container);
      let input = find('.search-box input', container);
      fillIn(input, 'guy');
      click('span.search-icon', container).then(()=>{
        click('.live-search .results li:eq(0)').then(() => {
          fillIn(input, 'group');
          click('span.search-icon', container).then(()=>{
            click('.live-search .results li:eq(0)').then(()=> {
              click(find('.done', container));
            });
          });
        });
      });
    });
  });
  andThen(function(){
    let block = find('.session-offerings .offering-block:eq(0)');
    let expectedText = 'Multiday' +
      'Starts Sunday September 11th @ 2:15AM' +
      'Ends Monday September 12th @ 12:23PM';
    assert.equal(getElementText(find('.multiday-offering-block-time-time', block)), getText(expectedText));
    assert.equal(getElementText(find('.offering-block-time-offering-location', block)), getText('testing palace'));
    assert.equal(getElementText(find('.offering-block-time-offering-learner_groups li', block)), getText('learnergroup0'));
    assert.equal(getElementText(find('.offering-block-time-offering-instructors li', block)), getText('0guyMc0son1guyMc1son2guyMc2son5guyMc5son6guyMc6son'));
  });
});

test('confirm removal message', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    let offering = find('.offering-block-time-offering:eq(0)');
    click('.offering-block-time-offering-actions .remove', offering).then(function(){
      assert.ok(offering.hasClass('offering-confirm-removal'));
      assert.equal(getElementText(find('.confirm-message', offering)), getText('Are you sure you want to delete this offering with 2 learner groups? This action cannot be undone. Yes Cancel'));
    });
  });
});

test('remove offering', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    let offerings = find('.offering-block-time-offering');
    assert.equal(offerings.length, 3);
    let offering = find('.offering-block-time-offering').eq(0);
    click('.offering-block-time-offering-actions .remove', offering).then(function(){
      click('.remove', offering).then(function(){
        assert.equal(find('.offering-block-time-offering').length, 2);
      });
    });
  });
});

test('cancel remove offering', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    let offerings = find('.offering-block-time-offering');
    assert.equal(offerings.length, 3);
    let offering = find('.offering-block-time-offering').eq(0);
    click('.offering-block-time-offering-actions .remove', offering).then(function(){
      click('.cancel', offering).then(function(){
        assert.equal(find('.offering-block-time-offering').length, 3);
      });
    });
  });
});
