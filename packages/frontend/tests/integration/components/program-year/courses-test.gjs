import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/program-year/courses';
import Courses from 'frontend/components/program-year/courses';

module('Integration | Component | program-year/courses', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const programYear = this.server.create('program-year');
    const cohort = this.server.create('cohort', { programYear });
    this.server.createList('course', 3, {
      cohorts: [cohort],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(<template><Courses @programYear={{this.programYear}} /></template>);
    assert.strictEqual(component.title, 'Associated Courses (3)');
    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].text, 'course 0');
    assert.strictEqual(component.courses[0].url, '/courses/1');
    assert.strictEqual(component.courses[1].text, 'course 1');
    assert.strictEqual(component.courses[1].url, '/courses/2');
    assert.strictEqual(component.courses[2].text, 'course 2');
    assert.strictEqual(component.courses[2].url, '/courses/3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('no linked courses', async function (assert) {
    const programYear = this.server.create('program-year');
    this.server.create('cohort', { programYear });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(<template><Courses @programYear={{this.programYear}} /></template>);
    assert.strictEqual(component.title, 'Associated Courses (0)');
    assert.strictEqual(component.courses.length, 0);
  });
});
