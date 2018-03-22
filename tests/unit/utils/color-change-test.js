import colorChange from 'dummy/utils/color-change';
import { module, test } from 'qunit';

module('Unit | Utility | color change', function() {
  test('it lightens', function(assert) {
    const hex = '#222222';
    const diff = '0.5';
    let result = colorChange(hex, diff);
    assert.ok(result);
    assert.equal(result, '#333333');
  });

  test('it darkens', function(assert) {
    const hex = '#aaaaaa';
    const diff = '-0.5';
    let result = colorChange(hex, diff);
    assert.ok(result);
    assert.equal(result, '#555555');
  });
});
