import { currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/dashboard';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Acceptance | Dashboard Week at a Glance', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const today = moment().hour(8);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('shows events', async function (assert) {
    const startOfWeek = today.clone().startOf('week');
    const endOfWeek = today.clone().endOf('week').hour(22).minute(59);
    this.server.create('userevent', {
      user: Number(this.user.id),
      name: 'start of week',
      startDate: startOfWeek.format(),
      endDate: startOfWeek.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
      isPublished: true,
      offering: 1,
    });

    this.server.create('userevent', {
      user: Number(this.user.id),
      name: 'end of week',
      startDate: endOfWeek.format(),
      endDate: endOfWeek.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
      isPublished: true,
      offering: 2,
    });
    await page.visit({ show: 'week' });
    assert.strictEqual(currentRouteName(), 'dashboard');

    assert.strictEqual(page.weekGlance.offeringEvents.length, 2);
    assert.strictEqual(page.weekGlance.offeringEvents[0].title, 'start of week');
    assert.strictEqual(page.weekGlance.offeringEvents[1].title, 'end of week');
  });

  test('shows all pre work', async function (assert) {
    const prerequisites = [1, 2, 3].map((id) => {
      return {
        user: Number(this.user.id),
        name: `pre ${id}`,
        isPublished: true,
        ilmSession: id,
        session: id,
        prerequisites: [],
        postrequisites: [],
      };
    });
    this.server.create('userevent', {
      user: Number(this.user.id),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
      isPublished: true,
      offering: 1,
      prerequisites,
    });
    await page.visit({ show: 'week' });
    assert.strictEqual(currentRouteName(), 'dashboard');

    assert.strictEqual(page.weekGlance.offeringEvents.length, 1);
    assert.strictEqual(page.weekGlance.preWork.length, 3);
    assert.strictEqual(page.weekGlance.preWork[0].title, 'pre 1');
    assert.strictEqual(page.weekGlance.preWork[1].title, 'pre 2');
    assert.strictEqual(page.weekGlance.preWork[2].title, 'pre 3');

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });
});
