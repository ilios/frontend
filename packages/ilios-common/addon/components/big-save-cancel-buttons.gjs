import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSpinner, faCheck, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default class BigSaveCancelButtonsComponent extends Component {
  get isSaving() {
    if (this.args.save.isTask) {
      return this.args.save.isRunning;
    }

    return this.args.disableSave;
  }

  <template>
    <div data-test-big-save-cancel-buttons>
      {{#if (has-block)}}
        {{yield @save @cancel @disableSave @disableCancel}}
      {{else}}
        <button
          aria-label={{t "general.save"}}
          type="button"
          class="bigsave"
          disabled={{this.isSaving}}
          {{on "click" @save}}
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
          {{on "click" @cancel}}
          data-test-cancel
        >
          <FaIcon @icon={{faArrowRotateLeft}} @fixedWidth={{true}} />
        </button>
      {{/if}}
    </div>
  </template>
}
