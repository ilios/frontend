import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | course/rollover-date-picker', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<Course::RolloverDatePicker @course={{this.course}} @onChange={{(noop)}} />`);
    assert.dom('input').hasValue(new Date(course.startDate).toLocaleDateString());
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('onChange callback is invoked', async function (assert) {
    assert.expect(1);
    const date = new Date(2020, 4, 6);
    const newDate = new Date(2020, 4, 13);
    const course = this.server.create('course', {
      startDate: date,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('change', (changedDate) => {
      assert.equal(newDate.getTime(), changedDate.getTime());
    });
    await render(
      hbs`<Course::RolloverDatePicker @course={{this.course}} @onChange={{this.change}} />`
    );
    const element = find('input');
    element._flatpickr.setDate(newDate, true);
  });
});
