import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/collapsed-competencies';

module('Integration | Component | collapsed competencies', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const schoolA = this.server.create('school', { title: 'Medicine' });
    const schoolB = this.server.create('school', { title: 'Pharmacy' });
    const competencyA = this.server.create('competency', { school: schoolA });
    const competencyB = this.server.create('competency', { school: schoolB });
    const programYear = this.server.create('programYear');
    const pyObjectiveA = this.server.create('programYearObjective', { programYear, competency: competencyA });
    const pyObjectiveB = this.server.create('programYearObjective', { programYear, competency: competencyB });
    const course = this.server.create('course');
    this.server.create('courseObjective', { course, programYearObjectives: [ pyObjectiveA ]});
    this.server.create('courseObjective', { course, programYearObjectives: [ pyObjectiveB ]});
    this.course = await this.owner.lookup('service:store').find('course', course.id);
  });

  test('it renders', async function(assert) {
    assert.expect(5);
    this.set('subject', this.course);
    await render(hbs`<CollapsedCompetencies @subject={{this.subject}} @expand={{noop}} />`);
    assert.equal(component.title, 'Competencies (2)');
    assert.equal(component.headers[0].text, 'School');
    assert.equal(component.headers[1].text, 'Competencies');
    assert.equal(component.competencies[0].school, 'Medicine');
    assert.equal(component.competencies[1].count, '1');
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(2);
    this.set('subject', this.course);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CollapsedCompetencies @subject={{this.subject}} @expand={{this.click}} />`);
    assert.equal(component.title, 'Competencies (2)');
    await component.expand();
  });
});
