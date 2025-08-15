import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/curriculum-inventory-report';

module('Acceptance | curriculum inventory report', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
  });

  test('create new sequence block Issue #2108', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const report = this.server.create('curriculum-inventory-report', { program });
    this.server.create('curriculumInventorySequence', { report });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(currentRouteName(), 'curriculum-inventory-report.index');
    assert.notOk(page.blocks.newBlock.form.isVisible);
    await page.blocks.header.expandCollapse.toggle();
    assert.ok(page.blocks.newBlock.form.isVisible);
  });

  test('rollover button hidden from unprivileged users', async function (assert) {
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(currentRouteName(), 'curriculum-inventory-report.index');
    assert.notOk(page.details.overview.rolloverLink.isVisible);
  });

  test('rollover button visible to privileged users', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(currentRouteName(), 'curriculum-inventory-report.index');
    assert.ok(page.details.overview.rolloverLink.isVisible);
  });

  test('finalizing report locks things down', async function (assert) {
    this.user.update({ directedSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school,
      title: 'Doctor of Medicine',
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: 2013,
      name: 'foo bar',
      description: 'lorem ipsum',
      program,
    });
    this.server.create('curriculum-inventory-sequence-block', {
      report,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    await page.visit({ reportId: reportModel.id });
    assert.ok(page.details.overview.rolloverLink.isVisible);
    assert.strictEqual(page.blocks.list.items.length, 1);
    assert.ok(page.blocks.list.items[0].isDeletable);
    assert.ok(page.blocks.header.expandCollapse.isVisible);
    assert.notOk(page.details.header.finalizeButtonIsDisabled);
    assert.ok(page.details.overview.startDate.isEditable);
    assert.ok(page.details.overview.endDate.isEditable);
    assert.ok(page.details.overview.academicYear.isEditable);
    assert.ok(page.details.overview.description.isEditable);
    await page.details.header.finalize();
    await page.details.finalizeConfirmation.confirm();
    assert.notOk(page.blocks.header.expandCollapse.isVisible);
    assert.ok(page.details.header.finalizeButtonIsDisabled);
    assert.notOk(page.blocks.list.items[0].isDeletable);
    assert.notOk(page.details.overview.startDate.isEditable);
    assert.notOk(page.details.overview.endDate.isEditable);
    assert.notOk(page.details.overview.academicYear.isEditable);
    assert.notOk(page.details.overview.description.isEditable);
  });
});
