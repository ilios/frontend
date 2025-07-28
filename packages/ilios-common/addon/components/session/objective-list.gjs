import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import ObjectiveSortManager from 'ilios-common/components/objective-sort-manager';
import set from 'ember-set-helper/helpers/set';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import gt from 'ember-truth-helpers/helpers/gt';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import isArray from 'ember-truth-helpers/helpers/is-array';
import ObjectiveListItem from 'ilios-common/components/session/objective-list-item';
import ObjectiveListLoading from 'ilios-common/components/session/objective-list-loading';

export default class SessionObjectiveListComponent extends Component {
  @tracked isSorting = false;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get courseObjectivesData() {
    return new TrackedAsyncData(this.course?.courseObjectives);
  }

  @cached
  get sessionObjectivesData() {
    return new TrackedAsyncData(this.args.session.sortedSessionObjectives);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get courseObjectives() {
    return this.courseObjectivesData.isResolved ? this.courseObjectivesData.value : null;
  }

  get sessionObjectives() {
    return this.sessionObjectivesData.isResolved ? this.sessionObjectivesData.value : null;
  }

  get sessionObjectiveCount() {
    return this.sessionObjectives?.length ?? 0;
  }
  <template>
    <div class="session-objective-list" data-test-session-objective-list>
      {{#if this.isSorting}}
        <ObjectiveSortManager @subject={{@session}} @close={{set this "isSorting" false}} />
      {{/if}}

      {{#if (and this.sessionObjectiveCount (not this.isSorting))}}
        {{#if (and @editable (gt this.sessionObjectiveCount 1))}}
          <button
            class="sort-button"
            type="button"
            {{on "click" (set this "isSorting" true)}}
            data-test-sort
          >
            {{t "general.sortObjectives"}}
          </button>
        {{/if}}
        <div class="grid-row headers{{unless @editable ' no-actions'}}" data-test-headers>
          <span class="grid-item" data-test-header>{{t "general.description"}}</span>
          <span class="grid-item" data-test-header>{{t "general.parentObjectives"}}</span>
          <span class="grid-item" data-test-header>{{t "general.vocabularyTerms"}}</span>
          <span class="grid-item" data-test-header>{{t "general.meshTerms"}}</span>
          {{#if @editable}}
            <span class="actions grid-item" data-test-header>{{t "general.actions"}}</span>
          {{/if}}
        </div>
        {{#if (and (isArray this.sessionObjectives) (isArray this.courseObjectives))}}
          {{#each this.sessionObjectives as |sessionObjective|}}
            <ObjectiveListItem
              @sessionObjective={{sessionObjective}}
              @editable={{@editable}}
              @courseObjectives={{this.courseObjectives}}
              @courseTitle={{this.course.title}}
              @session={{@session}}
            />
          {{/each}}
        {{else}}
          <ObjectiveListLoading @count={{this.sessionObjectiveCount}} />
        {{/if}}
      {{/if}}
    </div>
  </template>
}
