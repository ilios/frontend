import { loadFroalaEditor } from 'dummy/utils/load-froala-editor';
import { module, test } from 'qunit';

module('Unit | Utility | load-froala-editor', function () {
  test('it works', async function (assert) {
    const { FroalaEditor } = await loadFroalaEditor();
    assert.ok(FroalaEditor);
  });
});
