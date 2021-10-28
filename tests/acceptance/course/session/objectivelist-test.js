import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Objective List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });

    this.server.create('academicYear', { id: 2013 });
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);
  });

  test('list objectives', async function (assert) {
    assert.expect(53);
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    const session = this.server.create('session', { course });
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    const courseObjectives = this.server.createList('courseObjective', 2);
    const meshDescriptors = this.server.createList('meshDescriptor', 3);
    const terms = this.server.createList('term', 2, { vocabulary });
    this.server.create('sessionObjective', {
      session,
      courseObjectives: [courseObjectives.shift()],
      meshDescriptors: [meshDescriptors.shift()],
      terms: [terms.shift()],
    });
    this.server.create('sessionObjective', {
      session,
      courseObjectives,
      meshDescriptors,
      terms: terms,
    });
    this.server.createList('sessionObjective', 11, { session });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 13);

    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'session objective 0'
    );
    assert.strictEqual(page.objectives.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 0'
    );
    assert.strictEqual(page.objectives.objectiveList.objectives[0].meshDescriptors.list.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].meshDescriptors.list[0].title,
      'descriptor 0'
    );
    assert.strictEqual(page.objectives.objectiveList.objectives[0].selectedTerms.list.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms.length,
      1
    );
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].selectedTerms.list[0].terms[0].name,
      'term 0'
    );

    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].description.text,
      'session objective 1'
    );
    assert.strictEqual(page.objectives.objectiveList.objectives[1].parents.list.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].parents.list[0].text,
      'course objective 1'
    );
    assert.strictEqual(page.objectives.objectiveList.objectives[1].meshDescriptors.list.length, 2);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].meshDescriptors.list[0].title,
      'descriptor 1'
    );
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].meshDescriptors.list[1].title,
      'descriptor 2'
    );
    assert.strictEqual(page.objectives.objectiveList.objectives[1].selectedTerms.list.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].selectedTerms.list[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].selectedTerms.list[0].terms.length,
      1
    );
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].selectedTerms.list[0].terms[0].name,
      'term 1'
    );

    for (let i = 2; i <= 12; i++) {
      assert.strictEqual(
        page.objectives.objectiveList.objectives[i].description.text,
        `session objective ${i}`
      );
      assert.ok(page.objectives.objectiveList.objectives[i].parents.empty);
      assert.ok(page.objectives.objectiveList.objectives[i].meshDescriptors.empty);
    }
  });

  test('long objective', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    var longTitle =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    const course = this.server.create('course', { year: 2013, schoolId: 1 });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', { session, title: longTitle });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      longTitle.substring(0, 200)
    );
    await page.objectives.objectiveList.objectives[0].description.openEditor();
    assert.strictEqual(
      await page.objectives.objectiveList.objectives[0].description.editorContents(),
      `<p>${longTitle}</p>`
    );
  });

  test('edit objective title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    const newDescription = 'test new title';
    const course = this.server.create('course', { year: 2013, schoolId: 1 });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', { session });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'session objective 0'
    );
    await page.objectives.objectiveList.objectives[0].description.openEditor();
    await page.objectives.objectiveList.objectives[0].description.edit(newDescription);
    await page.objectives.objectiveList.objectives[0].description.save();
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      newDescription
    );
  });

  test('empty objective title can not be saved', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    const course = this.server.create('course', { year: 2013, schoolId: 1 });
    const session = this.server.create('session', { course });
    this.server.create('session-objective', { session });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.notOk(page.objectives.objectiveList.objectives[0].description.hasValidationError);
    await page.objectives.objectiveList.objectives[0].description.openEditor();
    await page.objectives.objectiveList.objectives[0].description.edit(
      '<p>&nbsp</p><div></div><span>  </span>'
    );
    await page.objectives.objectiveList.objectives[0].description.save();
    assert.ok(page.objectives.objectiveList.objectives[0].description.hasValidationError);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.validationError,
      'This field can not be blank'
    );
  });
});
