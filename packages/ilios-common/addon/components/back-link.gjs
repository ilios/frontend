<a
  title={{t "general.returnToPreviousPage"}}
  class="back-link"
  href="#"
  {{on "click" this.back}}
  data-test-back-link
>
  <FaIcon @icon="angles-left" />
  {{t "general.back"}}
</a>