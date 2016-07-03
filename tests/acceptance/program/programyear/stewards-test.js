import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1/programyears/1';
module('Acceptance: Program Year - Stewards', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school', {
      departments: [1,2,5,6,7,8,9],
      stewardedProgramYears: [1]
    });
    server.create('school', {
      departments: [3],
      stewardedProgramYears: [1,2]
    });
    server.create('school', {
      departments: [4],
      stewardedProgramYears: [3]
    });
    server.create('program', {
      school: 1,
      programYears: [1]
    });
    server.create('programYearSteward', {
      programYear: 1,
      school: 1,
      department: 1
    });
    server.create('programYearSteward', {
      programYear: 1,
      school: 2,
      department: 3
    });
    server.create('programYearSteward', {
      programYear: 1,
      school: 3,
      department: null
    });
    server.create('department', {
      school: 1,
      stewardedProgramYears: [1]
    });
    server.create('department', {
      school: 1
    });
    server.create('department', {
      school: 2,
      stewardedProgramYears: [2]
    });
    server.create('department', {
      school: 3,
    });

    server.createList('department', 5, {
      school: 1
    });
    server.create('programYear', {
      program: 1,
      stewards: [1,2,3]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-stewards');
    assert.equal(getElementText(find('.detail-title', container)), getText('Stewarding Schools and Departments (3)'));
    var items = find('ul.static-list', container);
    assert.equal(getElementText(items), getText('school 0 department 0 school 1 department 2 school 2'));
  });
});

test('save', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    var container = find('.detail-stewards');
    click('.detail-actions button', container).then(function(){
      assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 school 2 department 3'));
      assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 0 school 1 department 2 school 2'));
      click('.tree-list.selectable li:eq(0) ul li:eq(0)', container);
      click('.tree-list.removable li:eq(0) ul li:eq(0)', container);
      andThen(function(){
        assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 0 department 0 department 4 department 5 department 6 department 7 department 8 school 1 school 2 department 3'));
        assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 1 school 1 department 2 school 2'));
      });

      click('.bigadd', container);

      andThen(function(){
        assert.equal(getElementText(find('.static-list', container)), getText('school 0 department 1 school 1 department 2 school 2'));
      });
    });
  });
});

test('select school and all departments', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.detail-stewards');
    click('.detail-actions button', container).then(function(){
      click('.tree-list.selectable li:eq(0)', container);
      andThen(function(){
        assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 1 school 2 department 3'));
        assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
      });

      click('.bigadd', container);

      andThen(function(){
        assert.equal(getElementText(find('.static-list', container)), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
      });
    });
  });
});

test('select all departments but not school', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.detail-stewards');
    //click and then wait for each department in the list
    click('.detail-actions button', container).then(function(){
      click('.tree-list.selectable li:eq(0) li', container).then(()=>{
        click('.tree-list.selectable li:eq(0) li', container).then(()=>{
          click('.tree-list.selectable li:eq(0) li', container).then(()=>{
            click('.tree-list.selectable li:eq(0) li', container).then(()=>{
              click('.tree-list.selectable li:eq(0) li', container).then(()=>{
                click('.tree-list.selectable li:eq(0) li', container).then(()=>{
                });
              });
            });
          });
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 0 school 1 school 2 department 3'));
        assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
      });

      click('.bigadd', container);

      andThen(function(){
        assert.equal(getElementText(find('.static-list', container)), getText('school 0 department 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 department 2 school 2'));
      });
    });
  });
});

test('remove solo school with no departments', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.detail-stewards');
    click('.detail-actions button', container).then(function(){
      click('.tree-list.removable>li:eq(2) span', container);
      andThen(function(){
        assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 school 2 department 3'));
        assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 0 school 1 department 2'));
      });

      click('.bigadd', container);

      andThen(function(){
        assert.equal(getElementText(find('.static-list', container)), getText('school 0 department 0 school 1 department 2'));
      });
    });
  });
});

test('cancel', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    var container = find('.detail-stewards');
    click('.detail-actions button', container).then(function(){
      assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 0 department 1 department 4 department 5 department 6 department 7 department 8 school 1 school 2 department 3'));
      assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 0 school 1 department 2 school 2'));
      click('.tree-list.selectable li:eq(0) ul li:eq(0)', container);
      click('.tree-list.removable li:eq(0) ul li:eq(0)', container);
      andThen(function(){
        assert.equal(getElementText(find('.tree-list.selectable', container)), getText('school 0 department 0 department 4 department 5 department 6 department 7 department 8 school 1 school 2 department 3'));
        assert.equal(getElementText(find('.tree-list.removable', container)), getText('school 0 department 1 school 1 department 2 school 2'));
      });

      click('.bigcancel', container);

      andThen(function(){
        assert.equal(getElementText(find('.static-list', container)), getText('school 0 department 0 school 1 department 2 school 2'));
      });
    });
  });
});
