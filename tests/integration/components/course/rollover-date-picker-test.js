import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { DateTime } from 'luxon';

module('Integration | Component | course/rollover-date-picker', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::RolloverDatePicker @course={{this.course}} @onChange={{(noop)}} />`);
    assert.dom('input').hasValue(this.intl.formatDate(course.startDate));
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('onChange callback is invoked', async function (assert) {
    assert.expect(1);
    const date = DateTime.fromObject({ year: 2020, month: 5, day: 6, hour: 8 });
    const newDate = date.plus({ days: 7 });
    const course = this.server.create('course', {
      startDate: date.toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    this.set('change', (changedDate) => {
      assert.strictEqual(newDate.toMillis(), changedDate.getTime());
    });
    await render(
      hbs`<Course::RolloverDatePicker @course={{this.course}} @onChange={{this.change}} />`
    );
    const element = find('input');
    element._flatpickr.setDate(newDate.toJSDate(), true);
  });
});
