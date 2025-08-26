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

  // Quill automatically adds target="_blank" to inserted links.
  // This removes the target attribute
  const Link = QuillEditor.import('formats/link');
  class NoTargetLink extends Link {
    static create(value) {
      let node = super.create(value);
      value = this.sanitize(value);
      node.setAttribute('href', value);
      // Remove the target attribute (or set as desired)
      node.removeAttribute('target');
      return node;
    }
  }
  QuillEditor.register(NoTargetLink, true);

  return {
    QuillEditor,
  };
}
