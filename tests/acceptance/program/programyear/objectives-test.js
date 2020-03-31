import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program-year';

module('Acceptance | Program Year - Objectives', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const program = this.server.create('program', {
      school: this.school,
    });
    const programYear = this.server.create('programYear', {
      program,
    });
    this.server.create('cohort', {
      programYear
    });
    const parent = this.server.create('competency', {
      school: this.school,
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
    const meshDescriptors = this.server.createList('meshDescriptor', 4);

    const objective1 = this.server.create('objective', {
      programYears: [programYear],
      competency: competency1,
      meshDescriptors: [meshDescriptors[0], meshDescriptors[1]]
    });
    this.server.create('objective', {
      programYears: [programYear],
      competency: competency4
    });
    this.server.create('objective', {
      programYears: [programYear]
    });
    const course = this.server.create('course');
    this.server.create('objective', {
      courses: [course],
      parents: [objective1]
    });
  });

  test('list editable', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.ok(page.objectives.objectiveList.objectives[0].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[0].competencyTitle, 'competency 1');
    assert.ok(page.objectives.objectiveList.objectives[0].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[0].domainTitle, '(competency 0)');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[0].text, 'descriptor 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[1].text, 'descriptor 1');

    assert.equal(page.objectives.objectiveList.objectives[1].description.text, 'objective 1');
    assert.ok(page.objectives.objectiveList.objectives[1].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[1].competencyTitle, 'competency 3');
    assert.notOk(page.objectives.objectiveList.objectives[1].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[1].meshTerms.length, 0);

    assert.equal(page.objectives.objectiveList.objectives[2].description.text, 'objective 2');
    assert.notOk(page.objectives.objectiveList.objectives[2].hasCompetency);
    assert.notOk(page.objectives.objectiveList.objectives[2].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[2].meshTerms.length, 0);
  });

  test('list not editable', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.ok(page.objectives.objectiveList.objectives[0].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[0].competencyTitle, 'competency 1');
    assert.ok(page.objectives.objectiveList.objectives[0].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[0].domainTitle, '(competency 0)');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[0].text, 'descriptor 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[1].text, 'descriptor 1');

    assert.equal(page.objectives.objectiveList.objectives[1].description.text, 'objective 1');
    assert.ok(page.objectives.objectiveList.objectives[1].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[1].competencyTitle, 'competency 3');
    assert.notOk(page.objectives.objectiveList.objectives[1].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[1].meshTerms.length, 0);

    assert.equal(page.objectives.objectiveList.objectives[2].description.text, 'objective 2');
    assert.notOk(page.objectives.objectiveList.objectives[2].hasCompetency);
    assert.notOk(page.objectives.objectiveList.objectives[2].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[2].meshTerms.length, 0);
  });

  test('manage terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[0].title, 'descriptor 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[1].title, 'descriptor 1');

    await page.objectives.objectiveList.objectives[0].manageMesh();
    const m = page.objectives.manageObjectiveDescriptors.meshManager;
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

  test('save terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    await page.objectives.objectiveList.objectives[0].manageMesh();

    const m = page.objectives.manageObjectiveDescriptors.meshManager;
    assert.equal(m.selectedTerms.length, 2);
    await m.search('descriptor');
    await m.runSearch();

    await m.selectedTerms[0].remove();
    await m.searchResults[2].add();

    assert.equal(m.selectedTerms.length, 2);
    assert.equal(m.selectedTerms[0].title, 'descriptor 1');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');

    await page.objectives.save();
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[0].title, 'descriptor 1');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[1].title, 'descriptor 2');
  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    await page.objectives.objectiveList.objectives[0].manageMesh();

    const m = page.objectives.manageObjectiveDescriptors.meshManager;
    assert.equal(m.selectedTerms.length, 2);
    await m.search('descriptor');
    await m.runSearch();

    await m.selectedTerms[0].remove();
    await m.searchResults[2].add();

    assert.equal(m.selectedTerms.length, 2);
    assert.equal(m.selectedTerms[0].title, 'descriptor 1');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');

    await page.objectives.cancel();
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[0].title, 'descriptor 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[1].title, 'descriptor 1');
  });

  test('manage competency', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].manageCompetency();
    const m = page.objectives.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 0');

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
    assert.expect(9);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].manageCompetency();
    const m = page.objectives.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 0');
    await m.domains[0].competencies[1].toggle();
    assert.ok(m.domains[0].selected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].selected);
    await page.objectives.save();


    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.ok(page.objectives.objectiveList.objectives[0].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[0].competencyTitle, 'competency 2');
    assert.ok(page.objectives.objectiveList.objectives[0].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[0].domainTitle, '(competency 0)');
  });

  test('save no competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].manageCompetency();
    const m = page.objectives.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 0');
    await m.domains[0].competencies[0].toggle();
    assert.ok(m.domains[0].notSelected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    await page.objectives.save();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.notOk(page.objectives.objectiveList.objectives[0].hasCompetency);
  });

  test('cancel competency change', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(9);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].manageCompetency();
    const m = page.objectives.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 0');
    await m.domains[0].competencies[1].toggle();
    assert.ok(m.domains[0].selected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].selected);
    await page.objectives.cancel();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.ok(page.objectives.objectiveList.objectives[0].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[0].competencyTitle, 'competency 1');
    assert.ok(page.objectives.objectiveList.objectives[0].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[0].domainTitle, '(competency 0)');
  });

  test('cancel remove competency change', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(9);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[0].manageCompetency();
    const m = page.objectives.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 0');
    await m.domains[0].competencies[0].toggle();
    assert.ok(m.domains[0].notSelected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].notSelected);
    await page.objectives.cancel();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.ok(page.objectives.objectiveList.objectives[0].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[0].competencyTitle, 'competency 1');
    assert.ok(page.objectives.objectiveList.objectives[0].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[0].domainTitle, '(competency 0)');
  });

  test('add competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives[2].description.text, 'objective 2');
    assert.notOk(page.objectives.objectiveList.objectives[2].hasCompetency);

    await page.objectives.objectiveList.objectives[2].manageCompetency();
    const m = page.objectives.manageObjectiveCompetency;
    assert.equal(m.objectiveTitle, 'objective 2');
    await m.domains[0].competencies[1].toggle();
    assert.ok(m.domains[0].selected);
    assert.ok(m.domains[0].competencies[0].notSelected);
    assert.ok(m.domains[0].competencies[1].selected);
    await page.objectives.save();

    assert.equal(page.objectives.objectiveList.objectives[2].description.text, 'objective 2');
    assert.ok(page.objectives.objectiveList.objectives[2].hasCompetency);
    assert.equal(page.objectives.objectiveList.objectives[2].competencyTitle, 'competency 2');
    assert.ok(page.objectives.objectiveList.objectives[2].hasDomain);
    assert.equal(page.objectives.objectiveList.objectives[2].domainTitle, '(competency 0)');
  });

  test('empty objective title can not be saved', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    await page.objectives.createNew();
    assert.notOk(page.objectives.newObjective.hasValidationError);
    await page.objectives.newObjective.description('<p>&nbsp</p><div></div><span>  </span>');
    await page.objectives.newObjective.save();
    assert.ok(page.objectives.newObjective.hasValidationError);
    assert.equal(page.objectives.newObjective.validationError, 'This field can not be blank');
  });

  test('expand objective and view links', async function(assert) {
    assert.expect(6);
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    assert.equal(page.objectives.expanded.length, 0);
    await page.objectives.objectiveList.objectives[0].toggleExpandCollapse();
    assert.equal(page.objectives.expanded.length, 1);
    assert.equal(page.objectives.expanded[0].courseTitle, 'course 0');
    assert.equal(page.objectives.expanded[0].objectives.length, 1);
    assert.equal(page.objectives.expanded[0].objectives[0].text, 'objective 3');
  });
});
