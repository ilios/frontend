<button
  type="button"
  class="sortable-heading sortable text-{{this.align}}
    {{if this.hideFromSmallScreen 'hide-from-small-screen'}}"
  colspan={{this.colspan}}
  title={{this.title}}
  {{on "click" this.click}}
  ...attributes
>
  {{yield}}<FaIcon @icon={{this.sortIcon}} />
</button>