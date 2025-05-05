import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/reports/switcher';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Switcher from 'frontend/components/reports/switcher';

module('Integration | Component | reports/switcher', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(<template><Switcher /></template>);
    assert.strictEqual(component.text, 'Subject Reports Curriculum Reports');
    assert.strictEqual(component.subject.text, 'Subject Reports');
    assert.strictEqual(component.curriculum.text, 'Curriculum Reports');
    assert.notOk(component.subject.isActive);
    assert.notOk(component.curriculum.isActive);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
