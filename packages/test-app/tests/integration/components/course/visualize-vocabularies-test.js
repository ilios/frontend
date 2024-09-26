import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/course/visualize-vocabularies';

module('Integration | Component | course/visualize-vocabularies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders', async function (assert) {
    this.set('course', this.courseModel);

    await render(hbs`<Course::VisualizeVocabularies @model={{this.course}} />`);
    assert.strictEqual(component.courseTitle.text, 'course 0 2021');
    assert.strictEqual(component.courseTitle.link, '/courses/1');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('course', this.courseModel);

    await render(hbs`<Course::VisualizeVocabularies @model={{this.course}} />`);
    assert.strictEqual(component.courseTitle.text, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    this.set('course', this.courseModel);

    await render(hbs`<Course::VisualizeVocabularies @model={{this.course}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 3);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Vocabularies');
  });
});
