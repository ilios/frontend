<a
  href={{this.href}}
  class={{if this.isActive "active"}}
  {{on "click" this.navigate}}
  data-test-link-to-with-action
>
  {{yield}}
</a>