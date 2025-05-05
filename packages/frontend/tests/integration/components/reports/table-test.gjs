import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { setupAuthentication } from 'ilios-common';
import { component } from 'frontend/tests/pages/components/reports/table';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Table from 'frontend/components/reports/table';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/table', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('it renders', async function (assert) {
    this.server.create('report', {
      title: null,
      subject: 'course',
      user: this.user,
    });
    this.server.create('report', {
      title: null,
      subject: 'session',
      user: this.user,
    });

    const reportModels = await this.owner.lookup('service:store').findAll('report');

    this.set(
      'decoratedReports',
      reportModels.map((report) => {
        return {
          report,
          title: `${report.id} report`,
          type: 'subject',
        };
      }),
    );
    await render(
      <template>
        <Table
          @decoratedReports={{this.decoratedReports}}
          @query={{null}}
          @sortBy="title"
          @setSortBy={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.reports.length, 2);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
