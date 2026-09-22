import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';

module('Unit | Service | timezone', function (hooks) {
  setupTest(hooks);

  test('getCurrentTimezone', function (assert) {
    const service = this.owner.lookup('service:timezone');
    assert.strictEqual(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      service.getCurrentTimezone(),
    );
  });

  test('getTimezoneNames', function (assert) {
    const service = this.owner.lookup('service:timezone');
    const names = service.getTimezoneNames();
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    assert.ok(names.includes(currentTimezone));
    // KLUDGE!
    // Some of the test environments (mobile platforms) in our CI/CD pipeline either serve up 'UTC'
    // as current timezone name, or - even worse - a timezone offset instead of a AINA timezone name.
    // But that's not how the real world functions, this only ever happens in these broken test environments.
    // So let's pretend this isn't happening and filter these out to prevent test breakage.
    // [ST 2023/01/24]
    if (
      currentTimezone === 'UTC' ||
      !!currentTimezone.match('^([+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$')
    ) {
      names.splice(names.indexOf(currentTimezone), 1);
    }
    assert.notOk(names.includes('Etc/GMT-13'));
    assert.notOk(names.includes('Canada/Newfoundland'));
    assert.notOk(names.includes('UTC'));
    assert.strictEqual(names[0], 'Africa/Abidjan');
    assert.strictEqual(names[names.length - 1], 'Pacific/Wallis');
  });

  test('formatTimezone', function (assert) {
    const service = this.owner.lookup('service:timezone');
    const timezone = 'America/Los_Angeles';
    const offset = DateTime.local()
      .setZone(timezone)
      .zone.formatOffset(DateTime.local().toMillis(), 'short');
    assert.strictEqual(`(${offset}) America - Los Angeles`, service.formatTimezone(timezone));
  });

  test('getTimezones', function (assert) {
    const service = this.owner.lookup('service:timezone');
    const timezones = service.getTimezones();
    // fortunately, those are not expected to change, and they don't observe DST.
    // so it's safe to hardwire them into the test.
    assert.strictEqual(timezones[0].label, '(-11:00) Pacific - Midway');
    assert.strictEqual(timezones[0].value, 'Pacific/Midway');
    assert.strictEqual(timezones[timezones.length - 1].label, '(+14:00) Pacific - Kiritimati');
    assert.strictEqual(timezones[timezones.length - 1].value, 'Pacific/Kiritimati');
  });
});
