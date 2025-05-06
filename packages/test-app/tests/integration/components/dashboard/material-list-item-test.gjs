import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/dashboard/material-list-item';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import MaterialListItem from 'ilios-common/components/dashboard/material-list-item';

module('Integration | Component | dashboard/material-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  test('it renders a material with no a11y errors', async function (assert) {
    const today = DateTime.local({ hour: 8 });
    const lm = {
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      course: 1,
      mimetype: 'application/pdf',
      courseTitle: 'course title',
      courseYear: '2022',
      courseExternalId: 'c1-thefirst',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: today.toJSDate(),
    };

    this.set('lm', lm);
    await render(<template><MaterialListItem @lm={{this.lm}} /></template>);

    assert.strictEqual(component.sessionTitle, 'session1title');
    assert.strictEqual(component.courseTitle, 'course title');
    assert.strictEqual(component.title, 'PDF file title1 Download');
    assert.ok(component.isPdf);
    assert.ok(component.pdfDownloadLink.isVisible);
    assert.strictEqual(component.pdfDownloadLink.url, 'http://myhost.com/url1');
    assert.ok(component.pdfLink.isVisible);
    assert.strictEqual(component.pdfLink.url, 'http://myhost.com/url1?inline');
    assert.strictEqual(component.instructors, 'Instructor1name, Instructor2name');
    assert.strictEqual(
      component.firstOfferingDate,
      this.intl.formatDate(today.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
