import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';

export default class DetailLearnergroupsListItemComponent extends Component {
  @cached
  get allParentTitlesData() {
    return new TrackedAsyncData(this.args.group.getAllParentTitles());
  }

  get allParentTitles() {
    return this.allParentTitlesData.isResolved ? this.allParentTitlesData.value : [];
  }

  @action
  remove(learnerGroup, ev) {
    this.args.remove(learnerGroup, !(ev.ctrlKey || ev.shiftKey));
  }
  <template>
    <li
      class="detail-learnergroups-list-item"
      data-test-detail-learnergroups-list-item
      ...attributes
    >
      {{#if @isManaging}}
        <button
          class="remove-learnergroup"
          type="button"
          {{on "click" (fn this.remove @group)}}
          data-test-remove-learnergroup
        >
          {{#if @group.isTopLevel}}
            {{@group.title}}
          {{else}}
            {{#each this.allParentTitles as |title|}}
              {{! template-lint-disable no-bare-strings}}
              <span class="muted">
                {{title}}
                &raquo;&nbsp;
              </span>
            {{/each}}
            {{@group.title}}
            ({{@group.usersOnlyAtThisLevelCount}})
          {{/if}}
          {{#if @group.needsAccommodation}}
            <FaIcon
              @icon="universal-access"
              @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
              data-test-needs-accommodation
            />
          {{/if}}
          <FaIcon @icon="xmark" class="remove" />
        </button>
      {{else}}
        {{#if @group.isTopLevel}}
          {{@group.title}}
        {{else}}
          {{#each this.allParentTitles as |title|}}
            {{! template-lint-disable no-bare-strings}}
            <span class="muted">
              {{title}}
              &raquo;&nbsp;
            </span>
          {{/each}}
          {{@group.title}}
          ({{@group.usersOnlyAtThisLevelCount}})
        {{/if}}
        {{#if @group.needsAccommodation}}
          <FaIcon
            @icon="universal-access"
            @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
            data-test-needs-accommodation
          />
        {{/if}}
      {{/if}}
    </li>
  </template>
}
