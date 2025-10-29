import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program-year/objective-list-item-expanded';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import ObjectiveListItemExpanded from 'frontend/components/program-year/objective-list-item-expanded';

module('Integration | Component | program-year/objective-list-item-expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const programYear = this.server.create('program-year');
    const programYearObjective = this.server.create('program-year-objective', { programYear });
    const course1 = this.server.create('course');
    const course2 = this.server.create('course');
    this.server.createList('course-objective', 3, {
      course: course1,
      programYearObjectives: [programYearObjective],
    });
    this.server.createList('course-objective', 3, {
      course: course2,
      programYearObjectives: [programYearObjective],
    });

    const model = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', programYearObjective.id);
    this.set('objective', model);

    await render(<template><ObjectiveListItemExpanded @objective={{this.objective}} /></template>);
    assert.strictEqual(component.headers[0].text, 'Courses');
    assert.strictEqual(component.headers[1].text, 'Objectives');

    assert.strictEqual(component.courses.length, 2);
    assert.strictEqual(component.courses[0].title, 'course 0');
    assert.strictEqual(component.courses[0].objectives.length, 3);
    assert.strictEqual(component.courses[0].objectives[0].text, 'course objective 0');
    assert.strictEqual(component.courses[0].objectives[1].text, 'course objective 1');
    assert.strictEqual(component.courses[0].objectives[2].text, 'course objective 2');
    assert.strictEqual(component.courses[1].title, 'course 1');
    assert.strictEqual(component.courses[1].objectives.length, 3);
    assert.strictEqual(component.courses[1].objectives[0].text, 'course objective 3');
    assert.strictEqual(component.courses[1].objectives[1].text, 'course objective 4');
    assert.strictEqual(component.courses[1].objectives[2].text, 'course objective 5');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty and is accessible', async function (assert) {
    const programYear = this.server.create('program-year');
    const programYearObjective = this.server.create('program-year-objective', { programYear });
    const model = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', programYearObjective.id);
    this.set('objective', model);
    await render(<template><ObjectiveListItemExpanded @objective={{this.objective}} /></template>);
    assert.strictEqual(component.headers[0].text, 'Courses');
    assert.strictEqual(component.headers[1].text, 'Objectives');
    assert.ok(component.hasNone);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
