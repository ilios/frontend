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
    const objective = this.server.create('objective');
    this.server.create('course-objective', { course, objective });

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
                title: 'objective 1',
                active: true,
              }
            ]
          }
        ]
      }
    ];
    this.set('cohortObjectives', cohortObjectives);
    await render(hbs`<Course::ManageObjectiveParents
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{array}}
      @add={{noop}}
      @remove={{noop}}
      @removeFromCohort={{noop}}
    />`);

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
    const objective = this.server.create('objective');
    this.server.create('course-objective', { course, objective });

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
                title: 'objective 1',
                active: true,
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
                title: 'objective 1',
                active: true,
              }
            ]
          }
        ]
      }
    ];
    this.set('cohortObjectives', cohortObjectives);
    await render(hbs`<Course::ManageObjectiveParents
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{array}}
      @add={{noop}}
      @remove={{noop}}
      @removeFromCohort={{noop}}
    />`);

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

  test('inactive parents are hidden unless they are selected', async function (assert) {
    const course = this.server.create('course');
    const activeObjective = this.server.create('objective');
    const inactiveObjective = this.server.create('objective', { active: false });
    const inactiveSelectedObjective = this.server.create('objective', { active: false });
    const objective = this.server.create('objective', {
      parents: [inactiveSelectedObjective]
    });
    this.server.create('course-objective', { course, objective });

    const obj1 = {
      id: activeObjective.id,
      title: activeObjective.title,
      active: activeObjective.active,
      cohortId: 1,
    };
    const obj2 = {
      id: inactiveObjective.id,
      title: inactiveObjective.title,
      active: inactiveObjective.active,
      cohortId: 1,
    };
    const obj3 = {
      id: inactiveSelectedObjective.id,
      title: inactiveSelectedObjective.title,
      active: inactiveSelectedObjective.active,
      cohortId: 1,
    };
    const cohortObjectives = [
      {
        title: 'cohort 0',
        id: 1,
        allowMultipleParents: false,
        competencies: [
          {
            title: 'competency 0',
            objectives: [ obj1, obj2, obj3 ],
          }
        ]
      }
    ];
    this.set('cohortObjectives', cohortObjectives);
    this.set('selected', [obj3]);
    await render(hbs`<Course::ManageObjectiveParents
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{this.selected}}
      @add={{noop}}
      @remove={{noop}}
      @removeFromCohort={{noop}}
    />`);

    assert.equal(component.competencies.length, 1);
    assert.equal(component.competencies[0].title, 'competency 0');
    assert.ok(component.competencies[0].selected);

    assert.equal(component.competencies[0].objectives.length, 2);
    assert.equal(component.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(component.competencies[0].objectives[0].notSelected);
    assert.equal(component.competencies[0].objectives[1].title, 'objective 2');
    assert.ok(component.competencies[0].objectives[1].selected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
