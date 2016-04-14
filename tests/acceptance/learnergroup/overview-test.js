import destroyApp from '../../helpers/destroy-app';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty } = Ember;

var application;
var url = '/learnergroups/2';
module('Acceptance: Learner Group - Overview' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.createList('user', 2, {
      learnerGroups: [2]
    });
    server.create('course', {
      sessions: [1]
    });
    server.create('course', {
      sessions: [2]
    });
    server.create('session', {
      course: 1,
      offerings: [1]
    });
    server.create('session', {
      course: 2,
      offerings: [2,3]
    });
    server.create('offering', {
      session: 1,
      learnerGroups: [2]
    });
    server.create('offering', {
      session: 2,
      learnerGroups: [2]
    });
    server.create('offering', {
      session: 2,
      learnerGroups: [1]
    });
    server.createList('user', 2, {
      instructedLearnerGroups: [2]
    });
    server.create('cohort', {
      learnerGroups: [1,2,3,4,5,6]
    });
    server.create('learnerGroup', {
      cohort: 1,
      children: [2,3]
    });
    server.create('learnerGroup', {
      cohort: 1,
      parent: 1,
      children: [4,5],
      users: [2,3],
      instructors: [4,5],
      location: 'room 101',
      offerings: [1,2]
    });
    server.createList('learnerGroup', 2, {
      cohort: 1,
      parent: 1
    });
    server.createList('learnerGroup', 2, {
      cohort: 1,
      parent: 2
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'learnerGroup');
    assert.equal(getElementText(find('.detail-header .title h2')),getText('learner group 1'));
    assert.equal(getElementText(find('.detail-header .info')),getText('Members: 2'));
    assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (2)'));
    assert.equal(getElementText(find('.detail-overview .learnergrouplocation')), getText('DefaultLocation:room101'));

    var items = find('.detail-overview .removable-list li');
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('3 guy M. Mc3son'));
    assert.equal(getElementText(items.eq(1)), getText('4 guy M. Mc4son'));
    assert.equal(getElementText(find('.detail-overview .learnergroupcourses')), getText('Associated Courses: course 0, course 1'));
  });
});

test('change title', function(assert) {
  visit(url);
  andThen(function() {
    var container = find('.detail-header');
    assert.equal(getElementText(find('.title h2', container)), getText('learner group 1'));
    click(find('.title h2 .editable', container));
    andThen(function(){
      var input = find('.title .editinplace input', container);
      assert.equal(getText(input.val()), getText('learner group 1'));
      fillIn(input, 'test new title');
      click(find('.title .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.title h2', container)), getText('test new title'));
      });
    });
  });
});

test('search default instructors', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.learnergroup-overview').eq(0);
    fillIn(find('.search-box input', container), 'guy').then(function(){
      var searchResults = find('.results li', container);
      assert.equal(searchResults.length, 6);
      assert.equal(getElementText(searchResults.eq(0)), getText('5 Results'));
      assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son'));
      assert.ok(searchResults.eq(1).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(2)), getText('1 guy M. Mc1son'));
      assert.ok(searchResults.eq(2).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(3)), getText('2 guy M. Mc2son'));
      assert.ok(searchResults.eq(3).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(4)), getText('3 guy M. Mc3son'));
      assert.ok(searchResults.eq(4).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(5)), getText('4 guy M. Mc4son'));
      assert.ok(searchResults.eq(5).hasClass('inactive'));
    });
  });
});

test('add default instructor', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.learnergroup-overview').eq(0);
    var items = find('.removable-list li', container);
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('3 guy M. Mc3son'));
    assert.equal(getElementText(items.eq(1)), getText('4 guy M. Mc4son'));

    fillIn(find('.search-box input', container), 'guy').then(function(){
      click('.results li:eq(2)', container).then(function(){
        var items = find('.removable-list li', container);
        assert.equal(items.length, 3);
        assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
        assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));
        assert.equal(getElementText(items.eq(2)), getText('4 guy M. Mc4son'));
      });
    });
  });
});

test('remove default instructor', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.learnergroup-overview').eq(0);
    click('.removable-list li:eq(0)', container).then(function(){
      var items = find('.removable-list li', container);
      assert.equal(items.length, 1);
      assert.equal(getElementText(items.eq(0)), getText('4 guy M. Mc4son'));
    });
  });
});


test('change location', function(assert) {
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-overview');
    assert.equal(getElementText(find('.learnergrouplocation .editable', container)), getText('room 101'));
    click(find('.learnergrouplocation .editable', container));
    andThen(function(){
      var input = find('.learnergrouplocation .editinplace input', container);
      assert.equal(getText(input.val()), getText('room 101'));
      fillIn(input, 'test new location');
      click(find('.learnergrouplocation .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.learnergrouplocation .editable', container)), getText('test new location'));
      });
    });
  });
});

test('no associated courses', function(assert) {
  visit('/learnergroups/3');
  andThen(function() {
    assert.equal(getElementText(find('.detail-header .title h2')),getText('learnergroup 2'));
    assert.equal(getElementText(find('.detail-overview .learnergroupcourses')), getText('Associated Courses: None'));
  });
});

test('toggleSwitch for multi-editing works', function(assert) {
  const toggleSwitch = '.switch-label';
  const checkBoxLabel = '.check-all-label';
  const checkAllBox = '.check-all-input';
  const membersCheckBoxes = '.learnergroup-list input:checkbox';
  const selectInputField = '.ff-select-field';

  visit('/learnergroups/3');
  andThen(() => {
    assert.ok(isEmpty(find(checkAllBox)), 'checkmark input is hidden');
    assert.ok(isEmpty(find(membersCheckBoxes)), 'member checkboxes are hidden');
    assert.ok(isEmpty(find(selectInputField)), 'input field is hidden');
  });

  click(toggleSwitch);
  andThen(() => {
    assert.equal(find(checkBoxLabel).text(), 'Check All', 'label is correct');
    assert.ok(find(checkAllBox).is(':visible'), 'checkmark input is visible');
    assert.ok(!isEmpty(find(membersCheckBoxes)), 'member checkboxes are hidden');
    assert.ok(!isEmpty(find(selectInputField)), 'input field is hidden');
  });

  click(toggleSwitch);
  andThen(() => {
    assert.ok(isEmpty(find(checkAllBox)), 'checkmark input is hidden');
    assert.ok(isEmpty(find(membersCheckBoxes)), 'member checkboxes are hidden');
    assert.ok(isEmpty(find(selectInputField)), 'input field is hidden');
  });
});

test('`Check All` checkbox checks all or none', function(assert) {
  const toggleSwitch = '.switch-label';
  const checkAllBox = '.check-all-input';
  const checkBoxes = '.learnergroup-list input:checkbox';

  visit(url);
  click(toggleSwitch);
  andThen(function() {
    assert.ok(!find(checkBoxes).eq(0).prop('checked'));
    assert.ok(!find(checkBoxes).eq(1).prop('checked'));
  });

  click(checkAllBox);
  andThen(function() {
    assert.ok(find(checkBoxes).eq(0).prop('checked'));
    assert.ok(find(checkBoxes).eq(1).prop('checked'));
  });

  click(checkAllBox);
  andThen(function() {
    assert.ok(!find(checkBoxes).eq(0).prop('checked'));
    assert.ok(!find(checkBoxes).eq(1).prop('checked'));
  });
});
