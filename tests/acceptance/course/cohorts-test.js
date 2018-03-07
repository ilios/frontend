import { click, findAll, find, visit } from '@ember/test-helpers';
import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/courses/1?details=true&courseObjectiveDetails=true';

module('Acceptance: Course - Cohorts', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    const school = server.create('school');
    setupAuthentication(application, {id: 4136, school});
    server.create('academicYear', {id: 2013});
    const program = server.create('program', { school });
    const cohort1 = server.create('cohort');
    const cohort2 = server.create('cohort');
    const programYear1 = server.create('programYear', {
      program,
      cohort: cohort1,
    });
    const programYear2 = server.create('programYear', {
      program,
      cohort: cohort2,
    });
    const parentObjective1 = server.create('objective', {
      programYears: [programYear1],
    });
    const parentObjective2 = server.create('objective', {
      programYears: [programYear2],
    });

    const course = server.create('course', {
      year: 2013,
      school,
      cohorts: [programYear1.cohort], //instead of just cohort1 otherwise the relationship gets munged
    });

    server.create('objective', {
      courses: [course],
      parents: [parentObjective1, parentObjective2]
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list cohorts', async function (assert) {
    assert.expect(4);
    await visit(url);
    var container = find('.detail-cohorts');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, 1);
    assert.equal(getElementText(find(find('td'), rows[0])), getText('school 0'));
    assert.equal(getElementText(find(findAll('td')[1], rows[0])), getText('program 0'));
    assert.equal(getElementText(find(findAll('td')[2], rows[0])), getText(`cohort 0`));
  });

  test('manage cohorts', async function(assert) {
    assert.expect(2);
    await visit(url);
    let container = find('.detail-cohorts');
    await click(find('.actions button', container));
    assert.equal(findAll('.selected-cohorts li', container).length, 1);
    assert.equal(getElementText(find('.selectable-cohorts li', container)), getText('school 0 | program 0 | cohort 1'));
  });

  test('save cohort chages', async function(assert) {
    assert.expect(3);
    await visit(url);
    var container = find('.detail-cohorts');
    await click(find('.actions button', container));
    await click(find(find('.selected-cohorts li'), container));
    await click(find(find('.selectable-cohorts li'), container));
    await click('button.bigadd', container);

    assert.equal(getElementText(find(find('tbody tr:eq(0) td'), container)), getText('school 0'));
    assert.equal(getElementText(find(findAll('tbody tr:eq(0) td')[1], container)), getText('program 0'));
    assert.equal(getElementText(find(findAll('tbody tr:eq(0) td')[2], container)), getText('cohort 1'));
  });

  test('cancel cohort changes', async function(assert) {
    assert.expect(3);
    await visit(url);
    var container = find('.detail-cohorts');
    await click(find('.actions button', container));
    await click(find(find('.selected-cohorts li'), container));
    await click(find(find('.selectable-cohorts li'), container));
    await click('button.bigcancel', container);
    assert.equal(getElementText(find(find('tbody tr:eq(0) td'), container)), getText('school 0'));
    assert.equal(getElementText(find(findAll('tbody tr:eq(0) td')[1], container)), getText('program 0'));
    assert.equal(getElementText(find(findAll('tbody tr:eq(0) td')[2], container)), getText('cohort 0'));
  });

  test('removing a cohort remove course objectives parents linked to that cohort', async function(assert) {
    assert.expect(3);
    await visit(url);
    let parents = find('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    assert.equal(parents.length, 2);
    await click('.detail-cohorts .actions button');
    await click(find('.detail-cohorts .selected-cohorts li'));
    await click('.detail-cohorts button.bigadd');
    parents = find('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    assert.equal(parents.length, 1);
    assert.equal(getElementText(parents), getText('objective 1'));
  });
});
