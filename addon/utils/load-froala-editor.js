export async function loadFroalaEditor() {
  const { default: FroalaEditor } = await import('froala-editor');
  await Promise.all([
    import('froala-editor/js/languages/es.js'),
    import('froala-editor/js/languages/fr.js'),
    import('froala-editor/js/plugins/link.min.js'),
    import('froala-editor/js/plugins/lists.min.js'),
    import('froala-editor/js/plugins/code_view.min.js'),
  ]);

  return {
    FroalaEditor
  };
}
