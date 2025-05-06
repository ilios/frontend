import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/course/manage-objective-parents';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import ManageObjectiveParents from 'ilios-common/components/course/manage-objective-parents';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | course/manage-objective-parents', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const programYearObjective = this.server.create('program-year-objective');
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
    await render(
      <template>
        <ManageObjectiveParents
          @cohortObjectives={{this.cohortObjectives}}
          @selected={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
          @removeFromCohort={{(noop)}}
        />
      </template>,
    );

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
    const programYearObjective = this.server.create('program-year-objective');
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
    await render(
      <template>
        <ManageObjectiveParents
          @cohortObjectives={{this.cohortObjectives}}
          @selected={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
          @removeFromCohort={{(noop)}}
        />
      </template>,
    );

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

  test('parent domain title is shown next to competency title, if applicable', async function (assert) {
    const programYearObjective1 = this.server.create('program-year-objective');
    const programYearObjective2 = this.server.create('program-year-objective');
    const domain = this.server.create('competency', { title: 'domain' });
    const domainModel = await this.owner
      .lookup('service:store')
      .findRecord('competency', domain.id);
    const cohortObjectives = [
      {
        title: 'cohort 0',
        id: 1,
        competencies: [
          {
            title: 'competency 0',
            parent: domainModel,
            objectives: [
              {
                id: programYearObjective1.id,
                title: programYearObjective1.title,
                active: programYearObjective1.active,
              },
            ],
          },
          {
            title: 'competency 1',
            objectives: [
              {
                id: programYearObjective2.id,
                title: programYearObjective2.title,
                active: programYearObjective2.active,
              },
            ],
          },
        ],
      },
    ];
    this.set('cohortObjectives', cohortObjectives);
    await render(
      <template>
        <ManageObjectiveParents
          @cohortObjectives={{this.cohortObjectives}}
          @selected={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
          @removeFromCohort={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.competencies.length, 2);
    assert.strictEqual(component.competencies[0].title, 'competency 0 (domain)');
    assert.strictEqual(component.competencies[1].title, 'competency 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('inactive parents are hidden unless they are selected', async function (assert) {
    const activeProgramYearObjective = this.server.create('program-year-objective');
    const inactiveProgramYearObjective = this.server.create('program-year-objective', {
      active: false,
    });
    const inactiveSelectedProgramYearObjective = this.server.create('program-year-objective', {
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
    await render(
      <template>
        <ManageObjectiveParents
          @cohortObjectives={{this.cohortObjectives}}
          @selected={{this.selected}}
          @add={{(noop)}}
          @remove={{(noop)}}
          @removeFromCohort={{(noop)}}
        />
      </template>,
    );

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
