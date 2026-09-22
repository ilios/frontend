import { getValueFromHtml } from 'frontend/utils/html-server-variables';
import { module, test } from 'qunit';

module('Unit | Utility | html server variables', function () {
  test('it returns undefined when missing', function (assert) {
    assert.strictEqual(getValueFromHtml('nothing'), undefined);
  });
});
