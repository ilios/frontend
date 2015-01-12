import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsProgramProgramyearManageobjectives', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  visit('/programs/school/0/program/0/years/0/manageobjectives');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.program.programyear.manageobjectives');
    equal(find('#program-year-title').text().trim(), 'First Test Program 2014 - 2015 Class of 2018');
  });
});

test('breadcrumbs', function() {
  visit('/programs/school/0/program/0/years/0/manageobjectives');

  andThen(function() {
    var expectedCrumbs = [
      'Home',
      'All Programs',
      'First School',
      'First Test Program',
      '2014 - 2015',
      'Objectives'
    ];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('badge value', function() {
  expect(2);
  visit('/programs/school/0/program/0/years/0/manageobjectives');

  andThen(function() {
    equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '2');
    click('button:contains("Create a new objective")').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '3');
    });
  });
});

test('objective list', function() {
  expect(6);
  visit('/programs/school/0/program/0/years/0/manageobjectives');

  andThen(function() {
    var firstRow = find('#program-year-directors table:first tbody tr:eq(0)');
    equal(find('td:eq(0)', firstRow).text().trim(), 'First Objective');
    equal(find('td:eq(1)', firstRow).text().trim(), 'Third Competency');
    equal(find('td:eq(2)', firstRow).text().trim(), 'First Mesh Term');

    var secondRow = find('#program-year-directors table:first tbody tr:eq(1)');
    equal(find('td:eq(0)', secondRow).text().trim(), 'Second Objective');
    equal(find('td:eq(1)', secondRow).text().trim(), 'First Child Competency');
    equal(find('td:eq(2)', secondRow).text().trim(), '');
  });
});

test('create new', function() {
  expect(5);
  visit('/programs/school/0/program/0/years/0/manageobjectives');
  click('button:contains("Create a new objective")');

  andThen(function() {
    var row = find('#program-year-directors table:first tbody tr:eq(2)');
    ok(find('td:eq(0) textarea', row));
    ok(find('td:eq(1) select', row));
    equal(find('td:eq(2) button', row).text().trim(), "Select MeSH (0)");
    ok(find('td:eq(3) button:contains("Done")', row));
    fillIn('#program-year-directors table:first tbody tr:eq(2) td:eq(0) textarea', 'aaa Test');
    click('button:contains("Done")', row).then(function(){
      equal(find('#program-year-directors table:first tbody tr').length, 3);
      //disabled currently since phantomsjs was dying here
      // equal(find('#program-year-directors table:first tbody tr:eq(0) td:eq(0)').text().trim(), 'aaa Test');
      // equal(find('#program-year-directors table:first tbody tr:eq(1) td:eq(0)').text().trim(), 'First Objective');
    });
  });
});

test('edit', function() {
  expect(6);
  visit('/programs/school/0/program/0/years/0/manageobjectives');
  click('#program-year-directors table:first tbody tr:eq(0) li:contains("Edit")');

  andThen(function() {
    var row = find('#program-year-directors table:first tbody tr:eq(0)');
    ok(find('td:eq(0) textarea', row));
    ok(find('td:eq(1) select', row));
    equal(find('td:eq(2) button', row).text().trim(), "Select MeSH (1)");
    equal(find('td:eq(3) button', row).text().trim(), "Done");
    fillIn('#program-year-directors table:first tbody tr:eq(0) td:eq(0) textarea', 'xxxEdited Objective');
    var select = find('td:eq(1) select', row);
    find('option', select).filter(function() {
      return this.text === "First Child Competency";
    }).attr('selected', true);
    select.trigger('change');
    click('td:eq(3) button', row).then(function(){
      equal(find('#program-year-directors table:first tbody tr:eq(1) td:eq(0)').text().trim(), 'xxxEdited Objective');
      equal(find('#program-year-directors table:first tbody tr:eq(1) td:eq(1)').text().trim(), 'First Child Competency');
    });
  });
});

test('competency list', function() {
  expect(1);
  visit('/programs/school/0/program/0/years/1/manageobjectives');
  click('#program-year-directors table:first tbody tr:eq(0) li:contains("Edit")');

  andThen(function() {
    var row = find('#program-year-directors table:first tbody tr:eq(0)');
    equal(find('td:eq(1) select', row).text().trim(), 'First Child CompetencyThird Competency');
  });
});
