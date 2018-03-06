import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/courses/1?details=true';
module('Acceptance: Course - Mesh Terms', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear');
    server.createList('meshTree', 3);
    server.createList('meshConcept', 3);

    server.create('meshConcept', {
      scopeNote: '1234567890'.repeat(30)
    });

    server.create('meshDescriptor', {
      conceptIds: [1, 2, 3, 4],
      treeIds: [1, 2, 3]
    });
    server.create('meshDescriptor', {
      deleted: true
    });
    server.createList('meshDescriptor', 4);

    server.create('course', {
      year: 2014,
      schoolId: 1,
      meshDescriptorIds: [1, 2, 3]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list mesh', async function(assert) {
  assert.expect(4);
  await visit(url);
  var container = find('.detail-mesh');
  var items = find('ul.selected-mesh-terms li .term-title', container);
  assert.equal(items.length, 3);
  assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(items.eq(1)), getText('descriptor 1'));
  assert.equal(getElementText(items.eq(2)), getText('descriptor 2'));
});

test('manage mesh', async function(assert) {
  assert.expect(34);
  await visit(url);
  var container = find('.detail-mesh');
  await click(find('.actions button', container));
  let meshManager = find('.mesh-manager', container);
  let removableItems = find('.selected-terms li', meshManager);
  assert.equal(removableItems.length, 3);
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(0)).eq(0)),
    getText('descriptor 0')
  );
  assert.equal(getElementText(find('.term-details', removableItems.eq(0)).eq(0)), getText('1 - tree number 2'));
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(1)).eq(0)),
    getText('descriptor 1')
  );
  assert.equal(getElementText(find('.term-details', removableItems.eq(1)).eq(0)), getText('2 - (depr.)'));
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(2)).eq(0)),
    getText('descriptor 2')
  );
  assert.equal(getElementText(find('.term-details', removableItems.eq(2)).eq(0)), '3');
  let searchBox = find('.search-box', meshManager);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', searchBox);
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
  assert.ok(find(scopeNotes.eq(3)).hasClass('truncated'));
  assert.equal(getElementText(find('.descriptor-name', searchResults.eq(1)).eq(0)), getText('descriptor 1'));
  assert.equal(getElementText(find('.descriptor-name', searchResults.eq(2)).eq(0)), getText('descriptor 2'));
  assert.equal(getElementText(find('.descriptor-name', searchResults.eq(3)).eq(0)), getText('descriptor 3'));
  assert.equal(getElementText(find('.descriptor-name', searchResults.eq(4)).eq(0)), getText('descriptor 4'));
  assert.equal(getElementText(find('.descriptor-name', searchResults.eq(5)).eq(0)), getText('descriptor 5'));
  assert.ok(find(searchResults[0]).hasClass('disabled'));
  assert.ok(find(searchResults[1]).hasClass('disabled'));
  assert.ok(find(searchResults[2]).hasClass('disabled'));
  assert.ok(!find(searchResults[3]).hasClass('disabled'));
  assert.ok(!find(searchResults[4]).hasClass('disabled'));
  assert.ok(!find(searchResults[5]).hasClass('disabled'));

  await click('.selected-terms li:eq(1)', meshManager);
  assert.ok(!find('.mesh-search-results > li:eq(1)', meshManager).hasClass('disabled'));
  await click(searchResults[3]);
  assert.ok(find('.mesh-search-results > li:eq(3)', meshManager).hasClass('disabled'));
  removableItems = find('.selected-terms li', meshManager);
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(0)).eq(0)),
    getText('descriptor 0')
  );
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(1)).eq(0)),
    getText('descriptor 2')
  );
  assert.equal(
    getElementText(find('.term-title', removableItems.eq(2)).eq(0)),
    getText('descriptor 3')
  );
});

test('save mesh changes', async function(assert) {
  assert.expect(4);
  await visit(url);
  var container = find('.detail-mesh');
  await click(find('.actions button', container));
  let meshManager = find('.mesh-manager', container);
  await fillIn(find('.search-box input', meshManager).eq(0), 'descriptor');
  await click('.search-box span.search-icon', meshManager);
  await click('.selected-terms li:eq(1)', meshManager);
  await click('.mesh-search-results > li:eq(3)', meshManager);
  await click('button.bigadd', container);
  var items = find('ul.selected-mesh-terms li .term-title', container);
  assert.equal(items.length, 3);
  assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(items.eq(1)), getText('descriptor 2'));
  assert.equal(getElementText(items.eq(2)), getText('descriptor 3'));
});



test('cancel mesh changes', async function(assert) {
  assert.expect(4);
  await visit(url);
  var container = find('.detail-mesh');
  await click(find('.actions button', container));
  let meshManager = find('.mesh-manager', container);
  await fillIn(find('.search-box input', meshManager).eq(0), 'descriptor');
  await click('.search-box span.search-icon', meshManager);
  await click('.selected-terms li:eq(1)', meshManager);
  await click('.mesh-search-results li:eq(3)', meshManager);
  await click('button.bigcancel', container);

  var items = find('ul.selected-mesh-terms li .term-title', container);
  assert.equal(items.length, 3);
  assert.equal(getElementText(items.eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(items.eq(1)), getText('descriptor 1'));
  assert.equal(getElementText(items.eq(2)), getText('descriptor 2'));
});
