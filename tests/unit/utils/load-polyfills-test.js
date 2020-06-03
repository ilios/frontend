import { loadPolyfills } from 'ilios-common/utils/load-polyfills';
import { module, test } from 'qunit';

module('Unit | Utility | loadPolyfills', function() {

  test('it works', async function(assert) {
    await loadPolyfills();
    assert.ok(true);
  });
});
