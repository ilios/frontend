<button
  type="button"
  class="copy-btn"
  data-test-copy-button
  ...attributes
  {{on "click" (perform this.copy)}}
>
  {{yield}}
</button>