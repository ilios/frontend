import randomString from '../../../utils/random-string';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('util:random-string', 'Unit | Utility | random string' + testgroup);

// Replace this with your real tests.
test('it works', function(assert) {
  var result = randomString();
  assert.ok(result);
});
