import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { component } from 'frontend/tests/pages/components/program-year/list';
import List from 'frontend/components/program-year/list';

module('Integration | Component | program-year/list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = class extends Service {
      async canDeleteProgramYear() {
        return true;
      }
      async canLockProgramYear() {
        return true;
      }
      async canUnlockProgramYear() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);

    const school = this.server.create('school');
    const programYears = [1, 2, 3].map((i) => {
      const cohort = this.server.create('cohort');
      const meshDescriptors = this.server.createList('mesh-descriptor', 3);
      const vocabulary = this.server.create('vocabulary', { school });
      const terms = this.server.createList('term', 4, { vocabulary });
      const competencies = this.server.createList('competency', 2);
      const directors = this.server.createList('user', 2);
      const programYearAncestor = this.server.create('program-year-objective');
      const programYearObjectives = this.server.createList('program-year-objective', 2, {
        meshDescriptors,
        terms,
      });
      const programYearObjectiveWithAncestor = this.server.create('program-year-objective', {
        ancestor: programYearAncestor,
      });
      return this.server.create('program-year', {
        cohort,
        startYear: 2000 + i,
        programYearObjectives: [...programYearObjectives, programYearObjectiveWithAncestor],
        terms,
        competencies,
        directors,
      });
    });
    const program = this.server.create('program', { school, programYears });
    this.programModel = await this.owner.lookup('service:store').findRecord('program', program.id);
  });

  test('it renders short year', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: false,
        },
      };
    });
    this.set('program', this.programModel);
    await render(<template><List @canUpdate={{false}} @program={{this.program}} /></template>);

    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].link.text, '2001');
    assert.strictEqual(component.items[1].link.text, '2002');
    assert.strictEqual(component.items[2].link.text, '2003');
  });

  test('it renders long year', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('program', this.programModel);
    await render(<template><List @canUpdate={{false}} @program={{this.program}} /></template>);

    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].link.text, '2001 - 2002');
    assert.strictEqual(component.items[1].link.text, '2002 - 2003');
    assert.strictEqual(component.items[2].link.text, '2003 - 2004');
  });

  test('create new program year', async function (assert) {
    const thisYear = new Date().getFullYear();
    this.set('program', this.programModel);
    await render(<template><List @canCreate={{true}} @program={{this.program}} /></template>);
    await component.expandCollapse.toggle();
    await component.newProgramYear.years.select(thisYear);
    await component.newProgramYear.done.click();
    const programYears = await this.owner.lookup('service:store').findAll('program-year');
    const sortedProgramYears = sortBy(programYears, 'id');
    const newProgramYear = sortedProgramYears.slice().reverse()[0];
    const originalProgramYear = sortedProgramYears[sortedProgramYears.length - 2];
    assert.strictEqual(parseInt(newProgramYear.startYear, 10), thisYear);
    const terms = await newProgramYear.terms;
    const originalTerms = await originalProgramYear.terms;
    assert.strictEqual(terms.length, 4);
    assert.strictEqual(terms[0], originalTerms[0]);
    assert.strictEqual(terms[1], originalTerms[1]);
    assert.strictEqual(terms[2], originalTerms[2]);
    assert.strictEqual(terms[3], originalTerms[3]);
    const competencies = await newProgramYear.competencies;
    const originalCompetencies = await originalProgramYear.competencies;
    assert.strictEqual(competencies.length, 2);
    assert.strictEqual(competencies[0], originalCompetencies[0]);
    assert.strictEqual(competencies[1], originalCompetencies[1]);
    const directors = await newProgramYear.directors;
    const originalDirectors = await originalProgramYear.directors;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0], originalDirectors[0]);
    assert.strictEqual(directors[1], originalDirectors[1]);
    const objectives = await newProgramYear.programYearObjectives;
    const originalObjectives = await originalProgramYear.programYearObjectives;
    assert.strictEqual(objectives.length, 3);
    assert.strictEqual(objectives[0].description, originalObjectives[0].description);
    assert.strictEqual(objectives[1].description, originalObjectives[1].description);
    assert.strictEqual(objectives[2].description, originalObjectives[2].description);
    const ancestorObjective1 = await objectives[0].ancestor;
    const ancestorObjective2 = await objectives[1].ancestor;
    const ancestorObjective3 = await objectives[2].ancestor;
    const originalObjectivesAncestor = await originalObjectives[2].ancestor;
    assert.strictEqual(ancestorObjective1, originalObjectives[0]);
    assert.strictEqual(ancestorObjective2, originalObjectives[1]);
    assert.strictEqual(ancestorObjective3, originalObjectivesAncestor);
    const objectiveMeshDescriptors = await objectives[0].meshDescriptors;
    const originalObjectiveMeshDescriptors = await originalObjectives[0].meshDescriptors;
    assert.strictEqual(objectiveMeshDescriptors.length, 3);
    assert.strictEqual(objectiveMeshDescriptors[0], originalObjectiveMeshDescriptors[0]);
    assert.strictEqual(objectiveMeshDescriptors[1], originalObjectiveMeshDescriptors[1]);
    assert.strictEqual(objectiveMeshDescriptors[2], originalObjectiveMeshDescriptors[2]);
    const objectiveTerms = await objectives[0].terms;
    const originalObjectiveTerms = await originalObjectives[0].terms;
    assert.strictEqual(objectiveTerms.length, 4);
    assert.strictEqual(objectiveTerms[0], originalObjectiveTerms[0]);
    assert.strictEqual(objectiveTerms[1], originalObjectiveTerms[1]);
    assert.strictEqual(objectiveTerms[2], originalObjectiveTerms[2]);
    assert.strictEqual(objectiveTerms[3], originalObjectiveTerms[3]);
  });
});
