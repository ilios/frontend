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
var url = '/learnergroups/2';
module('Acceptance: Learner Group - Membership', {
  beforeEach: function() {
    application = startApp();
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
      assert.equal(options.length, 6);
      assert.equal(getElementText(options.eq(0)), getText('Remove Learner to cohort 0'));
      assert.equal(getElementText(options.eq(1)), getText('Switch Learner to learner group 0'));
      assert.equal(getElementText(options.eq(2)), getText('Switch Learner to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(3)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(4)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(5)), getText('Switch Learner to learner group 0 > learner group 2'));
    });
  });
});

test('top level group members', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.toplevelgroupmembers');
    assert.equal(getElementText(find('.detail-title', container)), getText('learner group 0 Members NOT in this Subgroup'));
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
      assert.equal(options.length, 6);
      assert.equal(getElementText(options.eq(0)), getText('Remove Learner to cohort 0'));
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
      assert.equal(options.length, 5);
      assert.equal(getElementText(options.eq(0)), getText('Switch Learner to learner group 0'));
      assert.equal(getElementText(options.eq(1)), getText('Switch Learner to learner group 0 > learner group 1'));
      assert.equal(getElementText(options.eq(2)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 3'));
      assert.equal(getElementText(options.eq(3)), getText('Switch Learner to learner group 0 > learner group 1 > learner group 4'));
      assert.equal(getElementText(options.eq(4)), getText('Switch Learner to learner group 0 > learner group 2'));

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
