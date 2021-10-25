import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

// @todo use a page object here [ST 2020/08/10]
module('Integration | Component | curriculum-inventory/sequence-block-details', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(7);

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

    assert
      .dom('.curriculum-inventory-sequence-block-header .title')
      .hasText(blockModel.get('title'), 'Block header is visible.');
    assert
      .dom('.curriculum-inventory-sequence-block-overview .description .editinplace')
      .hasText(blockModel.get('description'), 'Block overview is visible.');
    assert
      .dom('.breadcrumbs span')
      .exists({ count: 4 }, 'Breadcrumb has the right number of elements');
    assert.dom('.breadcrumbs span').hasText('Curriculum Inventory Report');
    assert.dom(findAll('.breadcrumbs span')[1]).hasText(grandParentBlockModel.get('title'));
    assert.dom(findAll('.breadcrumbs span')[2]).hasText(parentBlockModel.get('title'));
    assert.dom(findAll('.breadcrumbs span')[3]).hasText(blockModel.get('title'));
  });
});
