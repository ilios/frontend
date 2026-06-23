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
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { eq, not, or } from 'ember-truth-helpers';

export default class DetailTermsListItem extends Component {
  @tracked isHovering;

  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.term.getAllParents());
  }

  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : [];
  }

  @cached
  get parentData() {
    return new TrackedAsyncData(this.args.term.parent);
  }

  get parent() {
    return this.parentData.isResolved ? this.parentData.value : null;
  }

  get oldestInactiveParent() {
    return this.allParents.find((p) => !p.active);
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
      data-test-detail-terms-list-item
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
            {{#each this.allParents as |parent|}}
              {{! template-lint-disable no-bare-strings}}
              <span class="muted">
                {{parent.title}}
              </span>
              {{! only show the inactive label on the oldest inactive ancestor in the hierarchy }}
              {{#if (eq parent this.oldestInactiveParent)}}
                <span class="inactive">
                  ({{t "general.inactive"}})
                </span>
              {{/if}}
              &raquo;&nbsp;
            {{/each}}
            {{@term.title}}
          {{/if}}
          {{! only show the inactive label if the given term is inactive and all of its ancestors are active }}
          {{#if (not (or @term.active this.oldestInactiveParent))}}
            <span class="inactive">
              ({{t "general.inactive"}})
            </span>
          {{/if}}
          <FaIcon @icon={{faXmark}} class="remove" />
        </button>
      {{else}}
        {{#if @term.isTopLevel}}
          {{@term.title}}
        {{else}}
          {{#each this.allParents as |parent|}}
            {{! template-lint-disable no-bare-strings}}
            <span class="muted">
              {{parent.title}}
            </span>
            {{#if (eq parent this.oldestInactiveParent)}}
              <span class="inactive">
                ({{t "general.inactive"}})
              </span>
            {{/if}}
            &raquo;&nbsp;
          {{/each}}
          {{@term.title}}
        {{/if}}
        {{#if (not (or @term.active this.oldestInactiveParent))}}
          <span class="inactive">
            ({{t "general.inactive"}})
          </span>
        {{/if}}
      {{/if}}
    </li>
  </template>
}
