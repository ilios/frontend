import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/curriculum-inventory-reports';

const url = '/curriculum-inventory-reports/?program=1&school=1';

module('Acceptance | curriculum inventory reports', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    this.program = await this.server.create('program', { school });
    this.user = await setupAuthentication({ school, directedSchools: [school] }, true);
  });

  test('report title is correctly linked to report details page', async function (assert) {
    await this.server.create('curriculum-inventory-report', {
      program: this.program,
    });
    await visit(url);
    assert.strictEqual(page.reports.reports.reports[0].nameLink, '/curriculum-inventory-reports/1');
  });
});
