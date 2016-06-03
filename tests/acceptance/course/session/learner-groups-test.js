
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Learner Groups', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, {
      id: 4136,
      school: 1
    });
    setupModels();
  },

  afterEach: function() {
    destroyApp(application);
  }
});

let setupModels = function(){
  server.create('school', {
    courses: [1]
  });
  server.create('course', {
    school: 1,
    sessions: [1]
  });
  server.create('ilmSession', {
    session: 1,
    learnerGroups: [1, 2, 4]
  });
  server.create('sessionType', {
    sessions: [1]
  });
  server.create('program', {
    programYears: [1],
    school: 1
  });
  server.create('programYear', {
    cohorts: [1]
  });
  server.create('cohort', {
    learnerGroups: [1, 2, 3, 4, 5, 6, 7, 8],
    courses: [1],
    programYear: 1
  });
  server.createList('learnerGroup', 2, {
    ilmSessions: [1],
    cohort: 1
  });
  server.create('learnerGroup', {
    cohort: 1
  });
  server.create('learnerGroup', {
    ilmSessions: [1],
    cohort: 1,
    children: [6, 7]
  });
  server.create('learnerGroup', {
    cohort: 1,
    children: [8]
  });
  server.createList('learnerGroup', 2, {
    cohort: 1,
    parent: 4
  });
  server.createList('learnerGroup', 2, {
    cohort: 1,
    parent: 5
  });
  server.create('session', {
    course: 1,
    ilmSession: 1,
  });
};

test('initial selected learner groups', function(assert) {
  visit(url);
  const groupsList = '.detail-learnergroups-content';
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(groupsList)), getText('learnergroup0 learnergroup1 learnergroup3'));
  });
});

test('learner group manager display', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const selectedGroupsList = '.detail-learnergroups .selected-learner-groups .main-text';
  const availableLearnerGroups = '.detail-learnergroups .tree-groups-list';
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(availableLearnerGroups).children(':visible')), getText('learnergroup 2 learnergroup 3 learnergroup 5  learnergroup 6  learnergroup 4  learnergroup 7'));
    assert.equal(getElementText(find(selectedGroupsList)), getText('learnergroup0 learnergroup1 learnergroup3'));
  });
});

test('filter learner groups by top group should include all subgroups', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  fillIn('.search-box input', 3);
  const availableLearnerGroups = '.detail-learnergroups .tree-groups-list';
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(availableLearnerGroups).children(':visible')), getText('learnergroup 3 learnergroup 5 learnergroup 6'));
  });
});

test('filter learner groups by subgroup should include top group', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const lg3 = '.detail-learnergroups .tree-groups-list li:eq(3)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg6 = '.detail-learnergroups .tree-groups-list li:eq(5)';
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':visible'));
  });
  fillIn('.search-box input', 5);
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':hidden'));
  });
});

test('add learner group', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const selectedGroupsList = '.detail-learnergroups .selected-learner-groups .main-text';
  const lg2 = '.detail-learnergroups .tree-groups-list li:eq(2)';
  const lg2Clicker = lg2 + ' .clickable';
  andThen(function() {
    assert.ok(find(lg2).is(':visible'));
  });
  click(lg2Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(selectedGroupsList)), getText('learnergroup0 learnergroup1 learnergroup2 learnergroup3'));
    assert.ok(find(lg2).is(':hidden'));

  });
});

test('add learner sub group', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const selectedGroupsList = '.detail-learnergroups .selected-learner-groups .main-text';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg5Clicker = lg5 + ' .clickable';
  andThen(function() {
    assert.ok(find(lg5).is(':visible'));
  });
  click(lg5Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(selectedGroupsList)), getText('learnergroup0 learnergroup1 learnergroup3 learnergroup5'));
    assert.ok(find(lg5).is(':hidden'));
  });
});

test('add learner group with children', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const selectedGroupsList = '.detail-learnergroups .selected-learner-groups .main-text';
  const lg3 = '.detail-learnergroups .tree-groups-list li:eq(3)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg6 = '.detail-learnergroups .tree-groups-list li:eq(5)';
  const lg3Clicker = lg3 + ' .clickable';
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':visible'));
  });
  click(lg3Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(selectedGroupsList)), getText('learnergroup0 learnergroup1 learnergroup3 learnergroup5 learnergroup6'));
    assert.ok(find(lg3).is(':hidden'));
    assert.ok(find(lg5).is(':hidden'));
    assert.ok(find(lg6).is(':hidden'));
  });
});

test('add learner group with children and remove one child', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const selectedGroupsList = '.detail-learnergroups .selected-learner-groups .main-text';
  const lg3 = '.detail-learnergroups .tree-groups-list li:eq(3)';
  const lg5 = '.detail-learnergroups .tree-groups-list li:eq(4)';
  const lg6 = '.detail-learnergroups .tree-groups-list li:eq(5)';
  const lg3Clicker = lg3 + ' .clickable';
  const removeLg5 = '.detail-learnergroups .selected-learner-groups li:eq(3)';
  andThen(function() {
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':visible'));
  });
  click(lg3Clicker);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(selectedGroupsList)), getText('learnergroup0 learnergroup1 learnergroup3 learnergroup5 learnergroup6'));
    assert.ok(find(lg3).is(':hidden'));
    assert.ok(find(lg5).is(':hidden'));
    assert.ok(find(lg6).is(':hidden'));
  });
  click(removeLg5);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(selectedGroupsList)), getText('learnergroup0 learnergroup1 learnergroup3 learnergroup6'));
    assert.ok(find(lg3).is(':visible'));
    assert.ok(find(lg5).is(':visible'));
    assert.ok(find(lg6).is(':hidden'));
  });

});

test('undo learner group change', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const lg0 = '.detail-learnergroups .selected-learner-groups li:eq(0)';
  const lg7 = '.detail-learnergroups .available-learner-groups li:eq(7) .clickable';
  const cancel = '.detail-learnergroups .bigcancel';

  click(lg0);
  click(lg7);
  click(cancel);
  const groupsList = '.detail-learnergroups-content';
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(groupsList)), getText('learnergroup0 learnergroup1 learnergroup3'));
  });
});

test('save learner group change', function(assert) {
  visit(url + '?isManagingLearnerGroups=true');
  const lg0 = '.detail-learnergroups .selected-learner-groups li:eq(0)';
  const lg7 = '.detail-learnergroups .available-learner-groups li:eq(7) .clickable';
  const save = '.detail-learnergroups .bigadd';
  click(lg0);
  click(lg7);
  click(save);
  const groupsList = '.detail-learnergroups-content';
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    assert.equal(getElementText(find(groupsList)), getText('learnergroup1 learnergroup3 learnergroup4 learnergroup7'));
  });
});
