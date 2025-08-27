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

  // Quill automatically adds target="_blank" to inserted links by default.
  // This overrides the base Link Blot to allow for the target to be customized.
  const Link = QuillEditor.import('formats/link');
  class SmartLinkBlot extends Link {
    static create(value) {
      const node = super.create(value);

      const { href, blank } = value || {};

      node.setAttribute('href', href);

      if (blank) {
        node.setAttribute('target', '_blank');
      } else {
        node.removeAttribute('target');
      }

      return node;
    }
    static formats(domNode) {
      return { href: domNode.getAttribute('href'), blank: domNode.getAttribute('target') };
    }
    format(name, value) {
      if (name !== this.statics.blotName || !value) {
        super.format(name, value);
      } else {
        // passed in when creating a new link
        if (typeof value === 'object') {
          const { href, blank } = value;
          this.domNode.setAttribute('href', this.constructor.sanitize(href));

          if (blank) {
            this.domNode.setAttribute('target', '_blank');
          }
        }
        // passed in when editing an existing link
        else {
          this.domNode.setAttribute('href', this.constructor.sanitize(value));
        }
      }
    }
  }
  QuillEditor.register(SmartLinkBlot, true);

  return {
    QuillEditor,
  };
}
