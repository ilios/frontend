import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/manage-objective-parents';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/manage-objective-parents', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const course = this.server.create('course');
    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);

    const cohortObjectives = [
      {
        title: 'cohort 0',
        id: 0,
        allowMultipleParents: false,
        competencies: [
          {
            title: 'competency 0',
            objectives: [
              {
                id: 2,
                title: 'objective 1'
              }
            ]
          }
        ]
      }
    ];
    this.set('objective', objectiveModel);
    this.set('cohortObjectives', cohortObjectives);
    await render(hbs`<Course::ManageObjectiveParents
      @objective={{this.objective}}
      @cohortObjectives={{this.cohortObjectives}}
      @objective={{this.manageParentsObjective}}
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{array}}
      @add={{noop}}
      @remove={{noop}}
      @removeFromCohort={{noop}}
    />`);

    assert.equal(component.objectiveTitle, objectiveModel.title);
    assert.notOk(component.hasMultipleCohorts);
    assert.equal(component.selectedCohortTitle, 'cohort 0');

    assert.equal(component.competencies.length, 1);
    assert.equal(component.competencies[0].title, 'competency 0');
    assert.ok(component.competencies[0].notSelected);

    assert.equal(component.competencies[0].objectives.length, 1);
    assert.equal(component.competencies[0].objectives[0].title, 'objective 1');
    assert.ok(component.competencies[0].objectives[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible with multiple cohorts', async function (assert) {
    const course = this.server.create('course');
    const objective = this.server.create('objective', {
      courses: [course],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);

    const cohortObjectives = [
      {
        title: 'cohort 0',
        id: 1,
        allowMultipleParents: false,
        competencies: [
          {
            title: 'competency 0',
            objectives: [
              {
                id: 2,
                title: 'objective 1'
              }
            ]
          }
        ]
      },
      {
        title: 'cohort 1',
        id: 2,
        allowMultipleParents: true,
        competencies: [
          {
            title: 'competency 0',
            objectives: [
              {
                id: 2,
                title: 'objective 1'
              }
            ]
          }
        ]
      }
    ];
    this.set('objective', objectiveModel);
    this.set('cohortObjectives', cohortObjectives);
    await render(hbs`<Course::ManageObjectiveParents
      @objective={{this.objective}}
      @cohortObjectives={{this.cohortObjectives}}
      @objective={{this.manageParentsObjective}}
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{array}}
      @add={{noop}}
      @remove={{noop}}
      @removeFromCohort={{noop}}
    />`);

    assert.equal(component.objectiveTitle, objectiveModel.title);
    assert.ok(component.hasMultipleCohorts);
    assert.equal(component.selectedCohortTitle, 'cohort 0 cohort 1');

    assert.equal(component.competencies.length, 1);
    assert.equal(component.competencies[0].title, 'competency 0');
    assert.ok(component.competencies[0].notSelected);

    assert.equal(component.competencies[0].objectives.length, 1);
    assert.equal(component.competencies[0].objectives[0].title, 'objective 1');
    assert.ok(component.competencies[0].objectives[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
