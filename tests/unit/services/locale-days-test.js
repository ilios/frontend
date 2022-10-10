import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl, setLocale } from 'ember-intl/test-support';
import { freezeDateAt, unfreezeDate } from 'ilios-common';
import { DateTime } from 'luxon';

module('Unit | Service | locale-days', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  hooks.afterEach(() => {
    unfreezeDate();
    setLocale('en-us');
  });

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

  test('firstDayOfThisWeek works on Sunday in en-us', function (assert) {
    setLocale('en-us');
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 9);
  });

  test('firstDayOfDateWeek works for a Sunday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 9,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 9);
  });

  test('firstDayOfDateWeek works for a Monday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 10,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 9);
  });

  test('firstDayOfDateWeek works for a Saturday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 8,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 2);
  });

  test('firstDayOfThisWeek works on Sunday in fr', function (assert) {
    setLocale('fr');
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 3);
  });

  test('firstDayOfDateWeek works for a Sunday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 9,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 3);
  });

  test('firstDayOfDateWeek works for a Monday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 10,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 10);
  });

  test('firstDayOfDateWeek works for a Saturday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 8,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 3);
  });

  test('firstDayOfThisWeek works on Sunday in es', function (assert) {
    setLocale('es');
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfThisWeek).day, 3);
  });

  test('firstDayOfDateWeek works for a Sunday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 9,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 3);
  });

  test('firstDayOfDateWeek works for a Monday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 10,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 10);
  });

  test('firstDayOfDateWeek works for a Saturday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 8,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.firstDayOfDateWeek(dt)).day, 3);
  });

  test('lastDayOfThisWeek works on Sunday in en-us', function (assert) {
    setLocale('en-us');
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 15);
  });

  test('lastDayOfDateWeek works for a Sunday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 9,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 15);
  });

  test('lastDayOfDateWeek works for a Monday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 10,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 15);
  });

  test('lastDayOfDateWeek works for a Friday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 7,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 8);
  });

  test('lastDayOfDateWeek works for a Saturday in en-us', function (assert) {
    setLocale('en-us');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 8,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 8);
  });

  test('lastDayOfThisWeek works on Sunday in fr', function (assert) {
    setLocale('fr');
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 9);
  });

  test('lastDayOfDateWeek works for a Sunday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 9,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 9);
  });

  test('lastDayOfDateWeek works for a Monday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 10,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 16);
  });

  test('lastDayOfDateWeek works for a Friday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 7,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 9);
  });

  test('lastDayOfDateWeek works for a Saturday in fr', function (assert) {
    setLocale('fr');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 8,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 9);
  });

  test('lastDayOfThisWeek works on Sunday in es', function (assert) {
    setLocale('es');
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfThisWeek).day, 9);
  });

  test('lastDayOfDateWeek works for a Sunday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 9,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 9);
  });

  test('lastDayOfDateWeek works for a Monday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 10,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 16);
  });

  test('lastDayOfDateWeek works for a Friday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 7,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 9);
  });

  test('lastDayOfDateWeek works for a Saturday in es', function (assert) {
    setLocale('es');
    const dt = DateTime.fromObject({
      year: 2022,
      month: 10,
      day: 8,
      hour: 10,
    }).toJSDate();
    const service = this.owner.lookup('service:locale-days');
    assert.strictEqual(DateTime.fromJSDate(service.lastDayOfDateWeek(dt)).day, 9);
  });
});
