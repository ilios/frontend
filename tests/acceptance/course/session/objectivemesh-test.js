import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Objective Mesh Descriptors', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication();
    this.server.create('academicYear', {id: 2013});
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);

    this.server.createList('meshDescriptor', 6);
    this.server.create('objective', {
      meshDescriptorIds: [1]
    });
    this.server.create('objective', {
      meshDescriptorIds: [2, 3, 4, 5, 6]
    });
    this.server.create('objective');
    //create some other objectives not in this course
    this.server.createList('objective', 2);

    //create some extra descriptors that shouldn't be found in search
    this.server.createList('meshDescriptor', 10, {name: 'nope', annotation: 'nope'});

    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.server.create('session', {
      course,
      objectiveIds: [1, 2, 3]
    });
  });

  test('manage terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(page.objectives.objectiveList.objectives[1].description.text, 'objective 1');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list.length, 5);
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title, 'descriptor 1');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title, 'descriptor 2');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[2].title, 'descriptor 3');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[3].title, 'descriptor 4');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[4].title, 'descriptor 5');

    await page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].manage();
    const m = page.objectives.objectiveList.objectives[1].meshManager.meshManager;
    assert.equal(m.selectedTerms.length, 5);
    assert.equal(m.selectedTerms[0].title, 'descriptor 1');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');
    assert.equal(m.selectedTerms[2].title, 'descriptor 3');
    assert.equal(m.selectedTerms[3].title, 'descriptor 4');
    assert.equal(m.selectedTerms[4].title, 'descriptor 5');
    await m.search('descriptor');
    await m.runSearch();

    assert.equal(m.searchResults.length, 6);
    for (let i = 0; i < 6; i++) {
      assert.equal(m.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(m.searchResults[0].isEnabled);
    assert.ok(m.searchResults[1].isDisabled);
    assert.ok(m.searchResults[2].isDisabled);
    assert.ok(m.searchResults[3].isDisabled);
    assert.ok(m.searchResults[4].isDisabled);
    assert.ok(m.searchResults[5].isDisabled);

    await m.selectedTerms[0].remove();
    await m.searchResults[0].add();
    assert.ok(m.searchResults[0].isDisabled);
    assert.ok(m.searchResults[1].isEnabled);
    assert.equal(m.selectedTerms.length, 5);

    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');
    assert.equal(m.selectedTerms[2].title, 'descriptor 3');
    assert.equal(m.selectedTerms[3].title, 'descriptor 4');
    assert.equal(m.selectedTerms[4].title, 'descriptor 5');
  });

  test('save terms', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(page.objectives.objectiveList.objectives[1].description.text, 'objective 1');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list.length, 5);
    await page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].manage();

    const m = page.objectives.objectiveList.objectives[1].meshManager.meshManager;
    assert.equal(m.selectedTerms.length, 5);
    await m.search('descriptor');
    await m.runSearch();

    await m.selectedTerms[0].remove();
    await m.searchResults[0].add();

    assert.equal(m.selectedTerms.length, 5);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');
    assert.equal(m.selectedTerms[2].title, 'descriptor 3');
    assert.equal(m.selectedTerms[3].title, 'descriptor 4');
    assert.equal(m.selectedTerms[4].title, 'descriptor 5');

    await page.objectives.objectiveList.objectives[1].meshDescriptors.save();
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list.length, 5);
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title, 'descriptor 0');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title, 'descriptor 2');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[2].title, 'descriptor 3');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[3].title, 'descriptor 4');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[4].title, 'descriptor 5');
  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 3);

    assert.equal(page.objectives.objectiveList.objectives[1].description.text, 'objective 1');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list.length, 5);
    await page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].manage();

    const m = page.objectives.objectiveList.objectives[1].meshManager.meshManager;
    assert.equal(m.selectedTerms.length, 5);
    await m.search('descriptor');
    await m.runSearch();

    await m.selectedTerms[0].remove();
    await m.searchResults[0].add();

    assert.equal(m.selectedTerms.length, 5);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    assert.equal(m.selectedTerms[1].title, 'descriptor 2');
    assert.equal(m.selectedTerms[2].title, 'descriptor 3');
    assert.equal(m.selectedTerms[3].title, 'descriptor 4');
    assert.equal(m.selectedTerms[4].title, 'descriptor 5');

    await page.objectives.objectiveList.objectives[1].meshDescriptors.cancel();
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list.length, 5);
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title, 'descriptor 1');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title, 'descriptor 2');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[2].title, 'descriptor 3');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[3].title, 'descriptor 4');
    assert.equal(page.objectives.objectiveList.objectives[1].meshDescriptors.list[4].title, 'descriptor 5');
  });
});
