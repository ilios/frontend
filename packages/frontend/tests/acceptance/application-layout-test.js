import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';

module('Acceptance | Application layout', function (hooks) {
  setupApplicationTest(hooks);

  test.each(
    'layout with LTI-scoped authentication token',
    [['lti-dashboard'], ['lti-course-manager']],
    async function (assert, aud) {
      const school = await this.server.create('school');
      await setupAuthentication({ directedSchools: [school] }, { aud });
      await visit('/');
      assert.dom('.application-wrapper').doesNotHaveClass('show-navigation');
      assert.dom('header.ilios-header').doesNotExist();
      assert.dom('.ilios-logo').doesNotExist();
      assert.dom('[data-test-ilios-navigation]').doesNotExist();
      assert.dom('#main').exists();
      assert.dom('footer.ilios-footer').doesNotExist();
      await takeScreenshot(assert);
    },
  );

  test.each(
    'layout with non LTI-scoped authentication token',
    [null, undefined, '', 'ilios', 'lti-wienerschnitzel', 'LTI-DASHBOARD', 'Lti-course-manager'],
    async function (assert, aud) {
      const school = await this.server.create('school');
      await setupAuthentication({ directedSchools: [school] }, { aud });
      await visit('/');
      assert.dom('.application-wrapper').hasClass('show-navigation');
      assert.dom('header.ilios-header').exists();
      assert.dom('.ilios-logo').exists();
      assert.dom('[data-test-ilios-navigation]').exists();
      assert.dom('#main').exists();
      assert.dom('footer.ilios-footer').exists();
      await takeScreenshot(assert);
    },
  );
});
