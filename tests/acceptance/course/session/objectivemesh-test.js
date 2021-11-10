import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Objective Mesh Descriptors', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication();
    this.server.create('academicYear', { id: 2013 });
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const session = this.server.create('session', { course });
    const meshDescriptors = this.server.createList('meshDescriptor', 6);
    this.server.create('sessionObjective', {
      session,
      meshDescriptors: [meshDescriptors.shift()],
    });
    this.server.create('sessionObjective', { session, meshDescriptors });
    this.server.create('sessionObjective', { session });

    //create some extra descriptors that shouldn't be found in search
    this.server.createList('meshDescriptor', 10, {
      name: 'nope',
      annotation: 'nope',
    });
  });

  test('manage terms', async function (assert) {
    assert.expect(35);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 3);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      'session objective 1'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list.length,
      5
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title,
      'descriptor 1'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title,
      'descriptor 2'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[2].title,
      'descriptor 3'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[3].title,
      'descriptor 4'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[4].title,
      'descriptor 5'
    );

    await page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[1].meshManager.meshManager;
    assert.strictEqual(m.selectedTerms.length, 5);
    assert.strictEqual(m.selectedTerms[0].title, 'descriptor 1');
    assert.strictEqual(m.selectedTerms[1].title, 'descriptor 2');
    assert.strictEqual(m.selectedTerms[2].title, 'descriptor 3');
    assert.strictEqual(m.selectedTerms[3].title, 'descriptor 4');
    assert.strictEqual(m.selectedTerms[4].title, 'descriptor 5');
    await m.search.set('descriptor');
    await m.search.submit();

    assert.strictEqual(m.searchResults.length, 6);
    for (let i = 0; i < 6; i++) {
      assert.strictEqual(m.searchResults[i].title, `descriptor ${i}`);
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
    assert.strictEqual(m.selectedTerms.length, 5);

    assert.strictEqual(m.selectedTerms[0].title, 'descriptor 0');
    assert.strictEqual(m.selectedTerms[1].title, 'descriptor 2');
    assert.strictEqual(m.selectedTerms[2].title, 'descriptor 3');
    assert.strictEqual(m.selectedTerms[3].title, 'descriptor 4');
    assert.strictEqual(m.selectedTerms[4].title, 'descriptor 5');
  });

  test('save terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 3);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      'session objective 1'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list.length,
      5
    );
    await page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[0].manage();

    const m = page.details.objectives.objectiveList.objectives[1].meshManager.meshManager;
    assert.strictEqual(m.selectedTerms.length, 5);
    await m.search.set('descriptor');
    await m.search.submit();

    await m.selectedTerms[0].remove();
    await m.searchResults[0].add();

    assert.strictEqual(m.selectedTerms.length, 5);
    assert.strictEqual(m.selectedTerms[0].title, 'descriptor 0');
    assert.strictEqual(m.selectedTerms[1].title, 'descriptor 2');
    assert.strictEqual(m.selectedTerms[2].title, 'descriptor 3');
    assert.strictEqual(m.selectedTerms[3].title, 'descriptor 4');
    assert.strictEqual(m.selectedTerms[4].title, 'descriptor 5');

    await page.details.objectives.objectiveList.objectives[1].meshDescriptors.save();
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list.length,
      5
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title,
      'descriptor 0'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title,
      'descriptor 2'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[2].title,
      'descriptor 3'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[3].title,
      'descriptor 4'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[4].title,
      'descriptor 5'
    );
  });

  test('cancel changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 3);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      'session objective 1'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list.length,
      5
    );
    await page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[0].manage();

    const m = page.details.objectives.objectiveList.objectives[1].meshManager.meshManager;
    assert.strictEqual(m.selectedTerms.length, 5);
    await m.search.set('descriptor');
    await m.search.submit();

    await m.selectedTerms[0].remove();
    await m.searchResults[0].add();

    assert.strictEqual(m.selectedTerms.length, 5);
    assert.strictEqual(m.selectedTerms[0].title, 'descriptor 0');
    assert.strictEqual(m.selectedTerms[1].title, 'descriptor 2');
    assert.strictEqual(m.selectedTerms[2].title, 'descriptor 3');
    assert.strictEqual(m.selectedTerms[3].title, 'descriptor 4');
    assert.strictEqual(m.selectedTerms[4].title, 'descriptor 5');

    await page.details.objectives.objectiveList.objectives[1].meshDescriptors.cancel();
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list.length,
      5
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title,
      'descriptor 1'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title,
      'descriptor 2'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[2].title,
      'descriptor 3'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[3].title,
      'descriptor 4'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].meshDescriptors.list[4].title,
      'descriptor 5'
    );
  });
});
