import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl, setLocale } from 'ember-intl/test-support';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import { DateTime } from 'luxon';

module('Unit | Service | locale-days', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  hooks.afterEach(() => unfreezeDate());

  test('firstDayOfThisWeek respects current locale', function (assert) {
    freezeDateAt(new Date('2022-09-22'));
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 18);

    setLocale('es');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 19);

    setLocale('fr');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 19);

    setLocale('en-us');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 18);
  });

  test('lastDayOfWeek respects current locale', function (assert) {
    freezeDateAt(new Date('2022-09-22'));
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 24);

    setLocale('es');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 25);

    setLocale('fr');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 25);

    setLocale('en-us');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 24);
  });

  test('works at year boundry', function (assert) {
    freezeDateAt(new Date('2020-01-02'));
    const service = this.owner.lookup('service:locale-days');

    setLocale('en-us');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 29);
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 4);

    setLocale('es');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 30);
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 5);

    setLocale('fr');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 30);
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 5);
  });

  test('firstDayOfDateWeek respects current locale', function (assert) {
    const dt = new Date('2022-09-22');
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 18);

    setLocale('es');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 19);

    setLocale('fr');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 19);

    setLocale('en-us');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 18);
  });

  test('lastDayOfDateWeek respects current locale', function (assert) {
    const dt = new Date('2022-09-22');
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 24);

    setLocale('es');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 25);

    setLocale('fr');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 25);

    setLocale('en-us');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 24);
  });

  test('of date week works at year boundry', function (assert) {
    const dt = new Date('2020-01-02');
    const service = this.owner.lookup('service:locale-days');

    setLocale('en-us');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 29);
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 4);

    setLocale('es');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 30);
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 5);

    setLocale('fr');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 30);
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 5);
  });
});
