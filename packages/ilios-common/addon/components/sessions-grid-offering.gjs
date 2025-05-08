import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, dropTask, timeout } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import scrollIntoView from 'scroll-into-view';
import { TrackedAsyncData } from 'ember-async-data';
import and from 'ember-truth-helpers/helpers/and';
import OfferingForm from 'ilios-common/components/offering-form';
import perform from 'ember-concurrency/helpers/perform';
import gte from 'ember-truth-helpers/helpers/gte';
import t from 'ember-intl/helpers/t';
import gt from 'ember-truth-helpers/helpers/gt';
import lt from 'ember-truth-helpers/helpers/lt';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import ValidationError from 'ilios-common/components/validation-error';
import TruncateText from 'ilios-common/components/truncate-text';
import join from 'ilios-common/helpers/join';
import mapBy from 'ilios-common/helpers/map-by';
import sortBy from 'ilios-common/helpers/sort-by';
import truncate from 'ilios-common/helpers/truncate';
import FaIcon from 'ilios-common/components/fa-icon';

@validatable
export default class SessionsGridOffering extends Component {
  @Length(1, 255) @NotBlank() @tracked room;
  @tracked isEditing = false;
  @tracked wasUpdated = false;

  constructor() {
    super(...arguments);
    this.room = this.args.offering.room;
  }

  @cached
  get sessionData() {
    return new TrackedAsyncData(this.args.offering.session);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.session?.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  @cached
  get learnerGroupsData() {
    return new TrackedAsyncData(this.args.offering.learnerGroups);
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

  get learnerGroups() {
    return this.learnerGroupsData.isResolved ? this.learnerGroupsData.value : null;
  }

  get cohortsLoaded() {
    return !!this.cohorts;
  }

  @action
  close({ target }) {
    this.isEditing = false;
    this.args.setHeaderLockedStatus(this.isEditing);
    const row = target.parentElement.parentElement.parentElement.parentElement.parentElement;
    scrollIntoView(row, {
      behavior: 'smooth',
    });
  }

  changeRoom = dropTask(async () => {
    await timeout(10);
    this.addErrorDisplayFor('room');
    const isValid = await this.isValid('room');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('room');
    this.args.offering.set('room', this.room);
    await this.args.offering.save();
  });

  save = dropTask(
    this,
    async (
      startDate,
      endDate,
      room,
      url,
      learnerGroups,
      learners,
      instructorGroups,
      instructors,
    ) => {
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
      this.toggleEditing();
      await this.args.offering.save();
      this.updateUi.perform();
    },
  );

  updateUi = restartableTask(async () => {
    await timeout(10);
    this.wasUpdated = true;
    scrollIntoView(this.element);
    await timeout(4000);
    this.wasUpdated = false;
  });

  toggleEditing = () => {
    this.isEditing = !this.isEditing;
    this.args.setHeaderLockedStatus(this.isEditing);
  };
  <template>
    <tr
      class="sessions-grid-offering{{if @even ' even'}}{{if @firstRow ' firstRow'}}{{if
          this.wasUpdated
          ' wasUpdated'
        }}"
      data-test-sessions-grid-offering
    >
      {{#if this.cohortsLoaded}}
        {{#if (and this.isEditing)}}
          <td colspan={{if @canUpdate "10" "9"}} class="expanded-offering-manager">
            <OfferingForm
              @showRoom={{true}}
              @showInstructors={{true}}
              @cohorts={{this.cohorts}}
              @courseStartDate={{this.course.startDate}}
              @courseEndDate={{this.course.endDate}}
              @close={{this.close}}
              @save={{perform this.save}}
              @smallGroupMode={{false}}
              @offering={{@offering}}
              @session={{this.session}}
              @scrollToBottom={{false}}
            />
          </td>
        {{else}}
          {{#if @firstRow}}
            <td class="text-top offering-block-time-time" colspan="2" rowspan={{@span}}>
              <span class="offering-block-time-time-starttime" data-test-starttime>
                {{@startTime}}
              </span>
              <span class="offering-block-time-time-duration" data-test-duration>
                {{#if (gte @durationHours 1)}}
                  {{t "general.durationHours" count=@durationHours}}
                {{/if}}
                {{#if (and (gt @durationMinutes 0) (lt @durationMinutes 60))}}
                  {{t "general.durationMinutes" count=@durationMinutes}}
                {{/if}}
              </span>
            </td>
          {{/if}}
          <td class="room">
            {{#if @canUpdate}}
              <EditableField
                @value={{this.room}}
                @save={{perform this.changeRoom}}
                @close={{this.revertRoomChanges}}
                @saveOnEnter={{true}}
                @closeOnEscape={{true}}
                as |isSaving|
              >
                <input
                  aria-label={{t "general.room"}}
                  type="text"
                  class="change-room"
                  value={{this.room}}
                  disabled={{isSaving}}
                  {{on "key-press" (fn this.addErrorDisplayFor "room")}}
                  {{on "input" (pick "target.value" (set this "room"))}}
                />
                <ValidationError @validatable={{this}} @property="room" />
              </EditableField>
            {{else}}
              <TruncateText @text={{this.room}} @length={{10}} />
            {{/if}}
          </td>
          <td
            colspan="2"
            title={{join ", " (mapBy "fullName" (sortBy "fullName" @offering.allLearners))}}
          >
            {{#if @offering.allLearners.length}}
              <strong>({{@offering.allLearners.length}})</strong>
            {{/if}}
            {{truncate (join ", " (mapBy "fullName" (sortBy "fullName" @offering.allLearners))) 25}}
          </td>
          <td colspan="2" title={{join ", " (mapBy "title" (sortBy "title" this.learnerGroups))}}>
            {{#if this.learnerGroups.length}}
              <strong>({{this.learnerGroups.length}})</strong>
            {{/if}}
            {{truncate (join ", " (mapBy "title" (sortBy "title" this.learnerGroups))) 25}}
          </td>
          <td
            colspan="2"
            title={{join ", " (mapBy "fullName" (sortBy "fullName" @offering.allInstructors))}}
          >
            {{#if @offering.allInstructors.length}}
              <strong>({{@offering.allInstructors.length}})</strong>
            {{/if}}
            {{truncate
              (join ", " (mapBy "fullName" (sortBy "fullName" @offering.allInstructors)))
              25
            }}
          </td>
          {{#if @canUpdate}}
            <td class="text-center" data-test-actions>
              <button
                class="link-button"
                data-test-edit
                type="button"
                {{on "click" this.toggleEditing}}
              >
                <FaIcon @icon="pencil" @title={{t "general.edit"}} @ariaHidden={{false}} />
              </button>
            </td>
          {{/if}}
        {{/if}}
      {{/if}}
    </tr>
  </template>
}
