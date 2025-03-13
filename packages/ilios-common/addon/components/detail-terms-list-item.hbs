<li
  {{! template-lint-disable no-invalid-interactive }}
  class="detail-terms-list-item"
  role={{if @canEdit "button"}}
  {{on "click" (fn (if @canEdit @remove (noop)) @term)}}
  {{mouse-hover-toggle (set this "isHovering")}}
  id={{this.detailTermsListItemId}}
>
  {{#if this.showTooltip}}
    <IliosTooltip @target={{this.detailTermsListItemElement}}>
      {{@term.description}}
    </IliosTooltip>
  {{/if}}
  {{#if @term.isTopLevel}}
    {{@term.title}}
  {{else}}
    {{#each this.allParentTitles as |title|}}
      {{! template-lint-disable no-bare-strings}}
      <span class="muted">
        {{title}}
        &raquo;&nbsp;
      </span>
    {{/each}}
    {{@term.title}}
  {{/if}}
  {{#unless @term.active}}
    <span class="inactive">
      ({{t "general.inactive"}})
    </span>
  {{/unless}}
  {{#if @canEdit}}
    <FaIcon @icon="xmark" class="remove" />
  {{/if}}
</li>