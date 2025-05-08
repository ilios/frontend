<button
  class="selectable-terms-list-item {{if this.isSelected 'selected'}}"
  type="button"
  data-test-selectable-terms-list-item
  data-test-selectable-terms-list-item-level={{this.level}}
  {{on "click" this.click}}
  {{mouse-hover-toggle (set this "isHovering")}}
  id={{this.selectableTermsListItemButtonId}}
>
  {{#if this.showTooltip}}
    <IliosTooltip @target={{this.selectableTermsListItemButtonElement}}>
      {{@term.description}}
    </IliosTooltip>
  {{/if}}
  <span data-test-title>{{@term.title}}</span>
  <span class="actions">
    {{#if this.isSelected}}
      <FaIcon @icon="xmark" />
    {{else}}
      <FaIcon @icon="plus" class="add" />
    {{/if}}
  </span>
</button>