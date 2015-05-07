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
var url = '/program/1/programyear/1';
module('Acceptance: Program Year - Competencies', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school', {
      owningSchool: 1,
      programYears: [1],
      competencies: [1,2,3,4,5,6]
    });
    server.create('program', {
      owningSchool: 1,
      programYears: [1]
    });
    server.create('programYear', {
      program: 1,
      competencies: [2,3]
    });
    server.create('competency', {
      owningSchool: 1,
      children: [2,3]
    });
    server.createList('competency', 2, {
      parent: 1,
      owningSchool: 1,
      programYears: [1]
    });
    server.create('competency', {
      owningSchool: 1,
      children: [5,6],
    });
    server.createList('competency', 2, {
      owningSchool: 1,
      parent: 4
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list', function(assert) {

  visit(url);
  andThen(function() {
    var container = find('.programyear-competencies');
    assert.equal(getElementText(find('.detail-title', container)), getText('Competencies'));
    var competencies = 'competency 0 competency 1 competency 2';
    assert.equal(getElementText(find('.static-list', container)), getText(competencies));
  });
});

test('manager', function(assert) {
  visit(url);
  andThen(function() {
    var container = find('.programyear-competencies');
    click('.add', container).then(function(){
      assert.equal(getElementText(find('.tree-list.selectable', container)), getText('competency3competency4competency5'));
      assert.equal(getElementText(find('.tree-list.removable', container)), getText('competency0competency1competency2'));

      click('.tree-list.selectable li:eq(0) ul li:eq(0)', container);
      click('.tree-list.removable li:eq(0) ul li:eq(0)', container);
      andThen(function(){
        assert.equal(getElementText(find('.tree-list.selectable', container)), getText('competency0competency1competency3competency5'));
        assert.equal(getElementText(find('.tree-list.removable', container)), getText('competency0competency2competency3competency4'));
      });

      click('.bigadd', container);

      andThen(function(){
        var competencies = 'competency 0 competency 2 competency 3 competency 4';
        assert.equal(getElementText(find('.static-list', container)), getText(competencies));
      });
    });
  });
});
