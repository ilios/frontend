import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-session-type';

module('Integration | Component | course-visualize-session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const session = this.server.create('session', { course });
    const sessionType = this.server.create('sessionType', { school, sessions: [session] });
    this.sessionTypeModel = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });

    await render(hbs`<CourseVisualizeSessionType @model={{this.model}} />`);

    assert.strictEqual(component.title, 'course 0 2021');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });

    await render(hbs`<CourseVisualizeSessionType @model={{this.model}} />`);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    this.set('model', { course: this.courseModel, sessionType: this.sessionTypeModel });

    await render(hbs`<CourseVisualizeSessionType @model={{this.model}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 4);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Session Types');
    assert.strictEqual(component.breadcrumb.crumbs[2].link, '/data/courses/1/session-types');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, 'session type 0');
  });
});
