import Ember from 'ember';
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1/programyears/1?pyObjectiveDetails=true';
module('Acceptance: Program Year - Objectives', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school', {
      school: 1,
      programs: [1],
      competencies: [1,2,3,4,5]
    });
    server.create('program', {
      school: 1,
      programYears: [1]
    });
    server.create('programYear', {
      program: 1,
      competencies: [2,3,4,5],
      objectives: [1,2,3]
    });
    server.create('cohort');
    server.create('competency', {
      school: 1,
      children: [2,3]
    });
    server.create('competency', {
      parent: 1,
      school: 1,
      programYears: [1],
      objectives: [1]
    });
    server.create('competency', {
      parent: 1,
      school: 1,
      programYears: [1],
    });
    server.create('competency', {
      school: 1,
      programYears: [1],
      objectives: [2]
    });
    server.create('competency', {
      school: 1,
      programYears: [1],
    });
    server.createList('meshDescriptor', 2, {
      objectives: [1]
    });
    server.createList('meshDescriptor', 2);

    server.create('objective', {
      programYears: [1],
      competency: 2,
      meshDescriptors: [1,2]
    });
    server.create('objective', {
      programYears: [1],
      competency: 4
    });
    server.create('objective', {
      programYears: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list', function(assert) {
  visit(url);
  andThen(function() {
    let objectiveRows = find('.programyear-objective-list tbody tr');
    assert.equal(objectiveRows.length, 3);
    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(0))), getText('objective 0'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(0))), getText('competency 1 (competency 0)'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(0))), getText('descriptor 0 descriptor 1'));

    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(1))), getText('objective 1'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(1))), getText('competency 3'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(1))), getText('Add New'));

    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(2))), getText('objective 2'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(2))), getText('Add New'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(2))), getText('Add New'));
  });
});

test('manage terms', function(assert) {
  assert.expect(21);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives).then(function(){
      assert.equal(getElementText(find('.specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');
    });

    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, 2);
      assert.equal(getElementText(find('.content .title', removableItems.eq(0)).eq(0)), getText('descriptor 0'));
      assert.equal(getElementText(find('.content .title', removableItems.eq(1)).eq(0)), getText('descriptor 1'));

      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        assert.equal(searchResults.length, 4);

        assert.equal(getElementText(find('.descriptor-name', searchResults[0]).eq(0)), getText('descriptor 0'));
        assert.equal(getElementText(find('.descriptor-name', searchResults[1]).eq(0)), getText('descriptor 1'));
        assert.equal(getElementText(find('.descriptor-name', searchResults[2]).eq(0)), getText('descriptor 2'));
        assert.equal(getElementText(find('.descriptor-name', searchResults[3]).eq(0)), getText('descriptor 3'));
        assert.ok($(searchResults[0]).hasClass('disabled'));
        assert.ok($(searchResults[1]).hasClass('disabled'));
        assert.ok(!$(searchResults[2]).hasClass('disabled'));
        assert.ok(!$(searchResults[3]).hasClass('disabled'));
        click('.removable-list li:eq(0)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[2]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
          assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'));

          removableItems = find('.removable-list li', meshManager);
          assert.equal(removableItems.length, 2);
          assert.equal(
            getElementText(find('.content .title', removableItems.eq(0)).eq(0)),
            getText('descriptor 1')
          );
          assert.equal(
            getElementText(find('.content .title', removableItems.eq(1)).eq(0)),
            getText('descriptor 2')
          );
        });
      });
    });
  });
});

test('save terms', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click('button.bigadd', detailObjectives);
        andThen(function(){
          let tds = find('.programyear-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText('descriptor 1 descriptor 2'));
        });
      });
    });
  });
});

test('cancel term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) .link', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click(searchResults[3]);
        click('button.bigcancel', detailObjectives);
        andThen(function(){
          let tds = find('.programyear-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText('descriptor 0 descriptor 1'));
        });
      });
    });
  });
});

test('manage competencies', function(assert) {
  assert.expect(14);
  visit(url);
  andThen(function() {
    let tds = find('.programyear-objective-list tbody tr:eq(0) td');
    assert.equal(tds.length, 3);
    click('.link', tds.eq(1));
    andThen(function() {
      assert.equal(getElementText(find('.specific-title')), 'SelectParentCompetencyforObjective');
      let objectiveManager = find('.objective-manage-competency').eq(0);
      assert.equal(getElementText(find('.objectivetitle', objectiveManager)), getText('objective 0'));
      assert.equal(getElementText(find('.parent-picker', objectiveManager)), getText('competency0 competency1 competency2 competency3 competency4'));
      let items = find('.parent-picker .clickable');
      assert.equal(items.length, 4);
      assert.ok(find('.parent-picker h5:eq(0)').hasClass('selected'));
      assert.ok($(items[0]).hasClass('selected'));
      assert.ok(!$(items[1]).hasClass('selected'));
      assert.ok(!find('.parent-picker h5:eq(1)').hasClass('selected'));
      assert.ok(!find('.parent-picker h5:eq(2)').hasClass('selected'));

      andThen(function(){
        click('.parent-picker .clickable:eq(2)', objectiveManager).then(function(){
          items = find('.parent-picker .clickable');
          assert.ok(!$(items[0]).hasClass('selected'));
          assert.ok(!$(items[1]).hasClass('selected'));
          assert.ok($(items[2]).hasClass('selected'));
          assert.ok(!$(items[3]).hasClass('selected'));
        });
      });
    });
  });
});

test('save competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker .clickable:eq(1)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
        assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 2 (competency 0)'));
      });
    });
  });
});

test('save no competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker .clickable:eq(0)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
        assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('Add New'));
      });
    });
  });
});

test('cancel competency change', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(1)', objectiveManager).then(function(){
        click('.detail-objectives button.bigcancel');
      });
      andThen(function(){
        assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1 (competency 0)'));
      });
    });
  });
});

test('cancel remove competency change', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) .link');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(0)', objectiveManager).then(function(){
        click('.detail-objectives button.bigcancel');
      });
      andThen(function(){
        assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1 (competency 0)'));
      });
    });
  });
});

test('add competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(2) td:eq(1) button');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker .clickable:eq(1)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
        assert.equal(getElementText(find('.programyear-objective-list tbody tr:eq(2) td:eq(1)')), getText('competency 2 (competency 0)'));
      });
    });
  });
});

test('empty objective title can not be saved', function(assert) {
  assert.expect(4);
  visit(url);
  const container = '.programyear-objective-list';
  const title = `${container} tbody tr:eq(0) td:eq(0)`;
  const edit = `${title} .editable span`;
  const editor = `${title} .fr-box`;
  const initialObjectiveTitle = 'objective 0';
  const save = `${title} .done`;
  const errorMessage = `${title} .validation-error-message`;

  andThen(function() {
    assert.equal(getElementText(title), getText(initialObjectiveTitle));
    click(edit);
    andThen(function(){
      //wait for the editor to load
      Ember.run.later(()=>{

        let editorContents = find(editor).data('froala.editor').$el.text();
        assert.equal(getText(editorContents), getText(initialObjectiveTitle));

        find(editor).froalaEditor('html.set', '<p>&nbsp</p><div></div><span>  </span>');
        find(editor).froalaEditor('events.trigger', 'contentChanged');
        Ember.run.later(()=>{
          assert.equal(getElementText(errorMessage), getText('This field cannot be blank'));
          assert.ok(find(save).is(':disabled'));
        }, 100);
      }, 100);
    });
  });
});
