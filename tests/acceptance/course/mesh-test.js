import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';

var application;
var url = '/courses/1?details=true';
module('Acceptance: Course - Mesh Terms' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('academicYear');

    server.createList('meshTree', 3, {
      descriptor: 1
    });

    server.createList('meshConcept', 3, {
      descriptors: [1]
    });

    server.create('meshConcept', {
      descriptors: [1],
      scopeNote: '1234567890'.repeat(30)
    });

    server.create('meshDescriptor', {
      courses: [1],
      concepts: [1, 2, 3, 4],
      trees: [1, 2, 3]
    });
    server.createList('meshDescriptor', 2, {
      courses: [1]
    });

    server.createList('meshDescriptor', 3, {
    });

    server.create('course', {
      year: 1,
      school: 1,
      meshDescriptors: [1, 2, 3]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list mesh', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    var items = find('ul.columnar-list li', container);
    assert.equal(items.length, 3);
    assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
    assert.equal(getElementText(items.eq(1)), getText('descriptor 1'));
    assert.equal(getElementText(items.eq(2)), getText('descriptor 2'));
  });
});

test('manage mesh', function(assert) {
  assert.expect(34);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    click(find('.detail-actions button', container));
    andThen(function() {
      let meshManager = find('.mesh-manager', container);
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, 3);
      assert.equal(
        getElementText(find('.content .descriptor-name', removableItems.eq(0)).eq(0)),
        getText('descriptor 0')
      );
      assert.equal(getElementText(find('.content .descriptor-id', removableItems.eq(0)).eq(0)), getText('1 - tree number 2'));
      assert.equal(
        getElementText(find('.content .descriptor-name', removableItems.eq(1)).eq(0)),
        getText('descriptor 1')
      );
      assert.equal(getElementText(find('.content .descriptor-id', removableItems.eq(1)).eq(0)), '2');
      assert.equal(
        getElementText(find('.content .descriptor-name', removableItems.eq(2)).eq(0)),
        getText('descriptor 2')
      );
      assert.equal(getElementText(find('.content .descriptor-id', removableItems.eq(2)).eq(0)), '3');
      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results > li', meshManager);
        assert.equal(searchResults.length, 6);
        assert.equal(getElementText(find('.descriptor-name', searchResults.eq(0)).eq(0)), getText('descriptor 0'));
        assert.equal(getElementText(find('.descriptor-id', searchResults.eq(0)).eq(0)), getText('1 - tree number 2'));
        let scopeNotes = find('.mesh-concepts li', searchResults.eq(0));
        assert.equal(scopeNotes.length, 4);
        for(let i = 0; i < 3; i++) {
          assert.equal(getElementText(scopeNotes.eq(i)), getText(`scope note ${i}`));
        }
        assert.equal(getElementText(scopeNotes.eq(3)), '1234567890'.repeat(25));
        assert.ok($(scopeNotes.eq(3)).hasClass('truncated'));
        assert.equal(getElementText(find('.descriptor-name', searchResults.eq(1)).eq(0)), getText('descriptor 1'));
        assert.equal(getElementText(find('.descriptor-name', searchResults.eq(2)).eq(0)), getText('descriptor 2'));
        assert.equal(getElementText(find('.descriptor-name', searchResults.eq(3)).eq(0)), getText('descriptor 3'));
        assert.equal(getElementText(find('.descriptor-name', searchResults.eq(4)).eq(0)), getText('descriptor 4'));
        assert.equal(getElementText(find('.descriptor-name', searchResults.eq(5)).eq(0)), getText('descriptor 5'));
        assert.ok($(searchResults[0]).hasClass('disabled'));
        assert.ok($(searchResults[1]).hasClass('disabled'));
        assert.ok($(searchResults[2]).hasClass('disabled'));
        assert.ok(!$(searchResults[3]).hasClass('disabled'));
        assert.ok(!$(searchResults[4]).hasClass('disabled'));
        assert.ok(!$(searchResults[5]).hasClass('disabled'));

        click('.removable-list li:eq(1)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results > li:eq(1)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[3]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results > li:eq(3)', meshManager)).hasClass('disabled'));
          let removableItems = find('.removable-list li', meshManager);
          assert.equal(
            getElementText(find('.content .descriptor-name', removableItems.eq(0)).eq(0)),
            getText('descriptor 0')
          );
          assert.equal(
            getElementText(find('.content .descriptor-name', removableItems.eq(1)).eq(0)),
            getText('descriptor 2')
          );
          assert.equal(
            getElementText(find('.content .descriptor-name', removableItems.eq(2)).eq(0)),
            getText('descriptor 3')
          );
        });
      });
    });
  });
});

test('save mesh changes', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    click(find('.detail-actions button', container));
    andThen(function() {
      let meshManager = find('.mesh-manager', container);
      fillIn(find('.search-box input', meshManager).eq(0), 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        click('.removable-list li:eq(1)', meshManager).then(()=> {
          click('.mesh-search-results > li:eq(3)', meshManager).then(()=>{
            click('button.bigadd', container);
          });
        });
        andThen(function(){
          var items = find('ul.columnar-list li', container);
          assert.equal(items.length, 3);
          assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
          assert.equal(getElementText(items.eq(1)), getText('descriptor 2'));
          assert.equal(getElementText(items.eq(2)), getText('descriptor 3'));
        });
      });
    });
  });
});



test('cancel mesh changes', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-mesh');
    click(find('.detail-actions button', container));
    andThen(function() {
      let meshManager = find('.mesh-manager', container);
      fillIn(find('.search-box input', meshManager).eq(0), 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        click('.removable-list li:eq(1)', meshManager).then(()=> {
          click('.mesh-search-results li:eq(3)', meshManager).then(()=>{
            click('button.bigcancel', container);
          });
        });

        andThen(function(){
          var items = find('ul.columnar-list li', container);
          assert.equal(items.length, 3);
          assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
          assert.equal(getElementText(items.eq(1)), getText('descriptor 1'));
          assert.equal(getElementText(items.eq(2)), getText('descriptor 2'));
        });
      });
    });
  });
});
