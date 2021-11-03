import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-sequence-block';

module('Acceptance | curriculum inventory nested sequence blocks', function (hooks) {
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

    this.block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report: this.report,
      duration: 12,
      childSequenceOrder: 2,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: this.academicLevels[0],
    });
  });

  test('delete sub-sequence block', async function (assert) {
    this.server.create('curriculum-inventory-sequence-block', {
      parent: this.block,
      title: 'alpha',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      academicLevel: this.academicLevels[0],
    });
    this.server.create('curriculum-inventory-sequence-block', {
      parent: this.block,
      title: 'beta',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      academicLevel: this.academicLevels[0],
    });

    await page.visit({ blockId: 1 });

    assert.strictEqual(page.blocks.list.items.length, 2);
    await page.blocks.list.items[0].remove();
    await page.blocks.list.items[0].confirmRemoval.confirm();
    assert.strictEqual(page.blocks.list.items.length, 1);
  });
});
