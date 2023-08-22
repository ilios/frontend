import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import { currentURL } from '@ember/test-helpers';
import page from 'ilios-common/page-objects/events';
import { DateTime } from 'luxon';

module('Acceptance | Event', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('back link is visible', async function (assert) {
    const date = DateTime.fromISO('2023-04-23');
    const slug = 'U' + date.toFormat('yyyyMMdd') + 'O12345';
    this.server.get(`/api/userevents/:userid`, () => {
      return {
        userEvents: [
          {
            offering: 1,
            startDate: '2023-04-23',
            prerequisites: [],
            postrequisites: [],
          },
        ],
      };
    });
    await page.visit({ slug });
    assert.strictEqual(currentURL(), `/events/${slug}`);
    assert.ok(page.backLink.isPresent);
  });
});
