import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/dashboard/navigation';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import Navigation from 'ilios-common/components/dashboard/navigation';
import Service from '@ember/service';

module('Integration | Component | dashboard/navigation', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user = this.server.create('user', {
      id: 13,
      icsFeedKey: 'testkey',
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);
  });

  test('it renders and is accessible', async function (assert) {
    await render(<template><Navigation /></template>);
    assert.strictEqual(component.calendar.text, 'Calendar');
    assert.strictEqual(component.calendar.linkTarget, '/dashboard/calendar');
    assert.strictEqual(component.materials.text, 'Materials');
    assert.strictEqual(component.materials.linkTarget, '/dashboard/materials');
    assert.strictEqual(component.week.text, 'Week at a Glance');
    assert.strictEqual(component.week.linkTarget, '/dashboard/week');
    assert.strictEqual(component.icsFeed.copy.ariaLabel, 'Copy My ICS Link');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
