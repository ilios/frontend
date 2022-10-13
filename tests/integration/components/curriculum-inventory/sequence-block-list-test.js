import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-list';

module('Integration | Component | curriculum-inventory/sequence-block-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const course = this.server.create('course', { title: 'Life Lessons' });
    const academicLevel1 = this.server.create('curriculum-inventory-academic-level', { level: 1 });
    const academicLevel2 = this.server.create('curriculum-inventory-academic-level', { level: 2 });
    const academicLevel3 = this.server.create('curriculum-inventory-academic-level', { level: 3 });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel1, academicLevel2, academicLevel3],
      year: '2016',
      program,
      name: 'Lorem Ipsum',
      startDate: DateTime.fromObject({ year: 2015, month: 6, day: 12 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2016, month: 4, day: 11 }).toJSDate(),
      description: 'Lorem Ipsum',
    });

    const block1 = this.server.create('curriculum-inventory-sequence-block', {
      startingAcademicLevel: academicLevel1,
      endingAcademicLevel: academicLevel2,
      title: 'Foo',
      startDate: DateTime.fromObject({ year: 2015, month: 2, day: 23 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2016, month: 12, day: 3 }).toJSDate(),
      course,
      orderInSequence: 0,
      report,
    });
    const block2 = this.server.create('curriculum-inventory-sequence-block', {
      startingAcademicLevel: academicLevel2,
      endingAcademicLevel: academicLevel3,
      title: 'Bar',
      orderInSequence: 0,
      report,
    });
    const academicLevelModel1 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-academic-level', academicLevel1.id);
    const academicLevelModel2 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-academic-level', academicLevel2.id);
    const academicLevelModel3 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-academic-level', academicLevel3.id);
    const blockModel1 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block1.id);
    const blockModel2 = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', block2.id);
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.academicLevel1 = academicLevelModel1;
    this.academicLevel2 = academicLevelModel2;
    this.academicLevel3 = academicLevelModel3;
    this.sequenceBlock1 = blockModel1;
    this.sequenceBlock2 = blockModel2;
    this.report = reportModel;
    this.course = courseModel;
  });

  test('it renders with top-level sequence blocks', async function (assert) {
    await render(hbs`<CurriculumInventory::SequenceBlockList
      @report={{this.report}}
      @sequenceBlocks={{await this.report.topLevelSequenceBlocks}}
      @canUpdate={{true}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(
      component.header.title,
      'Sequence Blocks (2)',
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.ok(component.header.expandCollapse.isVisible, 'Add new button is visible.');
    assert.strictEqual(
      component.list.headers.sequenceBlock,
      'Sequence Block',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.startLevel,
      'Start Level',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.endLevel,
      'End Level',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.sequenceNumber,
      'Sequence #',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.startDate,
      'Start Date',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.endDate,
      'End Date',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.course,
      'Course',
      'Table column header has correct label.'
    );
    assert.strictEqual(
      component.list.headers.actions,
      'Actions',
      'Table column header has correct label.'
    );

    assert.strictEqual(component.list.items[0].title, this.sequenceBlock2.title);
    assert.strictEqual(parseInt(component.list.items[0].startLevel, 10), this.academicLevel2.level);
    assert.strictEqual(parseInt(component.list.items[0].endLevel, 10), this.academicLevel3.level);
    assert.strictEqual(component.list.items[0].orderInSequence, 'n/a');
    assert.strictEqual(component.list.items[0].startDate, 'n/a');
    assert.strictEqual(component.list.items[0].endDate, 'n/a');
    assert.strictEqual(component.list.items[0].course, 'n/a');
    assert.ok(component.list.items[0].isDeletable);
    assert.strictEqual(component.list.items[1].title, this.sequenceBlock1.title);
    assert.strictEqual(parseInt(component.list.items[1].startLevel, 10), this.academicLevel1.level);
    assert.strictEqual(parseInt(component.list.items[1].endLevel, 10), this.academicLevel2.level);
    assert.strictEqual(component.list.items[1].orderInSequence, 'n/a');
    assert.strictEqual(
      component.list.items[1].startDate,
      this.intl.formatDate(this.sequenceBlock1.startDate)
    );
    assert.strictEqual(
      component.list.items[1].endDate,
      this.intl.formatDate(this.sequenceBlock1.endDate)
    );
    assert.strictEqual(component.list.items[1].course, this.course.title);
    assert.ok(component.list.items[1].isDeletable);
  });

  test('it renders with nested blocks', async function (assert) {
    const parentBlock = this.server.create('curriculum-inventory-sequence-block');
    const parentBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', parentBlock.id);
    const children = (await parentBlockModel.children).slice();
    parentBlockModel.set('children', [...children, this.sequenceBlock1, this.sequenceBlock2]);
    this.set('parent', parentBlockModel);

    await render(hbs`<CurriculumInventory::SequenceBlockList
      @parent={{this.parent}}
      @report={{await this.parent.report}}
      @sequenceBlocks={{await this.parent.children}}
      @canUpdate={{true}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(
      component.header.title,
      'Sequence Blocks (2)',
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.strictEqual(component.list.items[0].title, this.sequenceBlock2.title);
    assert.strictEqual(parseInt(component.list.items[0].startLevel, 10), this.academicLevel2.level);
    assert.strictEqual(parseInt(component.list.items[0].endLevel, 10), this.academicLevel3.level);
    assert.strictEqual(component.list.items[0].orderInSequence, 'n/a');
    assert.strictEqual(component.list.items[0].startDate, 'n/a');
    assert.strictEqual(component.list.items[0].endDate, 'n/a');
    assert.strictEqual(component.list.items[0].course, 'n/a');
    assert.ok(component.list.items[0].isDeletable);
    assert.strictEqual(component.list.items[1].title, this.sequenceBlock1.title);
    assert.strictEqual(parseInt(component.list.items[1].startLevel, 10), this.academicLevel1.level);
    assert.strictEqual(parseInt(component.list.items[1].endLevel, 10), this.academicLevel2.level);
    assert.strictEqual(component.list.items[1].orderInSequence, 'n/a');
    assert.strictEqual(
      component.list.items[1].startDate,
      this.intl.formatDate(this.sequenceBlock1.startDate)
    );
    assert.strictEqual(
      component.list.items[1].endDate,
      this.intl.formatDate(this.sequenceBlock1.endDate)
    );
    assert.strictEqual(component.list.items[1].course, this.course.title);
    assert.ok(component.list.items[1].isDeletable);
  });

  test('read-only mode', async function (assert) {
    await render(hbs`<CurriculumInventory::SequenceBlockList
      @report={{this.report}}
      @sequenceBlocks={{await this.report.topLevelSequenceBlocks}}
      @canUpdate={{false}}
      @remove={{(noop)}}
    />`);

    assert.notOk(component.header.expandCollapse.isVisible, 'Add new button is not visible.');
    assert.notOk(component.list.items[0].isDeletable);
    assert.notOk(component.list.items[1].isDeletable);
  });

  test('delete', async function (assert) {
    assert.expect(3);
    this.set('remove', (block) => {
      assert.strictEqual(block, this.sequenceBlock2);
    });
    await render(hbs`<CurriculumInventory::SequenceBlockList
      @report={{this.report}}
      @sequenceBlocks={{await this.report.topLevelSequenceBlocks}}
      @canUpdate={{true}}
      @remove={{this.remove}}
    />`);

    assert.notOk(component.list.items[0].confirmRemoval.isVisible);
    await component.list.items[0].remove();
    assert.ok(component.list.items[0].confirmRemoval.isVisible);
    await component.list.items[0].confirmRemoval.confirm();
  });

  test('cancel delete', async function (assert) {
    await render(hbs`<CurriculumInventory::SequenceBlockList
      @report={{this.report}}
      @sequenceBlocks={{await this.report.topLevelSequenceBlocks}}
      @canUpdate={{true}}
      @remove={{(noop)}}
    />`);

    assert.notOk(component.list.items[0].confirmRemoval.isVisible);
    await component.list.items[0].remove();
    assert.ok(component.list.items[0].confirmRemoval.isVisible);
    await component.list.items[0].confirmRemoval.cancel();
    assert.notOk(component.list.items[0].confirmRemoval.isVisible);
  });

  test('empty top level blocks list', async function (assert) {
    await render(hbs`<CurriculumInventory::SequenceBlockList
      @report={{this.report}}
      @canUpdate={{true}}
      @sequenceBlocks={{(array)}}
    />`);
    assert.strictEqual(
      component.header.title,
      'Sequence Blocks (0)',
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.strictEqual(
      component.noSequenceBlocks.text,
      'There are no sequence blocks in this report.',
      'No blocks message is visible.'
    );
  });

  test('empty nested blocks list', async function (assert) {
    const parentBlock = this.server.create('curriculum-inventory-sequence-block');
    const parentBlockModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-sequence-block', parentBlock.id);
    this.set('parent', parentBlockModel);
    await render(hbs`<CurriculumInventory::SequenceBlockList
      @parent={{this.parent}}
      @report={{await this.parent.report}}
      @sequenceBlocks={{(array)}}
    />`);
    assert.strictEqual(
      component.header.title,
      'Sequence Blocks (0)',
      'Component title is correct, and show the correct number of blocks.'
    );
    assert.strictEqual(
      component.noSubSequenceBlocks.text,
      'This sequence block has no nested sequence blocks.',
      'No blocks message is visible.'
    );
  });
});
