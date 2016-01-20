import { and } from '../../../helpers/and';
import { module, test } from 'qunit';

module('Unit | Helper | and');

test('correctly compares values', function(assert) {
  let result = and([ true, true ]);
  assert.ok(result);

  result = and([ true, false ]);
  assert.notOk(result);

  result = and([ false, true ]);
  assert.notOk(result);

  result = and([ false, false ]);
  assert.notOk(result);
});

test('returns false when arguments are empty or `isBlank`', function(assert) {
  let result = and([]);
  assert.notOk(result);

  result = and([ true ]);
  assert.notOk(result);

  result = and([ undefined, undefined ]);
  assert.notOk(result);
});
