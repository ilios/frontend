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
var url = '/programs/1';
module('Acceptance: Program - ProgramYear List', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check list', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1,2,3]
  });
  for(let i = 1; i <= 3; i++){
    server.create('cohort', {
      programYear: i
    });
  }
  var last = server.create('programYear', {
    program: 1,
    startYear: 2012,
    cohort: 1,
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
    startYear: 2010,
    cohort: 2,
  });
  var secondProgramYear = server.create('programYear', {
    program: 1,
    startYear: 2011,
    cohort: 3,
  });
  visit(url);
  andThen(function() {
    var container = find('.programyear-list');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, 3);
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))), getText('2010 - 2011'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), getText('cohort1'));
    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))), getText('2011 - 2012'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), getText('cohort2'));
    assert.equal(getElementText(find('td:eq(0)', rows.eq(2))), getText('2012 - 2013'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(2))), getText('cohort0'));
  });
});

test('check competencies', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  server.createList('competency', 5, {
    programYear: 1
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
    competencies: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(2)')), 5);
  });
});

test('check objectives', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  server.createList('objective', 5, {
    programYear: 1
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
    objectives: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(3)')), 5);
  });
});

test('check directors', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  server.createList('user', 5, {
    programYear: 1
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
    directors: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(4)')), 5);
  });
});

test('check topics', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  server.createList('discipline', 5, {
    programYear: 1
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
    disciplines: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(5)')), 5);
  });
});

test('check warnings', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
  });
  visit(url);
  andThen(function() {
    var tds = find('.programyear-list tbody tr:eq(0) td');
    for(let i =2; i< 6; i++){
      let icon = find('i', tds.eq(i));
      assert.ok(icon);
      assert.ok(icon.hasClass('warning'));
    }
  });
});

test('check link', function(assert) {
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  var firstProgramYear = server.create('programYear', {
    program: 1,
  });
  visit(url);
  andThen(function() {
    click('.programyear-list tbody tr:eq(0) td:eq(0) a').then(function(){
      assert.equal(currentPath(), 'program.programYear.index');
    });
  });
});

test('new program year', function(assert) {
  server.createList('user', 3, {
    directedProgramYears: [1]
  });
  server.createList('competency', 3, {
    programYears: [1]
  });
  server.createList('discipline', 3, {
    programYears: [1]
  });
  server.createList('objective', 3, {
    programYears: [1]
  });
  server.create('programYearSteward', {
    department: 1,
    programYear: 1
  });
  var program = server.create('program', {
    owningSchool: 1,
    programYears: [1]
  });
  var currentYear = parseInt(moment().format('YYYY'));
  var firstProgramYear = server.create('programYear', {
    program: 1,
    startYear: currentYear,
    cohort: 1,
    directors: [2,3,4],
    competencies: [1,2,3],
    disciplines: [1,2,3],
    objectives: [1,2,3],
    stewards: [1],
  });
  server.create('cohort', {
    programYear: 1
  });
  visit(url);
  var newAcademicYear = currentYear+1 + ' - ' + (currentYear+2);
  andThen(function() {
    var container = find('.programyear-list');
    click('.detail-actions button', container);
    andThen(function(){
      let items = find('.newprogramyear option');
      assert.equal(items.length, 9);
      let expectedItems = [];
      var firstYear = parseInt(moment().subtract(5, 'years').format('YYYY'));
      for(let i = 0; i < 10; i++){
        var startYear = firstYear+i;
        if(startYear !== firstProgramYear.startYear){
          expectedItems.pushObject(
            (startYear) + ' - ' + (startYear+1)
          );
        }
      }
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
      pickOption('.newprogramyear select', newAcademicYear, assert);
      click('.newprogramyear .done', container);
    });
  });
  andThen(function(){
    assert.equal(currentPath(), 'program.index');
    var container = find('.programyear-list');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, 2);
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))), getText(currentYear + ' - ' + (currentYear+1)));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), getText('cohort0'));
    let firstRowTds = find('td', rows.eq(0));
    for(let i =2; i<5; i++){
      assert.equal(getElementText(firstRowTds.eq(i)), 3);
    }
    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))), getText(newAcademicYear));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), getText('Class of ' + (currentYear+1+program.duration)));

    let secondRowTds = find('td', rows.eq(1));
    for(let i =2; i<5; i++){
      assert.equal(getElementText(secondRowTds.eq(i)), 3);
    }
  });
});
