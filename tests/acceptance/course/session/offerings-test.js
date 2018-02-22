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

module('Acceptance: Session - Offerings', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    fixtures.users =  [];

    fixtures.users.pushObject(setupAuthentication(application, {id: 1}));
    server.create('school');
    server.create('program');
    server.create('programYear', { programId: 1});
    server.create('cohort', {
      programYearId: 1
    });
    server.create('course', {
      cohortIds: [1],
      schoolId: 1,
      directorIds: [1]
    });
    server.create('sessionType', {
      schoolId: 1
    });

    fixtures.users.pushObjects(server.createList('user', 8));

    fixtures.instructorGroups = [];
    fixtures.instructorGroups.pushObject(server.create('instructorGroup', {
      userIds: [2,3,6,7],
      schoolId: 1,
    }));
    fixtures.instructorGroups.pushObject(server.create('instructorGroup', {
      userIds: [4,5],
      schoolId: 1
    }));
    fixtures.learnerGroups = [];
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      userIds: [2,3],
      cohortId: 1,
      location: 'default 1',
      instructorIds: [1],
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      userIds: [4,5],
      cohortId: 1,
      location: 'default 2',
      instructorGroupIds: [1],
    }));
    fixtures.session = server.create('session', {
      courseId: 1,
    });
    fixtures.offerings = [];
    let today = moment().hour(9);
    fixtures.today = today;
    fixtures.offerings.pushObject(server.create('offering', {
      sessionId: 1,
      instructorIds: [6,7,8,9],
      instructorGroupIds: [1, 2],
      learnerGroupIds: [1, 2],
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      sessionId: 1,
      instructorIds: [8,9],
      instructorGroupIds: [2],
      learnerGroupIds: [2],
      startDate:today.clone().add(1, 'day').format(),
      endDate: today.clone().add(1, 'day').add(1, 'hour').format(),
    }));
    fixtures.offerings.pushObject(server.create('offering', {
      sessionId: 1,
      instructorGroupIds: [2],
      learnerGroupIds: [2],
      instructorIds: [],
      startDate: today.clone().add(2, 'days').format(),
      endDate: today.clone().add(3, 'days').add(1, 'hour').format(),
    }));
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('basics', async function(assert) {
    assert.expect(2);
    await visit(url);
    let container = find('.session-offerings');
    let offeringTitle = 'Offerings (' + fixtures.offerings.length + ')';
    assert.equal(getElementText(find('.title', container)), getText(offeringTitle));
    let dateBlocks = find('.offering-block', container);

    assert.equal(dateBlocks.length, fixtures.offerings.length, 'Date blocks count equals offerings fixtures count');
  });

  test('single day offering dates', async function(assert) {
    assert.expect(8);
    await visit(url);
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

  test('multiday offering dates', async function(assert) {
    assert.expect(1);
    await visit(url);
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

  test('learner groups', async function(assert) {
    assert.expect(7);
    await visit(url);
    let container = find('.session-offerings');
    let dateBlocks = find('.offering-block', container);
    for(let i = 0; i < fixtures.offerings.length; i++){
      let learnerGroups = find('.offering-block-time-offering-learner_groups li', dateBlocks.eq(i));
      let offeringLearnerGroups = fixtures.offerings[i].learnerGroupIds;
      assert.equal(learnerGroups.length, offeringLearnerGroups.length);
      for(let i = 0; i < offeringLearnerGroups.length; i++){
        let learnerGroup = fixtures.learnerGroups[offeringLearnerGroups[i] - 1];
        assert.equal(getElementText(learnerGroups.eq(i)), getText(learnerGroup.title));
      }
    }
  });

  test('instructors', async function(assert) {
    assert.expect(17);
    await visit(url);
    let container = find('.session-offerings');
    let dateBlocks = find('.offering-block', container);
    let extractInstructorsFromOffering = function(offeringId){
      let offering = fixtures.offerings[offeringId];
      let arr = [];
      arr.pushObjects(offering.instructorIds);
      offering.instructorGroupIds.forEach(function(groupId){
        let instructorGroup = fixtures.instructorGroups[groupId - 1];
        arr.pushObjects(instructorGroup.userIds);
      });

      return arr.uniq().sort();
    };
    for(let i = 0; i < fixtures.offerings.length; i++){
      let instructors = find('.offering-block-time-offering-instructors li', dateBlocks.eq(i));
      let offeringInstructors = extractInstructorsFromOffering(i);
      assert.equal(instructors.length, offeringInstructors.length);
      for (let i = 0; i < offeringInstructors.length; i++){
        const userId = offeringInstructors[i];
        const instructor = server.db.users.find(userId);
        const middleInitial = instructor.middleName.charAt(0).toUpperCase();
        const instructorTitle = `${instructor.firstName} ${middleInitial}. ${instructor.lastName}`;
        assert.equal(getElementText(instructors.eq(i)), getText(instructorTitle));
      }
    }
  });

  test('confirm removal message', async function(assert) {
    assert.expect(2);
    await visit(url);
    let offering = find('.offering-block-time-offering:eq(0)');
    await click('.offering-block-time-offering-actions .remove', offering);
    assert.ok(offering.hasClass('offering-confirm-removal'));
    assert.equal(getElementText(find('.confirm-message', offering)), getText('Are you sure you want to delete this offering with 2 learner groups? This action cannot be undone. Yes Cancel'));
  });

  test('remove offering', async function(assert) {
    assert.expect(2);
    await visit(url);

    let offerings = find('.offering-block-time-offering');
    assert.equal(offerings.length, 3);
    let offering = find('.offering-block-time-offering').eq(0);
    await click('.offering-block-time-offering-actions .remove', offering);
    await click('.confirm-message .remove', offering);
    assert.equal(find('.offering-block-time-offering').length, 2);
  });

  test('cancel remove offering', async function(assert) {
    assert.expect(2);
    await visit(url);
    let offerings = find('.offering-block-time-offering');
    assert.equal(offerings.length, 3);
    let offering = find('.offering-block-time-offering').eq(0);
    await click('.offering-block-time-offering-actions .remove', offering);
    await click('.cancel', offering);
    assert.equal(find('.offering-block-time-offering').length, 3);
  });

  test('users can create a new offering single day', async function(assert) {
    assert.expect(10);

    const form = '.offering-form';
    const expandButton = '.session-offerings .expand-button';
    const offeringButton = '.session-offerings .click-choice-buttons button:eq(1)';

    const startDateInput = `${form} .start-date input`;
    const startTimes = '.start-time select';
    const durationHours = '.offering-duration .hours input';
    const durationMinutes = '.offering-duration .minutes input';
    const offeringLocation = '.room input';

    const availableLearnerGroups = '.available-learner-groups .tree-groups-list';
    const learnerGroupOne = `${availableLearnerGroups} li:eq(0) .clickable`;
    const learnerGroupTwo = `${availableLearnerGroups} li:eq(1) .clickable`;

    const searchBox = '.instructors input';
    const searchBoxOption = '.livesearch-user-name:first';
    const createButton = '.done';

    const dayOfWeek = '.offering-block-date-dayofweek:first';
    const dayOfMonth = '.offering-block-date-dayofmonth:first';
    const startTime = '.offering-block-time-time-starttime:first';
    const endTime = '.offering-block-time-time-endtime:first';
    const learnerGroup1 = '.offering-block-time-offering-learner_groups ul li:eq(0)';
    const learnerGroup2 = '.offering-block-time-offering-learner_groups ul li:eq(1)';
    const room = '.offering-block-time-offering-location:first';
    const instructor = '.offering-block-time-offering-instructors ul li:eq(0)';

    await visit(url);
    await click(expandButton);
    await click(offeringButton);
    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(new Date(2011, 8, 11));

    let startBoxes = find(startTimes);
    await pickOption(startBoxes[0], '2', assert);
    await pickOption(startBoxes[1], '15', assert);

    await fillIn(durationHours, 15);
    await fillIn(durationMinutes, 15);
    await fillIn(offeringLocation, 'Rm. 111');
    await click(learnerGroupOne);
    await click(learnerGroupTwo);
    await fillIn(searchBox, 'guy');
    await click(searchBoxOption);
    await click(createButton);
    assert.equal(find(dayOfWeek).text(), 'Sunday', 'day of the week is correct');
    assert.equal(find(dayOfMonth).text(), 'September 11th', 'day of month is correct');
    assert.equal(find(startTime).text().trim(), 'Starts: 2:15 AM', 'start time is correct');
    assert.equal(find(endTime).text().trim(), 'Ends: 5:30 PM', 'end time is correct');
    assert.equal(find(learnerGroup1).text().trim(), 'learner group 0', 'correct learner group is picked');
    assert.equal(find(learnerGroup2).text().trim(), 'learner group 1', 'correct learner group is picked');
    assert.equal(find(room).text(), 'Rm. 111', 'location/room is correct');
    assert.equal(find(instructor).text(), '0 guy M. Mc0son', 'instructor is correct');
  });


  test('users can create a new offering multi-day', async function(assert) {
    assert.expect(9);

    const form = '.offering-form';
    const expandButton = '.session-offerings .expand-button';
    const offeringButton = '.session-offerings .click-choice-buttons button:eq(1)';

    const startDateInput = `${form} .start-date input`;
    const startTimes = `${form} .start-time select`;
    const durationHours = `${form} .offering-duration .hours input`;
    const durationMinutes = `${form} .offering-duration .minutes input`;
    const offeringLocation = `${form} .room input`;

    const availableLearnerGroups = `${form} .available-learner-groups .tree-groups-list`;
    const learnerGroupOne = `${availableLearnerGroups} li:eq(0) .clickable`;
    const learnerGroupTwo = `${availableLearnerGroups} li:eq(1) .clickable`;

    const searchBox = `${form} .instructors input`;
    const searchBoxOption = `${form} .livesearch-user-name:first`;
    const createButton = `${form} .done`;

    const learnerGroup1 = '.offering-block-time-offering-learner_groups ul li:eq(0)';
    const learnerGroup2 = '.offering-block-time-offering-learner_groups ul li:eq(1)';
    const room = '.offering-block-time-offering-location:first';
    const instructor = '.offering-block-time-offering-instructors ul li:eq(0)';

    const multiDayDesc = '.multiday-offering-block-time-time-description:first';
    const multiDayStarts = '.multiday-offering-block-time-time-starts:first';
    const multiDayEnds = '.multiday-offering-block-time-time-ends:first';

    await visit(url);
    await click(expandButton);
    await click(offeringButton);
    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(new Date(2011, 8, 11));

    let startBoxes = find(startTimes);
    await pickOption(startBoxes[0], '2', assert);
    await pickOption(startBoxes[1], '15', assert);

    await fillIn(durationHours, 39);
    await fillIn(durationMinutes, 15);
    await fillIn(offeringLocation, 'Rm. 111');
    await click(learnerGroupOne);
    await click(learnerGroupTwo);
    await fillIn(searchBox, 'guy');
    await click(searchBoxOption);
    await click(createButton);
    assert.equal(find(multiDayDesc).text().trim(), 'Multiday', 'multi-day statement is correct');
    assert.equal(find(multiDayStarts).text().trim(), 'Starts Sunday September 11th @ 2:15 AM', 'multi-day statement is correct');
    assert.equal(find(multiDayEnds).text().trim(), 'Ends Monday September 12th @ 5:30 PM', 'multi-day statement is correct');
    assert.equal(find(learnerGroup1).text().trim(), 'learner group 0', 'correct learner group is picked');
    assert.equal(find(learnerGroup2).text().trim(), 'learner group 1', 'correct learner group is picked');
    assert.equal(find(room).text(), 'Rm. 111', 'location/room is correct');
    assert.equal(find(instructor).text(), '0 guy M. Mc0son', 'instructor is correct');
  });

  test('users can create a new small group offering', async function(assert) {
    assert.expect(12);

    const form = '.offering-form';
    const expandButton = '.session-offerings .expand-button';

    const startDateInput = `${form} .start-date input`;
    const startTimes = `${form} .start-time select`;
    const durationHours = `${form} .offering-duration .hours input`;
    const durationMinutes = `${form} .offering-duration .minutes input`;

    const availableLearnerGroups = `${form} .available-learner-groups .tree-groups-list`;
    const learnerGroupOne = `${availableLearnerGroups} li:eq(0) .clickable`;
    const learnerGroupTwo = `${availableLearnerGroups} li:eq(1) .clickable`;

    const createButton = '.done';

    const dayOfWeek = '.offering-block-date-dayofweek:first';
    const dayOfMonth = '.offering-block-date-dayofmonth:first';
    const startTime = '.offering-block-time-time-starttime:first';
    const endTime = '.offering-block-time-time-endtime:first';
    const learnerGroup1 = '.offering-block-time-offering-learner_groups ul li:eq(0)';
    const learnerGroup2 = '.offering-block-time-offering-learner_groups ul li:eq(1)';
    const location1 = '.offering-block-time-offering-location:eq(0)';
    const location2 = '.offering-block-time-offering-location:eq(1)';
    const instructors1 = '.offering-block-time-offering-instructors:eq(0) li';
    const instructors2 = '.offering-block-time-offering-instructors:eq(1) li';

    await visit(url);
    await click(expandButton);
    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(new Date(2011, 8, 11));

    let startBoxes = find(startTimes);
    await pickOption(startBoxes[0], '2', assert);
    await pickOption(startBoxes[1], '15', assert);

    await fillIn(durationHours, 15);
    await fillIn(durationMinutes, 15);
    await click(learnerGroupOne);
    await click(learnerGroupTwo);
    await click(createButton);
    assert.equal(find(dayOfWeek).text(), 'Sunday', 'day of the week is correct');
    assert.equal(find(dayOfMonth).text(), 'September 11th', 'day of month is correct');
    assert.equal(find(startTime).text().trim(), 'Starts: 2:15 AM', 'start time is correct');
    assert.equal(find(endTime).text().trim(), 'Ends: 5:30 PM', 'end time is correct');
    assert.equal(find(learnerGroup1).text().trim(), 'learner group 0', 'correct learner group is picked');
    assert.equal(find(learnerGroup2).text().trim(), 'learner group 1', 'correct learner group is picked');
    assert.equal(find(location1).text(), 'default 1', 'correct default location is added');
    assert.equal(find(location2).text(), 'default 2', 'correct default location is added');
    assert.equal(getElementText(instructors1), '0guyM.Mc0son', 'correct default instructors are added');
    assert.equal(getElementText(instructors2), '1guyM.Mc1son2guyM.Mc2son5guyM.Mc5son6guyM.Mc6son', 'correct default instructors are added');
  });


  test('users can edit existing offerings', async function(assert) {
    assert.expect(8);

    const editButton = '.offering-detail-box i:first';
    const form = '.offering-form';

    const startDateInput = `${form} .start-date input`;
    const startTimes = `${form} .start-time select`;
    const durationHours = `${form} .offering-duration .hours input`;
    const durationMinutes = `${form} .offering-duration .minutes input`;
    const offeringLocation = `${form} .room input`;

    const removeLearnerGroupOne = `${form} .selected-learner-groups .remove-all-subgroups:eq(0)`;
    const removeFirstInstructor = `${form} .instructors .removable-list:eq(1) li:first i`;
    const removeFirstInstructorGroup = `${form} .instructors .removable-list:eq(0) li:first i`;
    const createButton = `${form} .done`;

    const dayOfWeek = '.offering-block-date-dayofweek:first';
    const dayOfMonth = '.offering-block-date-dayofmonth:first';
    const startTime = '.offering-block-time-time-starttime:first';
    const endTime = '.offering-block-time-time-endtime:first';
    const learnerGroup1 = '.offering-block-time-offering-learner_groups ul li:eq(0)';
    const room = '.offering-block-time-offering-location:first';
    // const instructor1 = '.offering-block-time-offering-instructors ul li:eq(0)';
    // const instructor2 = '.offering-block-time-offering-instructors ul li:eq(1)';
    // const instructor3 = '.offering-block-time-offering-instructors ul li:eq(2)';

    await visit(url);
    await click(editButton);
    let interactor = openDatepicker(find(startDateInput));
    interactor.selectDate(new Date(2011, 9, 5));

    let startBoxes = find(startTimes);
    await pickOption(startBoxes[0], '11', assert);
    await pickOption(startBoxes[1], '45', assert);

    await fillIn(durationHours, 6);
    await fillIn(durationMinutes, 10);
    await fillIn(offeringLocation, 'Rm. 111');
    await click(removeLearnerGroupOne);
    await click(removeFirstInstructor);
    await click(removeFirstInstructorGroup);
    await click(createButton);
    assert.equal(find(dayOfWeek).text(), 'Wednesday', 'day of the week is correct');
    assert.equal(find(dayOfMonth).text(), 'October 5th', 'day of month is correct');
    assert.equal(find(startTime).text().trim(), 'Starts: 11:45 AM', 'start time is correct');
    assert.equal(find(endTime).text().trim(), 'Ends: 5:55 PM', 'end time is correct');
    assert.equal(find(learnerGroup1).text().trim(), 'learner group 1', 'correct learner group is picked');
    //@todo: skipping these, works in real life, but doesn't reload the list in tests
    // assert.equal(find(instructor1).text(), '6 guy M. Mc6son', 'instructor is correct');
    // assert.equal(find(instructor2).text(), '8 guy M. Mc5son', 'instructor is correct');
    // assert.equal(find(instructor3).text(), '9 guy M. Mc5son', 'instructor is correct');
    assert.equal(find(room).text(), 'Rm. 111', 'location/room is correct');
  });

  test('users can create recurring small groups', async function(assert) {
    assert.expect(42);

    const form = '.offering-form';
    const expandButton = '.session-offerings .expand-button';

    const startDateInput = `${form} .start-date input`;
    const startTimes = `${form} .start-time select`;
    const durationHours = `${form} .offering-duration .hours input`;
    const durationMinutes = `${form} .offering-duration .minutes input`;

    const availableLearnerGroups = `${form} .available-learner-groups .tree-groups-list`;
    const learnerGroupOne = `${availableLearnerGroups} li:eq(0) .clickable`;
    const learnerGroupTwo = `${availableLearnerGroups} li:eq(1) .clickable`;

    const createButton = `${form} .done`;

    const makeRecurringButton = '.make-recurring .switch-label';
    const makeRecurringInput = '.make-recurring-input-container input';

    const daysOfWeek = '.offering-block-date-dayofweek';
    const daysOfMonth = '.offering-block-date-dayofmonth';
    const startsTime = '.offering-block-time-time-starttime';
    const endsTime = '.offering-block-time-time-endtime';
    const learnerGroups = '.offering-block-time-offering-learner_groups ul li';
    const locations = '.offering-block-time-offering-location';
    const instructors = '.offering-block-time-offering-instructors';

    await visit(url);
    await click(expandButton);
    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(new Date(2015, 4, 22));

    let startBoxes = find(startTimes);
    await pickOption(startBoxes[0], '2', assert);
    await pickOption(startBoxes[1], '15', assert);

    await fillIn(durationHours, 13);
    await fillIn(durationMinutes, 8);
    await click(makeRecurringButton);
    await fillIn(makeRecurringInput, '4');
    await click(learnerGroupOne);
    await click(learnerGroupTwo);

    await click(createButton);
    assert.equal(find(daysOfWeek).eq(0).text(), 'Friday', 'first day of the week is correct');
    assert.equal(find(daysOfWeek).eq(1).text(), 'Friday', 'second day of the week is correct');
    assert.equal(find(daysOfWeek).eq(2).text(), 'Friday', 'third day of the week is correct');
    assert.equal(find(daysOfWeek).eq(3).text(), 'Friday', 'fourth day of the week is correct');

    assert.equal(find(daysOfMonth).eq(0).text(), 'May 22nd', 'first day of month is correct');
    assert.equal(find(daysOfMonth).eq(1).text(), 'May 29th', 'second day of month is correct');
    assert.equal(find(daysOfMonth).eq(2).text(), 'June 5th', 'third day of month is correct');
    assert.equal(find(daysOfMonth).eq(3).text(), 'June 12th', 'fourth day of month is correct');

    assert.equal(find(startsTime).eq(0).text().trim(), 'Starts: 2:15 AM', 'first start time is correct');
    assert.equal(find(startsTime).eq(1).text().trim(), 'Starts: 2:15 AM', 'second start time is correct');
    assert.equal(find(startsTime).eq(2).text().trim(), 'Starts: 2:15 AM', 'third start time is correct');
    assert.equal(find(startsTime).eq(3).text().trim(), 'Starts: 2:15 AM', 'fourth start time is correct');

    assert.equal(find(endsTime).eq(0).text().trim(), 'Ends: 3:23 PM', 'first end time is correct');
    assert.equal(find(endsTime).eq(1).text().trim(), 'Ends: 3:23 PM', 'second end time is correct');
    assert.equal(find(endsTime).eq(2).text().trim(), 'Ends: 3:23 PM', 'third end time is correct');
    assert.equal(find(endsTime).eq(3).text().trim(), 'Ends: 3:23 PM', 'fourth end time is correct');

    assert.equal(find(learnerGroups).eq(0).text().trim(), 'learner group 0', 'first correct learner group is picked');
    assert.equal(find(learnerGroups).eq(1).text().trim(), 'learner group 1', 'first correct learner group is picked');
    assert.equal(find(learnerGroups).eq(2).text().trim(), 'learner group 0', 'second correct learner group is picked');
    assert.equal(find(learnerGroups).eq(3).text().trim(), 'learner group 1', 'second correct learner group is picked');
    assert.equal(find(learnerGroups).eq(4).text().trim(), 'learner group 0', 'third correct learner group is picked');
    assert.equal(find(learnerGroups).eq(5).text().trim(), 'learner group 1', 'third correct learner group is picked');
    assert.equal(find(learnerGroups).eq(6).text().trim(), 'learner group 0', 'fourth correct learner group is picked');
    assert.equal(find(learnerGroups).eq(7).text().trim(), 'learner group 1', 'fourth correct learner group is picked');

    assert.equal(find(locations).eq(0).text(), 'default 1', 'first correct default location is picked');
    assert.equal(find(locations).eq(1).text(), 'default 2', 'first correct default location is picked');
    assert.equal(find(locations).eq(2).text(), 'default 1', 'second correct default location is picked');
    assert.equal(find(locations).eq(3).text(), 'default 2', 'second correct default location is picked');
    assert.equal(find(locations).eq(4).text(), 'default 1', 'third correct default location is picked');
    assert.equal(find(locations).eq(5).text(), 'default 2', 'third correct default location is picked');
    assert.equal(find(locations).eq(6).text(), 'default 1', 'fourth correct default location is picked');
    assert.equal(find(locations).eq(7).text(), 'default 2', 'fourth correct default location is picked');

    assert.equal(getElementText(find(instructors).eq(0)), getText('0 guy M. Mc0son'), 'first correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(1)), getText('1 guy M. Mc1son 2 guy M. Mc2son 5 guy M. Mc5son 6 guy M. Mc6son'), 'first correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(2)), getText('0 guy M. Mc0son'), 'second correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(3)), getText('1 guy M. Mc1son 2 guy M. Mc2son 5 guy M. Mc5son 6 guy M. Mc6son'), 'second correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(4)), getText('0 guy M. Mc0son'), 'third correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(5)), getText('1 guy M. Mc1son 2 guy M. Mc2son 5 guy M. Mc5son 6 guy M. Mc6son'), 'third correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(6)), getText('0 guy M. Mc0son'), 'fourth correct default instructor is picked');
    assert.equal(getElementText(find(instructors).eq(7)), getText('1 guy M. Mc1son 2 guy M. Mc2son 5 guy M. Mc5son 6 guy M. Mc6son'), 'fourth correct default instructor is picked');
  });

  test('users can create recurring single offerings', async function(assert) {
    assert.expect(26);

    const form = '.offering-form';
    const expandButton = '.session-offerings .expand-button';
    const offeringButton = '.session-offerings .click-choice-buttons button:eq(1)';

    const startDateInput = `${form} .start-date input`;
    const startTimes = `${form} .start-time select`;
    const durationHours = `${form} .offering-duration .hours input`;
    const durationMinutes = `${form} .offering-duration .minutes input`;

    const availableLearnerGroups = `${form} .available-learner-groups .tree-groups-list`;
    const learnerGroupOne = `${availableLearnerGroups} li:eq(0) .clickable`;
    const learnerGroupTwo = `${availableLearnerGroups} li:eq(1) .clickable`;

    const createButton = `${form} .done`;

    const makeRecurringButton = '.make-recurring .switch-label';
    const makeRecurringInput = '.make-recurring-input-container input';


    const daysOfWeek = '.offering-block-date-dayofweek';
    const daysOfMonth = '.offering-block-date-dayofmonth';
    const startsTime = '.offering-block-time-time-starttime';
    const endsTime = '.offering-block-time-time-endtime';
    const learnerGroups = '.offering-block-time-offering-learner_groups ul li';

    await visit(url);
    await click(expandButton);
    await click(offeringButton);
    let startDateInteractor = openDatepicker(find(startDateInput));
    startDateInteractor.selectDate(new Date(2015, 4, 22));

    let startBoxes = find(startTimes);
    await pickOption(startBoxes[0], '2', assert);
    await pickOption(startBoxes[1], '15', assert);

    await fillIn(durationHours, 13);
    await fillIn(durationMinutes, 8);

    await click(makeRecurringButton);
    await fillIn(makeRecurringInput, '4');
    await click(learnerGroupOne);
    await click(learnerGroupTwo);

    await click(createButton);
    assert.equal(find(daysOfWeek).eq(0).text(), 'Friday', 'first day of the week is correct');
    assert.equal(find(daysOfWeek).eq(1).text(), 'Friday', 'second day of the week is correct');
    assert.equal(find(daysOfWeek).eq(2).text(), 'Friday', 'third day of the week is correct');
    assert.equal(find(daysOfWeek).eq(3).text(), 'Friday', 'fourth day of the week is correct');

    assert.equal(find(daysOfMonth).eq(0).text(), 'May 22nd', 'first day of month is correct');
    assert.equal(find(daysOfMonth).eq(1).text(), 'May 29th', 'second day of month is correct');
    assert.equal(find(daysOfMonth).eq(2).text(), 'June 5th', 'third day of month is correct');
    assert.equal(find(daysOfMonth).eq(3).text(), 'June 12th', 'fourth day of month is correct');

    assert.equal(find(startsTime).eq(0).text().trim(), 'Starts: 2:15 AM', 'first start time is correct');
    assert.equal(find(startsTime).eq(1).text().trim(), 'Starts: 2:15 AM', 'second start time is correct');
    assert.equal(find(startsTime).eq(2).text().trim(), 'Starts: 2:15 AM', 'third start time is correct');
    assert.equal(find(startsTime).eq(3).text().trim(), 'Starts: 2:15 AM', 'fourth start time is correct');

    assert.equal(find(endsTime).eq(0).text().trim(), 'Ends: 3:23 PM', 'first end time is correct');
    assert.equal(find(endsTime).eq(1).text().trim(), 'Ends: 3:23 PM', 'second end time is correct');
    assert.equal(find(endsTime).eq(2).text().trim(), 'Ends: 3:23 PM', 'third end time is correct');
    assert.equal(find(endsTime).eq(3).text().trim(), 'Ends: 3:23 PM', 'fourth end time is correct');

    assert.equal(find(learnerGroups).eq(0).text().trim(), 'learner group 0', 'first correct learner group is picked');
    assert.equal(find(learnerGroups).eq(1).text().trim(), 'learner group 1', 'first correct learner group is picked');
    assert.equal(find(learnerGroups).eq(2).text().trim(), 'learner group 0', 'second correct learner group is picked');
    assert.equal(find(learnerGroups).eq(3).text().trim(), 'learner group 1', 'second correct learner group is picked');
    assert.equal(find(learnerGroups).eq(4).text().trim(), 'learner group 0', 'third correct learner group is picked');
    assert.equal(find(learnerGroups).eq(5).text().trim(), 'learner group 1', 'third correct learner group is picked');
    assert.equal(find(learnerGroups).eq(6).text().trim(), 'learner group 0', 'fourth correct learner group is picked');
    assert.equal(find(learnerGroups).eq(7).text().trim(), 'learner group 1', 'fourth correct learner group is picked');
  });

  test('edit offerings twice #2850', async assert => {
    assert.expect(2);
    server.create('learnerGroup', {
      cohortId: 1,
    });
    server.create('learnerGroup', {
      cohortId: 1,
      parentId: 3,
    });
    server.create('learnerGroup', {
      cohortId: 1,
      parentId: 4,
    });
    server.create('learnerGroup', {
      cohortId: 1,
      parentId: 5,
    });
    server.db.cohorts.update(1, {learnerGroupIds: [3, 4, 5, 6]});

    const editButton = '.offering-detail-box i:first';
    const form = '.offering-form';
    const save = `${form} .done`;
    const room = '.offering-block-time-offering-location:first';

    await visit(url);
    await click(editButton);

    await click(save);
    assert.equal(find(room).text(), 'room 0', 'location/room is correct');

    await click(editButton);
    await click(save);
    assert.equal(find(room).text(), 'room 0', 'location/room is correct');
  });
});