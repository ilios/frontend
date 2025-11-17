import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { hash } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import or from 'ember-truth-helpers/helpers/or';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import InstructorSelectionManager from 'ilios-common/components/instructor-selection-manager';
import SelectedInstructors from 'ilios-common/components/selected-instructors';
import SelectedInstructorGroups from 'ilios-common/components/selected-instructor-groups';

export default class DetailInstructorsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked instructorGroupBuffer = [];
  @tracked instructorBuffer = [];
  @tracked availableInstructorGroups;

  @cached
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
  }

  @cached
  get ilmInstructorsData() {
    return new TrackedAsyncData(this.ilmSession?.instructors);
  }

  @cached
  get ilmInstructorGroupsData() {
    return new TrackedAsyncData(this.ilmSession?.instructorGroups);
  }

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
  }

  get ilmInstructors() {
    return this.ilmInstructorsData.isResolved ? this.ilmInstructorsData.value : null;
  }

  get ilmInstructorGroups() {
    return this.ilmInstructorGroupsData.isResolved ? this.ilmInstructorGroupsData.value : null;
  }

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  load = task({ restartable: true }, async () => {
    const user = await this.currentUser.getModel();
    const school = await user.school;
    this.availableInstructorGroups = await school.instructorGroups;
  });

  manage = task({ drop: true }, async () => {
    const ilmSession = await this.args.session.ilmSession;
    const { instructorGroups, instructors } = await hash({
      instructorGroups: ilmSession.instructorGroups,
      instructors: ilmSession.instructors,
    });

    this.instructorGroupBuffer = instructorGroups;
    this.instructorBuffer = instructors;
    this.isManaging = true;
  });

  save = task({ drop: true }, async () => {
    const ilmSession = await this.args.session.ilmSession;
    ilmSession.set('instructorGroups', this.instructorGroupBuffer);
    ilmSession.set('instructors', this.instructorBuffer);
    await ilmSession.save();
    this.isManaging = false;
  });

  get instructorCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.instructors.length;
  }

  get selectedIlmInstructors() {
    if (!this.ilmInstructors) {
      return [];
    }
    return this.ilmInstructors;
  }

  get selectedIlmInstructorGroups() {
    if (!this.ilmInstructorGroups) {
      return [];
    }
    return this.ilmInstructorGroups;
  }

  get instructorGroupCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.instructorGroups.length;
  }
  @action
  cancel() {
    this.instructorGroupBuffer = [];
    this.instructorBuffer = [];
    this.isManaging = false;
  }
  @action
  addInstructorGroupToBuffer(instructorGroup) {
    this.instructorGroupBuffer = [...this.instructorGroupBuffer, instructorGroup];
  }
  @action
  removeInstructorGroupFromBuffer(instructorGroup) {
    this.instructorGroupBuffer = this.instructorGroupBuffer.filter(
      (obj) => obj.id !== instructorGroup.id,
    );
  }
  @action
  addInstructorToBuffer(instructor) {
    this.instructorBuffer = [...this.instructorBuffer, instructor];
  }
  @action
  removeInstructorFromBuffer(instructor) {
    this.instructorBuffer = this.instructorBuffer.filter((obj) => obj.id !== instructor.id);
  }
  <template>
    <section class="detail-instructors" data-test-detail-instructors>
      <div class="detail-instructors-header">
        <div class="title" data-test-title>
          {{#if this.isManaging}}
            <span class="detail-specific-title">
              {{t "general.instructorsManageTitle"}}
            </span>
          {{else}}
            {{t
              "general.instructorsAndInstructorGroupsWithCount"
              instructorCount=this.instructorCount
              instructorGroupCount=this.instructorGroupCount
            }}
          {{/if}}
        </div>
        <div class="actions">
          {{#if this.isManaging}}
            <button
              class="bigadd"
              type="button"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon @icon="check" />
            </button>
            <button
              class="bigcancel"
              type="button"
              aria-label={{t "general.cancel"}}
              {{on "click" this.cancel}}
              data-test-cancel
            >
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          {{else if @editable}}
            <button type="button" {{on "click" (perform this.manage)}} data-test-manage>
              {{t "general.instructorsManageTitle"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div
        class="detail-instructors-content{{unless
            (or this.instructorCount this.instructorGroupCount)
            ' empty'
          }}"
      >
        {{#if this.isManaging}}
          <InstructorSelectionManager
            @addInstructor={{this.addInstructorToBuffer}}
            @addInstructorGroup={{this.addInstructorGroupToBuffer}}
            @removeInstructor={{this.removeInstructorFromBuffer}}
            @removeInstructorGroup={{this.removeInstructorGroupFromBuffer}}
            @availableInstructorGroups={{this.availableInstructorGroups}}
            @instructorGroups={{this.instructorGroupBuffer}}
            @instructors={{this.instructorBuffer}}
            @showDefaultNotLoaded={{false}}
          />
        {{else}}
          {{#if this.instructorCount}}
            <SelectedInstructors
              @instructors={{this.selectedIlmInstructors}}
              @isManaging={{false}}
              @showDefaultNotLoaded={{false}}
              class="display-selected-instructors"
            />
          {{/if}}
          {{#if this.instructorGroupCount}}
            <SelectedInstructorGroups
              @instructorGroups={{this.selectedIlmInstructorGroups}}
              @isManaging={{false}}
              @showDefaultNotLoaded={{false}}
              class="display-selected-instructor-groups"
            />
          {{/if}}
        {{/if}}
      </div>
    </section>
  </template>
}
