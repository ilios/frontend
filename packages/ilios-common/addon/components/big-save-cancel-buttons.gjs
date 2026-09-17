import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSpinner, faCheck, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default class BigSaveCancelButtonsComponent extends Component {
  get save() {
    // if ember-concurrency Task, perform it, otherwise run function normally
    if (typeof this.args.save.perform === 'function') {
      return this.args.save.perform;
    }

    return this.args.save;
  }
  get isSaving() {
    // if ember-concurrency Task, check for running task
    if (typeof this.args.save.perform === 'function') {
      return this.args.save.isRunning;
    }

    return false;
  }
  get cancel() {
    // if ember-concurrency Task, perform it, otherwise run function normally
    if (typeof this.args.cancel.perform === 'function') {
      return this.args.cancel.perform;
    }

    return this.args.cancel;
  }

  <template>
    <div data-test-big-save-cancel-buttons>
      {{#if (has-block)}}
        {{yield this.save this.cancel @disableSave @disableCancel}}
      {{else}}
        <button
          aria-label={{t "general.save"}}
          type="button"
          class="bigsave"
          disabled={{this.isSaving}}
          {{on "click" this.save}}
          data-test-save
          ...attributes
        >
          <FaIcon
            @icon={{if this.isSaving faSpinner faCheck}}
            @spin={{if this.isSaving true false}}
            @fixedWidth={{true}}
          />
        </button>
        <button
          aria-label={{t "general.cancel"}}
          type="button"
          class="bigcancel"
          disabled={{this.isSaving}}
          {{on "click" this.cancel}}
          data-test-cancel
        >
          <FaIcon @icon={{faArrowRotateLeft}} @fixedWidth={{true}} />
        </button>
      {{/if}}
    </div>
  </template>
}
