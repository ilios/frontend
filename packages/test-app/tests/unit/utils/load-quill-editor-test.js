import { loadQuillEditor } from 'ilios-common/utils/load-quill-editor';
import { module, test } from 'qunit';

module('Unit | Utility | load-quill-editor', function () {
  test('it works', async function (assert) {
    const { QuillEditor } = await loadQuillEditor();
    assert.ok(QuillEditor);
  });
});
