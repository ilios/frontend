import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
// import { getUniqueName } from '../../helpers/percy-snapshot-name';
// import { pauseTest } from '@ember/test-helpers';
import page from 'ilios-common/page-objects/course';
// import percySnapshot from '@percy/ember';

module('Acceptance | Course - Objective Parents - Faded Status Sync', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    this.school = this.server.create('school');
    this.longObjDescription =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    this.longParentObjTitle =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    this.fadedClass = 'faded';
    this.fadedSelector = '.faded';
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competency1 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency2 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency3 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const parent1 = this.server.create('program-year-objective', {
      programYear,
      competency: competency1,
    });
    const parent2 = this.server.create('program-year-objective', {
      programYear,
      competency: competency2,
      title: this.longParentObjTitle,
    });
    const parent3 = this.server.create('program-year-objective', {
      programYear,
      competency: competency3,
      title: this.longParentObjTitle,
    });
    this.course = this.server.create('course', {
      year: 2024,
      school: this.school,
      cohorts: [cohort],
    });
    this.server.create('course-objective', {
      course: this.course,
      programYearObjectives: [parent1],
      title: this.longObjDescription,
    });
    this.server.create('course-objective', {
      course: this.course,
      programYearObjectives: [parent2],
    });
    this.server.create('course-objective', {
      course: this.course,
      programYearObjectives: [parent3],
      title: this.longObjDescription,
    });
  });

  test('objective description and parent objectives faded statuses are synced', async function (assert) {
    // assert.expect(18);
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });

    // await pauseTest();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives.length,
      3,
      'course objective count is 3',
    );

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      this.longObjDescription,
      'first course objective title is long',
    );
    assert.dom('#objective-1 .display-text-wrapper', this.element).hasClass(this.fadedClass);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list.length,
      1,
      'first course objective has one parent objective',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0',
      "first course objective's parent objective's title is short",
    );
    assert
      .dom('#objective-1 .display-text-wrapper', this.element)
      .doesNotHaveClass(this.fadedClass);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      'course objective 1',
      'second course objective title is short',
    );
    assert
      .dom('#objective-2 .display-text-wrapper', this.element)
      .doesNotHaveClass(this.fadedClass);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].parents.list.length,
      1,
      'second course objective has one parent objective',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].parents.list[0].text,
      this.longParentObjTitle,
      "second course objective's parent objective's title is long",
    );
    assert.dom('#objective-2 .display-text-wrapper', this.element).hasClass(this.fadedClass);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[2].description.text,
      this.longObjDescription,
      'third course objective title is long',
    );
    assert.dom('#objective-3 .display-text-wrapper', this.element).hasClass(this.fadedClass);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[2].parents.list.length,
      1,
      'third course objective has one parent objective',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[2].parents.list[0].text,
      this.longParentObjTitle,
      "third course objective's parent objective's title is long",
    );
    assert.dom('#objective-3 .display-text-wrapper', this.element).hasClass(this.fadedClass);
  });
});
