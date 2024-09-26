import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/collapsed-competencies';

module('Integration | Component | collapsed competencies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const schoolA = this.server.create('school', { title: 'Medicine' });
    const schoolB = this.server.create('school', { title: 'Pharmacy' });
    const competencyA = this.server.create('competency', { school: schoolA });
    const competencyB = this.server.create('competency', { school: schoolB });
    const competencyC = this.server.create('competency', { school: schoolB });
    const programYear = this.server.create('program-year', {
      competencies: [
        ...this.server.createList('competency', 2, { school: schoolB }),
        ...this.server.createList('competency', 3, { school: schoolA }),
      ],
    });
    const pyObjectiveA = this.server.create('program-year-objective', {
      programYear,
      competency: competencyA,
    });
    const pyObjectiveB = this.server.create('program-year-objective', {
      programYear,
      competency: competencyB,
    });
    const pyObjectiveC = this.server.create('program-year-objective', {
      programYear,
      competency: competencyC,
    });
    const course = this.server.create('course');
    this.server.create('course-objective', {
      course,
      programYearObjectives: [pyObjectiveA, pyObjectiveC],
    });
    this.server.create('course-objective', {
      course,
      programYearObjectives: [pyObjectiveB],
    });
    this.server.create('course-objective', {
      course,
      programYearObjectives: [pyObjectiveC],
    });
    this.course = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.programYear = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
  });

  test('it renders', async function (assert) {
    this.set('subject', this.course);
    await render(hbs`<CollapsedCompetencies @subject={{this.subject}} @expand={{(noop)}} />`);
    assert.strictEqual(component.title, 'Competencies (3)');
    assert.strictEqual(component.headers[0].text, 'School');
    assert.strictEqual(component.headers[1].text, 'Competencies');
    assert.strictEqual(component.competencies[0].school, 'Medicine');
    assert.strictEqual(component.competencies[0].count, '1');
    assert.strictEqual(component.competencies[1].school, 'Pharmacy');
    assert.strictEqual(component.competencies[1].count, '2');
  });

  test('clicking the header expands the list', async function (assert) {
    assert.expect(2);
    this.set('subject', this.course);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CollapsedCompetencies @subject={{this.subject}} @expand={{this.click}} />`);
    assert.strictEqual(component.title, 'Competencies (3)');
    await component.expand();
  });

  test('it renders for program year', async function (assert) {
    this.set('subject', this.programYear);
    await render(hbs`<CollapsedCompetencies @subject={{this.subject}} @expand={{(noop)}} />`);
    assert.strictEqual(component.title, 'Competencies (5)');
    assert.strictEqual(component.headers[0].text, 'School');
    assert.strictEqual(component.headers[1].text, 'Competencies');
    assert.strictEqual(component.competencies[0].school, 'Medicine');
    assert.strictEqual(component.competencies[0].count, '3');
    assert.strictEqual(component.competencies[1].school, 'Pharmacy');
    assert.strictEqual(component.competencies[1].count, '2');
  });
});
