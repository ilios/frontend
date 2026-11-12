import { assert } from '@ember/debug';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faArrowRotateLeft,faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class BigSaveCancelButtonsComponent extends Component {
  get save() {
    assert('save must be a task', typeof this.args.save.perform === 'function');
    return this.args.save.perform;
  }
  get isSaving() {
    return this.args.save.isRunning;
  }

  <template>
    <div data-test-big-save-cancel-buttons>
      {{#if (has-block)}}
        {{yield this.save @cancel @disableSave @disableCancel}}
      {{else}}
        <button
          aria-label={{t "general.save"}}
          type="button"
          class="bigsave"
          disabled={{if @disableSave @disableSave this.isSaving}}
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
          disabled={{if @disableCancel @disableCancel this.isSaving}}
          {{on "click" @cancel}}
          data-test-cancel
        >
          <FaIcon @icon={{faArrowRotateLeft}} @fixedWidth={{true}} />
        </button>
      {{/if}}
    </div>
  </template>
}
