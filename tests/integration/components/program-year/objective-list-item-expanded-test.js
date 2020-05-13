import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objective-list-item-expanded';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list-item-expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(14);
    const programYear = this.server.create('program-year');
    const objective = this.server.create('objective');
    this.server.create('program-year-objective', { objective, programYear });
    const course1 = this.server.create('course');
    const course2 = this.server.create('course');
    const objectivesInCourse1 = this.server.createList('objective', 3, { parents: [objective] });
    const objectivesInCourse2 = this.server.createList('objective', 3, { parents: [objective] });
    objectivesInCourse1.forEach(objective => {
      this.server.create('course-objective', { course: course1, objective });
    });
    objectivesInCourse2.forEach(objective => {
      this.server.create('course-objective', { course: course2, objective });
    });

    const model = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', model);

    await render(
      hbs`<ProgramYear::ObjectiveListItemExpanded @objective={{this.objective}} />`
    );
    assert.equal(component.headers[0].text, "Courses");
    assert.equal(component.headers[1].text, "Objectives");

    assert.equal(component.courses.length, 2);
    assert.equal(component.courses[0].title, 'course 0');
    assert.equal(component.courses[0].objectives.length, 3);
    assert.equal(component.courses[0].objectives[0].text, 'objective 1');
    assert.equal(component.courses[0].objectives[1].text, 'objective 2');
    assert.equal(component.courses[0].objectives[2].text, 'objective 3');
    assert.equal(component.courses[1].title, 'course 1');
    assert.equal(component.courses[1].objectives.length, 3);
    assert.equal(component.courses[1].objectives[0].text, 'objective 4');
    assert.equal(component.courses[1].objectives[1].text, 'objective 5');
    assert.equal(component.courses[1].objectives[2].text, 'objective 6');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders empty and is accessible', async function(assert) {
    assert.expect(4);
    const programYear = this.server.create('program-year');
    const objective = this.server.create('objective');
    this.server.create('program-year-objective', { objective, programYear });
    const model = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', model);
    await render(
      hbs`<ProgramYear::ObjectiveListItemExpanded @objective={{this.objective}} />`
    );
    assert.equal(component.headers[0].text, "Courses");
    assert.equal(component.headers[1].text, "Objectives");
    assert.ok(component.hasNone);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
