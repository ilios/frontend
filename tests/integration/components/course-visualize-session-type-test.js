import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-session-type';

module('Integration | Component | course-visualize-session-type', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const session = this.server.create('session', { course });
    const sessionType = this.server.create('sessionType', { school, sessions: [session] });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('model', { course: courseModel, sessionType: sessionTypeModel });

    await render(hbs`<CourseVisualizeSessionType @model={{this.model}} />`);
    assert.equal(component.title, 'course 0 2021');
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
    const session = this.server.create('session', { course });
    const sessionType = this.server.create('sessionType', { school, sessions: [session] });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('model', { course: courseModel, sessionType: sessionTypeModel });

    await render(hbs`<CourseVisualizeSessionType @model={{this.model}} />`);

    assert.equal(component.title, 'course 0 2021 - 2022');
  });
});
