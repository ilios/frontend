import { click, find, findAll, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
const url = '/programs/1/programyears/1?pyCompetencyDetails=true';

module('Acceptance: Program Year - Competencies', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('program', {
      school,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1
    });
    this.server.create('competency', {
      school,
    });
    this.server.createList('competency', 2, {
      parentId: 1,
      school,
      programYearIds: [1]
    });
    this.server.create('competency', {
      school,
    });
    this.server.createList('competency', 2, {
      school,
      parentId: 4
    });
  });

  test('list', async function(assert) {
    await visit(url);
    assert.equal(await getElementText(find('.programyear-competencies .title')), getText('Competencies (2)'));
    let competencies = 'competency 0 competency 1 competency 2';
    assert.equal(await getElementText(find('.programyear-competencies .programyear-competencies-content')), getText(competencies));
  });

  test('manager', async function(assert) {
    await visit(url);
    await click('.programyear-competencies .programyear-competencies-actions button');
    let checkboxes = findAll('.programyear-competencies input[type=checkbox]');
    assert.equal(checkboxes.length, 6);
    assert.ok(checkboxes[0].indeterminate);
    assert.ok(!checkboxes[0].checked);
    assert.ok(checkboxes[1].checked);
    assert.ok(checkboxes[2].checked);
    assert.ok(!checkboxes[3].checked);
    assert.ok(!checkboxes[4].checked);
    assert.ok(!checkboxes[5].checked);

    await click(findAll('.programyear-competencies input[type=checkbox]')[1]);
    await click(findAll('.programyear-competencies input[type=checkbox]')[4]);
    await click('.programyear-competencies .bigadd');

    let competencies = 'competency 0 competency 2 competency 3 competency 4';
    assert.equal(await getElementText('.programyear-competencies .programyear-competencies-content'), getText(competencies));
  });
});
