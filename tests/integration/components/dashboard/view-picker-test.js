import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/dashboard/view-picker';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | dashboard/view-picker', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<Dashboard::ViewPicker />`);
    assert.strictEqual(component.calendar.text, 'Calendar');
    assert.strictEqual(component.calendar.linkTarget, '/dashboard/calendar');
    assert.strictEqual(component.materials.text, 'Materials');
    assert.strictEqual(component.materials.linkTarget, '/dashboard/materials');
    assert.strictEqual(component.week.text, 'Week at a Glance');
    assert.strictEqual(component.week.linkTarget, '/dashboard/week');
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });
});
