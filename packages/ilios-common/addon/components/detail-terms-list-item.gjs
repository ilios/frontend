import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';

export default class DetailTermsListItem extends Component {
  @tracked isHovering;

  @cached
  get allParentsTitlesData() {
    return new TrackedAsyncData(this.args.term.getAllParentTitles(this.args.term));
  }

  get allParentTitles() {
    return this.allParentsTitlesData.isResolved ? this.allParentsTitlesData.value : [];
  }

  @cached
  get parentData() {
    return new TrackedAsyncData(this.args.term.parent);
  }

  get parent() {
    return this.parentData.isResolved ? this.parentData.value : null;
  }

  get detailTermsListItemId() {
    return `detail-terms-list-item-${guidFor(this)}`;
  }

  get detailTermsListItemElement() {
    return document.getElementById(this.detailTermsListItemId);
  }

  get showTooltip() {
    return this.args?.term.description?.length && this.isHovering;
  }

  get isTopLevel() {
    if (undefined === this.parent) {
      return false;
    }
    return !this.parent;
  }
  <template>
    <li
      class="detail-terms-list-item"
      id={{this.detailTermsListItemId}}
      {{mouseHoverToggle (set this "isHovering")}}
    >
      {{#if @canEdit}}
        {{#if this.showTooltip}}
          <IliosTooltip @target={{this.detailTermsListItemElement}}>
            {{@term.description}}
          </IliosTooltip>
        {{/if}}
        <button type="button" {{on "click" (fn @remove @term)}}>
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
          <FaIcon @icon="xmark" class="remove" />
        </button>
      {{else}}
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
      {{/if}}
    </li>
  </template>
}
