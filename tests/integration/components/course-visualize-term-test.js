import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-term';

module('Integration | Component | course-visualize-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const course = this.server.create('course', { year: 2021, school, terms: [term] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);
    this.set('model', { course: courseModel, term: termModel });

    await render(hbs`<CourseVisualizeTerm @model={{this.model}} />`);

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
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const course = this.server.create('course', { year: 2021, school, terms: [term] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);
    this.set('model', { course: courseModel, term: termModel });

    await render(hbs`<CourseVisualizeTerm @model={{this.model}} />`);

    assert.equal(component.title, 'course 0 2021 - 2022');
  });
});
