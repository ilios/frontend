import countDigits from '../../../utils/count-digits';
import { module, test } from 'qunit';

module('Unit | Utility | count digits', function() {
  test('count digits in decimal numbers', function(assert) {
    assert.equal(countDigits(0), 1);
    assert.equal(countDigits(1), 1);
    assert.equal(countDigits(1234), 4);
    assert.equal(countDigits(-1234), 4);
    assert.equal(countDigits(1234.111), 4);
    assert.equal(countDigits('1234'), 4);
    assert.equal(countDigits('-1234'), 4);
    assert.equal(countDigits('1234.111'), 4);
    assert.equal(countDigits('020'), 2);
  });

  test('throws type error on invalid input', function(assert) {
    assert.throws(function(){
      countDigits('abc');
    }, TypeError);

    assert.throws(function(){
      countDigits();
    }, TypeError);

    assert.throws(function(){
      countDigits(NaN);
    }, TypeError);
  });
});
