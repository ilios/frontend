import { loadFroalaEditor } from 'dummy/utils/load-froala-editor';
import { module, test } from 'qunit';

module('Unit | Utility | load-froala-editor', function() {

  test('it works', async function (assert) {
    assert.expect(1);
    let { FroalaEditor } = await loadFroalaEditor();
    assert.ok(FroalaEditor);
  });
});
