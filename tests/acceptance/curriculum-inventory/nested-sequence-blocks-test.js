import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
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
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
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
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    this.server.create('curriculum-inventory-sequence-block', {
      parent: this.block,
      title: 'beta',
      description: 'lorem ipsum',
      report: this.report,
      childSequenceOrder: 1,
      orderInSequence: 0,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });

    await page.visit({ blockId: 1 });

    assert.strictEqual(page.blocks.list.items.length, 2);
    await page.blocks.list.items[0].remove();
    await page.blocks.list.items[0].confirmRemoval.confirm();
    assert.strictEqual(page.blocks.list.items.length, 1);
  });

  test('change start and end level #6551', async function (assert) {
    this.server.create('curriculum-inventory-sequence-block', {
      parent: this.block,
      report: this.report,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const { startLevel, endLevel } = page.details.overview;

    await page.visit({ blockId: 1 });
    assert.strictEqual(startLevel.level, 'Year 0');
    assert.strictEqual(endLevel.level, 'Year 1');
    await endLevel.edit();
    await endLevel.select('4');
    await endLevel.save();
    await startLevel.edit();
    await startLevel.select('2');
    await startLevel.save();

    assert.strictEqual(startLevel.level, 'Year 1');
    assert.strictEqual(endLevel.level, 'Year 3');
  });

  test('cancel start and end level changes #6551', async function (assert) {
    this.server.create('curriculum-inventory-sequence-block', {
      parent: this.block,
      report: this.report,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    const { startLevel, endLevel } = page.details.overview;

    await page.visit({ blockId: 1 });
    assert.strictEqual(startLevel.level, 'Year 0');
    assert.strictEqual(endLevel.level, 'Year 1');
    await endLevel.edit();
    await endLevel.select('4');
    await endLevel.cancel();
    await startLevel.edit();
    await startLevel.select('2');
    await startLevel.cancel();

    assert.strictEqual(startLevel.level, 'Year 0');
    assert.strictEqual(endLevel.level, 'Year 1');
  });
});
