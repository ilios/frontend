import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/dashboard/material-list-item';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | dashboard/material-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders a material with no a11y errors', async function (assert) {
    const today = DateTime.local({ hour: 8 });
    const lm = {
      title: 'title1',
      absoluteFileUri: 'http://myhost.com/url1',
      sessionTitle: 'session1title',
      course: 1,
      type: 'file',
      mimetype: 'application/pdf',
      courseTitle: 'course title',
      courseYear: '2022',
      courseExternalId: 'c1-thefirst',
      instructors: ['Instructor1name', 'Instructor2name'],
      firstOfferingDate: today.toJSDate(),
    };

    this.set('lm', lm);
    await render(hbs`<Dashboard::MaterialListItem @lm={{this.lm}} />
`);

    assert.strictEqual(component.sessionTitle, 'session1title');
    assert.strictEqual(component.courseTitle, 'course title');
    assert.strictEqual(component.title, 'File title1 Download');
    assert.ok(component.isPdf);
    assert.ok(component.pdfDownloadLink.isVisible);
    assert.strictEqual(component.pdfDownloadLink.url, 'http://myhost.com/url1');
    assert.ok(component.pdfLink.isVisible);
    assert.strictEqual(component.pdfLink.url, 'http://myhost.com/url1?inline');
    assert.strictEqual(component.instructors, 'Instructor1name, Instructor2name');
    assert.strictEqual(
      component.firstOfferingDate,
      this.intl.formatDate(today.toJSDate(), {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      })
    );

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });
});
