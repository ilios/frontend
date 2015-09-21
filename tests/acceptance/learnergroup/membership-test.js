import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

const { isEmpty } = Ember;

var application;
var url = '/learnergroups/2';
module('Acceptance: Learner Group - Membership', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.createList('user', 2, {
      cohorts: [1],
      learnerGroups: [1,2]
    });
    server.createList('user', 2, {
      cohorts: [1],
      learnerGroups: [1,2,4]
    });
    server.createList('user', 2, {
      cohorts: [1],
      learnerGroups: [1]
    });
    server.createList('user', 2, {
      cohorts: [1]
    });
    server.create('cohort', {
      users: [2,3,4,5,6,7,8,9],
      learnerGroups: [1,2,3,4,5,6]
    });
    server.create('learnerGroup', {
      cohort: 1,
      children: [2,3],
      users: [2,3,6,7]
    });
    server.create('learnerGroup', {
      cohort: 1,
      parent: 1,
      children: [4,5],
      users: [2,3,4,5],
    });
    server.create('learnerGroup', {
      cohort: 1,
      parent: 1
    });
    server.create('learnerGroup', {
      cohort: 1,
      users: [4,5],
      parent: 2
    });
    server.createList('learnerGroup', 2, {
      cohort: 1,
      parent: 2
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('this group members', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-overview');
    assert.equal(currentPath(), 'learnerGroup');
    assert.equal(getElementText(find('.detail-title', container)), getText('learner group 1 Members (2)'));
    assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('1 guy Mc1son'));
    assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(0)'), container), getText('learner group 0 > learner group 1'));
    assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(1)'), container), getText('2 guy Mc2son'));
    assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(1)'), container), getText('learner group 0 > learner group 1'));

    click('.learnergroup-group-membership:eq(0) .editable').then(function(){
      let options = find('.learnergroup-group-membership:eq(0) select option', container);
      assert.equal(options.length, 7);
      assert.equal(getElementText(options.eq(0)), getText('Select Group'));
      assert.equal(getElementText(options.eq(1)), getText('Remove Learner to cohort 0'));
      assert.equal(getElementText(options.eq(2)), getText('Switch Learner to learner group 0'));
      assert.equal(getElementText(options.eq(3)), getText('Switch Learner to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(4)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(5)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(6)), getText('Switch Learner to learner group 0 > learner group 2'));
    });
  });
});

test('top level group members', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.toplevelgroupmembers');
    assert.equal(getElementText(find('.detail-title', container)), getText('learner group 0 Learner Assignments'));
    assert.equal(getElementText(find('.learnergroup-username:eq(0)', container)), getText('3 guy Mc3son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(0)', container)), getText('learner group 0 > learner group 1 > learner group 3'));
    assert.equal(getElementText(find('.learnergroup-username:eq(1)', container)), getText('4 guy Mc4son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(1)', container)), getText('learner group 0 > learner group 1  > learner group 3'));
    assert.equal(getElementText(find('.learnergroup-username:eq(2)', container)), getText('5 guy Mc5son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(2)', container)), getText('learner group 0'));
    assert.equal(getElementText(find('.learnergroup-username:eq(3)', container)), getText('6 guy Mc6son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(3)', container)), getText('learner group 0'));
    click('.learnergroup-group-membership:eq(0) .editable', container).then(function(){
      let options = find('.learnergroup-group-membership:eq(0) select option', container);
      assert.equal(options.length, 7);
      assert.equal(getElementText(options.eq(0)), getText('Select Group'));
      assert.equal(getElementText(options.eq(1)), getText('Remove Learner to cohort 0'));
      assert.equal(getElementText(options.eq(2)), getText('Switch Learner to learner group 0'));
      assert.equal(getElementText(options.eq(3)), getText('Switch Learner to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(4)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(5)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(6)), getText('Switch Learner to learner group 0 > learner group 2'));
      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Switch Learner to learner group 0 > learner group 1', assert);
      click(find('.learnergroup-group-membership:eq(0) .actions .done', container));
      andThen(function(){
        let container = find('.detail-overview');
        assert.equal(getElementText(find('.detail-header .info')),getText('Members: 3'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (3)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('1 guy Mc1son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(1)'), container), getText('2 guy Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(2)'), container), getText('3 guy Mc3son'));
      });
    });
  });
});

test('cohort members', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.cohortmembers');
    assert.equal(getElementText(find('.detail-title', container)), getText('Cohort Members NOT assigned to learner group 0'));
    assert.equal(getElementText(find('.learnergroup-username:eq(0)', container)), getText('7 guy Mc7son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(0)', container)), getText('Not in this group'));
    assert.equal(getElementText(find('.learnergroup-username:eq(1)', container)), getText('8 guy Mc8son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(1)', container)), getText('Not in this group'));
    click('.learnergroup-group-membership:eq(0) .editable', container).then(function(){
      let options = find('.learnergroup-group-membership:eq(0) select option', container);
      assert.equal(options.length, 6);
      assert.equal(getElementText(options.eq(0)), getText('Select Group'));
      assert.equal(getElementText(options.eq(1)), getText('Switch Learner to learner group 0'));
      assert.equal(getElementText(options.eq(2)), getText('Switch Learner to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(3)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(4)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(5)), getText('Switch Learner to learner group 0 > learner group 2'));

      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Switch Learner to learner group 0 > learner group 1', assert);
      click(find('.learnergroup-group-membership:eq( 0) .actions .done', container));
      andThen(function(){
        let container = find('.detail-overview');
        assert.equal(getElementText(find('.detail-header .info')),getText('Members: 3'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (3)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('1 guy Mc1son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(1)'), container), getText('2 guy Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(2)'), container), getText('7 guy Mc7son'));
      });
    });
  });
});

test('move group member to another subgroup', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-overview');
    click('.learnergroup-group-membership:eq(0) .editable').then(function(){
      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Switch Learner to learner group 0 > learner group 2', assert);
      click(find('.learnergroup-group-membership:eq( 0) .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.detail-header .info')),getText('Members: 1'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (1)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('2 guy Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(0)'), container), getText('learner group 0 > learner group 1'));

        assert.equal(getElementText(find('.toplevelgroupmembers .learnergroup-username:eq(0)')), getText('1 guy Mc1son'));
        assert.equal(getElementText(find('.toplevelgroupmembers .learnergroup-group-membership:eq(0)')), getText('learner group 0 > learner group 2'));
      });
    });
  });
});

test('remove group member back to cohort', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-overview');
    click('.learnergroup-group-membership:eq(0) .editable').then(function(){
      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Remove Learner to cohort 0', assert);
      click(find('.learnergroup-group-membership:eq( 0) .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.detail-header .info')),getText('Members: 1'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (1)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('2 guy Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(0)'), container), getText('learner group 0 > learner group 1'));

        assert.equal(getElementText(find('.cohortmembers .learnergroup-username:eq(0)')), getText('1 guy Mc1son'));
        assert.equal(getElementText(find('.cohortmembers .learnergroup-group-membership:eq(0)')), getText('Not in this group'));
      });
    });
  });
});

test('`Include Entire Cohort` checkbox checks all or none', function(assert) {
  const toggleSwitch = '.switch-label';
  const checkAllBox = '.multi-edit-box .ember-checkbox';
  const checkBoxes = '.learnergroup-list .ember-checkbox';

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

test('multi-edit save (bulk-saving) works properly (moving to NOT ASSIGNED) - (1/2)', function(assert) {
  const toggleSwitch = '.switch-label';
  const checkAllBox = '.multi-edit-box .ember-checkbox';
  const selectInputField = '.ff-select-field';
  const selectOptionOne = '.ff-option:first';
  const saveButton = '.save-all';
  const learnerMembersOne = '.learnergroup-list:eq(0) .learnergroup-username:eq(0)';
  const learnerMembersOneGroup = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(0) .non-editable';
  const learnerMembersTwo = '.learnergroup-list:eq(0) .learnergroup-username:eq(1)';
  const learnerMembersTwoGroup = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(1) .non-editable';
  const learnerNotAssignedOne = '.learnergroup-list:eq(2) .learnergroup-username:eq(0)';
  const learnerNotAssignedOneGroup = '.learnergroup-list:eq(2) .learnergroup-group-membership:eq(0) .editable';
  const learnerNotAssignedTwo = '.learnergroup-list:eq(2) .learnergroup-username:eq(1)';
  const learnerNotAssignedTwoGroup = '.learnergroup-list:eq(2) .learnergroup-group-membership:eq(1) .editable';

  visit(url);
  click(toggleSwitch);
  andThen(function() {
    assert.equal(find(learnerMembersOne).text(), '1 guy Mc1son', 'learner member one is assigned');
    assert.equal(find(learnerMembersTwo).text(), '2 guy Mc2son', 'learner member two is assigned');
    assert.equal(find(learnerMembersOneGroup).text(), 'learner group 0 > learner group 1', 'group assignment is correct');
    assert.equal(find(learnerMembersTwoGroup).text(), 'learner group 0 > learner group 1', 'group assignment is correct');
    assert.equal(find(learnerNotAssignedOne).text(), '7 guy Mc7son', 'leaner member is not assigned');
    assert.equal(find(learnerNotAssignedTwo).text(), '8 guy Mc8son', 'learner member is not assigned');
  });

  click(checkAllBox);
  click(saveButton);
  andThen(function() {
    assert.equal(find(learnerMembersOne).text(), '1 guy Mc1son', 'no action was performed b/c no option was chosen');
    assert.equal(find(learnerMembersTwo).text(), '2 guy Mc2son', 'no action was performed b/c no option was chosen');
  });

  click(checkAllBox);
  click(selectInputField);
  click(selectOptionOne);
  click(saveButton);
  andThen(function() {
    assert.equal(find(learnerMembersOne).text(), '1 guy Mc1son', 'no action was performed b/c nothing was checked');
    assert.equal(find(learnerMembersTwo).text(), '2 guy Mc2son', 'no action was performed b/c nothing was checked');
  });

  click(checkAllBox);
  click(saveButton);
  andThen(function() {
    assert.ok(isEmpty(find(learnerMembersOne)), '1 guy Mc1son was removed from cohort');
    assert.ok(isEmpty(find(learnerMembersTwo)), '2 guy Mc2son was removed from cohort');
    assert.equal(find(learnerNotAssignedOne).text(), '1 guy Mc1son', '1 guy Mc1son was moved to the unassigned group');
    assert.equal(find(learnerNotAssignedOneGroup).text(), 'Not in this group', 'group is correct');
    assert.equal(find(learnerNotAssignedTwo).text(), '2 guy Mc2son', '2 guy Mc2son was moved to the unassigned group');
    assert.equal(find(learnerNotAssignedTwoGroup).text(), 'Not in this group', 'group is correct');
  });
});

test('multi-edit save (bulk-saving) works properly (moving to ASSIGNED) - (2/2)', function(assert) {
  const toggleSwitch = '.switch-label';
  const checkAllBox = '.multi-edit-box .ember-checkbox';
  const selectInputField = '.ff-select-field';
  const selectOptionTwo = '.ff-option:eq(1)';
  const saveButton = '.save-all';
  const learnerMembersOne = '.learnergroup-list:eq(0) .learnergroup-username:eq(0)';
  const learnerMembersTwo = '.learnergroup-list:eq(0) .learnergroup-username:eq(1)';
  const learnerAssignedOne = '.learnergroup-list:eq(1) .learnergroup-username:eq(0)';
  const learnerAssignedOneGroup = '.learnergroup-list:eq(1) .learnergroup-group-membership:eq(0) .editable';
  const learnerAssignedTwo = '.learnergroup-list:eq(1) .learnergroup-username:eq(1)';
  const learnerAssignedTwoGroup = '.learnergroup-list:eq(1) .learnergroup-group-membership:eq(1) .editable';

  visit(url);
  andThen(function() {
    assert.equal(find(learnerAssignedOne).text(), '3 guy Mc3son', 'learner is assigned');
    assert.equal(find(learnerAssignedTwo).text(), '4 guy Mc4son', 'learner is assigned');
  });

  click(toggleSwitch);
  click(checkAllBox);
  click(selectInputField);
  click(selectOptionTwo);
  click(saveButton);
  andThen(function() {
    assert.ok(isEmpty(find(learnerMembersOne)), 'learner was removed');
    assert.ok(isEmpty(find(learnerMembersTwo)), 'learner was removed');
    assert.equal(find(learnerAssignedOne).text(), '1 guy Mc1son', 'learner was assigned');
    assert.equal(find(learnerAssignedOneGroup).text(), 'learner group 0', 'group is correct');
    assert.equal(find(learnerAssignedTwo).text(), '2 guy Mc2son', 'learner was assigned');
    assert.equal(find(learnerAssignedTwoGroup).text(), 'learner group 0', 'group is correct');
  });
});
