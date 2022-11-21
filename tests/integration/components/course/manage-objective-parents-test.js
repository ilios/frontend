import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/manage-objective-parents';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/manage-objective-parents', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const programYearObjective = this.server.create('programYearObjective');
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
                id: programYearObjective.id,
                title: programYearObjective.title,
                active: programYearObjective.active,
              },
            ],
          },
        ],
      },
    ];
    this.set('cohortObjectives', cohortObjectives);
    await render(hbs`<Course::ManageObjectiveParents
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{(array)}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @removeFromCohort={{(noop)}}
    />
`);

    assert.notOk(component.hasMultipleCohorts);
    assert.strictEqual(component.selectedCohortTitle, 'cohort 0');

    assert.strictEqual(component.competencies.length, 1);
    assert.strictEqual(component.competencies[0].title, 'competency 0');
    assert.ok(component.competencies[0].notSelected);

    assert.strictEqual(component.competencies[0].objectives.length, 1);
    assert.strictEqual(component.competencies[0].objectives[0].title, programYearObjective.title);
    assert.ok(component.competencies[0].objectives[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible with multiple cohorts', async function (assert) {
    const programYearObjective = this.server.create('programYearObjective');
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
                id: programYearObjective.title,
                title: programYearObjective.title,
                active: programYearObjective.active,
              },
            ],
          },
        ],
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
                id: programYearObjective.id,
                title: programYearObjective.title,
                active: programYearObjective.active,
              },
            ],
          },
        ],
      },
    ];
    this.set('cohortObjectives', cohortObjectives);
    await render(hbs`<Course::ManageObjectiveParents
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{(array)}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @removeFromCohort={{(noop)}}
    />
`);

    assert.ok(component.hasMultipleCohorts);
    assert.strictEqual(component.selectedCohortTitle, 'cohort 0 cohort 1');

    assert.strictEqual(component.competencies.length, 1);
    assert.strictEqual(component.competencies[0].title, 'competency 0');
    assert.ok(component.competencies[0].notSelected);

    assert.strictEqual(component.competencies[0].objectives.length, 1);
    assert.strictEqual(component.competencies[0].objectives[0].title, programYearObjective.title);
    assert.ok(component.competencies[0].objectives[0].notSelected);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('inactive parents are hidden unless they are selected', async function (assert) {
    const activeProgramYearObjective = this.server.create('programYearObjective');
    const inactiveProgramYearObjective = this.server.create('programYearObjective', {
      active: false,
    });
    const inactiveSelectedProgramYearObjective = this.server.create('programYearObjective', {
      active: false,
    });

    const obj1 = {
      id: activeProgramYearObjective.id,
      title: activeProgramYearObjective.title,
      active: activeProgramYearObjective.active,
      cohortId: 1,
    };
    const obj2 = {
      id: inactiveProgramYearObjective.id,
      title: inactiveProgramYearObjective.title,
      active: inactiveProgramYearObjective.active,
      cohortId: 1,
    };
    const obj3 = {
      id: inactiveSelectedProgramYearObjective.id,
      title: inactiveSelectedProgramYearObjective.title,
      active: inactiveSelectedProgramYearObjective.active,
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
            objectives: [obj1, obj2, obj3],
          },
        ],
      },
    ];
    this.set('cohortObjectives', cohortObjectives);
    this.set('selected', [obj3]);
    await render(hbs`<Course::ManageObjectiveParents
      @cohortObjectives={{this.cohortObjectives}}
      @selected={{this.selected}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @removeFromCohort={{(noop)}}
    />
`);

    assert.strictEqual(component.competencies.length, 1);
    assert.strictEqual(component.competencies[0].title, 'competency 0');
    assert.ok(component.competencies[0].selected);

    assert.strictEqual(component.competencies[0].objectives.length, 2);
    assert.strictEqual(component.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(component.competencies[0].objectives[0].notSelected);
    assert.strictEqual(component.competencies[0].objectives[1].title, 'program-year objective 2');
    assert.ok(component.competencies[0].objectives[1].selected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
