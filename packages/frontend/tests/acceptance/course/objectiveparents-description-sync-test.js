import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { getUniqueName } from '../../helpers/percy-snapshot-name';
import { waitFor } from '@ember/test-helpers';
import page from 'ilios-common/page-objects/course';
import percySnapshot from '@percy/ember';

module('Acceptance | Course - Objective Parents - Faded Status Sync', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.longObjDescription =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    this.longParentObjTitle =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    this.fadedSelector = '.faded';

    this.user = await setupAuthentication({}, true);
    this.school = this.server.create('school');
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
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });

    // slight delay to allow for proper loading of component
    await waitFor(this.fadedSelector);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives.length,
      3,
      'course objective count is 3',
    );

    /*
      1st option: col1 long/col2 short
    */

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      this.longObjDescription,
      '1st objective title is long',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.enabled,
      '1st objective is fade-enabled',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.isFaded,
      '1st objective long title is faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.control.expand,
      '1st objective long title has expand button',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list.length,
      1,
      '1st objective has one parent objective',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0',
      '1st parent objective title is short',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].parents.fadeText.enabled,
      '1st parent objective is not fade-enabled',
    );

    await percySnapshot(getUniqueName(assert, '1st objective list item collapsed'));
    await takeScreenshot(assert, '1st objective list item collapsed');
    await page.details.objectives.objectiveList.objectives[0].description.fadeText.control.expand.click();
    await percySnapshot(getUniqueName(assert, '1st objective list item expanded'));
    await takeScreenshot(assert, '1st objective list item expanded');

    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.isFaded,
      '1st objective long title is no longer faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.control.collapse,
      '1st objective long title now has collapse button',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].parents.fadeText.enabled,
      '1st parent objective is still not fade-enabled',
    );

    await page.details.objectives.objectiveList.objectives[0].description.fadeText.control.collapse.click();
    await percySnapshot(getUniqueName(assert, '1st objective list item collapsed again'));
    await takeScreenshot(assert, '1st objective list item collapsed again');

    assert.ok(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.isFaded,
      '1st objective long title is faded again',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.control.expand,
      '1st objective long title now has expand button',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[0].parents.fadeText.enabled,
      '1st parent objective is still not fade-enabled',
    );

    /*
      2nd option: col1 short/col2 long
    */

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      'course objective 1',
      '2nd objective title is short',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[1].description.fadeText.enabled,
      '2nd objective is not fade-enabled',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].parents.list.length,
      1,
      '2nd objective has one parent objective',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].parents.list[0].text,
      this.longParentObjTitle,
      '2nd parent objective title is long',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.enabled,
      '2nd parent objective title is fade-enabled',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.displayText.isFaded,
      '2nd parent objective long title is faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.control.expand,
      '2nd parent objective long title has expand button',
    );

    await percySnapshot(getUniqueName(assert, '2nd objective list item collapsed'));
    await takeScreenshot(assert, '2nd objective list item collapsed');
    await page.details.objectives.objectiveList.objectives[1].parents.fadeText.control.expand.click();
    await percySnapshot(getUniqueName(assert, '2nd objective list item expanded'));
    await takeScreenshot(assert, '2nd objective list item expanded');

    assert.notOk(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.displayText.isFaded,
      '2nd parent objective long title is no longer faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.control.collapse,
      '2nd parent objective long title now has collapse button',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[1].description.fadeText.enabled,
      '2nd objective is still not fade-enabled',
    );

    await page.details.objectives.objectiveList.objectives[1].parents.fadeText.control.collapse.click();
    await percySnapshot(getUniqueName(assert, '2nd objective list item collapsed again'));
    await takeScreenshot(assert, '2nd objective list item collapsed again');

    assert.ok(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.displayText.isFaded,
      '2nd parent objective long title is faded again',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[1].parents.fadeText.control.expand,
      '2nd objective long title now has expand button',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[1].description.fadeText.enabled,
      '2nd parent objective is still not fade-enabled',
    );

    /*
      3rd option: col1 long/col2 long
    */

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[2].description.text,
      this.longObjDescription,
      '3rd objective title is long',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.enabled,
      '3rd objective is fade-enabled',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.displayText.isFaded,
      '3rd objective long title is faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.control.expand,
      '3rd objective long title has expand button',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[2].parents.list.length,
      1,
      '3rd objective has one parent objective',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[2].parents.list[0].text,
      this.longParentObjTitle,
      '3rd parent objective title is long',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.enabled,
      '3rd parent objective title is fade-enabled',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.displayText.isFaded,
      '3rd parent objective long title is faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.expand,
      '3rd parent objective long title has expand button',
    );

    await percySnapshot(getUniqueName(assert, '3rd objective list item collapsed'));
    await takeScreenshot(assert, '3rd objective list item collapsed');
    await page.details.objectives.objectiveList.objectives[2].description.fadeText.control.expand.click();
    await percySnapshot(getUniqueName(assert, '3rd objective list item expanded'));
    await takeScreenshot(assert, '3rd objective list item expanded');

    assert.notOk(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.displayText.isFaded,
      '3rd objective long title is no longer faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.control.collapse,
      '3rd objective long title now has collapse button',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.displayText.isFaded,
      '3rd parent objective long title is no longer faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.collapse,
      '3rd parent objective long title now has collapse button',
    );

    await page.details.objectives.objectiveList.objectives[2].description.fadeText.control.collapse.click();
    await percySnapshot(getUniqueName(assert, '3rd objective list item collapsed again'));
    await takeScreenshot(assert, '3rd objective list item collapsed again');

    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.displayText.isFaded,
      '3rd objective long title is faded again',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.control.expand,
      '3rd objective long title now has expand button',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.displayText.isFaded,
      '3rd parent objective long title is faded again',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.expand,
      '3rd parent objective long title now has expand button',
    );

    await page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.expand.click();
    await percySnapshot(getUniqueName(assert, '3rd objective list item expanded again'));
    await takeScreenshot(assert, '3rd objective list item expanded again');

    assert.notOk(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.displayText.isFaded,
      '3rd objective long title is no longer faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.control.collapse,
      '3rd objective long title now has collapse button',
    );
    assert.notOk(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.displayText.isFaded,
      '3rd parent objective long title is no longer faded',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.collapse,
      '3rd parent objective long title now has collapse button',
    );

    await page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.collapse.click();
    await percySnapshot(getUniqueName(assert, '3rd objective list item collapsed again'));
    await takeScreenshot(assert, '3rd objective list item collapsed again');

    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.displayText.isFaded,
      '3rd objective long title is faded again',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].description.fadeText.control.expand,
      '3rd objective long title now has expand button',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.displayText.isFaded,
      '3rd parent objective long title is faded again',
    );
    assert.ok(
      page.details.objectives.objectiveList.objectives[2].parents.fadeText.control.expand,
      '3rd parent objective long title now has expand button',
    );
  });
});
