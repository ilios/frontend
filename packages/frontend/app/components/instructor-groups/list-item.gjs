import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import ResponsiveTd from 'frontend/components/responsive-td';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default class InstructorGroupsListItemComponent extends Component {
  @service permissionChecker;
  @tracked showRemoveConfirmation = false;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteInstructorGroup(this.args.instructorGroup),
    );
  }

  @cached
  get coursesData() {
    return new TrackedAsyncData(this.args.instructorGroup.courses);
  }

  get courses() {
    return this.coursesData.isResolved ? this.coursesData.value : null;
  }

  get canDelete() {
    return this.canDeleteData.isResolved
      ? this.canDeleteData.value && this.courses && this.courses.length === 0
      : false;
  }

  remove = task({ drop: true }, async () => {
    await this.args.instructorGroup.destroyRecord();
  });
  <template>
    <tr
      class={{if this.showRemoveConfirmation "confirm-removal"}}
      data-test-instructor-groups-list-item
    >
      <td class="text-left" colspan="2" data-test-title>
        <LinkTo @route="instructor-group" @model={{@instructorGroup}}>
          {{@instructorGroup.title}}
        </LinkTo>
      </td>
      <td class="text-center hide-from-small-screen" data-test-users>
        {{@instructorGroup.users.length}}
      </td>
      <td class="text-center hide-from-small-screen" data-test-courses>
        {{@instructorGroup.courses.length}}
      </td>
      <td class="text-right">
        {{#if this.canDelete}}
          <button
            class="link-button"
            type="button"
            {{on "click" (set this "showRemoveConfirmation" true)}}
            title={{t "general.remove"}}
            data-test-remove
          >
            <FaIcon @icon={{faTrash}} class="enabled remove" />
          </button>
        {{else}}
          <FaIcon @icon={{faTrash}} class="disabled" />
        {{/if}}
      </td>
    </tr>
    {{#if this.showRemoveConfirmation}}
      <tr class="confirm-removal" data-test-confirm-removal>
        <ResponsiveTd @smallScreenSpan="3" @largeScreenSpan="5">
          <div class="confirm-message">
            {{t
              "general.confirmRemoveInstructorGroup"
              instructorCount=@instructorGroup.users.length
            }}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="remove text"
                {{on "click" (perform this.remove)}}
                data-test-confirm
              >
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" (set this "showRemoveConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </ResponsiveTd>
      </tr>
    {{/if}}
  </template>
}
