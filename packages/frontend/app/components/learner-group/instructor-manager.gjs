import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import UserNameInfo from 'ilios-common/components/user-name-info';
import InstructorGroupMembersList from 'frontend/components/learner-group/instructor-group-members-list';
import UserSearch from 'ilios-common/components/user-search';
import UserStatus from 'ilios-common/components/user-status';
import { faArrowRotateLeft, faCheck, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';

export default class LearnerGroupInstructorManagerComponent extends Component {
  @tracked instructors = [];
  @tracked instructorGroups = [];

  constructor() {
    super(...arguments);
    this.instructors = this.args.instructors;
    this.instructorGroups = this.args.instructorGroups;
  }

  @action
  addInstructor(user) {
    this.instructors = [...this.instructors, user];
  }

  @action
  addInstructorGroup(instructorGroup) {
    this.instructorGroups = [...this.instructorGroups, instructorGroup];
  }

  @action
  removeInstructor(user) {
    this.instructors = this.instructors.filter((instructor) => instructor !== user);
  }

  @action
  removeInstructorGroup(instructorGroup) {
    this.instructorGroups = this.instructorGroups.filter((group) => group !== instructorGroup);
  }
  <template>
    <div
      class="learner-group-instructor-manager"
      data-test-learner-group-instructor-manager
      ...attributes
    >
      <div class="detail-header">
        <div class="title" data-test-title>
          {{t "general.manageDefaultInstructors"}}
        </div>
        <div class="actions">
          <UserSearch
            @addUser={{this.addInstructor}}
            @addInstructorGroup={{this.addInstructorGroup}}
            @currentlyActiveUsers={{this.instructors}}
            @availableInstructorGroups={{@availableInstructorGroups}}
            @currentlyActiveInstructorGroups={{this.instructorGroups}}
          />
          <div>
            <button
              type="button"
              class="bigadd"
              aria-label={{t "general.save"}}
              {{on "click" (fn @save this.instructors this.instructorGroups)}}
              data-test-save
            >
              <FaIcon @icon={{faCheck}} />
            </button>
            <button
              type="button"
              class="bigcancel"
              aria-label={{t "general.cancel"}}
              {{on "click" @cancel}}
              data-test-cancel
            >
              <FaIcon @icon={{faArrowRotateLeft}} />
            </button>
          </div>
        </div>
      </div>
      <div class="detail-content">
        {{#if this.instructors.length}}
          <h4>
            {{t "general.instructors"}}
          </h4>
          <ul class="removable-instructors">
            {{#each (sortBy "fullName" this.instructors) as |user|}}
              <li>
                <button
                  class="link-button"
                  type="button"
                  {{on "click" (fn this.removeInstructor user)}}
                  data-test-selected-instructor
                >
                  <UserStatus @user={{user}} />
                  <UserNameInfo @user={{user}} />
                  <FaIcon @icon={{faXmark}} class="remove" />
                </button>
              </li>
            {{/each}}
          </ul>
        {{/if}}
        {{#if this.instructorGroups.length}}
          <h4>
            {{t "general.instructorGroups"}}
          </h4>
          <div class="removable-instructor-groups">
            {{#each (sortBy "title" this.instructorGroups) as |instructorGroup|}}
              <div class="removable-instructor-group" data-test-selected-instructor-group>
                <button
                  class="link-button"
                  type="button"
                  data-test-instructor-group-title
                  {{on "click" (fn this.removeInstructorGroup instructorGroup)}}
                >
                  <FaIcon @icon={{faUsers}} />
                  {{instructorGroup.title}}
                  <FaIcon @icon={{faXmark}} class="remove" />
                </button>
                <br />
                <InstructorGroupMembersList @instructorGroup={{instructorGroup}} />
              </div>
            {{/each}}
          </div>
        {{/if}}
      </div>
    </div>
  </template>
}
