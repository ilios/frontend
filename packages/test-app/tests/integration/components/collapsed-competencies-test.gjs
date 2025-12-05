import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/collapsed-competencies';
import CollapsedCompetencies from 'ilios-common/components/collapsed-competencies';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | collapsed competencies', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const schoolA = await this.server.create('school', { title: 'Medicine' });
    const schoolB = await this.server.create('school', { title: 'Pharmacy' });
    const competencyA = await this.server.create('competency', { school: schoolA });
    const competencyB = await this.server.create('competency', { school: schoolB });
    const competencyC = await this.server.create('competency', { school: schoolB });
    const programYear = await this.server.create('program-year', {
      competencies: [
        ...(await this.server.createList('competency', 2, { school: schoolB })),
        ...(await this.server.createList('competency', 3, { school: schoolA })),
      ],
    });
    const pyObjectiveA = await this.server.create('program-year-objective', {
      programYear,
      competency: competencyA,
    });
    const pyObjectiveB = await this.server.create('program-year-objective', {
      programYear,
      competency: competencyB,
    });
    const pyObjectiveC = await this.server.create('program-year-objective', {
      programYear,
      competency: competencyC,
    });
    const course = await this.server.create('course');
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [pyObjectiveA, pyObjectiveC],
    });
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [pyObjectiveB],
    });
    await this.server.create('course-objective', {
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
    await render(
      <template><CollapsedCompetencies @subject={{this.subject}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Competencies (3)');
    assert.strictEqual(component.headers[0].text, 'School');
    assert.strictEqual(component.headers[1].text, 'Competencies');
    assert.strictEqual(component.competencies[0].school, 'Medicine');
    assert.strictEqual(component.competencies[0].count, '1');
    assert.strictEqual(component.competencies[1].school, 'Pharmacy');
    assert.strictEqual(component.competencies[1].count, '2');
  });

  test('clicking the header expands the list', async function (assert) {
    this.set('subject', this.course);
    this.set('click', () => {
      assert.step('click called');
    });
    await render(
      <template>
        <CollapsedCompetencies @subject={{this.subject}} @expand={{this.click}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Competencies (3)');
    await component.expand();
    assert.verifySteps(['click called']);
  });

  test('it renders for program year', async function (assert) {
    this.set('subject', this.programYear);
    await render(
      <template><CollapsedCompetencies @subject={{this.subject}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Competencies (5)');
    assert.strictEqual(component.headers[0].text, 'School');
    assert.strictEqual(component.headers[1].text, 'Competencies');
    assert.strictEqual(component.competencies[0].school, 'Medicine');
    assert.strictEqual(component.competencies[0].count, '3');
    assert.strictEqual(component.competencies[1].school, 'Pharmacy');
    assert.strictEqual(component.competencies[1].count, '2');
  });
});
