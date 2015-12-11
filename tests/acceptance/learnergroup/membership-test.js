import destroyApp from '../../helpers/destroy-app';
import { module, skip, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';

var application;
var url = '/learnergroups/2';
module('Acceptance: Learner Group - Membership' + testgroup, {
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
    destroyApp(application);
  }
});

test('this group members', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-overview');
    assert.equal(currentPath(), 'learnerGroup');
    assert.equal(getElementText(find('.detail-title', container)), getText('learner group 1 Members (2)'));
    assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(0)'), container), getText('learner group 0 > learner group 1'));
    assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(1)'), container), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(1)'), container), getText('learner group 0 > learner group 1'));

    click('.learnergroup-group-membership:eq(0) .editable').then(function(){
      let options = find('.learnergroup-group-membership:eq(0) select option', container);
      assert.equal(options.length, 7);
      assert.equal(getElementText(options.eq(0)), getText('Select Group'));
      assert.equal(getElementText(options.eq(1)), getText('Remove learners to cohort 0'));
      assert.equal(getElementText(options.eq(2)), getText('Switch learners to learner group 0'));
      assert.equal(getElementText(options.eq(3)), getText('Switch learners to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(4)), getText('Switch learners to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(5)), getText('Switch learners to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(6)), getText('Switch learners to learner group 0 > learner group 2'));
    });
  });
});

//
// This test is currently broken, click-testing passes this test case.
// TODO: revisit/fix. [ST 2015/10/19]
//
/*
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
*/

test('cohort members', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.cohortmembers');
    assert.equal(getElementText(find('.detail-title', container)), getText('Cohort Members NOT assigned to learner group 0 (2)'));
    assert.equal(getElementText(find('.learnergroup-username:eq(0)', container)), getText('7 guy M. Mc7son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(0)', container)), getText('Not in this group'));
    assert.equal(getElementText(find('.learnergroup-username:eq(1)', container)), getText('8 guy M. Mc8son'));
    assert.equal(getElementText(find('.learnergroup-group-membership:eq(1)', container)), getText('Not in this group'));
    click('.learnergroup-group-membership:eq(0) .editable', container).then(function(){
      let options = find('.learnergroup-group-membership:eq(0) select option', container);
      assert.equal(options.length, 6);
      assert.equal(getElementText(options.eq(0)), getText('Select Group'));
      assert.equal(getElementText(options.eq(1)), getText('Switch learners to learner group 0'));
      assert.equal(getElementText(options.eq(2)), getText('Switch learners to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(3)), getText('Switch learners to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(4)), getText('Switch learners to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(5)), getText('Switch learners to learner group 0 > learner group 2'));

      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Switch learners to learner group 0 > learner group 1', assert);
      click(find('.learnergroup-group-membership:eq( 0) .actions .done', container));
      andThen(function(){
        let container = find('.detail-overview');
        // Assertion below needs to be fixed (issue #1157)
        // assert.equal(getElementText(find('.detail-header .info')),getText('Members: 3'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (3)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('1 guy M. Mc1son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(1)'), container), getText('2 guy M. Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(2)'), container), getText('7 guy M. Mc7son'));
      });
    });
  });
});

test('move group member to another subgroup', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-overview');
    click('.learnergroup-group-membership:eq(0) .editable').then(function(){
      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Switch learners to learner group 0 > learner group 2', assert);
      click(find('.learnergroup-group-membership:eq( 0) .actions .done', container));
      andThen(function(){
        // Assertion below needs to be fixed (issue #1157)
        // assert.equal(getElementText(find('.detail-header .info')),getText('Members: 1'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (1)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('2 guy M. Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(0)'), container), getText('learner group 0 > learner group 1'));

        assert.equal(getElementText(find('.toplevelgroupmembers .learnergroup-username:eq(0)')), getText('1 guy M. Mc1son'));
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
      pickOption(find('.learnergroup-group-membership:eq(0) select', container), 'Remove learners to cohort 0', assert);
      click(find('.learnergroup-group-membership:eq( 0) .actions .done', container));
      andThen(function(){
        // Assertion below needs to be fixed (issue #1157)
        // assert.equal(getElementText(find('.detail-header .info')),getText('Members: 1'));
        assert.equal(getElementText(find('.detail-overview .detail-title')), getText('learner group 1 Members (1)'));
        assert.equal(getElementText(find('.detail-content .learnergroup-username:eq(0)'), container), getText('2 guy M. Mc2son'));
        assert.equal(getElementText(find('.detail-content .learnergroup-group-membership:eq(0)'), container), getText('learner group 0 > learner group 1'));

        assert.equal(getElementText(find('.cohortmembers .learnergroup-username:eq(0)')), getText('1 guy M. Mc1son'));
        assert.equal(getElementText(find('.cohortmembers .learnergroup-group-membership:eq(0)')), getText('Not in this group'));
      });
    });
  });
});

skip('multi-edit save (bulk-saving) works properly and knows when to trigger', function(assert) {
  const toggleSwitch = '.switch-label';
  const checkAllBox = '.check-all-input';
  const selectInputField = '.ff-select-field';
  const selectOptionOne = '.ff-option:first';
  const selectOptionTwo = '.ff-option:eq(1)';
  const selectOptionThree = '.ff-option:eq(2)';
  const saveButton = '.save-all';

  // In the top list (single-edit section):
  const member1GroupSE = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(0) .editable';
  // const member2GroupSE = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(1) .editable';

  // In the top list (multi-edit section):
  const member1 = '.learnergroup-list:eq(0) .learnergroup-username:eq(0)';
  const member2 = '.learnergroup-list:eq(0) .learnergroup-username:eq(1)';
  const member3 = '.learnergroup-list:eq(0) .learnergroup-username:eq(2)';
  const member4 = '.learnergroup-list:eq(0) .learnergroup-username:eq(3)';
  const member5 = '.learnergroup-list:eq(0) .learnergroup-username:eq(4)';
  const member6 = '.learnergroup-list:eq(0) .learnergroup-username:eq(5)';
  const member7 = '.learnergroup-list:eq(0) .learnergroup-username:eq(6)';
  const member8 = '.learnergroup-list:eq(0) .learnergroup-username:eq(7)';

  const member1Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(0) .non-editable';
  const member2Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(1) .non-editable';
  const member3Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(2) .non-editable';
  const member4Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(3) .non-editable';
  const member5Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(4) .non-editable';
  const member6Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(5) .non-editable';
  const member7Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(6) .non-editable';
  const member8Group = '.learnergroup-list:eq(0) .learnergroup-group-membership:eq(7) .non-editable';

  // const checkBox1 = '.checkbox:eq(0)'; jshint unused variable
  const checkBox2 = '.checkbox:eq(1)';
  const checkBox3 = '.checkbox:eq(2)';
  const checkBox4 = '.checkbox:eq(3)';
  const checkBox5 = '.checkbox:eq(4)';
  // const checkBox6 = '.checkbox:eq(5)'; jshint unused variable
  // const checkBox7 = '.checkbox:eq(6)'; jshint unused variable
  // const checkBox8 = '.checkbox:eq(7)'; jshint unused variable

  // Learner assignments:
  const LAmember1 = '.learnergroup-list:eq(1) .learnergroup-username:eq(0)';
  const LAmember2 = '.learnergroup-list:eq(1) .learnergroup-username:eq(1)';
  // const LAmember3 = '.learnergroup-list:eq(1) .learnergroup-username:eq(2)'; jshint unused variable
  // const LAmember4 = '.learnergroup-list:eq(1) .learnergroup-username:eq(3)'; jshint unused variable

  const LAmember1Group = '.learnergroup-list:eq(1) .learnergroup-group-membership:eq(0) .editable';
  const LAmember2Group = '.learnergroup-list:eq(1) .learnergroup-group-membership:eq(1) .editable';
  // const LAmember3Group = '.learnergroup-list:eq(1) .learnergroup-group-membership:eq(2) .editable'; jshint unused variable
  // const LAmember4Group = '.learnergroup-list:eq(1) .learnergroup-group-membership:eq(3) .editable'; jshint unused variable

  // Member Not Assigned:
  const NAmember1 = '.learnergroup-list:eq(2) .learnergroup-username:eq(0)';
  const NAmember2 = '.learnergroup-list:eq(2) .learnergroup-username:eq(1)';
  const NAmember3 = '.learnergroup-list:eq(2) .learnergroup-username:eq(2)';
  // const NAmember4 = '.learnergroup-list:eq(2) .learnergroup-username:eq(3)'; jshint unused variable

  const NAmember1Group = '.learnergroup-list:eq(2) .learnergroup-group-membership:eq(0) .editable';
  const NAmember2Group = '.learnergroup-list:eq(2) .learnergroup-group-membership:eq(1) .editable';
  const NAmember3Group = '.learnergroup-list:eq(2) .learnergroup-group-membership:eq(2) .editable';
  // const NAmember4Group = '.learnergroup-list:eq(2) .learnergroup-group-membership:eq(3) .editable'; jshint unused variable

  visit(url);
  click(toggleSwitch);
  andThen(function() {
    assert.equal(find(member1).text(), '1 guy M. Mc1son');
    assert.equal(find(member2).text(), '2 guy M. Mc2son');
    assert.equal(find(member3).text(), '3 guy M. Mc3son');
    assert.equal(find(member4).text(), '4 guy M. Mc4son');
    assert.equal(find(member5).text(), '5 guy M. Mc5son');
    assert.equal(find(member6).text(), '6 guy M. Mc6son');
    assert.equal(find(member7).text(), '7 guy M. Mc7son');
    assert.equal(find(member8).text(), '8 guy M. Mc8son');

    assert.equal(find(member1Group).text(), 'learner group 0 > learner group 1');
    assert.equal(find(member2Group).text(), 'learner group 0 > learner group 1');
    assert.equal(find(member3Group).text(), 'learner group 0 > learner group 1 > learner group 3');
    assert.equal(find(member4Group).text(), 'learner group 0 > learner group 1 > learner group 3');
    assert.equal(find(member5Group).text(), 'learner group 0');
    assert.equal(find(member6Group).text(), 'learner group 0');
    assert.equal(find(member7Group).text(), 'Not in this group');
    assert.equal(find(member8Group).text(), 'Not in this group');
  });

  click(checkAllBox);
  click(saveButton);
  andThen(function() {
    // Checks if request occurs when no option is chosen from the select component
    assert.equal(find(member1).text(), '1 guy M. Mc1son', 'no action was performed b/c no option was chosen');
    assert.equal(find(member1Group).text(), 'learner group 0 > learner group 1', 'no action was performed b/c no option was chosen');
  });

  click(checkAllBox);
  click(selectInputField);
  click(selectOptionOne);
  click(saveButton);
  andThen(function() {
    // Checks if request occurs when no students are checkmarked
    assert.equal(find(member1).text(), '1 guy M. Mc1son', 'no action was performed b/c nothing was checked');
    assert.equal(find(member1).text(), '1 guy M. Mc1son', 'no action was performed b/c nothing was checked');
  });

  click(checkBox2);
  click(saveButton);
  andThen(function() {
    // Checks top box
    assert.equal(find(member6).text(), '2 guy M. Mc2son', 'moved to not assigned');
    assert.equal(find(member6Group).text(), 'Not in this group', 'moved to not assigned');

    // Checks bottom box
    assert.equal(find(NAmember1).text(), '2 guy M. Mc2son', 'moved to not assigned');
    assert.equal(find(NAmember1Group).text(), 'Not in this group', 'moved to not assigned');
  });

  click(checkBox2);
  click(checkBox3);
  click(selectInputField);
  click(selectOptionTwo);
  click(saveButton);
  andThen(function() {
    // Checks top box
    assert.equal(find(member2).text(), '3 guy M. Mc3son', 'changed assignment');
    assert.equal(find(member2Group).text(), 'learner group 0', 'changed assignment');
    assert.equal(find(member3).text(), '4 guy M. Mc4son', 'changed assignment');
    assert.equal(find(member3Group).text(), 'learner group 0', 'changed assignment');

    // Checks middle box
    assert.equal(find(LAmember1).text(), '3 guy M. Mc3son', 'changed assignment');
    assert.equal(find(LAmember1Group).text(), 'learner group 0', 'changed assignment');
    assert.equal(find(LAmember2).text(), '4 guy M. Mc4son', 'changed assignment');
    assert.equal(find(LAmember2Group).text(), 'learner group 0', 'changed assignment');
  });

  click(checkBox2);
  click(checkBox4);
  click(selectInputField);
  click(selectOptionOne);
  click(saveButton);
  andThen(function() {
    // Checks top box
    assert.equal(find(member5).text(), '3 guy M. Mc3son', 'moved to not assigned');
    assert.equal(find(member5Group).text(), 'Not in this group', 'moved to not assigned');
    assert.equal(find(member6).text(), '5 guy M. Mc5son', 'moved to not assigned');
    assert.equal(find(member6Group).text(), 'Not in this group', 'moved to not assigned');

    // Checks bottom box
    assert.equal(find(NAmember2).text(), '3 guy M. Mc3son', 'moved to not assigned');
    assert.equal(find(NAmember2Group).text(), 'Not in this group', 'moved to not assigned');
    assert.equal(find(NAmember3).text(), '5 guy M. Mc5son', 'moved to not assigned');
    assert.equal(find(NAmember3Group).text(), 'Not in this group', 'moved to not assigned');
  });

  click(checkBox5);
  click(selectInputField);
  click(selectOptionThree);
  click(saveButton);
  andThen(function() {
    // Checks top box
    assert.equal(find(member2).text(), '3 guy M. Mc3son', 'moved to original group');
    assert.equal(find(member2Group).text(), 'learner group 0 > learner group 1', 'moved to original group');
  });

  click(toggleSwitch);
  andThen(function() {
    // Checks top box (single-edit)
    assert.equal(find(member1).text(), '1 guy M. Mc1son');
    assert.equal(find(member1GroupSE).text(), 'learner group 0 > learner group 1');

    //@today disabled this test - it works in the app [JJ 11/2015]
    // assert.equal(find(member2).text(), '3 guy M. Mc3son');
    // assert.equal(find(member2GroupSE).text(), 'learner group 0 > learner group 1');
  });
});
