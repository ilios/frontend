export async function loadQuillEditor() {
  const { default: QuillEditor } = await import('quill');

  // Quill doesn't include redo/undo icons by default,
  // so have to hack in from `quill/assets/icons/[undo|redo].svg`
  // https://github.com/slab/quill/issues/885#issuecomment-609384079
  const icons = QuillEditor.import('ui/icons');
  icons['undo'] = await (await fetch('/assets/images/quill/undo.svg')).text();
  icons['redo'] = await (await fetch('/assets/images/quill/redo.svg')).text();

  return {
    QuillEditor,
  };
}
