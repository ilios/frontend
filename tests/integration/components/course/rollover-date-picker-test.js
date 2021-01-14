import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module(
  'Integration | Component | course/rollover-date-picker',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const course = this.server.create('course');
      const courseModel = await this.owner
        .lookup('service:store')
        .find('course', course.id);
      this.set('course', courseModel);
      await render(hbs`<Course::RolloverDatePicker @course={{this.course}} />`);
      assert
        .dom('input')
        .hasValue(new Date(course.startDate).toLocaleDateString());
    });
  }
);
