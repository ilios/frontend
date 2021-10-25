import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program-year';

module('Acceptance | Program Year - Objectives', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const program = this.server.create('program', {
      school: this.school,
    });
    const vocabulary = this.server.create('vocabulary', { school: this.school });
    const term1 = this.server.create('term', { vocabulary });
    const term2 = this.server.create('term', { vocabulary });
    const programYear = this.server.create('programYear', {
      program,
    });
    this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency1 = this.server.create('competency', {
      parent,
      school: this.school,
      programYears: [programYear],
    });
    this.server.create('competency', {
      parent,
      school: this.school,
      programYears: [programYear],
    });
    const competency4 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    this.server.createList('competency', 3, { school: this.school });
    const meshDescriptors = this.server.createList('meshDescriptor', 4);
    const programYearObjective = this.server.create('programYearObjective', {
      programYear,
      competency: competency1,
      meshDescriptors: [meshDescriptors[0], meshDescriptors[1]],
      terms: [term1],
    });
    this.server.create('programYearObjective', {
      programYear,
      competency: competency4,
      active: false,
      terms: [term2],
    });
    this.server.create('programYearObjective', { programYear });
    const course = this.server.create('course');
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
  });

  test('list editable', async function (assert) {
    assert.expect(25);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);
    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.competencyTitle,
      'competency 1'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasDomain);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.domainTitle,
      '(competency 0)'
    );
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].text,
      'descriptor 0'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[1].text,
      'descriptor 1'
    );
    assert.equal(page.objectives.objectiveList.objectives[0].selectedTerms.list.length, 1);
    assert.equal(
      page.objectives.objectiveList.objectives[0].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 0'
    );

    assert.equal(
      page.objectives.objectiveList.objectives[1].description.text,
      'program-year objective 1'
    );
    assert.ok(page.objectives.objectiveList.objectives[1].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[1].competency.competencyTitle,
      'competency 3'
    );
    assert.notOk(page.objectives.objectiveList.objectives[1].competency.hasDomain);
    assert.ok(page.objectives.objectiveList.objectives[1].meshDescriptors.isEmpty);
    assert.equal(page.objectives.objectiveList.objectives[1].selectedTerms.list.length, 1);
    assert.equal(
      page.objectives.objectiveList.objectives[1].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[1].selectedTerms.list[0].terms[0].name,
      'term 1'
    );

    assert.equal(
      page.objectives.objectiveList.objectives[2].description.text,
      'program-year objective 2'
    );
    assert.notOk(page.objectives.objectiveList.objectives[2].competency.hasCompetency);
    assert.notOk(page.objectives.objectiveList.objectives[2].competency.hasDomain);
    assert.ok(page.objectives.objectiveList.objectives[2].meshDescriptors.isEmpty);
    assert.notOk(page.objectives.objectiveList.objectives[2].selectedTerms.list.isPresent);
  });

  test('list not editable', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);
    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.competencyTitle,
      'competency 1'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasDomain);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.domainTitle,
      '(competency 0)'
    );
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].text,
      'descriptor 0'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[1].text,
      'descriptor 1'
    );

    assert.equal(
      page.objectives.objectiveList.objectives[1].description.text,
      'program-year objective 1'
    );
    assert.ok(page.objectives.objectiveList.objectives[1].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[1].competency.competencyTitle,
      'competency 3'
    );
    assert.notOk(page.objectives.objectiveList.objectives[1].competency.hasDomain);
    assert.ok(page.objectives.objectiveList.objectives[1].meshDescriptors.isEmpty);

    assert.equal(
      page.objectives.objectiveList.objectives[2].description.text,
      'program-year objective 2'
    );
    assert.notOk(page.objectives.objectiveList.objectives[2].competency.hasCompetency);
    assert.notOk(page.objectives.objectiveList.objectives[2].competency.hasDomain);
    assert.ok(page.objectives.objectiveList.objectives[2].meshDescriptors.isEmpty);
  });

  test('manage MeSH terms', async function (assert) {
    assert.expect(23);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].title,
      'descriptor 0'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[1].title,
      'descriptor 1'
    );

    await page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].manage();
    const m = page.objectives.objectiveList.objectives[0].meshManager.meshManager;
    assert.equal(m.selectedTerms.length, 2);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    assert.equal(m.selectedTerms[1].title, 'descriptor 1');
    await m.search('descriptor');
    await m.runSearch();

    assert.equal(m.searchResults.length, 4);
    for (let i = 0; i < 4; i++) {
      assert.equal(m.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(m.searchResults[0].isDisabled);
    assert.ok(m.searchResults[1].isDisabled);
    assert.ok(m.searchResults[2].isEnabled);
    assert.ok(m.searchResults[3].isEnabled);

    await m.selectedTerms[0].remove();
    await m.searchResults[2].add();
    assert.ok(m.searchResults[0].isEnabled);
    assert.ok(m.searchResults[1].isDisabled);
    assert.ok(m.searchResults[2].isDisabled);
    assert.equal(m.selectedTerms.length, 2);

    assert.equal(m.selectedTerms[0].title, 'descriptor 1');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');
  });

  test('save MeSH terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    await page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].manage();

    const m = page.objectives.objectiveList.objectives[0].meshManager.meshManager;
    assert.equal(m.selectedTerms.length, 2);
    await m.search('descriptor');
    await m.runSearch();

    await m.selectedTerms[0].remove();
    await m.searchResults[2].add();

    assert.equal(m.selectedTerms.length, 2);
    assert.equal(m.selectedTerms[0].title, 'descriptor 1');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');

    await page.objectives.objectiveList.objectives[0].meshDescriptors.save();
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].title,
      'descriptor 1'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[1].title,
      'descriptor 2'
    );
  });

  test('cancel changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    await page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].manage();

    const m = page.objectives.objectiveList.objectives[0].meshManager.meshManager;
    assert.equal(m.selectedTerms.length, 2);
    await m.search('descriptor');
    await m.runSearch();

    await m.selectedTerms[0].remove();
    await m.searchResults[2].add();

    assert.equal(m.selectedTerms.length, 2);
    assert.equal(m.selectedTerms[0].title, 'descriptor 1');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');

    await page.objectives.objectiveList.objectives[0].meshDescriptors.cancel();
    assert.equal(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 2);
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].title,
      'descriptor 0'
    );
    assert.equal(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[1].title,
      'descriptor 1'
    );
  });

  test('manage competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(12);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].competency.manage();
    const m = page.objectives.objectiveList.objectives[0].competencyManager;

    assert.equal(m.domains.length, 3);
    assert.equal(m.domains[0].title, 'competency 0');
    assert.ok(m.domains[0].selected);

    assert.equal(m.domains[0].competencies.length, 2);
    assert.equal(m.domains[0].competencies[0].title, 'competency 1');
    assert.ok(m.domains[0].competencies[0].selected);
    assert.equal(m.domains[0].competencies[1].title, 'competency 2');
    assert.ok(m.domains[0].competencies[1].notSelected);

    assert.equal(m.domains[1].title, 'competency 3');
    assert.ok(m.domains[1].notSelected);
    assert.equal(m.domains[2].title, 'competency 4');
    assert.ok(m.domains[2].notSelected);
  });

  test('save competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(8);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].competency.manage();
    const m = page.objectives.objectiveList.objectives[0].competencyManager;
    await m.domains[0].competencies[1].toggle();
    assert.ok(m.domains[0].selected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].selected);
    await page.objectives.objectiveList.objectives[0].competency.save();

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.competencyTitle,
      'competency 2'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasDomain);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.domainTitle,
      '(competency 0)'
    );
  });

  test('save no competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].competency.manage();
    const m = page.objectives.objectiveList.objectives[0].competencyManager;
    await m.domains[0].competencies[0].toggle();
    assert.ok(m.domains[0].notSelected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    await page.objectives.objectiveList.objectives[0].competency.save();

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.notOk(page.objectives.objectiveList.objectives[0].competency.hasCompetency);
  });

  test('cancel competency change', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(8);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].competency.manage();
    const m = page.objectives.objectiveList.objectives[0].competencyManager;
    await m.domains[0].competencies[1].toggle();
    assert.ok(m.domains[0].selected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].selected);
    await page.objectives.objectiveList.objectives[0].competency.cancel();

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.competencyTitle,
      'competency 1'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasDomain);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.domainTitle,
      '(competency 0)'
    );
  });

  test('cancel remove competency change', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(8);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].competency.manage();
    const m = page.objectives.objectiveList.objectives[0].competencyManager;
    await m.domains[0].competencies[0].toggle();
    assert.ok(m.domains[0].notSelected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].notSelected);
    await page.objectives.objectiveList.objectives[0].competency.cancel();

    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.competencyTitle,
      'competency 1'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].competency.hasDomain);
    assert.equal(
      page.objectives.objectiveList.objectives[0].competency.domainTitle,
      '(competency 0)'
    );
  });

  test('add competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(10);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(
      page.objectives.objectiveList.objectives[2].description.text,
      'program-year objective 2'
    );
    assert.notOk(page.objectives.objectiveList.objectives[2].competency.hasCompetency);

    await page.objectives.objectiveList.objectives[2].competency.manage();
    const m = page.objectives.objectiveList.objectives[2].competencyManager;
    await m.domains[0].competencies[1].toggle();
    assert.ok(m.domains[0].selected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].selected);
    await page.objectives.objectiveList.objectives[2].competency.save();

    assert.equal(
      page.objectives.objectiveList.objectives[2].description.text,
      'program-year objective 2'
    );
    assert.ok(page.objectives.objectiveList.objectives[2].competency.hasCompetency);
    assert.equal(
      page.objectives.objectiveList.objectives[2].competency.competencyTitle,
      'competency 2'
    );
    assert.ok(page.objectives.objectiveList.objectives[2].competency.hasDomain);
    assert.equal(
      page.objectives.objectiveList.objectives[2].competency.domainTitle,
      '(competency 0)'
    );
  });

  test('empty objective title can not be saved', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);
    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    await page.objectives.createNew();
    assert.notOk(page.objectives.newObjective.hasValidationError);
    await page.objectives.newObjective.description('<p>&nbsp</p><div></div><span>  </span>');
    await page.objectives.newObjective.save();
    assert.ok(page.objectives.newObjective.hasValidationError);
    assert.equal(page.objectives.newObjective.validationError, 'This field can not be blank');
  });

  test('expand objective and view links', async function (assert) {
    assert.expect(6);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(
      page.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.equal(page.objectives.objectiveList.expanded.length, 0);
    await page.objectives.objectiveList.objectives[0].toggleExpandCollapse();
    assert.equal(page.objectives.objectiveList.expanded.length, 1);
    assert.equal(page.objectives.objectiveList.expanded[0].courseTitle, 'course 0');
    assert.equal(page.objectives.objectiveList.expanded[0].objectives.length, 1);
    assert.equal(
      page.objectives.objectiveList.expanded[0].objectives[0].text,
      'course objective 0'
    );
  });

  test('activate and deactivate', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.ok(page.objectives.objectiveList.objectives[0].isActive);
    assert.ok(page.objectives.objectiveList.objectives[1].isInactive);
    assert.ok(page.objectives.objectiveList.objectives[2].isActive);

    await page.objectives.objectiveList.objectives[0].deactivate();
    await page.objectives.objectiveList.objectives[1].activate();

    assert.ok(page.objectives.objectiveList.objectives[0].isInactive);
    assert.ok(page.objectives.objectiveList.objectives[1].isActive);
    assert.ok(page.objectives.objectiveList.objectives[2].isActive);
  });
});
