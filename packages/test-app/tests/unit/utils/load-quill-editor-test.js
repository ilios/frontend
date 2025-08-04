import { loadQuillEditor } from 'rs-common/utils/load-quill-editor';
import { module, test } from 'qunit';

module('Unit | Utility | load-froala-editor', function () {
  test('it works', async function (assert) {
    const { QuillEditor } = await loadQuillEditor();
    assert.ok(QuillEditor);
  });
});
