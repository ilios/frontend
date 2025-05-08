import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import UserSearch from 'ilios-common/components/user-search';

export default class ReportsSubjectNewInstructorComponent extends Component {
  @service store;

  @cached
  get selectedInstructor() {
    return new TrackedAsyncData(this.store.findRecord('user', this.args.currentId));
  }

  @action
  chooseInstructor(user) {
    this.args.changeId(user.id);
  }
  <template>
    <p data-test-reports-subject-new-instructor>
      <label for="new-instructor">
        {{t "general.whichIs"}}
      </label>
      {{#if @currentId}}
        {{#if this.selectedInstructor.isResolved}}
          <button
            class="link-button"
            type="button"
            {{on "click" (fn @changeId null)}}
            data-test-remove
          >
            {{this.selectedInstructor.value.fullName}}
            <FaIcon @icon="xmark" class="remove" />
          </button>
        {{/if}}
      {{else}}
        <UserSearch @addUser={{this.chooseInstructor}} />
      {{/if}}
    </p>
  </template>
}
