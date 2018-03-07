import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/programs/1/programyears/1?pyCompetencyDetails=true';

module('Acceptance: Program Year - Competencies', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', {
      programYearId: 1
    });
    server.create('competency', {
      schoolId: 1,
    });
    server.createList('competency', 2, {
      parentId: 1,
      schoolId: 1,
      programYearIds: [1]
    });
    server.create('competency', {
      schoolId: 1,
    });
    server.createList('competency', 2, {
      schoolId: 1,
      parentId: 4
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list', async function(assert) {
    await visit(url);
    let container = find('.programyear-competencies');
    assert.equal(getElementText(find('.title', container)), getText('Competencies (2)'));
    let competencies = 'competency 0 competency 1 competency 2';
    assert.equal(getElementText(find('.programyear-competencies-content', container)), getText(competencies));
  });

  test('manager', async function(assert) {
    await visit(url);
    let container = find('.programyear-competencies');
    await click('.programyear-competencies-actions button', container);
    let checkboxes = find('input[type=checkbox]', container);
    assert.equal(checkboxes.length, 6);
    assert.ok(checkboxes.eq(0).prop('indeterminate'));
    assert.ok(!checkboxes.eq(0).prop('checked'));
    assert.ok(checkboxes.eq(1).prop('checked'));
    assert.ok(checkboxes.eq(2).prop('checked'));
    assert.ok(!checkboxes.eq(3).prop('checked'));
    assert.ok(!checkboxes.eq(4).prop('checked'));
    assert.ok(!checkboxes.eq(5).prop('checked'));

    await click('input[type=checkbox]:eq(1)', container);
    await click('input[type=checkbox]:eq(4)', container);
    await click('.bigadd', container);

    let competencies = 'competency 0 competency 2 competency 3 competency 4';
    assert.equal(getElementText(find('.programyear-competencies-content', container)), getText(competencies));
  });
});
