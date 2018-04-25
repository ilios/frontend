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
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.create('vocabulary', {
      school: this.school,
      active: true
    });
    this.server.create('program', {
      school: this.school
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
    var items = findAll('.detail-taxonomies ul.selected-taxonomy-terms li');
    assert.equal(items.length, 1);
    assert.equal(await getElementText(items[0]), getText('term 0'));
  });

  test('manage terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    await visit(url);
    await click(find('.taxonomy-manager .actions button'));
    assert.equal(await getElementText(find('.taxonomy-manager .removable-list li')), getText('term 0'));
    assert.equal(await getElementText(find('.taxonomy-manager .selectable-terms-list li')), getText('term 0'));
    assert.equal(await getElementText(findAll('.taxonomy-manager .selectable-terms-list li')[1]), getText('term 1'));
  });

  test('save term changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(1);
    await visit(url);
    await click(find('.taxonomy-manager .actions button'));
    await click(find('.taxonomy-manager .removable-list li'));
    await click(find('.taxonomy-manager .selectable-terms-list li:nth-of-type(2) > div'));
    await click('.taxonomy-manager button.bigadd');
    assert.equal(await getElementText(find('.taxonomy-manager ul.selected-taxonomy-terms li')), getText('term 1'));
  });

  test('cancel term changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(1);
    await visit(url);
    await click(find('.taxonomy-manager .actions button'));
    await click('.taxonomy-manager .removable-list li');
    await click(find('.taxonomy-manager .selectable-terms-list li:nth-of-type(2) > div'));
    await click('.taxonomy-manager button.bigcancel');
    assert.equal(await getElementText(find('.taxonomy-manager ul.selected-taxonomy-terms li')), getText('term 0'));
  });
});
