import { loadFroalaEditor } from 'dummy/utils/load-froala-editor';
import { module, test } from 'qunit';

module('Unit | Utility | load-froala-editor', function() {

  test('it works', function (assert) {
    assert.expect(2);
    let result = loadFroalaEditor();
    assert.ok(result);
    result.then(() => {
      assert.ok(true, 'result is a promise');
    });
  });
});
