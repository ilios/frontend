import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/objectives', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort]
    });
    const programYearObjectives = this.server.createList('objective', 3, {
      competency: competencies[0],
      programYears: [programYear]
    });
    this.server.createList('objective', 2, {
      competency: competencies[1],
      programYears: [programYear]
    });

    this.server.create('objective', {
      parents: [programYearObjectives[0]],
      courses: [course],
    });
    this.server.create('objective', {
      courses: [course],
    });
    this.server.createList('objective', 2, { competency: competencies[0] });
    this.server.createList('objective', 4, { competency: competencies[1] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.current.length, 2);
    assert.equal(component.current[0].description.text, 'objective 5');
    assert.equal(component.current[0].parents.length, 1);
    assert.equal(component.current[0].parents[0].description, 'objective 0');
    assert.equal(component.current[0].meshTerms.length, 0);

    assert.equal(component.current[1].description.text, 'objective 6');
    assert.equal(component.current[1].parents.length, 0);
    assert.equal(component.current[1].meshTerms.length, 0);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort]
    });
    const programYearObjectives = this.server.createList('objective', 3, {
      competency: competencies[0],
      programYears: [programYear]
    });
    this.server.createList('objective', 2, {
      competency: competencies[1],
      programYears: [programYear]
    });

    this.server.create('objective', {
      parents: [programYearObjectives[0]],
      courses: [course],
    });
    this.server.createList('objective', 2, { competency: competencies[0] });
    this.server.createList('objective', 4, { competency: competencies[1] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.current.length, 1);
    assert.equal(component.current[0].description.text, 'objective 5');
    assert.equal(component.current[0].parents.length, 1);
    await component.current[0].manageParents();

    const m = component.manageObjectiveParents;
    assert.equal(m.objectiveTitle, 'objective 5');
    assert.notOk(m.hasMultipleCohorts);
    assert.equal(m.selectedCohortTitle, 'cohort 0');
    assert.equal(m.competencies.length, 2);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);

    assert.equal(m.competencies[0].objectives.length, 3);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.equal(m.competencies[0].objectives[1].title, 'objective 1');
    assert.ok(m.competencies[0].objectives[1].notSelected);
    assert.equal(m.competencies[0].objectives[2].title, 'objective 2');
    assert.ok(m.competencies[0].objectives[2].notSelected);

    assert.equal(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].notSelected);

    assert.equal(m.competencies[1].objectives.length, 2);
    assert.equal(m.competencies[1].objectives[0].title, 'objective 3');
    assert.ok(m.competencies[1].objectives[0].notSelected);
    assert.equal(m.competencies[1].objectives[1].title, 'objective 4');
    assert.ok(m.competencies[1].objectives[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for multiple cohorts', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear1 = this.server.create('program-year', { program });
    const cohort1 = this.server.create('cohort', { programYear: programYear1 });

    const programYear2 = this.server.create('program-year', { program });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });

    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort1, cohort2]
    });
    const programYearObjectives = this.server.createList('objective', 2, {
      competency: competencies[0],
      programYears: [programYear1]
    });
    this.server.createList('objective', 2, {
      competency: competencies[1],
      programYears: [programYear2]
    });

    this.server.create('objective', {
      parents: [programYearObjectives[0]],
      courses: [course],
    });
    this.server.createList('objective', 2, { competency: competencies[0] });
    this.server.createList('objective', 4, { competency: competencies[1] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.current.length, 1);
    assert.equal(component.current[0].description.text, 'objective 4');
    assert.equal(component.current[0].parents.length, 1);
    await component.current[0].manageParents();

    const m = component.manageObjectiveParents;
    assert.equal(m.objectiveTitle, 'objective 4');
    assert.ok(m.hasMultipleCohorts);
    assert.equal(m.selectedCohortTitle, 'cohort 0 cohort 1');
    assert.equal(m.selectedCohortId, '1');

    assert.equal(m.competencies.length, 1);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);

    assert.equal(m.competencies[0].objectives.length, 2);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.equal(m.competencies[0].objectives[1].title, 'objective 1');
    assert.ok(m.competencies[0].objectives[1].notSelected);

    await m.selectCohort(2);
    assert.equal(m.selectedCohortId, '2');
    assert.equal(m.competencies[0].title, 'competency 1');
    assert.ok(m.competencies[0].notSelected);

    assert.equal(m.competencies[0].objectives.length, 2);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 2');
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.equal(m.competencies[0].objectives[1].title, 'objective 3');
    assert.ok(m.competencies[0].objectives[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
