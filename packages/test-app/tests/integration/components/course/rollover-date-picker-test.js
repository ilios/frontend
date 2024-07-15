import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { DateTime } from 'luxon';

module('Integration | Component | course/rollover-date-picker', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const course = this.server.create('course', {
      startDate: '2019-05-06',
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::RolloverDatePicker @course={{this.course}} @onChange={{(noop)}} />`);
    assert.dom('input').hasValue('5/6/2019');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('onChange callback is invoked', async function (assert) {
    assert.expect(3);
    const course = this.server.create('course', {
      startDate: '2020-05-06',
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    this.set('change', (changedDate) => {
      const { year, month, day } = DateTime.fromJSDate(changedDate);
      assert.strictEqual(year, 2020);
      assert.strictEqual(month, 5);
      assert.strictEqual(day, 13);
    });
    await render(
      hbs`<Course::RolloverDatePicker @course={{this.course}} @onChange={{this.change}} />`,
    );
    const element = find('input');
    element._flatpickr.setDate('2020-05-13', true);
  });
});
