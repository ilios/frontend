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
    const programYearObjective = this.server.create('objective', { programYears: [programYear] });
    const course1 = this.server.create('course');
    const course2 = this.server.create('course');
    this.server.createList('objective', 3, { courses: [course1], parents: [programYearObjective] });
    this.server.createList('objective', 3, { courses: [course2], parents: [programYearObjective] });

    const model = await this.owner.lookup('service:store').find('objective', programYearObjective.id);
    this.set('objective', model);

    await render(
      hbs`<ProgramYear::ObjectiveListItemExpanded @objective={{objective}} />`
    );
    assert.equal(component.headers[1].text, "Courses");
    assert.equal(component.headers[2].text, "Objectives");

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
    const programYearObjective = this.server.create('objective', { programYears: [programYear] });
    const model = await this.owner.lookup('service:store').find('objective', programYearObjective.id);
    this.set('objective', model);

    await render(
      hbs`<ProgramYear::ObjectiveListItemExpanded @objective={{objective}} />`
    );
    assert.equal(component.headers[1].text, "Courses");
    assert.equal(component.headers[2].text, "Objectives");
    assert.ok(component.hasNone);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
