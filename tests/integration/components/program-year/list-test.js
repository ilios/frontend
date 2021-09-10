import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/program-year/list';

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
      const meshDescriptors = this.server.createList('meshDescriptor', 3);
      const vocabulary = this.server.create('vocabulary', { school });
      const terms = this.server.createList('term', 4, { vocabulary });
      const competencies = this.server.createList('competency', 2);
      const directors = this.server.createList('user', 2);
      const programYearAncestor = this.server.create('programYearObjective');
      const programYearObjectives = this.server.createList('programYearObjective', 2, {
        meshDescriptors,
        terms,
      });
      const programYearObjectiveWithAncestor = this.server.create('programYearObjective', {
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
    this.programModel = await this.owner.lookup('service:store').find('program', program.id);
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
    await render(hbs`<ProgramYear::List @canUpdate={{false}} @program={{this.program}} />`);

    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].link.text, '2001');
    assert.equal(component.items[1].link.text, '2002');
    assert.equal(component.items[2].link.text, '2003');
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
    await render(hbs`<ProgramYear::List @canUpdate={{false}} @program={{this.program}} />`);

    assert.equal(component.items.length, 3);
    assert.equal(component.items[0].link.text, '2001 - 2002');
    assert.equal(component.items[1].link.text, '2002 - 2003');
    assert.equal(component.items[2].link.text, '2003 - 2004');
  });

  test('create new program year', async function (assert) {
    const thisYear = new Date().getFullYear();
    this.set('program', this.programModel);
    await render(hbs`<ProgramYear::List @canCreate={{true}} @program={{this.program}} />`);
    await component.expandCollapse.toggle();
    await component.newProgramYear.years.select(thisYear);
    await component.newProgramYear.done.click();
    const programYears = (await this.owner.lookup('service:store').findAll('programYear')).sortBy(
      'id'
    );
    const newProgramYear = programYears.sortBy('id').lastObject;
    const originalProgramYear = programYears[programYears.length - 2];
    assert.equal(newProgramYear.startYear, thisYear);
    const terms = (await newProgramYear.terms).toArray();
    const originalTerms = (await originalProgramYear.terms).toArray();
    assert.equal(terms.length, 4);
    assert.equal(terms[0], originalTerms[0]);
    assert.equal(terms[1], originalTerms[1]);
    assert.equal(terms[2], originalTerms[2]);
    assert.equal(terms[3], originalTerms[3]);
    const competencies = (await newProgramYear.competencies).toArray();
    const originalCompetencies = (await originalProgramYear.competencies).toArray();
    assert.equal(competencies.length, 2);
    assert.equal(competencies[0], originalCompetencies[0]);
    assert.equal(competencies[1], originalCompetencies[1]);
    const directors = (await newProgramYear.directors).toArray();
    const originalDirectors = (await originalProgramYear.directors).toArray();
    assert.equal(directors.length, 2);
    assert.equal(directors[0], originalDirectors[0]);
    assert.equal(directors[1], originalDirectors[1]);
    const objectives = (await newProgramYear.programYearObjectives).toArray();
    const originalObjectives = (await originalProgramYear.programYearObjectives).toArray();
    assert.equal(objectives.length, 3);
    assert.equal(objectives[0].description, originalObjectives[0].description);
    assert.equal(objectives[1].description, originalObjectives[1].description);
    assert.equal(objectives[2].description, originalObjectives[2].description);
    const ancestorObjective1 = await objectives[0].ancestor;
    const ancestorObjective2 = await objectives[1].ancestor;
    const ancestorObjective3 = await objectives[2].ancestor;
    const originalObjectivesAncestor = await originalObjectives[2].ancestor;
    assert.equal(ancestorObjective1, originalObjectives[0]);
    assert.equal(ancestorObjective2, originalObjectives[1]);
    assert.equal(ancestorObjective3, originalObjectivesAncestor);
    const objectiveMeshDescriptors = (await objectives[0].meshDescriptors).toArray();
    const originalObjectiveMeshDescriptors = (
      await originalObjectives[0].meshDescriptors
    ).toArray();
    assert.equal(objectiveMeshDescriptors.length, 3);
    assert.equal(objectiveMeshDescriptors[0], originalObjectiveMeshDescriptors[0]);
    assert.equal(objectiveMeshDescriptors[1], originalObjectiveMeshDescriptors[1]);
    assert.equal(objectiveMeshDescriptors[2], originalObjectiveMeshDescriptors[2]);
    const objectiveTerms = (await objectives[0].terms).toArray();
    const originalObjectiveTerms = (await originalObjectives[0].terms).toArray();
    assert.equal(objectiveTerms.length, 4);
    assert.equal(objectiveTerms[0], originalObjectiveTerms[0]);
    assert.equal(objectiveTerms[1], originalObjectiveTerms[1]);
    assert.equal(objectiveTerms[2], originalObjectiveTerms[2]);
    assert.equal(objectiveTerms[3], originalObjectiveTerms[3]);
  });
});
