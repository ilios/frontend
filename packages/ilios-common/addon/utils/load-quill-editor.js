export async function loadQuillEditor() {
  const { default: QuillEditor } = await import('quill');
  const undoIcon = await import('quill/assets/icons/undo.svg');
  const redoIcon = await import('quill/assets/icons/redo.svg');

  // Quill doesn't include redo/undo icons by default,
  // so have to hack in from `quill/assets/icons/[undo|redo].svg`
  // https://github.com/slab/quill/issues/885#issuecomment-609384079
  const icons = QuillEditor.import('ui/icons');
  icons['undo'] = undoIcon.default;
  icons['redo'] = redoIcon.default;

  return {
    QuillEditor,
  };
}
