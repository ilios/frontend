import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { DateTime } from 'luxon';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/sequence-block-details';
import SequenceBlockDetails from 'frontend/components/curriculum-inventory/sequence-block-details';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | curriculum-inventory/sequence-block-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.push(
        this.server.create('curriculumInventoryAcademicLevel', { name: `Year ${i + 1}` }),
      );
    }
    const program = this.server.create('program', { school });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
    });
    const grandParentBlock = this.server.create('curriculum-inventory-sequence-block', {
      title: 'Okely Dokely',
      report,
    });
    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      title: 'Foo',
      parent: grandParentBlock,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      title: 'bar',
      description: 'lorem ipsum',
      report,
      parent: parentBlock,
      duration: 12,
      startDate: DateTime.fromObject({ year: 2015, month: 1, day: 2 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2015, month: 4, day: 30 }).toJSDate(),
      childSequenceOrder: 1,
      orderInSequence: 1,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      startingAcademicLevel: academicLevels[0],
      endingAcademicLevel: academicLevels[1],
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', report.id);
    const blockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', block.id);
    const parentBlockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', parentBlock.id);
    const grandParentBlockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', grandParentBlock.id);
    this.set('report', reportModel);
    this.set('sequenceBlock', blockModel);
    this.set('sortBy', 'title');
    this.set('canUpdate', true);
    await render(
      <template>
        <SequenceBlockDetails
          @report={{this.report}}
          @sequenceBlock={{this.sequenceBlock}}
          @canUpdate={{this.canUpdate}}
          @sortSessionsBy={{this.sortBy}}
          @setSortSessionBy={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.header.title.value, blockModel.title);
    assert.strictEqual(
      component.overview.description.text,
      `Description: ${blockModel.description}`,
    );
    assert.strictEqual(component.breadcrumbs.blockCrumbs.length, 3);
    assert.strictEqual(component.breadcrumbs.reportCrumb.text, 'Curriculum Inventory Report');
    assert.strictEqual(component.breadcrumbs.blockCrumbs[0].text, grandParentBlockModel.title);
    assert.strictEqual(component.breadcrumbs.blockCrumbs[1].text, parentBlockModel.title);
    assert.strictEqual(component.breadcrumbs.blockCrumbs[2].text, blockModel.title);
  });
});
