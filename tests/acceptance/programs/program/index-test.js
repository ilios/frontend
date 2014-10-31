import Ember from 'ember';
import startApp from '../../../helpers/start-app';

var App;

module('Acceptance: ProgramsProgramIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting /programs.program.index', function() {
  visit('/programs/0/index');

  andThen(function() {
    equal(currentPath(), 'programs.program.index');
  });
});

test('breadcrumbs /programs.program.index', function() {
  visit('/programs/0/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'All Programs', 'First Test Program'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('program details /programs.program.index', function() {
  expect(8);
  visit('/programs/0/index');

  andThen(function() {
    equal(find('.container fieldset legend').text().trim(), 'First Test Program (Edit)');
    equal(find('.container fieldset p:eq(0)').text().trim(), 'Program Title: First Test Program');
    equal(find('.container fieldset p:eq(1)').text().trim(), 'Short Title: ftp');
    equal(find('.container fieldset p:eq(2)').text().trim(), 'Duration: 4 years');
  });

  visit('/programs/1/index');

  andThen(function() {
    equal(find('.container fieldset legend').text().trim(), 'Second Test Program (Edit)');
    equal(find('.container fieldset p:eq(0)').text().trim(), 'Program Title: Second Test Program');
    equal(find('.container fieldset p:eq(1)').text().trim(), 'Short Title: stp');
    equal(find('.container fieldset p:eq(2)').text().trim(), 'Duration: 1 year');
  });
});

test('program list /programs.program.index', function() {
  expect(16);
  visit('/programs/0/index');

  andThen(function() {
    var firstProgramYearRow = find('.container table:first tbody tr:first');
    equal(find('td:first', firstProgramYearRow).text().trim(), '2013 - 2014');
    equal(find('td:eq(1)', firstProgramYearRow).text().trim(), 'Class of 2017');
    equal(find('td:eq(2)', firstProgramYearRow).text().trim().substring(0,1), '3');
    equal(find('td:eq(3)', firstProgramYearRow).text().trim().substring(0,1), '2');
    equal(find('td:eq(4)', firstProgramYearRow).text().trim().substring(0,1), '1');
    equal(find('td:eq(5)', firstProgramYearRow).text().trim().substring(0,1), '2');
    equal(find('td:eq(6)', firstProgramYearRow).text().trim().substring(0,1), '2');
    equal(find('td:eq(7)', firstProgramYearRow).text().trim(), 'Not Published');

    var secondProgramYearRow = find('.container table:first tbody tr:eq(1)');
    equal(find('td:first', secondProgramYearRow).text().trim(), '2014 - 2015');
    equal(find('td:eq(1)', secondProgramYearRow).text().trim(), 'Class of 2018');
    equal(find('td:eq(2)', secondProgramYearRow).text().trim().substring(0,1), '2');
    equal(find('td:eq(3)', secondProgramYearRow).text().trim().substring(0,1), '2');
    equal(find('td:eq(4)', secondProgramYearRow).text().trim().substring(0,1), '1');
    equal(find('td:eq(5)', secondProgramYearRow).text().trim().substring(0,1), '2');
    equal(find('td:eq(6)', secondProgramYearRow).text().trim().substring(0,1), '1');
    equal(find('td:eq(7)', secondProgramYearRow).text().trim(), 'Not Published');
  });
});

test('program year link /programs.program.index', function() {
  expect(1);
  visit('/programs/0/index');
  click('.container table:first tbody tr:first td:first a');

  andThen(function() {
    equal(currentPath(), 'programs.program.programyear.managecompetencies');
  });
});

test('program isEditable /programs.program.index', function() {
  expect(5);
  visit('/programs/0/index');

  andThen(function() {
    var firstProgramYearRow = find('.container table:first tbody tr:first');
    click('td:eq(8) ul.menu li:contains("Edit")', firstProgramYearRow);
    var select = find('td:first select', firstProgramYearRow);
    equal(select.length, 1);
    equal(find('option', select).length, 9);
    equal(find('option', select).text().indexOf('2014 - 2015'), -1);
    equal(find('option', select).text().trim(), '2009 - 20102010 - 20112011 - 20122012 - 20132013 - 20142015 - 20162016 - 20172017 - 20182018 - 2019');
    equal(select.val(), '2013 - 2014');
  });
});

test('program re-sort /programs.program.index', function() {
  expect(2);
  visit('/programs/0/index');

  andThen(function() {
    var firstProgramYearRow = find('.container table:first tbody tr:first');
    click('td:eq(8) ul.menu li:contains("Edit")', firstProgramYearRow);
    var select = find('td:first select', firstProgramYearRow);
    select.val('2018 - 2019');
    select.trigger('change');
    click('button:contains("Save")', firstProgramYearRow).then(function(){
      equal(find('.container table:first tbody tr:first td:first').text().trim(), '2014 - 2015');
      equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), '2018 - 2019');
    });
  });
});

test('create program year /programs.program.index', function() {
  expect(11);
  visit('/programs/0/index');

  andThen(function() {
    click('button:contains("Create a New Program Year")');
    equal(find('.container table:first tbody tr').length, 3);
    equal(find('.container table:first tbody tr:first td:first').text().trim(), '2013 - 2014');
    equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), '2014 - 2015');
    var select = find('.container table:first tbody tr:last td:first select');
    equal(select.length, 1);
    equal(find('option', select).length, 8);
    equal(find('option', select).text().indexOf('2014 - 2015'), -1);
    equal(find('option', select).text().trim(), '2009 - 20102010 - 20112011 - 20122012 - 20132015 - 20162016 - 20172017 - 20182018 - 2019');
    equal(select.val(), '2018 - 2019');
    click('button:contains("Save")').then(function(){
      equal(find('.container table:first tbody tr:eq(0) td:first').text().trim(), '2013 - 2014');
      equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), '2014 - 2015');
      equal(find('.container table:first tbody tr:eq(2) td:first').text().trim(), '2018 - 2019');
    });
  });
});

test('edit program /programs.program.index', function() {
  expect(1);
  visit('/programs/0/index');
  click('.container fieldset legend a:contains("Edit")');


  andThen(function() {
    equal(currentPath(), 'programs.program.edit');
  });
});
