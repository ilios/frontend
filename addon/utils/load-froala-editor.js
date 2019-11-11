import FroalaEditor from 'froala-editor';
import 'froala-editor/js/languages/es.js';
import 'froala-editor/js/languages/fr.js';
import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/lists.min.js';

export async function loadFroalaEditor() {
  /**
   * Dynamic loading doesn't seem to work in an addon right now:
   * Once https://github.com/ef4/ember-auto-import/issues/254 is resolved
   * this code can be activated to greatly reduce file size of our initial JS
   */
  // const FroalaEditor = await import('froala-editor');
  // await Promise.all([
  //   import('froala-editor/js/languages/es.js'),
  //   import('froala-editor/js/languages/fr.js'),
  //   import('froala-editor/js/plugins/link.min.js'),
  //   import('froala-editor/js/plugins/lists.min.js'),
  // ]);

  return {
    FroalaEditor
  };
}
