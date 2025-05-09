import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/subject-copy-new';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import SubjectCopyNew from 'frontend/components/reports/subject-copy-new';

module('Integration | Component | reports/subject-copy-new', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.user = await setupAuthentication();
    //override default handler to just return all courses
    this.server.get('api/courses', (schema) => {
      return schema.courses.all();
    });
  });

  test('it renders', async function (assert) {
    const report = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'instructor',
      prepositionalObjectTableRowId: this.user.id,
      user: this.user,
    });
    const reportModel = await this.owner.lookup('service:store').findRecord('report', report.id);
    this.set('report', reportModel);
    await render(
      <template>
        <SubjectCopyNew
          @report={{this.report}}
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.report.school}}
        />
      </template>,
    );

    assert.strictEqual(component.button.label, this.intl.t('general.edit'));
    assert.strictEqual(
      component.button.link,
      '/reports/subjects?selectedPrepositionalObject=instructor&selectedPrepositionalObjectId=100&selectedSubject=course&showNewReportForm=true',
    );
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
