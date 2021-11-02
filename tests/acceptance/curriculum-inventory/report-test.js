import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-report';

module('Acceptance | curriculum inventory report', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('create new sequence block Issue #2108', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const report = this.server.create('curriculumInventoryReport', { program });
    this.server.create('curriculumInventorySequence', { report });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculumInventoryReport', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.notOk(page.blocks.newBlock.form.isVisible);
    await page.blocks.header.expandCollapse.toggle();
    assert.ok(page.blocks.newBlock.form.isVisible);
  });

  test('rollover button hidden from unprivileged users', async function (assert) {
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculumInventoryReport', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.notOk(page.details.overview.rolloverLink.isVisible);
  });

  test('rollover button visible to privileged users', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculumInventoryReport', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculumInventoryReport', report.id);
    await page.visit({ reportId: reportModel.id });
    await page.visit({ reportId: reportModel.id });
    assert.equal(currentRouteName(), 'curriculumInventoryReport.index');
    assert.ok(page.details.overview.rolloverLink.isVisible);
  });
});
