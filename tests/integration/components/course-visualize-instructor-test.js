import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-instructor';

module('Integration | Component | course-visualize-instructor', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const user = this.server.create('user');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('model', {
      user: userModel,
      course: courseModel,
      offeringMinutes: 120,
      ilmMinutes: 60,
    });
    await render(hbs`<CourseVisualizeInstructor @model={{this.model}} />`);
    assert.strictEqual(component.title, 'course 0 2021');
    assert.strictEqual(component.instructorName, '0 guy M. Mc0son');
    assert.strictEqual(component.totalOfferingsTime, 'Total Instructional Time 120 Minutes');
    assert.strictEqual(component.totalIlmTime, 'Total ILM Time 60 Minutes');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const user = this.server.create('user');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('model', {
      user: userModel,
      course: courseModel,
      offeringMinutes: 0,
      ilmMinutes: 0,
    });

    await render(hbs`<CourseVisualizeInstructor @model={{this.model}} />`);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const user = this.server.create('user');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('model', {
      user: userModel,
      course: courseModel,
      offeringMinutes: 0,
      ilmMinutes: 0,
    });

    await render(hbs`<CourseVisualizeInstructor @model={{this.model}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 4);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Instructors');
    assert.strictEqual(component.breadcrumb.crumbs[2].link, '/data/courses/1/instructors');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, '0 guy M. Mc0son');
  });
});
