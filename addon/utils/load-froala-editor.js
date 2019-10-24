export async function loadFroalaEditor() {
  //move all these into a util class so they can be imported more places
  const FroalaEditor = await import('froala-editor');
  await Promise.all([
    import('froala-editor/js/languages/es.js'),
    import('froala-editor/js/languages/fr.js'),
    import('froala-editor/js/plugins/link.min.js'),
    import('froala-editor/js/plugins/lists.min.js'),
  ]);

  return {
    FroalaEditor
  };
}
