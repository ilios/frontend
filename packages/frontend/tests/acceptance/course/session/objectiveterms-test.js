import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Objective Vocabulary Terms', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    const school = this.server.create('school');
    this.server.create('academic-year', { id: 2013 });
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    this.server.create('cohort', { programYear });
    const vocabulary = this.server.create('vocabulary', {
      school,
      active: true,
    });
    const term = this.server.create('term', { vocabulary, active: true });
    this.server.createList('term', 3, { vocabulary, active: true });
    const course = this.server.create('course', { school });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', { session, terms: [term] });
    this.school = school;
  });

  test('manage and save terms', async function (assert) {
    assert.expect(24);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)',
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
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].title,
      'Vocabulary 1 (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms
        .length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms[0]
        .name,
      'term 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .value,
      '1',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .text,
      'Vocabulary 1 (school 0)',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
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
    await page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms[0].remove();
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
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)',
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
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].title,
      'Vocabulary 1 (school 0)',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms
        .length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms[0]
        .name,
      'term 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options.length,
      1,
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .value,
      '1',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
        .text,
      'Vocabulary 1 (school 0)',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].taxonomyManager.vocabulary.options[0]
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
    await page.details.objectives.objectiveList.objectives[0].taxonomyManager.selectedTerms[0].terms[0].remove();
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
