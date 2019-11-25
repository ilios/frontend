import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/collapsed-competencies';

module('Integration | Component | collapsed competencies', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
    const schoolA = this.server.create('school', {title: 'Medicine'});
    const schoolB = this.server.create('school', { title: 'Pharmacy' });
    const competencyA = this.server.create('competency', { school: schoolA });
    const competencyB = this.server.create('competency', { school: schoolB });
    const objectiveA = this.server.create('objective', { competency: competencyA });
    const objectiveB = this.server.create('objective', { competency: competencyB });

    const course = this.server.create('course', {
      objectives: [objectiveA, objectiveB]
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    this.set('click', () => {});
    await render(hbs`<CollapsedCompetencies @subject={{this.course}} @expand={{this.click}} />`);
    assert.equal(component.title, 'Competencies (2)');
    assert.equal(component.headers[0].text, 'School');
    assert.equal(component.headers[1].text, 'Competencies');
    assert.equal(component.competencies[0].school, 'Medicine');
    assert.equal(component.competencies[1].count, '1');
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(2);
    const schoolA = this.server.create('school', {title: 'Medicine'});
    const schoolB = this.server.create('school', { title: 'Pharmacy' });
    const competencyA = this.server.create('competency', { school: schoolA });
    const competencyB = this.server.create('competency', { school: schoolB });
    const objectiveA = this.server.create('objective', { competency: competencyA });
    const objectiveB = this.server.create('objective', { competency: competencyB });

    const course = this.server.create('course', {
      objectives: [objectiveA, objectiveB]
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CollapsedCompetencies @subject={{this.course}} @expand={{this.click}} />`);
    assert.equal(component.title, 'Competencies (2)');
    await component.expand();
  });
});
