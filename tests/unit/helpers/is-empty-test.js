import { isEmpty } from '../../../helpers/is-empty';
import { module, test } from 'qunit';

module('Unit | Helper | is empty', function() {
  test('correctly checks values', function(assert) {
    let result = isEmpty([ null ]);
    assert.ok(result);

    result = isEmpty([ '' ]);
    assert.ok(result);

    result = isEmpty([ 42 ]);
    assert.notOk(result);
  });
});
