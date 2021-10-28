import escapeRegExp from '../../../utils/escape-reg-exp';
import { module, test } from 'qunit';

module('Unit | Utility | escape Regular Expressions special characters', function () {
  test('escapes special chars', function (assert) {
    assert.strictEqual(
      escapeRegExp('\\^$*+?.()|{}[]'),
      '\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\{\\}\\[\\]'
    );
    assert.strictEqual(escapeRegExp('abc'), 'abc');
    assert.strictEqual(escapeRegExp('MoneyBag$$$ +1'), 'MoneyBag\\$\\$\\$ \\+1');
    assert.strictEqual(escapeRegExp(null), null);
    assert.strictEqual(escapeRegExp(''), '');
  });
});
