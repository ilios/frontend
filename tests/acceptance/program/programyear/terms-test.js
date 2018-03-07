import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1/programyears/1?pyTaxonomyDetails=true';

module('Acceptance: Program Year - Terms', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('vocabulary', {
      schoolId: 1,
      active: true
    });
    server.create('program', {
      schoolId: 1
    });
    server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', { programYearId: 1});
    server.create('term', {
      programYearIds: [1],
      vocabularyId: 1,
      active: true
    });
    server.create('term', {
      vocabularyId: 1,
      active: true
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list terms', async function(assert) {
    assert.expect(2);
    await visit(url);
    var container = find('.detail-taxonomies');
    var items = find('ul.selected-taxonomy-terms li', container);
    assert.equal(items.length, 1);
    assert.equal(getElementText(items.eq(0)), getText('term 0'));
  });

  test('manage terms', async function(assert) {
    assert.expect(3);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    assert.equal(getElementText(find('.removable-list li:eq(0)', container)), getText('term 0'));
    assert.equal(getElementText(find('.selectable-terms-list li:eq(0)', container)), getText('term 0'));
    assert.equal(getElementText(find('.selectable-terms-list li:eq(1)', container)), getText('term 1'));
  });

  test('save term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find('.removable-list li:eq(0)', container));
    await click(find('.selectable-terms-list li:eq(1) > div', container));
    await click('button.bigadd', container);
    assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 1'));
  });

  test('cancel term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find('.removable-list li:eq(0)', container));
    await click(find('.selectable-terms-list li:eq(1) > div', container));
    await click('button.bigcancel', container);
    assert.equal(getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 0'));
  });
});
