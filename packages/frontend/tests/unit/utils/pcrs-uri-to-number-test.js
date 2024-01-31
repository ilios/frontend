import pcrsUriToNumber from '../../../utils/pcrs-uri-to-number';
import { module, test } from 'qunit';

module('Unit | Utility | pcrs-uri-to-number', function () {
  test('extracts number from PCRS uri', function (assert) {
    assert.strictEqual(pcrsUriToNumber('aamc-pcrs-comp-c0101'), '1.1');
    assert.strictEqual(pcrsUriToNumber('aamc-pcrs-comp-c0899'), '8.99');
  });

  test('returns input if pattern matching failed', function (assert) {
    assert.strictEqual(pcrsUriToNumber(''), '');
    assert.strictEqual('foo bar', 'foo bar');
  });

  test('throws type error on invalid input', function (assert) {
    assert.throws(function () {
      pcrsUriToNumber(null);
    }, TypeError);
    assert.throws(function () {
      pcrsUriToNumber();
    }, TypeError);
    assert.throws(function () {
      pcrsUriToNumber(NaN);
    }, TypeError);
    assert.throws(function () {
      pcrsUriToNumber(10);
    }, TypeError);
  });
});
