import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/course';

module('Acceptance: Course - Objective Mesh Descriptors', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('academicYear', {id: 2013});
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);

    server.createList('meshDescriptor', 6);
    server.create('objective', {
      meshDescriptorIds: [1]
    });
    server.create('objective', {
      meshDescriptorIds: [2, 3, 4, 5, 6]
    });
    server.create('objective');
    //create some other objectives not in this course
    this.server.createList('objective', 2);

    //create some extra descriptors that shouldn't be found in search
    this.server.createList('meshDescriptor', 10, {name: 'nope', annotation: 'nope'});

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1,2,3]
    });
  });

  test('manage terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 3);

    assert.equal(page.objectives.current(1).description.text, 'objective 1');
    assert.equal(page.objectives.current(1).meshTerms().count, 5);
    assert.equal(page.objectives.current(1).meshTerms(0).title, 'descriptor 1');
    assert.equal(page.objectives.current(1).meshTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.current(1).meshTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.current(1).meshTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.current(1).meshTerms(4).title, 'descriptor 5');

    await page.objectives.current(1).manageMesh();
    assert.equal(page.objectives.meshManager.selectedTerms().count, 5);
    assert.equal(page.objectives.meshManager.selectedTerms(0).title, 'descriptor 1');
    assert.equal(page.objectives.meshManager.selectedTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.meshManager.selectedTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.meshManager.selectedTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.meshManager.selectedTerms(4).title, 'descriptor 5');
    await page.objectives.meshManager.search('descriptor');
    await page.objectives.meshManager.runSearch();

    assert.equal(page.objectives.meshManager.searchResults().count, 6);
    for (let i = 0; i < 6; i++) {
      assert.equal(page.objectives.meshManager.searchResults(i).title, `descriptor ${i}`);
    }
    assert.ok(page.objectives.meshManager.searchResults(0).isEnabled);
    assert.ok(page.objectives.meshManager.searchResults(1).isDisabled);
    assert.ok(page.objectives.meshManager.searchResults(2).isDisabled);
    assert.ok(page.objectives.meshManager.searchResults(3).isDisabled);
    assert.ok(page.objectives.meshManager.searchResults(4).isDisabled);
    assert.ok(page.objectives.meshManager.searchResults(5).isDisabled);

    await page.objectives.meshManager.selectedTerms(0).remove();
    await page.objectives.meshManager.searchResults(0).add();
    assert.ok(page.objectives.meshManager.searchResults(0).isDisabled);
    assert.ok(page.objectives.meshManager.searchResults(1).isEnabled);
    assert.equal(page.objectives.meshManager.selectedTerms().count, 5);

    assert.equal(page.objectives.meshManager.selectedTerms(0).title, 'descriptor 0');
    assert.equal(page.objectives.meshManager.selectedTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.meshManager.selectedTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.meshManager.selectedTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.meshManager.selectedTerms(4).title, 'descriptor 5');
  });

  test('save terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 3);

    assert.equal(page.objectives.current(1).description.text, 'objective 1');
    assert.equal(page.objectives.current(1).meshTerms().count, 5);
    await page.objectives.current(1).manageMesh();

    assert.equal(page.objectives.meshManager.selectedTerms().count, 5);
    await page.objectives.meshManager.search('descriptor');
    await page.objectives.meshManager.runSearch();

    await page.objectives.meshManager.selectedTerms(0).remove();
    await page.objectives.meshManager.searchResults(0).add();

    assert.equal(page.objectives.meshManager.selectedTerms().count, 5);
    assert.equal(page.objectives.meshManager.selectedTerms(0).title, 'descriptor 0');
    assert.equal(page.objectives.meshManager.selectedTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.meshManager.selectedTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.meshManager.selectedTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.meshManager.selectedTerms(4).title, 'descriptor 5');

    await page.objectives.save();
    assert.equal(page.objectives.current(1).meshTerms().count, 5);
    assert.equal(page.objectives.current(1).meshTerms(0).title, 'descriptor 0');
    assert.equal(page.objectives.current(1).meshTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.current(1).meshTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.current(1).meshTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.current(1).meshTerms(4).title, 'descriptor 5');
  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 3);

    assert.equal(page.objectives.current(1).description.text, 'objective 1');
    assert.equal(page.objectives.current(1).meshTerms().count, 5);
    await page.objectives.current(1).manageMesh();

    assert.equal(page.objectives.meshManager.selectedTerms().count, 5);
    await page.objectives.meshManager.search('descriptor');
    await page.objectives.meshManager.runSearch();

    await page.objectives.meshManager.selectedTerms(0).remove();
    await page.objectives.meshManager.searchResults(0).add();

    assert.equal(page.objectives.meshManager.selectedTerms().count, 5);
    assert.equal(page.objectives.meshManager.selectedTerms(0).title, 'descriptor 0');
    assert.equal(page.objectives.meshManager.selectedTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.meshManager.selectedTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.meshManager.selectedTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.meshManager.selectedTerms(4).title, 'descriptor 5');

    await page.objectives.cancel();
    assert.equal(page.objectives.current(1).meshTerms().count, 5);
    assert.equal(page.objectives.current(1).meshTerms(0).title, 'descriptor 1');
    assert.equal(page.objectives.current(1).meshTerms(1).title, 'descriptor 2');
    assert.equal(page.objectives.current(1).meshTerms(2).title, 'descriptor 3');
    assert.equal(page.objectives.current(1).meshTerms(3).title, 'descriptor 4');
    assert.equal(page.objectives.current(1).meshTerms(4).title, 'descriptor 5');
  });
});
