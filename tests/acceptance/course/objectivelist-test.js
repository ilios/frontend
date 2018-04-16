import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/course';

module('Acceptance: Course - Objective List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('academicYear', {id: 2013});
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);

  });

  test('list objectives', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(45);
    assert.expect(45);
    this.server.createList('competency', 2);
    this.server.create('objective', {
      competencyId: 1
    });
    this.server.create('objective');
    this.server.createList('meshDescriptor', 3);
    this.server.create('objective', {
      parentIds: [1],
      meshDescriptorIds: [1]
    });
    this.server.create('objective', {
      parentIds: [2],
      meshDescriptorIds: [1,2]
    });
    this.server.createList('objective', 11);
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [3,4,5,6,7,8,9,10,11,12,13,14,15]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 13);

    assert.equal(page.objectives.current(0).description.text, 'objective 2');
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).description, 'objective 0');
    assert.equal(page.objectives.current(0).meshTerms().count, 1);
    assert.equal(page.objectives.current(0).meshTerms(0).title, 'descriptor 0');

    assert.equal(page.objectives.current(1).description.text, 'objective 3');
    assert.equal(page.objectives.current(1).parents().count, 1);
    assert.equal(page.objectives.current(1).parents(0).description, 'objective 1');
    assert.equal(page.objectives.current(1).meshTerms().count, 2);
    assert.equal(page.objectives.current(1).meshTerms(0).title, 'descriptor 0');
    assert.equal(page.objectives.current(1).meshTerms(1).title, 'descriptor 1');

    for (let i=4; i <= 14; i++) {
      assert.equal(page.objectives.current(i-2).description.text, `objective ${i}`);
      assert.equal(page.objectives.current(i-2).parents().count, 0);
      assert.equal(page.objectives.current(i-2).meshTerms().count, 0);
    }
  });

  test('long objective', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    var longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    this.server.create('objective', {
      title: longTitle
    });

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, longTitle.substring(0, 200));
    await page.objectives.current(0).description.openEditor();
    assert.equal(page.objectives.current(0).description.editorContents, `<p>${longTitle}</p>`);
  });

  test('edit objective title', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    const newDescription = 'test new title';
    this.server.create('objective');

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, 'objective 0');
    await page.objectives.current(0).description.openEditor();
    await page.objectives.current(0).description.edit(newDescription);
    await page.objectives.current(0).description.save();
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, newDescription);
  });

  test('empty objective title can not be saved', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    this.server.create('objective');

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [1]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.notOk(page.objectives.current(0).description.hasValidationError);
    await page.objectives.current(0).description.openEditor();
    await page.objectives.current(0).description.edit('<p>&nbsp</p><div></div><span>  </span>');
    await page.objectives.current(0).description.save();
    assert.ok(page.objectives.current(0).description.hasValidationError);
    assert.equal(page.objectives.current(0).description.validationError, 'This field can not be blank');
  });
});
