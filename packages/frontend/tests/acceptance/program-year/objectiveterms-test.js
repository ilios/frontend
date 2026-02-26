import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/program-year';

module('Acceptance | Program Year - Objective Vocabulary Terms', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    const school = this.server.create('school');
    this.server.create('academic-year', { id: 2013 });
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.server.create('cohort', { programYear });
    const vocabulary = this.server.create('vocabulary', { school, title: 'Topics', active: true });
    const vocabulary2 = this.server.create('vocabulary', {
      school,
      title: 'Resources',
      active: true,
    });
    const term = this.server.create('term', { vocabulary, active: true });
    this.server.createList('term', 3, { vocabulary, active: true });
    this.server.create('term', { vocabulary: vocabulary2, active: true });
    this.server.create('program-year-objective', { programYear, terms: [term] });
    this.school = school;
  });

  test('manage and save terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    await takeScreenshot(assert);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].title,
      'Topics (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 0',
    );
    assert.notOk(page.details.objectives.objectiveList.objectives[0].taxonomyManager.isPresent);
    await page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].manage();
    assert.ok(page.details.objectives.objectiveList.objectives[0].taxonomyManager.isPresent);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms.length,
      2,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].title,
      'Resources (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms
        .length,
      0,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].title,
      'Topics (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].terms
        .length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].terms[0]
        .name,
      'term 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options.length,
      2,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .value,
      '2',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .text,
      'Resources (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[1]
        .value,
      '1',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[1]
        .text,
      'Topics (school 0)',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .isSelected,
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[1]
        .isSelected,
    );

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms.length,
      4,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[0].name,
      'term 0',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[0]
        .isSelected,
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[1]
        .isSelected,
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[2]
        .isSelected,
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[3]
        .isSelected,
    );
    await page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].terms[0].remove();
    await page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[3].toggle();
    await page.details.objectives.objectiveList.objectives[0].selectedTerms.save();
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 3',
    );
  });

  test('manage and cancel terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyObjectiveDetails: true });
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'program-year objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].title,
      'Topics (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 0',
    );
    assert.notOk(page.details.objectives.objectiveList.objectives[0].taxonomyManager.isPresent);
    await page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].manage();
    assert.ok(page.details.objectives.objectiveList.objectives[0].taxonomyManager.isPresent);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms.length,
      2,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].title,
      'Topics (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].terms
        .length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].terms[0]
        .name,
      'term 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options.length,
      2,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[1]
        .value,
      '1',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[1]
        .text,
      'Topics (school 0)',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[1]
        .isSelected,
    );

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms.length,
      4,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[0].name,
      'term 0',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[0]
        .isSelected,
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[1]
        .isSelected,
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[2]
        .isSelected,
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[3]
        .isSelected,
    );
    await page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[1].terms[0].remove();
    await page.details.objectives.objectiveList.objectives[0].taxonomyManager.availableTerms[3].toggle();
    await page.details.objectives.objectiveList.objectives[0].selectedTerms.cancel();
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 0',
    );
  });
});
