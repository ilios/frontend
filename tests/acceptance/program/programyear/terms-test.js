import { click, find, findAll, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';


import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
const url = '/programs/1/programyears/1?pyTaxonomyDetails=true';

module('Acceptance: Program Year - Terms', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('vocabulary', {
      school,
      active: true
    });
    this.server.create('program', {
      school
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1});
    this.server.create('term', {
      programYearIds: [1],
      vocabularyId: 1,
      active: true
    });
    this.server.create('term', {
      vocabularyId: 1,
      active: true
    });
  });

  test('list terms', async function(assert) {
    assert.expect(2);
    await visit(url);
    var container = find('.detail-taxonomies');
    var items = findAll('ul.selected-taxonomy-terms li', container);
    assert.equal(items.length, 1);
    assert.equal(await getElementText(items[0]), getText('term 0'));
  });

  test('manage terms', async function(assert) {
    assert.expect(3);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    assert.equal(await getElementText(find(find('.removable-list li'), container)), getText('term 0'));
    assert.equal(await getElementText(find(find('.selectable-terms-list li'), container)), getText('term 0'));
    assert.equal(await getElementText(find(findAll('.selectable-terms-list li')[1], container)), getText('term 1'));
  });

  test('save term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find(find('.removable-list li'), container));
    await click(find('.selectable-terms-list li:nth-of-type(2) > div', container));
    await click('button.bigadd', container);
    assert.equal(await getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 1'));
  });

  test('cancel term changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    var container = find('.taxonomy-manager');
    await click(find('.actions button', container));
    await click(find(find('.removable-list li'), container));
    await click(find('.selectable-terms-list li:nth-of-type(2) > div', container));
    await click('button.bigcancel', container);
    assert.equal(await getElementText(find('ul.selected-taxonomy-terms li', container)), getText('term 0'));
  });
});
