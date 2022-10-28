import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-list-item';

module('Integration | Component | curriculum-inventory/sequence-block-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.program = this.server.create('program', { school });
    this.report = this.server.create('curriculum-inventory-report', {
      program: this.program,
      name: 'CI Report',
      year: '2017',
      startDate: new Date('2017-07-01'),
      endDate: new Date('2018-06-30'),
    });
  });

  test('it renders', async function (assert) {
    const course = this.server.create('course');
    const startingAcademicLevel = this.server.create('curriculum-inventory-academic-level', {
      level: 5,
    });
    const endingAcademicLevel = this.server.create('curriculum-inventory-academic-level', {
      level: 6,
    });
    const block = this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      title: 'block 1',
      startDate: new Date('2021-03-17'),
      endDate: new Date('2021-05-22'),
      orderInSequence: 3,
      startingAcademicLevel,
      endingAcademicLevel,
      course,
    });
    const blockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', block.id);
    this.set('block', blockModel);

    await render(
      hbs`<CurriculumInventory::SequenceBlockListItem
        @sequenceBlock={{this.block}}
        @canUpdate={{true}}
        @remove={{(noop)}}
        @isInOrderedSequence={{true}}
      />`
    );

    assert.strictEqual(component.title, 'block 1');
    assert.strictEqual(component.startLevel, '5');
    assert.strictEqual(component.endLevel, '6');
    assert.strictEqual(component.orderInSequence, '3');
    assert.strictEqual(
      component.startDate,
      this.intl.formatDate(DateTime.fromObject({ year: 2021, month: 3, day: 17 }).toJSDate())
    );
    assert.strictEqual(
      component.endDate,
      this.intl.formatDate(DateTime.fromObject({ year: 2021, month: 5, day: 22 }).toJSDate())
    );
    assert.strictEqual(component.course, 'course 0');
    assert.ok(component.isDeletable);
  });

  test('sequence block is nested inside unordered block', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', { orderInSequence: 3 });
    const blockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', block.id);
    this.set('block', blockModel);

    await render(
      hbs`<CurriculumInventory::SequenceBlockListItem
        @sequenceBlock={{this.block}}
        @canUpdate={{true}}
        @remove={{(noop)}}
        @isInOrderedSequence={{false}}
      />`
    );

    assert.strictEqual(component.orderInSequence, 'n/a');
  });

  test('read-only mode', async function (assert) {
    const block = this.server.create('curriculum-inventory-sequence-block');
    const blockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', block.id);
    this.set('block', blockModel);

    await render(
      hbs`<CurriculumInventory::SequenceBlockListItem
        @sequenceBlock={{this.block}}
        @canUpdate={{false}}
        @remove={{(noop)}}
        @isInOrderedSequence={{false}}
      />`
    );

    assert.notOk(component.isDeletable);
  });

  test('delete', async function (assert) {
    assert.expect(3);
    const block = this.server.create('curriculum-inventory-sequence-block');
    const blockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', block.id);
    this.set('block', blockModel);
    this.set('remove', (block) => {
      assert.strictEqual(block, blockModel);
    });

    await render(
      hbs`<CurriculumInventory::SequenceBlockListItem
        @sequenceBlock={{this.block}}
        @canUpdate={{true}}
        @remove={{this.remove}}
        @isInOrderedSequence={{false}}
      />`
    );

    assert.notOk(component.confirmRemoval.isVisible);
    await component.remove();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.confirm();
  });
});
