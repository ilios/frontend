import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { or } from 'ember-truth-helpers';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSpinner, faCheck, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default class BigSaveCancelButtonsComponent extends Component {
  @service intl;

  <template>
    <div data-test-big-save-cancel-buttons>
      {{#if (has-block)}}
        {{yield @save @cancel @disableSave @disableCancel}}
      {{else}}
        <button
          aria-label={{t "general.save"}}
          type="button"
          class="bigsave"
          disabled={{@disableSave}}
          {{on "click" @save}}
          data-test-save
          ...attributes
        >
          <FaIcon
            @icon={{if (or @save.isRunning @disableSave) faSpinner faCheck}}
            @spin={{if (or @save.isRunning @disableSave) true false}}
            @fixedWidth={{true}}
          />
        </button>
        <button
          aria-label={{t "general.cancel"}}
          type="button"
          class="bigcancel"
          disabled={{if @disableCancel @disableCancel @save.isRunning}}
          {{on "click" @cancel}}
          data-test-cancel
        >
          <FaIcon @icon={{faArrowRotateLeft}} @fixedWidth={{true}} />
        </button>
      {{/if}}
    </div>
  </template>
}
