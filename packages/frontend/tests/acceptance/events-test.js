import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { currentURL } from '@ember/test-helpers';
import page from 'ilios-common/page-objects/events';
import { DateTime } from 'luxon';

module('Acceptance | Event', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('back link is not visible', async function (assert) {
    const date = DateTime.fromISO('2023-04-23');
    const slug = 'U' + date.toFormat('yyyyMMdd') + 'O12345';
    this.server.get(`api/userevents/:userid`, () => {
      assert.step('API called');
      return {
        userEvents: [
          {
            offering: 12345,
            startDate: '2023-04-23',
            prerequisites: [],
            postrequisites: [],
          },
        ],
      };
    });
    await page.visit({ slug });
    assert.strictEqual(currentURL(), `/events/${slug}`);
    assert.notOk(page.backLink.isPresent);
    assert.verifySteps(['API called']);
  });

  test('it redirects to event-not-found page if no user event can be found', async function (assert) {
    const date = DateTime.fromISO('2016-05-25');
    const slug = 'U' + date.toFormat('yyyyMMdd') + 'O12345';
    const fromDate = date.set({ hour: 0 });
    const toDate = date.set({ hour: 24 });
    this.server.get(`/api/userevents/:userid`, (scheme, { params, queryParams }) => {
      assert.step('API called');
      assert.strictEqual(params.userid, this.user.id);
      assert.strictEqual(fromDate.toFormat('X'), queryParams.from);
      assert.strictEqual(toDate.toFormat('X'), queryParams.to);
      return { userEvents: [] };
    });
    await page.visit({ slug });
    assert.strictEqual(currentURL(), `/event-not-found/${slug}`);
    assert.verifySteps(['API called']);
  });
});
