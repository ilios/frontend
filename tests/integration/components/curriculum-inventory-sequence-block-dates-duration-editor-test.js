import { setupRenderingTest } from 'ember-qunit';
import { render} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory-sequence-block-dates-duration-editor';

module('Integration | Component | curriculum inventory sequence block dates duration editor', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 10
    });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{noop}}
      @cancel={{noop}}
    />`);
    assert.equal(component.startDate.label, 'Start:', 'Start date is labeled correctly.');
    assert.equal(
      component.startDate.value,
      moment(blockModel.startDate).format('M/D/YYYY'),
      'Start date input has correct value.'
    );
    assert.equal(component.endDate.label, 'End:', 'End date is labeled correctly.');
    assert.equal(
      component.endDate.value,
      moment(blockModel.endDate).format('M/D/YYYY'),
      'End date input has correct value.'
    );
    assert.equal(component.duration.label, 'Duration (in Days):', 'Duration input is labeled correctly.');
    assert.equal(component.duration.value, blockModel.duration, 'Duration input has correct value.');
  });

  test('save', async function(assert) {
    assert.expect(3);
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2016-11-02T00:00:00');
    const newDuration = 15;
    const block = this.server.create('curriculum-inventory-sequence-block', {
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 5
    });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', (startDate, endDate, duration) => {
      assert.equal(startDate.getTime(), newStartDate.getTime(), 'New start date on save.');
      assert.equal(endDate.getTime(), newEndDate.getTime(), 'New end date on save.');
      assert.equal(duration, newDuration, 'New duration on save');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    await component.duration.set(newDuration);
    await component.save();
  });

  test('save with date range and a zero duration', async function(assert) {
    assert.expect(3);
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2016-11-02T00:00:00');
    const newDuration = 0;
    const block = this.server.create('curriculum-inventory-sequence-block');
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', (startDate, endDate, duration) => {
      assert.equal(startDate.getTime(), newStartDate.getTime(), 'New start date on save.');
      assert.equal(endDate.getTime(), newEndDate.getTime(), 'New end date on save.');
      assert.equal(duration, newDuration, 'New duration on save');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    await component.duration.set(newDuration);
    await component.save();
  });

  test('save with non-zero duration and no date range', async function(assert) {
    assert.expect(3);
    const newDuration = '5';
    const block = this.server.create('curriculum-inventory-sequence-block');
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', (startDate, endDate, duration) => {
      assert.equal(startDate, null, 'NULL for start date on save.');
      assert.equal(endDate, null, 'NULL for end date on save.');
      assert.equal(duration, newDuration, 'New duration on save.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    await component.duration.set(newDuration);
    await component.save();
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    const block = this.server.create('curriculum-inventory-sequence-block', {
      startDate: new Date('2016-04-23T00:00:00'),
      endDate: new Date('2016-06-02T00:00:00'),
      duration: 10
    });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action got invoked.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{noop}}
      @cancel={{this.cancel}}
    />`);
    await component.cancel();
  });


  test('save fails if end-date is older than start-date', async function(assert) {
    assert.expect(2);
    const newStartDate = new Date('2016-10-30T00:00:00');
    const newEndDate = new Date('2013-11-02T00:00:00');
    const block = this.server.create('curriculum-inventory-sequence-block');
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', () => {
      assert.ok(false, 'Save action should have not been invoked.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    assert.notOk(component.endDate.hasError);
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    await component.save();
    assert.ok(component.endDate.hasError);
  });

  test('save fails on missing duration', async function(assert) {
    assert.expect(2);
    const block = this.server.create('curriculum-inventory-sequence-block', {
      startDate: new Date('2016-04-23'),
      endDate: new Date('2016-06-02'),
      duration: 10
    });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', () => {
      assert.ok(false, 'Save action should have not been invoked.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    assert.notOk(component.duration.hasError);
    await component.duration.set('');
    await component.save();
    assert.ok(component.duration.hasError);
  });

  test('save fails on invalid duration', async function(assert) {
    assert.expect(2);
    const block = this.server.create('curriculum-inventory-sequence-block', {
      startDate: new Date('2016-04-23'),
      endDate: new Date('2016-06-02'),
      duration: 10
    });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', ()=> {
      assert.ok(false, 'Save action should have not been invoked.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    assert.notOk(component.duration.hasError);
    await component.duration.set('-10');
    await component.save();
    assert.ok(component.duration.hasError);
  });

  test('save fails if neither date range nor duration is provided', async function(assert) {
    assert.expect(4);
    const block = this.server.create('curriculum-inventory-sequence-block', { duration: 0 });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', () => {
      assert.ok(false, 'Save action should have not been invoked.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    assert.notOk(component.startDate.hasError);
    assert.notOk(component.endDate.hasError);
    await component.save();
    assert.ok(component.startDate.hasError);
    assert.ok(component.endDate.hasError);
  });

  test('save fails if start-date is given but no end-date is provided', async function(assert) {
    assert.expect(2);
    const block = this.server.create('curriculum-inventory-sequence-block', { duration: 0 });
    const blockModel = await this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id);
    this.set('sequenceBlock', blockModel);
    this.set('save', () => {
      assert.ok(false, 'Save action should have not been invoked.');
    });
    await render(hbs`<CurriculumInventorySequenceBlockDatesDurationEditor
      @sequenceBlock={{this.sequenceBlock}}
      @save={{this.save}}
      @cancel={{noop}}
    />`);
    assert.notOk(component.endDate.hasError);
    await component.startDate.set(new Date());
    await component.save();
    assert.ok(component.endDate.hasError);
  });
});
