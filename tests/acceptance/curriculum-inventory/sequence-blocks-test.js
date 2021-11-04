import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
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
      academicLevel: this.academicLevels[0],
    });
    this.server.create('curriculum-inventory-sequence-block', {
      title: 'beta',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      academicLevel: this.academicLevels[0],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculumInventoryReport', this.report.id);
    await page.visit({ reportId: reportModel.id });
    assert.strictEqual(page.blocks.list.items.length, 2);
    await page.blocks.list.items[0].remove();
    await page.blocks.list.items[0].confirmRemoval.confirm();
    assert.strictEqual(page.blocks.list.items.length, 1);
  });
});
