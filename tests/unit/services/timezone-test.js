import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';

module('Unit | Service | timezone', function (hooks) {
  setupTest(hooks);

  test('getCurrentTimezone', function (assert) {
    const service = this.owner.lookup('service:timezone');
    assert.strictEqual(moment.tz.guess(), service.getCurrentTimezone());
  });

  test('getTimezoneNames', function (assert) {
    const service = this.owner.lookup('service:timezone');
    const names = service.getTimezoneNames();
    const currentTimezone = moment.tz.guess();
    assert.ok(names.includes(currentTimezone));
    assert.notOk(names.includes('Etc/GMT-13'));
    assert.notOk(names.includes('Canada/Newfoundland'));
    assert.notOk(names.includes('UTC'));
    assert.strictEqual(names[0], 'Africa/Abidjan');
    assert.strictEqual(names[names.length - 1], 'Pacific/Yap');
  });

  test('formatTimezone', function (assert) {
    const service = this.owner.lookup('service:timezone');
    const timezone = 'America/Los_Angeles';
    const offset = moment.tz(timezone).format('Z');
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
