import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-vocabulary';

// @todo flesh this out [ST 2021/02/24]
module('Integration | Component | course-visualize-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const course = this.server.create('course', { year: 2021, school, terms: [term] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    this.set('model', { course: courseModel, vocabulary: vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);

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
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    this.set('model', { course: courseModel, vocabulary: vocabularyModel });

    await render(hbs`<CourseVisualizeVocabulary @model={{this.model}} />`);

    assert.equal(component.title, 'course 0 2021 - 2022');
  });
});
