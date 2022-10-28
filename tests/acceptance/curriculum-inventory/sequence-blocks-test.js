import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-report';

module('Acceptance | curriculum inventory sequence blocks', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const program = this.server.create('program', { school: this.school });
    this.academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    this.report = this.server.create('curriculum-inventory-report', {
      academicLevels: this.academicLevels,
      program,
      year: '2016',
      isFinalized: false,
    });
    this.sequence = this.server.create('curriculum-inventory-sequence', {
      report: this.report,
    });
  });

  test('delete sequence block', async function (assert) {
    this.server.create('curriculum-inventory-sequence-block', {
      title: 'alpha',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    this.server.create('curriculum-inventory-sequence-block', {
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
      .findRecord('curriculumInventoryReport', this.report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(page.blocks.list.items.length, 2);
    await page.blocks.list.items[0].remove();
    await page.blocks.list.items[0].confirmRemoval.confirm();
    assert.strictEqual(page.blocks.list.items.length, 1);
  });

  test('block title is correctly linked to block details page', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
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
      `/curriculum-inventory-sequence-block/${block.id}`
    );
  });
});
