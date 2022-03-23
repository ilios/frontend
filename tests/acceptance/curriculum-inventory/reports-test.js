import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-reports';

const url = '/curriculum-inventory-reports/?program=1&school=1';

module('Acceptance | curriculum inventory reports', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.program = this.server.create('program', { school: this.school });
    this.user = await setupAuthentication({ school: this.school });
    this.user.update({ directedSchools: [this.school] });
  });

  test('report title is correctly linked to report details page', async function (assert) {
    this.server.create('curriculumInventoryReport', {
      program: this.program,
    });
    await visit(url);
    assert.strictEqual(page.reports.reports.reports[0].nameLink, '/curriculum-inventory-reports/1');
  });
});
