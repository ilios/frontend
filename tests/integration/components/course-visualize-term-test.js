import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-term';

module('Integration | Component | course-visualize-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const course = this.server.create('course', { year: 2021, school, terms: [term] });
    this.courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.termModel = await this.owner.lookup('service:store').find('term', term.id);
  });

  test('it renders', async function (assert) {
    this.set('model', { course: this.courseModel, term: this.termModel });

    await render(hbs`<CourseVisualizeTerm @model={{this.model}} />`);

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
    this.set('model', { course: this.courseModel, term: this.termModel });

    await render(hbs`<CourseVisualizeTerm @model={{this.model}} />`);

    assert.strictEqual(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    this.set('model', { course: this.courseModel, term: this.termModel });

    await render(hbs`<CourseVisualizeTerm @model={{this.model}} />`);

    assert.strictEqual(component.breadcrumb.crumbs.length, 5);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.strictEqual(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'Visualizations');
    assert.strictEqual(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.strictEqual(component.breadcrumb.crumbs[2].text, 'Vocabularies');
    assert.strictEqual(component.breadcrumb.crumbs[2].link, '/data/courses/1/vocabularies');
    assert.strictEqual(component.breadcrumb.crumbs[3].text, 'Vocabulary 1');
    assert.strictEqual(component.breadcrumb.crumbs[3].link, '/data/courses/1/vocabularies/1');
    assert.strictEqual(component.breadcrumb.crumbs[4].text, 'term 0');
  });
});
