import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-report';
import moment from 'moment';

module('Acceptance | Curriculum Inventory Report - Sequence Blocks', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({school: this.school, administeredSchools: [this.school]});
    const program = this.server.create('program', {school: this.school});
    this.academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    this.report = this.server.create('curriculum-inventory-report', {
      academicLevels: this.academicLevels,
      program,
      year: '2016',
      isFinalized: false
    });
    this.sequence = this.server.create('curriculum-inventory-sequence', {
      report: this.report,
    });
  });

  test('delete sequence block', async function(assert) {
    assert.expect(2);

    this.server.createList('curriculum-inventory-sequence-block', 2, {
      description: 'lorem ipsum',
      report: this.report,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: this.academicLevels[0]
    });

    await page.visit({ reportId: 1 });

    assert.equal(page.blocks.list.length, 2);
    await page.blocks.list[0].remove();
    await page.blocks.list[1].confirmRemoval();
    assert.equal(page.blocks.list.length, 1);
  });
});
