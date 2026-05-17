import { module, test } from 'qunit';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/curriculum-inventory-report';

module('Acceptance | curriculum inventory sequence blocks', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const program = await this.server.create('program', { school: this.school });
    this.academicLevels = await this.server.createList('curriculum-inventory-academic-level', 10);
    this.report = await this.server.create('curriculum-inventory-report', {
      academicLevels: this.academicLevels,
      program,
      year: 2016,
      isFinalized: false,
    });
    this.sequence = await this.server.create('curriculum-inventory-sequence', {
      report: this.report,
    });
  });

  test('delete sequence block', async function (assert) {
    await this.server.create('curriculum-inventory-sequence-block', {
      title: 'alpha',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    await this.server.create('curriculum-inventory-sequence-block', {
      title: 'beta',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(page.blocks.list.items.length, 2);
    await page.blocks.list.items[0].remove();
    await page.blocks.list.items[0].confirmRemoval.confirm();
    assert.strictEqual(page.blocks.list.items.length, 1);
  });

  test('block title is correctly linked to block details page', async function (assert) {
    const block = await this.server.create('curriculum-inventory-sequence-block', {
      title: 'alpha',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    await page.visit({ reportId: this.report.id });
    assert.strictEqual(
      page.blocks.list.items[0].titleLink,
      `/curriculum-inventory-sequence-block/${block.id}`,
    );
  });
});
