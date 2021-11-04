import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-details';

module('Integration | Component | curriculum-inventory/sequence-block-details', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(
        this.server.create('curriculumInventoryAcademicLevel', { name: `Year ${i + 1}` })
      );
    }
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculumInventoryReport', {
      academicLevels,
      year: '2016',
      program,
    });
    const grandParentBlock = this.server.create('curriculumInventorySequenceBlock', {
      title: 'Okely Dokely',
      report,
    });
    const parentBlock = this.server.create('curriculumInventorySequenceBlock', {
      title: 'Foo',
      parent: grandParentBlock,
    });
    const block = this.server.create('curriculumInventorySequenceBlock', {
      title: 'bar',
      description: 'lorem ipsum',
      report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: academicLevels[0],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    const blockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block.id);
    const parentBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', parentBlock.id);
    const grandParentBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', grandParentBlock.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', blockModel);
    this.set('sortBy', 'title');
    this.set('canUpdate', true);
    await render(hbs`<CurriculumInventory::SequenceBlockDetails
      @report={{this.report}}
      @sequenceBlock={{this.sequenceBlock}}
      @canUpdate={{this.canUpdate}}
      @sortSessionsBy={{this.sortBy}}
      @setSortSessionBy={{(noop)}}
    />`);
    assert.strictEqual(component.header.title.value, blockModel.title);
    assert.strictEqual(
      component.overview.description.text,
      `Description: ${blockModel.description}`
    );
    assert.strictEqual(component.breadcrumbs.blockCrumbs.length, 3);
    assert.strictEqual(component.breadcrumbs.reportCrumb.text, 'Curriculum Inventory Report');
    assert.strictEqual(component.breadcrumbs.blockCrumbs[0].text, grandParentBlockModel.title);
    assert.strictEqual(component.breadcrumbs.blockCrumbs[1].text, parentBlockModel.title);
    assert.strictEqual(component.breadcrumbs.blockCrumbs[2].text, blockModel.title);
  });
});
