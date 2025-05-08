import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { modifier } from 'ember-modifier';
import { TrackedAsyncData } from 'ember-async-data';

export default class OfferingManagerComponent extends Component {
  @service intl;
  @tracked isEditing = false;
  @tracked showRemoveConfirmation = false;
  @tracked hoveredGroups = [];

  setLearnerGroupElement = modifier((element, [id]) => {
    set(this, `learnerGroupElement${id}`, element);
  });

  @cached
  get learnerGroupsData() {
    return new TrackedAsyncData(this.args.offering.learnerGroups);
  }

  @cached
  get sessionData() {
    return new TrackedAsyncData(this.args.offering?.session);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.session?.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  get learnerGroups() {
    return this.learnerGroupsData.isResolved ? this.learnerGroupsData.value : null;
  }

  get session() {
    return this.sessionData.isResolved ? this.sessionData.value : null;
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  get cohortsLoaded() {
    return !!this.cohorts;
  }

  @action
  save(startDate, endDate, room, url, learnerGroups, learners, instructorGroups, instructors) {
    this.args.offering.setProperties({
      startDate,
      endDate,
      room,
      url,
      learnerGroups,
      learners,
      instructorGroups,
      instructors,
    });

    return this.args.offering.save();
  }

  get sortedLearnerGroups() {
    if (!this.learnerGroups) {
      return [];
    }
    return this.learnerGroups.slice().sort((learnerGroupA, learnerGroupB) => {
      const locale = this.intl.get('locale');
      if ('title:desc' === this.sortBy) {
        return learnerGroupB.title.localeCompare(learnerGroupA.title, locale, { numeric: true });
      }
      return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, { numeric: true });
    });
  }

  @action
  toggleHover(id) {
    if (this.hoveredGroups.includes(id)) {
      this.hoveredGroups = this.hoveredGroups.filter((theId) => theId !== id);
    } else {
      this.hoveredGroups = [...this.hoveredGroups, id];
    }
  }

  textCopied = task(async () => {
    await timeout(3000);
  });
}

<div
  class="offering-manager {{if this.showRemoveConfirmation 'show-remove-confirmation'}}"
  data-test-offering-manager
  ...attributes
>
  {{#if this.cohortsLoaded}}
    {{#if this.isEditing}}
      <OfferingForm
        @showRoom={{true}}
        @showInstructors={{true}}
        @cohorts={{this.cohorts}}
        @courseStartDate={{this.course.startDate}}
        @courseEndDate={{this.course.endDate}}
        @close={{toggle "isEditing" this}}
        @save={{this.save}}
        @smallGroupMode={{false}}
        @offering={{@offering}}
        @session={{this.session}}
        @scrollToBottom={{false}}
      />
    {{else}}
      <div class="offering-manager-learner-groups">
        <ul>
          {{#each this.sortedLearnerGroups as |learnerGroup|}}
            <li
              {{this.setLearnerGroupElement learnerGroup.id}}
              {{mouse-hover-toggle (fn this.toggleHover learnerGroup.id)}}
            >
              {{learnerGroup.title}}
              {{#if learnerGroup.needsAccommodation}}
                <FaIcon
                  @icon="universal-access"
                  @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
                />
              {{/if}}
              {{#unless learnerGroup.isTopLevelGroup}}
                {{#if
                  (and
                    (get this (concat "learnerGroupElement" learnerGroup.id))
                    (includes learnerGroup.id this.hoveredGroups)
                  )
                }}
                  <IliosTooltip @target={{get this (concat "learnerGroupElement" learnerGroup.id)}}>
                    <strong>
                      {{if
                        (eq learnerGroup.allParents.length 1)
                        (t "general.parentGroup")
                        (t "general.parentGroups")
                      }}:
                    </strong>
                    {{join " » " (reverse (map-by "title" learnerGroup.allParents))}}
                  </IliosTooltip>
                {{/if}}
              {{/unless}}
            </li>
          {{else}}
            <li>
              <FaIcon @icon="users" />
            </li>
          {{/each}}
        </ul>
      </div>
      <div class="offering-manager-location">
        <TruncateText @text={{@offering.room}} @length={{10}} data-test-location />
        <OfferingUrlDisplay @url={{@offering.url}} data-test-url />
      </div>
      <div class="offering-manager-instructors">
        <ul>
          {{#each @offering.allInstructors as |user|}}
            <li data-test-instructor>
              <UserNameInfo @user={{user}} />
            </li>
          {{else}}
            <li>
              <FaIcon @icon="user-plus" />
            </li>
          {{/each}}
        </ul>
      </div>
      {{#if @editable}}
        <div class="offering-manager-actions">
          <button class="link-button edit" type="button" {{on "click" (toggle "isEditing" this)}}>
            <FaIcon @icon="pen-to-square" class="enabled" />
          </button>
          {{#if @editable}}
            <button
              class="link-button remove"
              type="button"
              {{on "click" (set this "showRemoveConfirmation" true)}}
            >
              <FaIcon @icon="trash" class="enabled" />
            </button>
          {{else}}
            <FaIcon @icon="trash" class="disabled" />
          {{/if}}
        </div>
      {{/if}}
      {{#if this.showRemoveConfirmation}}
        <div class="confirm-removal">
          <div class="confirm-message">
            {{t "general.confirmRemove" learnerGroupCount=@offering.learnerGroups.length}}
            <br />
            <div class="confirm-buttons">
              <button type="button" class="remove text" {{on "click" (fn @remove @offering)}}>
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="cancel text"
                {{on "click" (set this "showRemoveConfirmation" false)}}
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </div>
      {{/if}}
    {{/if}}
  {{/if}}
</div>