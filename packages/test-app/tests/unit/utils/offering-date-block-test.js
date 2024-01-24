import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';
import {
  OfferingBlock,
  OfferingDateBlock,
  OfferingTimeBlock,
} from 'ilios-common/utils/offering-date-block';

module('Unit | Utility | offering-date-block', function (hooks) {
  setupTest(hooks);

  test('OfferingBlock::addOffering', function (assert) {
    const block = new OfferingBlock();
    assert.strictEqual(block.offerings.length, 0);
    block.addOffering({});
    assert.strictEqual(block.offerings.length, 1);
    block.addOffering({});
    assert.strictEqual(block.offerings.length, 2);
  });

  test('OfferingDateBlock::date', function (assert) {
    const key = '2023005';
    const block = new OfferingDateBlock(key);
    const date = block.date;
    assert.strictEqual(DateTime.fromJSDate(date).year, 2023);
    assert.strictEqual(DateTime.fromJSDate(date).ordinal, 5);
  });

  test('OfferingDateBlock::dateStamp', function (assert) {
    const key = '2023005';
    const block = new OfferingDateBlock(key);
    const dateStamp = block.dateStamp;
    assert.strictEqual(dateStamp, DateTime.fromJSDate(new Date(2023, 0, 5)).toUnixInteger());
  });

  test('OfferingTimeBlocks::offeringTimeBlocks', function (assert) {
    const key = '2023005';
    const store = this.owner.lookup('service:store');
    const startDate1 = new Date(2023, 1, 18, 0, 0, 0);
    const startDate2 = new Date(2023, 5, 2, 17, 25, 0);
    const endDate1 = new Date(2023, 7, 20, 11, 45, 0);
    const endDate2 = new Date(2024, 10, 17, 15, 0, 0);
    const block = new OfferingDateBlock(key);
    assert.strictEqual(block.offeringTimeBlocks.length, 0);
    const offering1 = store.createRecord('offering', { startDate: startDate1, endDate: endDate1 });
    const offering2 = store.createRecord('offering', { startDate: startDate1, endDate: endDate2 });
    const offering3 = store.createRecord('offering', { startDate: startDate2, endDate: endDate2 });
    block.addOffering(offering1);
    block.addOffering(offering2);
    block.addOffering(offering3);
    const offeringTimeBlocks = block.offeringTimeBlocks;
    assert.strictEqual(offeringTimeBlocks.length, 3);
    assert.strictEqual(offeringTimeBlocks[0].timeKey, '2023049000020232321145');
    assert.strictEqual(offeringTimeBlocks[1].timeKey, '2023049000020243221500');
    assert.strictEqual(offeringTimeBlocks[2].timeKey, '2023153172520243221500');
  });

  test('OfferingTimeBlock::isMultiDay', function (assert) {
    let key = '2023005000020230051000';
    let block = new OfferingTimeBlock(key);
    assert.notOk(block.isMultiDay);
    key = '2023005000020230061000';
    block = new OfferingTimeBlock(key);
    assert.ok(block.isMultiDay);
  });

  test('OfferingTimeBlock::startDate', function (assert) {
    const key = '2023005134520240120430';
    const block = new OfferingTimeBlock(key);
    const startDate = block.startDate;
    assert.strictEqual(startDate.year, 2023);
    assert.strictEqual(startDate.ordinal, 5);
    assert.strictEqual(startDate.hour, 13);
    assert.strictEqual(startDate.minute, 45);
  });

  test('OfferingTimeBlock::endDate', function (assert) {
    const key = '2023005134520240120430';
    const block = new OfferingTimeBlock(key);
    const endDate = block.endDate;
    assert.strictEqual(endDate.year, 2024);
    assert.strictEqual(endDate.ordinal, 12);
    assert.strictEqual(endDate.hour, 4);
    assert.strictEqual(endDate.minute, 30);
  });

  test('OfferingTimeBlock::durationHours', function (assert) {
    const key = '2023005134520240120430';
    const block = new OfferingTimeBlock(key);
    assert.strictEqual(block.durationHours, 8918);
  });

  test('OfferingTimeBlock::durationMinutes', function (assert) {
    const key = '2023005134520240120430';
    const block = new OfferingTimeBlock(key);
    assert.strictEqual(block.durationMinutes, 45);
  });

  test('OfferingTimeBlock::totalMinutes', function (assert) {
    const key = '2023005134520240120430';
    const block = new OfferingTimeBlock(key);
    assert.strictEqual(block.totalMinutes, 535125);
  });
});
